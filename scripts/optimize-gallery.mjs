/**
 * Build-time gallery image optimizer.
 *
 * Reads high-resolution source photos from `gallery-source/` and emits
 * web-optimized WebP derivatives into `public/gallery/`, which is a build
 * artifact (gitignored). Runs automatically via the `prebuild` / `predev`
 * npm hooks, so `npm run build` / `npm run dev` always ship optimized assets.
 *
 * Output files keep the same `mae-kampong-village-N.webp` naming the site
 * expects, so no component references need to change beyond the extension.
 */
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = import.meta.dirname; // directory of this script
const SRC = join(ROOT, '..', 'gallery-source');
const OUT = join(ROOT, '..', 'public', 'gallery');

const MAX_WIDTH = 1600; // px - ample for a full-bleed hero / gallery grid
const WEBP_QUALITY = 80;

function frameNumber(name) {
  const m = name.match(/(\d+)\.jpg$/i);
  return m ? parseInt(m[1], 10) : null;
}

await mkdir(OUT, { recursive: true });

let files = [];
try {
  files = (await readdir(SRC)).filter((f) => /\.jpg$/i.test(f));
} catch {
  // Source directory absent (e.g. optimized WebP committed to the repo) — nothing to do.
  console.log('[optimize-gallery] gallery-source/ not found — using committed public/gallery/ WebP (no-op).');
  process.exit(0);
}

if (files.length === 0) {
  console.log('[optimize-gallery] no source JPEGs — using committed public/gallery/ WebP (no-op).');
  process.exit(0);
}

let processed = 0;
let skipped = 0;

for (const f of files) {
  const n = frameNumber(f);
  if (!n) continue;

  const srcPath = join(SRC, f);
  const outPath = join(OUT, `mae-kampong-village-${n}.webp`);

  // Skip when the optimized derivative already exists and is up to date.
  try {
    const outStat = await stat(outPath);
    const srcStat = await stat(srcPath);
    if (outStat.mtimeMs >= srcStat.mtimeMs) {
      skipped++;
      continue;
    }
  } catch {
    // output missing - fall through and generate it
  }

  const buffer = await sharp(srcPath, { animated: false })
    .rotate() // honor EXIF orientation
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  await writeFile(outPath, buffer);
  processed++;
}

console.log(
  `[optimize-gallery] ${files.length} source(s) -> processed=${processed} skipped=${skipped}`
);

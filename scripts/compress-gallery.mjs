/**
 * Lossy re-compression for the shipped gallery photos.
 *
 * `public/gallery/*.webp` are the images the site actually serves, so this
 * script re-encodes them in place at a web-friendly weight and emits a small
 * `-800.webp` companion for the gallery grid / thumbnails (used via `srcset`).
 *
 * It is idempotent: a photo is only re-encoded when a smaller companion is
 * missing or older than the full-size file, so repeated builds never stack
 * generation loss on top of an already optimized photo.
 */
import sharp from 'sharp';
import { readdir, stat, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = import.meta.dirname;
const DIR = join(ROOT, '..', 'public', 'gallery');

// Photos are shot portrait, so constrain the *longest* edge instead of width.
const FULL_EDGE = 1800;
const FULL_QUALITY = 62;
const SMALL_EDGE = 800;
const SMALL_QUALITY = 68;

const isFullSize = (name) => /^mae-kampong-village-\d+\.webp$/i.test(name);

const files = (await readdir(DIR)).filter(isFullSize).sort((a, b) => {
  const n = (s) => parseInt(s.match(/(\d+)\.webp$/i)[1], 10);
  return n(a) - n(b);
});

if (files.length === 0) {
  console.log('[compress-gallery] no gallery photos found — nothing to do.');
  process.exit(0);
}

let processed = 0;
let skipped = 0;
let beforeBytes = 0;
let afterFullBytes = 0;
let smallBytes = 0;

for (const f of files) {
  const fullPath = join(DIR, f);
  const smallPath = join(DIR, f.replace(/\.webp$/i, '-800.webp'));

  const fullStat = await stat(fullPath);
  let smallStat = null;
  try {
    smallStat = await stat(smallPath);
  } catch {
    smallStat = null;
  }

  if (smallStat && smallStat.mtimeMs >= fullStat.mtimeMs) {
    skipped++;
    continue;
  }

  const input = await readFile(fullPath);
  beforeBytes += input.length;

  const full = await sharp(input, { animated: false })
    .rotate()
    .resize({ width: FULL_EDGE, height: FULL_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: FULL_QUALITY, effort: 6, smartSubsample: true })
    .toBuffer();

  const small = await sharp(input, { animated: false })
    .rotate()
    .resize({ width: SMALL_EDGE, height: SMALL_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: SMALL_QUALITY, effort: 6, smartSubsample: true })
    .toBuffer();

  await writeFile(fullPath, full);
  await writeFile(smallPath, small);

  afterFullBytes += full.length;
  smallBytes += small.length;
  processed++;
  console.log(
    `[compress-gallery] ${f}: ${(input.length / 1024).toFixed(0)}KB -> ${(full.length / 1024).toFixed(0)}KB + ${(small.length / 1024).toFixed(0)}KB`
  );
}

const kb = (n) => (n / 1024).toFixed(0);
console.log(
  `[compress-gallery] processed=${processed} skipped=${skipped} · full-size ${kb(beforeBytes)}KB -> ${kb(afterFullBytes)}KB (+${kb(smallBytes)}KB thumbnails)`
);

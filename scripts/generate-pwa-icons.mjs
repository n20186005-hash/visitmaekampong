/**
 * Build-time PWA icon generator.
 *
 * Derives square PNG app icons from the committed hero WebP so the manifest and
 * apple-touch-icon always match the site's key art. Runs via the `prebuild` /
 * `predev` npm hooks, right after `optimize-gallery.mjs`.
 */
import sharp from 'sharp';
import { mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = import.meta.dirname;
const SRC = join(ROOT, '..', 'public', 'gallery', 'mae-kampong-village-1.webp');
const OUT = join(ROOT, '..', 'public', 'icons');

const ICONS = [
  { name: 'icon-192.png', size: 192, mask: false },
  { name: 'icon-512.png', size: 512, mask: false },
  { name: 'apple-touch-icon.png', size: 180, mask: false },
  // maskable: keep the subject inside the safe zone (~80% of the canvas)
  { name: 'maskable-512.png', size: 512, mask: true },
];

try {
  await access(SRC);
} catch {
  console.log('[pwa-icons] hero image not found — skipping icon generation.');
  process.exit(0);
}

await mkdir(OUT, { recursive: true });

for (const icon of ICONS) {
  const scale = icon.mask ? 0.8 : 1;
  const inner = Math.round(icon.size * scale);
  const offset = Math.round((icon.size - inner) / 2);

  const pipeline = sharp(SRC, { animated: false })
    .rotate()
    .resize({ width: inner, height: inner, fit: 'cover', position: 'centre' });

  const buffer = icon.mask
    ? await sharp({
        create: {
          width: icon.size,
          height: icon.size,
          channels: 4,
          background: { r: 7, g: 26, b: 28, alpha: 1 },
        },
      })
        .composite([{ input: await pipeline.toBuffer(), top: offset, left: offset }])
        .png({ compressionLevel: 9 })
        .toBuffer()
    : await pipeline.png({ compressionLevel: 9 }).toBuffer();

  await sharp(buffer).toFile(join(OUT, icon.name));
}

console.log(`[pwa-icons] generated ${ICONS.length} icon(s) in public/icons/`);

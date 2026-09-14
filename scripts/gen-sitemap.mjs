/**
 * Generates dist/sitemap.xml from the built HTML.
 *
 * Runs as a postbuild step so the sitemap can never drift from the pages that
 * actually exist, and so `noindex` pages (legal / utility) are excluded
 * automatically instead of being hand-maintained.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const SITE = 'https://visitmaekampong.com';
const LANGS = ['th', 'en', 'zh'];
// /zh/ is Traditional Chinese — announce it language-only and per region.
const HREFLANG = { th: ['th'], en: ['en'], zh: ['zh-Hant', 'zh-Hant-TW', 'zh-Hant-HK'] };
const X_DEFAULT = 'th';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

if (!existsSync(DIST)) {
  console.error(`[sitemap] ${DIST}/ not found — run "astro build" first.`);
  process.exit(1);
}

const pages = [];

for (const file of walk(DIST)) {
  if (!file.endsWith('index.html')) continue;
  const rel = relative(DIST, file).split('\\').join('/');
  if (rel.startsWith('404')) continue;

  const html = readFileSync(file, 'utf8');
  // Respect the robots directive rendered by BaseLayout.
  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) continue;

  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (!canonical) continue;

  const u = new URL(canonical);
  const seg = u.pathname.split('/').filter(Boolean);
  const lang = seg[0];
  if (!LANGS.includes(lang)) continue;

  const lastmod = html.match(/<time[^>]*datetime="(\d{4}-\d{2}-\d{2})/i)?.[1];
  pages.push({ url: u.origin + u.pathname, lang, slug: seg.slice(1).join('/'), lastmod });
}

// Group by slug so every language variant can be listed as an hreflang cluster.
const groups = new Map();
for (const p of pages) {
  if (!groups.has(p.slug)) groups.set(p.slug, []);
  groups.get(p.slug).push(p);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const today = new Date().toISOString().slice(0, 10);

const urls = [...groups.entries()].flatMap(([, variants]) => {
  const byLang = Object.fromEntries(variants.map((v) => [v.lang, v.url]));
  return variants.map((v) => {
    const alternates = LANGS.filter((l) => byLang[l])
      .flatMap((l) =>
        HREFLANG[l].map(
          (code) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${byLang[l]}"/>`
        )
      )
      .concat([`    <xhtml:link rel="alternate" hreflang="x-default" href="${byLang[X_DEFAULT]}"/>`])
      .join('\n');
    const priority = v.slug === '' ? '1.0' : '0.8';
    return [
      '  <url>',
      `    <loc>${esc(v.url)}</loc>`,
      alternates,
      `    <lastmod>${v.lastmod || today}</lastmod>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  });
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;

writeFileSync(join(DIST, 'sitemap.xml'), xml, 'utf8');
console.log(`[sitemap] ${pages.length} pages → dist/sitemap.xml`);

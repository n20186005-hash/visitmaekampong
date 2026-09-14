/**
 * Converts the Chinese source strings to Traditional Chinese (Taiwan, with
 * phrase conversion) so /zh/ can be announced as zh-Hant / zh-Hant-TW /
 * zh-Hant-HK instead of zh-CN.
 *
 * Only string literals that actually contain Han characters are touched, so
 * code, keys, Thai/English copy and punctuation stay untouched.
 *
 * Usage: npm run i18n:hant
 */
import { readFileSync, writeFileSync } from 'node:fs';
import * as OpenCC from 'opencc-js';

const convert = OpenCC.Converter({ from: 'cn', to: 'twp' });
const HAS_HAN = /[㐀-䶿一-鿿豈-﫿]/;

// OpenCC picks a few forms that read wrong for a Taiwanese audience; force the
// forms this site wants. Applied after every conversion so re-runs stay stable.
const OVERRIDES = [
  ['社群', '社區'], // a village community, not an online community
  ['髮展', '發展'], // 发 → 發 (OpenCC falls back to 髮 outside known phrases)
  ['運營', '營運'],
];

// Files that hold Chinese copy outside of i18n/zh.json.
const FILES = [
  'src/i18n/zh.json',
  'src/config.ts',
  'src/lib/weather.ts',
  'src/components/Hero.astro',
];

const convertQuoted = (src) => {
  const out = src
    .replace(/'([^'\n]*)'/g, (m, s) => (HAS_HAN.test(s) ? `'${convert(s)}'` : m))
    .replace(/"([^"\n]*)"/g, (m, s) => (HAS_HAN.test(s) ? `"${convert(s)}"` : m))
    .replace(/`([^`\n]*)`/g, (m, s) => (HAS_HAN.test(s) ? `\`${convert(s)}\`` : m));
  return OVERRIDES.reduce((acc, [from, to]) => acc.split(from).join(to), out);
};

let changed = 0;
for (const file of FILES) {
  const before = readFileSync(file, 'utf8');
  const after = convertQuoted(before);
  if (before === after) {
    console.log(`[zh-hant] ${file} — unchanged`);
    continue;
  }
  writeFileSync(file, after, 'utf8');
  changed += 1;
  console.log(`[zh-hant] ${file} — converted`);
}
console.log(`[zh-hant] ${changed}/${FILES.length} files updated`);

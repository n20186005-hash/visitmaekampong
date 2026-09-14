import th from './th.json';
import en from './en.json';
import zh from './zh.json';

export const defaultLang = 'th';
export const languagesList = ['th', 'en', 'zh'] as const;
export type Lang = (typeof languagesList)[number];

export const languages: Record<Lang, string> = {
  th: 'ไทย',
  en: 'EN',
  zh: '中',
};

const messagesMap: Record<Lang, any> = { th, en, zh };

// mapping for <html lang> — /zh/ is Traditional Chinese (Taiwan / Hong Kong)
export const htmlLang: Record<Lang, string> = {
  th: 'th',
  en: 'en',
  zh: 'zh-Hant',
};

/**
 * Every hreflang code a page must announce. /zh/ serves Traditional Chinese, so
 * it is declared once language-only (zh-Hant) and once per target region
 * (zh-Hant-TW / zh-Hant-HK) — all pointing at the same URL.
 */
export const hreflangCodes: Record<Lang, string[]> = {
  th: ['th'],
  en: ['en'],
  zh: ['zh-Hant', 'zh-Hant-TW', 'zh-Hant-HK'],
};

// og:locale wants the underscore form (zh_TW), not BCP 47.
export const ogLocale: Record<Lang, string> = {
  th: 'th_TH',
  en: 'en_US',
  zh: 'zh_TW',
};

const lookup = (obj: Record<string, unknown>, key: string): string => {
  const parts = key.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof cur === 'string' ? cur : key;
};

export const getI18n = async (url: URL) => {
  const raw = url.pathname.split('/').filter(Boolean)[0] as Lang;
  const lang = (languagesList.includes(raw) ? raw : defaultLang) as Lang;
  const messages = messagesMap[lang];
  const t = (key: string) => lookup(messages as unknown as Record<string, unknown>, key);
  return { lang, t, messages };
};

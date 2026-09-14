import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://visitmaekampong.com',
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: false },
  }),
  build: {
    // Keep each language page as a real folder so Cloudflare Workers serves
    // /th/, /en/ and /zh/ as directory indexes.
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'th',
    locales: ['th', 'en', 'zh'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

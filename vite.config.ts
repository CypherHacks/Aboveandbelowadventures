// vite.config.ts
import { defineConfig, loadEnv, type Plugin, type HtmlTagDescriptor } from 'vite';
import react from '@vitejs/plugin-react';

function seoFiles(opts: { siteUrl: string; extraRoutesFile?: string; supabaseUrl?: string }): Plugin {
  let outDir = 'dist';

  const toAbs = (site: string, path: string) =>
    /^https?:\/\//i.test(path) ? path : `${site}${path.startsWith('/') ? path : `/${path}`}`;

  const plugin: Plugin = {
    name: 'seo-files',
    apply: 'build', // <- typed literal, OK
    configResolved(config) {
      outDir = config.build?.outDir ?? 'dist';
    },
    transformIndexHtml() {
      if (!opts.supabaseUrl) return;
      let origin: string | undefined;
      try {
        origin = new URL(opts.supabaseUrl).origin;
      } catch {
        /* ignore bad URL */
      }
      if (!origin) return;
      const tag: HtmlTagDescriptor = {
        tag: 'link',
        attrs: { rel: 'preconnect', href: origin, crossorigin: '' },
        injectTo: 'head',
      };
      return [tag]; // acceptable return type
    },
    async closeBundle() {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');

      const routes = new Set<string>(['/', '/packages', '/gallery', '/about', '/contact']);

      if (opts.extraRoutesFile) {
        const extraPath = path.resolve(process.cwd(), opts.extraRoutesFile);
        try {
          const text = await fs.readFile(extraPath, 'utf8');
          for (const line of text.split('\n')) {
            const p = line.trim();
            if (p) routes.add(p.startsWith('/') ? p : `/${p}`);
          }
        } catch {
          /* optional file */
        }
      }

      const lastmod = new Date().toISOString().slice(0, 10);
      const urlset = [...routes]
        .map((r) => `<url><loc>${toAbs(opts.siteUrl, r)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq></url>`)
        .join('');

      const xml =
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}</urlset>`;

      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(path.join(outDir, 'sitemap.xml'), xml, 'utf8');

      const robots = `User-agent: *\nDisallow:\n\nSitemap: ${opts.siteUrl}/sitemap.xml\n`;
      await fs.writeFile(path.join(outDir, 'robots.txt'), robots, 'utf8');
    },
  };

  return plugin;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const SITE_URL = (env.VITE_SITE_URL || 'https://example.com').replace(/\/$/, '');
  const SUPABASE_URL = env.VITE_SUPABASE_URL;

  return {
    plugins: [
      react(), // OK: @vitejs/plugin-react already returns a valid PluginOption
      seoFiles({
        siteUrl: SITE_URL,
        extraRoutesFile: 'public/sitemap-extra.txt', // optional list of extra routes
        supabaseUrl: SUPABASE_URL, // optional preconnect
      }),
    ],
    optimizeDeps: { exclude: ['lucide-react'] },
    build: { sourcemap: true },
  };
});

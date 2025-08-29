// netlify/functions/sitemap.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// No session needed in a server function
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const isoDate = (d) => new Date(d).toISOString().slice(0, 10);
const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  })[c]);

const getBaseUrl = (event) => {
  const envUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');
  if (envUrl) return envUrl;
  const host = event.headers['x-forwarded-host'] || event.headers.host;
  const proto = event.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
};

export async function handler(event) {
  try {
    const site = getBaseUrl(event);
    const today = isoDate(Date.now());

    // Add your stable top-level routes here
    const urls = [
      { loc: `${site}/`, lastmod: today },
      { loc: `${site}/packages`, lastmod: today },
      { loc: `${site}/gallery`, lastmod: today },
      { loc: `${site}/about`, lastmod: today },
      { loc: `${site}/contact`, lastmod: today },
    ];

    // Pull package slugs/ids from your Supabase table
    // Adjust table or column names if needed.
    const { data, error } = await db
      .from('packages')
      .select('slug, id, updated_at, updatedAt')
      .limit(5000);

    if (error) {
      // If DB fails, still serve the static routes so GSC can read a valid sitemap.
      console.error('sitemap db error:', error);
    } else if (Array.isArray(data)) {
      for (const row of data) {
        const slug = row.slug ?? (row.id != null ? String(row.id) : null);
        if (!slug) continue;
        const last = row.updated_at || row.updatedAt || today;
        urls.push({
          loc: `${site}/packages/${slug}`,
          lastmod: isoDate(last),
        });
      }
    }

    const items = urls
      .map(
        (u) =>
          `<url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>weekly</changefreq></url>`
      )
      .join('');
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600',
      },
      body: xml,
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
      body: `sitemap error: ${e}`,
    };
  }
}

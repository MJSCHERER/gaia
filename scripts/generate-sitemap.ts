// ./scripts/generate-sitemap.ts

import fs from 'fs';
import path from 'path';

const siteUrl = 'https://gaiamundi.com';

// --- Public Routes aus React Router + Backend Endpoints (öffentlich) ---
const routes: string[] = [
  '/',
  '/en/',
  '/es/',
  '/de/',
  '/about',
  '/gallery',
  '/cart',
  '/artwork/:slug',
  '/artist/:slug',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password/:token',
  '/verify-email/:token',
  '/privacy-policy',
];

// Funktion zum Erstellen eines XML-Eintrags
function sitemapEntry(
  url: string,
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
  priority: number = 0.8,
): string {
  return `
  <url>
    <loc>${siteUrl}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// Sitemap XML generieren
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => sitemapEntry(r)).join('\n')}
</urlset>
`;

// Speicherpfade
const distPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');

// Schreiben der Datei
fs.writeFileSync(distPath, xml);
fs.writeFileSync(publicPath, xml);

console.log(`✅ Sitemap generated:
- ${distPath}
- ${publicPath}`);

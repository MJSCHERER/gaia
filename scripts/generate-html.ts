// ./scripts/generate-gaiamundi-html.ts

import fs from 'fs';
import path from 'path';

type Lang = 'en' | 'de' | 'es';

// Meta für jede Sprache
const meta: Record<Lang, { title: string; description: string }> = {
  en: {
    title: 'Gaiamundi - Unique Artworks by Visionary Artists | Non-AI Art & NFTs',
    description:
      'Explore Gaiamundi: unique, original artworks by visionary artists where creativity meets the cosmos. Discover digital art, NFTs, and non-AI fine art for collectors and enthusiasts worldwide.',
  },
  de: {
    title: 'Gaiamundi - Einzigartige Kunstwerke visionärer Künstler | Non-AI Art & NFTs',
    description:
      'Entdecke Gaiamundi: einzigartige, originale Kunstwerke visionärer Künstler, wo Kreativität auf den Kosmos trifft. Digitale Kunst, NFTs und Non-AI Fine Art für Sammler weltweit.',
  },
  es: {
    title: 'Gaiamundi - Obras de Arte Únicas de Artistas Visionarios | Non-AI Art & NFTs',
    description:
      'Explora Gaiamundi: obras de arte únicas y originales de artistas visionarios donde la creatividad se encuentra con el cosmos. Descubre arte digital, NFTs y arte Non-AI para coleccionistas.',
  },
};

// Basis-HTML-Vorlage
function generateHtml(lang: Lang, title: string, description: string) {
  const siteUrl = 'https://www.gaiamundi.com';
  const urlMap: Record<string, string> = { en: '/en/', de: '/de/', es: '/es/' };

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Title -->
  <title>${title}</title>

  <!-- Description -->
  <meta name="description" content="${description}" />

  <!-- Keywords -->
  <meta name="keywords" content="original art, visionary artists, contemporary gallery, digital art, NFT art, unique artwork, fine art, non-AI art, collectible art, cosmic art, modern art, Gaiamundi, art marketplace, digital collectibles, creative vision, art inspiration" />

  <!-- Author -->
  <meta name="author" content="Gaiamundi" />

  <!-- Canonical -->
  <link rel="canonical" href="${siteUrl}${urlMap[lang]}" />

  <!-- Hreflang -->
  <link rel="alternate" href="${siteUrl}/es/" hreflang="es" />
  <link rel="alternate" href="${siteUrl}/en/" hreflang="en" />
  <link rel="alternate" href="${siteUrl}/de/" hreflang="de" />
  <link rel="alternate" href="${siteUrl}/" hreflang="x-default" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Gaiamundi" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${siteUrl}/gaiamundi-logo.png" />
  <meta property="og:url" content="${siteUrl}${urlMap[lang]}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${siteUrl}/gaiamundi-logo.png" />

  <!-- JSON-LD Organization -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gaiamundi",
    "url": "${siteUrl}",
    "logo": "${siteUrl}/gaiamundi-logo.png",
    "sameAs": [
      "https://www.facebook.com/gaiamundi",
      "https://twitter.com/gaiamundi",
      "https://www.instagram.com/gaiamundi"
    ]
  }
  </script>

  <!-- Sitemap -->
  <link rel="sitemap" type="application/xml" title="Sitemap" href="${siteUrl}/sitemap.xml" />

  <!-- Favicons & App Icons -->
  <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png">
  <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png">
  <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png">
  <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png">
  <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png">
  <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
  <meta name="theme-color" content="#ffffff">
  <link rel="mask-icon" href="/favicon/gaiamundi-logo.svg" color="#000000" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
}

// Ausgabeordner
const outputDir = path.join(process.cwd(), 'public');

// Sprachversionen schreiben
for (const lang of ['es', 'en', 'de'] as Lang[]) {
  let dir = outputDir;
  if (lang !== 'es') dir = path.join(outputDir, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    generateHtml(lang, meta[lang].title, meta[lang].description),
    'utf-8',
  );
  console.log(`✅ Generated ${lang}/index.html`);
}

console.log('✅ HTML generation completed.');

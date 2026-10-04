// src/pages/sitemap-[id].xml.ts
import type { APIRoute } from 'astro';
import tarotData from '../assets/tarot-images.json';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const pageNum = parseInt(id || '1', 10);
  
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 10) {
    return new Response('Sitemap Not Found', { status: 404 });
  }

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const cards = tarotData.cards;
  const PER_PAGE = 50000;
  const startIndex = (pageNum - 1) * PER_PAGE;
  const endIndex = pageNum * PER_PAGE;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  let counter = 0;

  // Permutasi 3 Kartu (Past, Present, Future)
  outerLoop: for (let i = 0; i < cards.length; i++) {
    for (let j = 0; j < cards.length; j++) {
      if (i === j) continue;
      for (let k = 0; k < cards.length; k++) {
        if (k === i || k === j) continue;

        // Cek apakah permutasi ini masuk ke chunk halaman sitemap saat ini
        if (counter >= startIndex && counter < endIndex) {
          const slug = `${slugify(cards[i].name)}-${slugify(cards[j].name)}-${slugify(cards[k].name)}`;
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/${slug}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }

        counter++;
        if (counter >= endIndex) break outerLoop;
      }
    }
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
/**
 * SanceaVet — sitemap.xml dynamique.
 *
 * Liste les pages publiques du site + chaque article de blog (récupéré depuis
 * data/posts.json), afin que Google découvre automatiquement les nouveaux
 * articles sans intervention manuelle.
 */

const SITE = 'https://sanceavet.fr';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/equipe/adrien-le-leuch', priority: '0.8', changefreq: 'monthly' },
  { loc: '/equipe/maxime-bousses', priority: '0.8', changefreq: 'monthly' },
  { loc: '/equipe/lucie-lengelle', priority: '0.8', changefreq: 'monthly' },
  { loc: '/equipe/alexis-racine', priority: '0.8', changefreq: 'monthly' },
  { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
  { loc: '/referencement-veterinaire', priority: '0.7', changefreq: 'monthly' },
  { loc: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
  { loc: '/politique-confidentialite', priority: '0.3', changefreq: 'yearly' },
  { loc: '/conditions-generales-fonctionnement', priority: '0.3', changefreq: 'yearly' },
];

function slugify(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function onRequest(context) {
  const { env, request } = context;
  const requestOrigin = new URL(request.url).origin;

  let posts = [];
  try {
    const res = await env.ASSETS.fetch(new URL('/data/posts.json', requestOrigin));
    if (res.ok) {
      const data = await res.json();
      posts = Array.isArray(data.posts) ? data.posts : [];
    }
  } catch (_) {
    /* sitemap sans articles plutôt qu'une erreur */
  }

  const entries = [];

  for (const page of STATIC_PAGES) {
    entries.push(
      `  <url>\n` +
        `    <loc>${esc(SITE + page.loc)}</loc>\n` +
        `    <changefreq>${page.changefreq}</changefreq>\n` +
        `    <priority>${page.priority}</priority>\n` +
        `  </url>`
    );
  }

  for (const post of posts) {
    // Slug saisi dans l'admin, sinon dérivé du titre.
    const slug = slugify(post.slug || post.title);
    if (!slug) continue;
    const lastmod = /^\d{4}-\d{2}-\d{2}/.test(post.date || '') ? post.date.slice(0, 10) : '';
    entries.push(
      `  <url>\n` +
        `    <loc>${esc(`${SITE}/blog/${slug}`)}</loc>\n` +
        (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '') +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>0.7</priority>\n` +
        `  </url>`
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

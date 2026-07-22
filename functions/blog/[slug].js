/**
 * SanceaVet — Page article de blog avec méta-données SEO / réseaux sociaux.
 *
 * Sert /blog/<slug> en réutilisant le gabarit statique blog.html et en y
 * injectant, côté serveur (donc lisibles par les robots Facebook / Google qui
 * n'exécutent pas le JavaScript) :
 *   - <title> propre à l'article
 *   - meta description
 *   - Open Graph (og:title, og:description, og:image, og:url, og:type=article…)
 *   - Twitter Card
 *   - <link rel="canonical">
 *   - données structurées JSON-LD (schema.org/Article)
 *
 * Le corps de l'article reste rendu côté client par assets/js/blog.js.
 */

// Domaine de production : on force le canonical / og:url dessus pour consolider
// le référencement (évite le duplicate content entre *.pages.dev et le domaine).
const SITE = 'https://sanceavet.fr';
const DEFAULT_IMAGE = '/assets/img/veterinaire-chaton-consultation.jpg';

function slugify(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Slug effectif de l'article : celui saisi dans l'admin, sinon dérivé du titre.
function postSlug(post) {
  return slugify(post.slug || post.title);
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteUrl(path, origin) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return origin + (path.startsWith('/') ? path : '/' + path);
}

export async function onRequest(context) {
  const { params, env, request } = context;
  const requestOrigin = new URL(request.url).origin;
  const wanted = decodeURIComponent(params.slug || '');

  // Charge la liste des articles
  let posts = [];
  try {
    const res = await env.ASSETS.fetch(new URL('/data/posts.json', requestOrigin));
    if (res.ok) {
      const data = await res.json();
      posts = Array.isArray(data.posts) ? data.posts : [];
    }
  } catch (_) {
    /* on retombera sur le gabarit brut */
  }

  const target = slugify(wanted);
  const post = posts.find((p) => postSlug(p) === target);

  // Récupère le gabarit statique
  const template = await env.ASSETS.fetch(new URL('/blog.html', requestOrigin));

  // Article inconnu : on renvoie le gabarit tel quel (le client affichera
  // « Article introuvable »).
  if (!post) {
    return new Response(template.body, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const canonical = `${SITE}/blog/${postSlug(post)}`;
  // encodeURI : les images uploadées peuvent contenir des espaces/accents,
  // que Facebook n'accepte pas dans une URL og:image.
  const image = encodeURI(absoluteUrl(post.image, SITE) || SITE + DEFAULT_IMAGE);
  const pageTitle = `${post.title} – Blog | Sancéa Vet`;
  const desc = post.excerpt || '';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: desc,
    image: [image],
    datePublished: post.date || '',
    dateModified: post.date || '',
    articleSection: post.category || '',
    author: { '@type': 'Organization', name: 'Sancéa Vet' },
    publisher: {
      '@type': 'Organization',
      name: 'Sancéa Vet',
      logo: { '@type': 'ImageObject', url: `${SITE}/assets/img/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  }).replace(/</g, '\\u003c');

  const headTags = `
    <link rel="canonical" href="${esc(canonical)}">
    <meta name="description" content="${esc(desc)}">
    <meta name="author" content="Sancéa Vet">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${esc(post.title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${esc(canonical)}">
    <meta property="og:image" content="${esc(image)}">
    <meta property="og:site_name" content="Sancéa Vet">
    <meta property="og:locale" content="fr_FR">
    <meta property="article:published_time" content="${esc(post.date || '')}">
    <meta property="article:section" content="${esc(post.category || '')}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(post.title)}">
    <meta name="twitter:description" content="${esc(desc)}">
    <meta name="twitter:image" content="${esc(image)}">
    <script type="application/ld+json">${jsonLd}</script>
  `;

  // On retire les balises SEO génériques du gabarit pour éviter les doublons
  // (Facebook retiendrait sinon le premier og:title, celui de la page listing).
  const removeStatic = { element(el) { el.remove(); } };

  const rewriter = new HTMLRewriter()
    .on('title', {
      element(el) {
        el.setInnerContent(pageTitle);
      },
    })
    .on('link[rel="canonical"]', removeStatic)
    .on('meta[name="description"]', removeStatic)
    .on('meta[property^="og:"]', removeStatic)
    .on('meta[name^="twitter:"]', removeStatic)
    .on('head', {
      element(el) {
        el.append(headTags, { html: true });
      },
    });

  const response = rewriter.transform(template);
  return new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, must-revalidate',
    },
  });
}

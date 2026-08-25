const blogDataUrl = '/data/posts.json';

// Doit rester identique à slugify() côté serveur (functions/blog/[slug].js)
function slugify(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Slug effectif : celui saisi dans l'admin, sinon dérivé du titre.
function postSlug(post) {
    return slugify(post.slug || post.title);
}

function markdownToHtml(markdown) {
    if (!markdown) return '';
    const html = markdown
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/^\- (.*)$/gm, '<li>$1</li>')
        .replace(/(?:\r\n|\r|\n){2,}/g, '</p><p>');

    const listHtml = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    return `<p>${listHtml}</p>`
        .replace(/<p><ul>/g, '<ul>')
        .replace(/<\/ul><\/p>/g, '</ul>')
        .replace(/<p><\/p>/g, '');
}

function escapeAttr(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Convertit un lien YouTube / Vimeo saisi dans l'admin en URL d'intégration
// (iframe). Renvoie null si le lien n'est pas reconnu.
function videoEmbedUrl(url) {
    if (!url) return null;

    let parsed;
    try {
        parsed = new URL(String(url).trim());
    } catch (_) {
        return null;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

    const host = parsed.hostname.replace(/^www\./, '');

    // youtu.be/<id>
    if (host === 'youtu.be') {
        const id = parsed.pathname.split('/')[1];
        return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }

    // youtube.com/watch?v=<id>, /embed/<id>, /shorts/<id>, /live/<id>
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
        const id = parsed.searchParams.get('v')
            || (parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
        return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }

    // vimeo.com/<id> et player.vimeo.com/video/<id>
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
        const id = (parsed.pathname.match(/(\d+)/) || [])[1];
        return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    return null;
}

// Bloc vidéo d'un article : fichier MP4 uploadé en priorité, sinon lien
// YouTube / Vimeo. Chaîne vide si l'article n'a pas de vidéo.
function videoHtml(post) {
    if (!post) return '';

    if (post.videoFile) {
        // Pas de `poster` : l'image de l'article imposerait ses proportions au
        // lecteur et écraserait les vidéos verticales filmées au téléphone.
        const src = escapeAttr(post.videoFile);
        return `
            <div class="article-video article-video-file">
                <video controls preload="metadata" playsinline src="${src}">
                    Votre navigateur ne peut pas lire cette vidéo.
                    <a href="${src}">Télécharger la vidéo</a>
                </video>
            </div>`;
    }

    const embed = videoEmbedUrl(post.videoUrl);
    if (embed) {
        return `
            <div class="article-video article-video-embed">
                <iframe src="${escapeAttr(embed)}"
                        title="${escapeAttr(post.title)}"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen></iframe>
            </div>`;
    }

    // Lien non reconnu (Facebook, Instagram…) : on propose au moins le lien.
    if (post.videoUrl && /^https?:\/\//i.test(String(post.videoUrl).trim())) {
        return `<p class="article-video-link"><a href="${escapeAttr(post.videoUrl)}" target="_blank" rel="noopener">▶ Voir la vidéo</a></p>`;
    }

    return '';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function slugFromUrl() {
    // Nouvelle URL propre : /blog/<slug>
    const match = window.location.pathname.match(/^\/blog\/(.+?)\/?$/);
    if (match) return decodeURIComponent(match[1]);
    // Rétro-compatibilité : ancien format /blog.html?slug=<slug>
    return new URLSearchParams(window.location.search).get('slug');
}

// Ouvre le popup article (sur index.html) ou affiche inline (sur blog.html)
function openArticleModal(post) {
    const modal = document.getElementById('articleModal');
    if (modal) {
        document.getElementById('articleModalImg').src = post.image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&h=800&fit=crop';
        document.getElementById('articleModalImg').alt = post.title;
        document.getElementById('articleModalCategory').textContent = post.category || '';
        document.getElementById('articleModalDate').textContent = formatDate(post.date);
        document.getElementById('articleModalTitle').textContent = post.title;
        document.getElementById('articleModalExcerpt').textContent = post.excerpt;
        document.getElementById('articleModalBody').innerHTML = videoHtml(post) + markdownToHtml(post.body);
        document.getElementById('articleModalReadTime').textContent = post.timeToRead ? `Durée de lecture : ${post.timeToRead}` : '';

        // Boutons de partage — on pointe vers l'URL propre servie avec les
        // balises Open Graph (functions/blog/[slug].js) pour de belles vignettes.
        const articleUrl = encodeURIComponent(`${location.origin}/blog/${postSlug(post)}`);
        const articleTitle = encodeURIComponent(post.title);
        document.getElementById('articleModalShare').innerHTML = `
            <div class="share-bar">
                <span class="share-label">Partager :</span>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${articleUrl}" target="_blank" rel="noopener" class="share-btn share-facebook" title="Partager sur Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    Facebook
                </a>
                <a href="https://twitter.com/intent/tweet?url=${articleUrl}&text=${articleTitle}" target="_blank" rel="noopener" class="share-btn share-twitter" title="Partager sur X">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X
                </a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}" target="_blank" rel="noopener" class="share-btn share-linkedin" title="Partager sur LinkedIn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                </a>
                <a href="https://api.whatsapp.com/send?text=${articleTitle}%20${articleUrl}" target="_blank" rel="noopener" class="share-btn share-whatsapp" title="Partager sur WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    WhatsApp
                </a>
            </div>
            <style>
                .share-bar {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.6rem;
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #eee;
                }
                .share-label {
                    font-size: 0.9rem;
                    color: #666;
                    font-weight: 500;
                    margin-right: 0.2rem;
                }
                .share-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.45rem 0.9rem;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    text-decoration: none;
                    transition: opacity 0.2s, transform 0.2s;
                    color: white;
                }
                .share-btn:hover { opacity: 0.85; transform: translateY(-1px); }
                .share-facebook { background: #1877f2; }
                .share-twitter   { background: #000; }
                .share-linkedin  { background: #0a66c2; }
                .share-whatsapp  { background: #25d366; }
            </style>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeArticleModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('articleModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Expose globalement pour les boutons onclick
window.openArticleModal = openArticleModal;
window.closeArticleModal = closeArticleModal;

function createPostCard(post) {
    const hasModal = !!document.getElementById('articleModal');
    const cardAction = hasModal
        ? `onclick="openArticleModal(${JSON.stringify(post).replace(/"/g, '&quot;')})" style="cursor:pointer;"`
        : `onclick="location.href='/blog/${postSlug(post)}'" style="cursor:pointer;"`;

    return `
        <article class="blog-card fade-in" ${cardAction}>
            <div class="blog-image-wrapper">
                <img src="${post.image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&h=800&fit=crop'}" alt="${post.title}">
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="category">${post.category || 'Actualité'}</span>
                    <span>${formatDate(post.date)}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <div class="blog-footer">
                    <span class="date">${post.timeToRead || ''}</span>
                </div>
            </div>
        </article>
    `;
}

function renderBlogGrid(posts) {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    const sortedPosts = posts.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    // La homepage est la seule page à porter le bouton « Voir tous les articles » :
    // elle limite l'aperçu à 3 articles, la page /blog les affiche tous.
    const isHomepage = !!document.getElementById('voirTousBtn');

    // Aucun article publié : on affiche un message plutôt qu'une section vide
    if (sortedPosts.length === 0) {
        blogGrid.innerHTML = `
            <p style="grid-column:1/-1; text-align:center; color:var(--text-light); padding:2rem 0;">
                Aucun article pour le moment. Revenez bientôt !
            </p>`;
        const btn = document.getElementById('voirTousBtn');
        if (btn) btn.style.display = 'none';
        return;
    }

    const postsToShow = isHomepage ? sortedPosts.slice(0, 3) : sortedPosts;
    blogGrid.innerHTML = postsToShow.map(createPostCard).join('');

    // Le bouton "Voir tous les articles" est présent dans le HTML de la homepage :
    // on se contente de l'afficher (il reste masqué s'il n'y a aucun article).
    const voirTousBtn = document.getElementById('voirTousBtn');
    if (voirTousBtn) voirTousBtn.style.display = '';

    // Réactiver le fade-in sur les cartes injectées dynamiquement
    blogGrid.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100);
    });
}

function renderArticle(post) {
    const articleContainer = document.getElementById('articleContainer');
    const blogGrid = document.getElementById('blogGrid');
    const blogTitle = document.getElementById('blogTitle');

    if (!post || !articleContainer) return;

    if (blogGrid) blogGrid.style.display = 'none';
    if (blogTitle) blogTitle.textContent = post.title;

    document.title = `${post.title} – Blog | Sancéa Vet`;

    articleContainer.innerHTML = `
        <article class="blog-card article-view">
            <div class="blog-image-wrapper">
                <img src="${post.image || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&h=800&fit=crop'}" alt="${post.title}">
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="category">${post.category}</span>
                    <span>${formatDate(post.date)}</span>
                </div>
                <h1>${post.title}</h1>
                <p class="article-excerpt">${post.excerpt}</p>
                ${videoHtml(post)}
                <div class="article-body">${markdownToHtml(post.body)}</div>
                <p class="article-note">Durée de lecture : ${post.timeToRead || 'N/A'}</p>
            </div>
        </article>
        <p><a href="/blog">← Retour aux articles</a></p>
    `;
}

function renderNotFound() {
    const container = document.getElementById('articleContainer') || document.getElementById('blogGrid');
    if (!container) return;
    container.innerHTML = `<div class="blog-error"><h2>Article introuvable</h2><p>Le contenu demandé n'existe pas encore. Retournez à la page <a href="/blog">des articles</a>.</p></div>`;
}

async function loadBlog() {
    try {
        const response = await fetch(blogDataUrl);
        if (!response.ok) throw new Error('Impossible de charger les données du blog.');
        const data = await response.json();
        const posts = Array.isArray(data.posts) ? data.posts : [];
        const slug = slugFromUrl();

        if (slug) {
            const target = slugify(slug);
            const post = posts.find(item => postSlug(item) === target);
            if (post) renderArticle(post);
            else renderNotFound();
        } else {
            renderBlogGrid(posts);
        }
    } catch (error) {
        console.error(error);
        const container = document.getElementById('blogGrid');
        if (container) container.innerHTML = '<p>Impossible de charger les articles pour le moment.</p>';
    }
}

window.addEventListener('DOMContentLoaded', loadBlog);

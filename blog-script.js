// ===================================================================
//   BLOG SCRIPT - VERSION FINALE ET CORRIGÉE
// ===================================================================

// --- INITIALISATION DES PAGES ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#posts-grid')) {
        loadBlogIndex();
    }
    if (document.querySelector('#post-body')) {
        loadSinglePost();
    }
});

// --- VARIABLES GLOBALES ---
let allPosts = [];
let currentPosts = [];
const postsPerPage = 2;
let currentPage = 1;

// --- FONCTIONS PRINCIPALES ---

/**
 * Charge les articles et les notes, puis initialise l'affichage du blog.
 */
async function loadBlogIndex() {
    try {
        const [postsResponse, { data: ratingsData, error: ratingsError }] = await Promise.all([
            fetch('/blog/posts.json'),
            supabaseClient.from('rating').select('*')
        ]);

        if (ratingsError) {
            console.error('Erreur Supabase:', ratingsError);
            throw ratingsError;
        }
        
        allPosts = await postsResponse.json();

        const ratings = {};
        if (ratingsData) {
            ratingsData.forEach(item => {
                if (item.votes > 0) {
                    ratings[item.article_id] = {
                        rating: (item.total_score / item.votes).toFixed(1),
                        votes: item.votes
                    };
                }
            });
        }

        allPosts.forEach(post => {
            if (ratings[post.id]) {
                post.rating = ratings[post.id].rating;
                post.votes = ratings[post.id].votes;
            }
        });

        currentPosts = allPosts;
        displayPage(1);
        setupPagination();
        displayCategories();

    } catch (error) {
        console.error("Erreur de chargement du blog:", error);
        const grid = document.getElementById('posts-grid');
        if(grid) grid.innerHTML = "<p>Impossible de charger les articles. Vérifiez la console pour plus de détails.</p>";
    }
}

/**
 * Charge un article unique, son contenu, et gère le système de vote.
 */
// Dans blog-script.js, remplacez toute la fonction loadSinglePost

// Dans blog-script.js, remplacez toute la fonction loadSinglePost

// Dans le fichier : blog-script.js

async function loadSinglePost() {
    try {
        const postId = new URLSearchParams(window.location.search).get('id');
        if (!postId) return;

        const [postsResponse, markdownResponse, { data: ratingData, error: ratingsError }] = await Promise.all([
            fetch('/blog/posts.json'),
            fetch(`/blog/posts/${postId}.md`),
            supabaseClient.from('rating').select('*').eq('article_id', postId).single()
        ]);

        if (ratingsError && ratingsError.code !== 'PGRST116') {
            console.error('Erreur Supabase:', ratingsError);
        }

        const posts = await postsResponse.json();
        const postMeta = posts.find(p => p.id === postId);
        const markdown = await markdownResponse.text();

        document.title = `${postMeta.title} - Le Blog des Créatifs`;
        const header = document.getElementById('post-header');
        header.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(/${postMeta.coverImage})`;
        header.innerHTML = `
            <div class="post-header-content">
                <span class="post-card-category ${postMeta.category.toLowerCase().replace(/\s+/g, '-')}">${postMeta.category}</span>
                <h1>${postMeta.title}</h1>
                <p class="post-meta">Par ${postMeta.author} • ${postMeta.date}</p>
            </div>`;
        document.getElementById('post-body').innerHTML = marked.parse(markdown);
        
        setupShareLinks(postMeta.title);
        loadRecentPosts(posts, postId);

        const ratingWidget = document.querySelector('.rating-widget');
        const avgRatingContainer = document.getElementById('average-rating-display');
        const starsContainer = document.getElementById('user-rating-stars');
        
        if (ratingData && ratingData.votes > 0) {
            const average = (ratingData.total_score / ratingData.votes).toFixed(1);
            const voteText = ratingData.votes > 1 ? "votes" : "vote";
            avgRatingContainer.innerHTML = `Note moyenne : <span class="avg-stars">${average} ★</span> (${ratingData.votes} ${voteText})`;
        } else {
            avgRatingContainer.innerHTML = `Note moyenne : <span class="avg-stars">Pas encore noté</span>`;
        }

        // On vérifie si un score a été enregistré pour cet article
        const userVote = localStorage.getItem(`voted_score_${postId}`);
        if (userVote) {
            ratingWidget.classList.add('rated');
            const userScore = parseInt(userVote);
            const stars = starsContainer.querySelectorAll('i');
            stars.forEach((star, index) => {
                if (index < userScore) {
                    star.classList.add('user-rated'); // On colore les étoiles correspondantes
                }
            });
        }

        starsContainer.addEventListener('click', async (e) => {
            if (e.target.tagName === 'I' && !ratingWidget.classList.contains('rated')) {
                const score = parseInt(e.target.dataset.value);
                const { error } = await supabaseClient.rpc('add_vote', { post_id: postId, vote_score: score });
                
                if (error) {
                    console.error('Erreur lors de l\'envoi du vote:', error);
                } else {
                    // On enregistre le score précis
                    localStorage.setItem(`voted_score_${postId}`, score.toString());
                    location.reload();
                }
            }
        });

    } catch (error) {
        console.error("Erreur de chargement de l'article:", error);
    }
}


/**
 * Affiche les articles pour une page donnée.
 */
function displayPage(page) {
    const featuredContainer = document.getElementById('featured-post-container');
    const gridContainer = document.getElementById('posts-grid');
    gridContainer.innerHTML = '';
    featuredContainer.innerHTML = '';
    currentPage = page;

    const featuredPost = allPosts.find(p => p.isFeatured);
    let postsToDisplay = [...currentPosts];

    if (page === 1 && featuredPost && currentPosts.includes(featuredPost)) {
        featuredContainer.innerHTML = createPostCard(featuredPost);
        postsToDisplay = postsToDisplay.filter(p => !p.isFeatured);
    }

    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    const paginatedItems = postsToDisplay.slice(start, end);
    paginatedItems.forEach(post => {
        gridContainer.innerHTML += createPostCard(post);
    });
}

/**
 * Crée le HTML pour une carte d'article.
 */
// Dans blog-script.js, remplacez la fonction createPostCard

const createPostCard = (post) => {
    const categoryClass = (post.category || '').toLowerCase().replace(/\s+/g, '-');
    
    // ▼▼▼ LOGIQUE AMÉLIORÉE ICI ▼▼▼
    let ratingHtml = ''; // Par défaut, on n'affiche rien
    if (post.rating) {
        // Si l'article a une note, on l'affiche
        ratingHtml = `
            <div class="card-rating">
                <i class="fa-solid fa-star"></i>
                <span>${post.rating} (${post.votes} votes)</span>
            </div>
        `;
    } else {
        // Sinon, on affiche un message par défaut
        ratingHtml = `
            <div class="card-rating no-rating">
                <span>Pas encore noté</span>
            </div>
        `;
    }
    // ▲▲▲ FIN DE LA LOGIQUE AMÉLIORÉE ▲▲▲

    return `
    <article class="post-card">
        <a href="post.html?id=${post.id}"><img src="/${post.coverImage}" alt="${post.title}" class="post-card-image"></a>
        <div class="post-card-content">
            <span class="post-card-category ${categoryClass}">${post.category}</span>
            <a href="post.html?id=${post.id}" style="text-decoration: none;"><h2 class="post-card-title">${post.title}</h2></a>
            <p class="post-card-meta">Par ${post.author} • ${post.date}</p>
            ${ratingHtml}
            <p class="post-card-excerpt">${post.excerpt}</p>
            <a href="post.html?id=${post.id}" class="post-card-readmore">Lire la suite &rarr;</a>
        </div>
    </article>
    `;
};

/**
 * Crée les boutons de pagination.
 */
function setupPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const featuredPost = allPosts.find(p => p.isFeatured);
    let postsToPaginate = [...currentPosts];
    if (featuredPost && postsToPaginate.includes(featuredPost)) {
        postsToPaginate = postsToPaginate.filter(p => !p.isFeatured);
    }
    const pageCount = Math.ceil(postsToPaginate.length / postsPerPage);
    if (pageCount <= 1) return;
    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement('button');
        btn.classList.add('pagination-button');
        btn.innerText = i;
        if (i === currentPage) {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            displayPage(i);
            const currentActive = document.querySelector('.pagination-button.active');
            if(currentActive) currentActive.classList.remove('active');
            btn.classList.add('active');
        });
        paginationContainer.appendChild(btn);
    }
}

/**
 * Affiche les catégories et gère le filtrage.
 */
function displayCategories() {
    const categoryContainer = document.getElementById('category-list');
    if (!categoryContainer) return;
    const categories = ['Toutes les catégories', ...new Set(allPosts.map(p => p.category).filter(Boolean))];
    categoryContainer.innerHTML = categories.map(cat => `<li><a href="#" data-category="${cat}">${cat}</a></li>`).join('');
    const categoryLinks = categoryContainer.querySelectorAll('a');
    if (categoryLinks.length > 0) {
        categoryLinks[0].classList.add('active');
    }
    categoryLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const selectedCategory = link.dataset.category;
            if (selectedCategory === 'Toutes les catégories') {
                currentPosts = allPosts;
            } else {
                currentPosts = allPosts.filter(post => post.category === selectedCategory);
            }
            displayPage(1);
            setupPagination();
        });
    });
}

// --- Fonctions utilitaires ---
function loadRecentPosts(posts, currentPostId) {
    const recentPostsContainer = document.getElementById('recent-posts-list');
    if (!recentPostsContainer) return;
    const recentPosts = posts.filter(post => post.id !== currentPostId).slice(0, 3);
    recentPostsContainer.innerHTML = recentPosts.map(post => `
        <div class="recent-post-item">
            <a href="post.html?id=${post.id}"><img src="/${post.coverImage}" alt="${post.title}"></a>
            <div class="recent-post-item-info">
                <h4><a href="post.html?id=${post.id}">${post.title}</a></h4>
                <p>${post.date}</p>
            </div>
        </div>
    `).join('');
}

function setupShareLinks(title) {
    const url = window.location.href; 
    const text = encodeURIComponent(title);
    const facebookLink = document.getElementById('share-facebook');
    const whatsappLink = document.getElementById('share-whatsapp');
    const linkedinLink = document.getElementById('share-linkedin');

    if (facebookLink) facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (whatsappLink) whatsappLink.href = `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(url)}`;
    if (linkedinLink) linkedinLink.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${text}`;
}
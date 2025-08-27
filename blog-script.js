document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#posts-grid')) {
        loadBlogIndex();
    }
    if (document.querySelector('#post-body')) {
        loadSinglePost();
    }
});

// --- VARIABLES GLOBALES POUR GÉRER L'ÉTAT DU BLOG ---
let allPosts = []; // Stocke tous les articles chargés une seule fois
let currentPosts = []; // Stocke les articles actuellement affichés (filtrés ou non)
const postsPerPage = 2; // On affiche 3 articles par page
let currentPage = 1;

/**
 * Charge tous les articles et initialise l'affichage.
 */
async function loadBlogIndex() {
    try {
        const response = await fetch('blog/posts.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allPosts = await response.json();
        currentPosts = allPosts; // Au début, on affiche tous les articles

        displayPage(1); // Affiche la première page
        setupPagination(); // Crée les boutons de pagination
        displayCategories(); // Met en place les filtres de catégorie

    } catch (error) {
        console.error("Erreur de chargement du blog:", error);
    }
}

/**
 * Affiche les articles pour une page spécifique.
 * @param {number} page - Le numéro de la page à afficher.
 */
function displayPage(page) {
    const featuredContainer = document.getElementById('featured-post-container');
    const gridContainer = document.getElementById('posts-grid');
    
    gridContainer.innerHTML = '';
    featuredContainer.innerHTML = '';
    currentPage = page;

    const featuredPost = allPosts.find(p => p.isFeatured);
    let postsToDisplay = [...currentPosts];

    // L'article à la une est affiché séparément sur la première page,
    // PEU IMPORTE la catégorie sélectionnée, du moment qu'il est dans la liste filtrée.
    if (page === 1 && featuredPost && currentPosts.includes(featuredPost)) {
        featuredContainer.innerHTML = createPostCard(featuredPost);
        // On le retire de la liste pour ne pas le dupliquer dans la grille.
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
const createPostCard = (post) => `
    <article class="post-card">
        <a href="post.html?id=${post.id}"><img src="${post.coverImage}" alt="${post.title}" class="post-card-image"></a>
        <div class="post-card-content">
            <span class="post-card-category">${post.category}</span>
            <a href="post.html?id=${post.id}" style="text-decoration: none;"><h2 class="post-card-title">${post.title}</h2></a>
            <p class="post-card-meta">Par ${post.author} • ${post.date}</p>
            <p class="post-card-excerpt">${post.excerpt}</p>
            <a href="post.html?id=${post.id}" class="post-card-readmore">Lire la suite &rarr;</a>
        </div>
    </article>
`;

/**
 * Crée et gère les boutons de pagination.
 */
function setupPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    const featuredPost = allPosts.find(p => p.isFeatured);
    let postsToPaginate = [...currentPosts];

    // Si l'article à la une est dans la liste filtrée, on ne le compte pas pour la pagination.
    if (featuredPost && postsToPaginate.includes(featuredPost)) {
        postsToPaginate = postsToPaginate.filter(p => !p.isFeatured);
    }

    const pageCount = Math.ceil(postsToPaginate.length / postsPerPage);
    
    if (pageCount <= 1) return; // Ne pas afficher la pagination s'il n'y a qu'une page

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

    const categories = ['Toutes les catégories', ...new Set(allPosts.map(p => p.category))];
    categoryContainer.innerHTML = categories.map(cat => `<li><a href="#" data-category="${cat}">${cat}</a></li>`).join('');

    const categoryLinks = categoryContainer.querySelectorAll('a');
    categoryLinks[0].classList.add('active');

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
            
            displayPage(1); // Affiche la première page des résultats filtrés
            setupPagination(); // Met à jour la pagination pour les résultats filtrés
        });
    });
}


// --- Fonctions pour la page d'un article (CORRIGÉES) ---
async function loadSinglePost() {
    try {
        const postId = new URLSearchParams(window.location.search).get('id');
        if (!postId) return;
        const [postsResponse, markdownResponse] = await Promise.all([
            fetch('blog/posts.json'),
            fetch(`blog/posts/${postId}.md`)
        ]);
        const posts = await postsResponse.json();
        const postMeta = posts.find(p => p.id === postId);
        const markdown = await markdownResponse.text();
        document.title = `${postMeta.title} - Le Blog des Créatifs`;
        const header = document.getElementById('post-header');
        header.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${postMeta.coverImage})`;
        
        header.innerHTML = `
            <div class="post-header-content">
                <span class="post-card-category">${postMeta.category}</span>
                <h1>${postMeta.title}</h1>
                <p class="post-meta">Par ${postMeta.author} • ${postMeta.date}</p>
            </div>`;

        document.getElementById('post-body').innerHTML = marked.parse(markdown);
        setupShareLinks(postMeta.title);
        loadRecentPosts(posts, postId);
    } catch (error) {
        console.error("Erreur de chargement de l'article:", error);
    }
}

function loadRecentPosts(allPosts, currentPostId) {
    const recentPostsContainer = document.getElementById('recent-posts-list');
    if (!recentPostsContainer) return;
    const recentPosts = allPosts.filter(post => post.id !== currentPostId).slice(0, 3);
    let html = '';
    recentPosts.forEach(post => {
        html += `
            <div class="recent-post-item">
                <a href="post.html?id=${post.id}">
                    <img src="${post.coverImage}" alt="${post.title}">
                </a>
                <div class="recent-post-item-info">
                    <h4><a href="post.html?id=${post.id}">${post.title}</a></h4>
                    <p>${post.date}</p>
                </div>
            </div>
        `;
    });
    recentPostsContainer.innerHTML = html;
}

function setupShareLinks(title) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    
    document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    document.getElementById('share-whatsapp').href = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    document.getElementById('share-linkedin').href = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
}
// ===================================================================
//   SCRIPT PRINCIPAL COMPLET ET FINAL (pour index.html)
// ===================================================================

// --- CONFIGURATION DE SUPABASE ---
// Ces clés sont publiques et sécurisées par les politiques RLS de votre base de données.
const SUPABASE_URL = 'https://udehcxhyzddwbvvlmzvx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZWhjeGh5emRkd2J2dmxtenZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MjQyMTAsImV4cCI6MjA3MjAwMDIxMH0.9U3hkFXT39f4TV-ETbs6dMJ6vs_5gPEP0tabRJK1nNU';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Gère l'affichage des badges de session en fonction de la date actuelle.
 */
function automateSessionBadges() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // On compare uniquement les jours, pas l'heure

    const badges = document.querySelectorAll('.session-badge');
    badges.forEach(badge => {
        const sessionDateString = badge.dataset.sessionDate; // Lit la date depuis l'attribut HTML
        if (sessionDateString) {
            const sessionDate = new Date(sessionDateString);
            if (sessionDate < today) {
                // Si la date de la session est passée, on cache le badge
                badge.classList.add('hidden');
            }
        }
    });
}

/**
 * Charge les articles populaires depuis le JSON et les notes depuis Supabase.
 */
async function loadPopularPosts() {
    const grid = document.getElementById('popular-posts-grid');
    if (!grid) return;

    const createPopularPostCard = (post) => {
        const categoryClass = (post.category || '').toLowerCase().replace(/\s+/g, '-');
        let ratingHtml = `
            <div class="card-rating no-rating">
                <span>Pas encore noté</span>
            </div>`;
            
        if (post.rating && post.votes > 0) {
            ratingHtml = `
            <div class="card-rating">
                <i class="fa-solid fa-star"></i>
                <span>${post.rating} (${post.votes} ${post.votes > 1 ? 'votes' : 'vote'})</span>
            </div>`;
        }

        return `
        <article class="post-card">
            <a href="post.html?id=${post.id}"><img src="${post.coverImage}" alt="${post.title}" class="post-card-image"></a>
            <div class="post-card-content">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span class="post-card-category ${categoryClass}">${post.category}</span>
                    ${ratingHtml}
                </div>
                <a href="post.html?id=${post.id}" style="text-decoration: none;"><h3 class="post-card-title" style="font-size: 1.2rem;">${post.title}</h3></a>
                <p class="post-card-excerpt">${post.excerpt}</p>
                <a href="post.html?id=${post.id}" class="post-card-readmore">Lire la suite &rarr;</a>
            </div>
        </article>`;
    };

    try {
        const [postsResponse, { data: ratingsData, error: ratingsError }] = await Promise.all([
            fetch('blog/posts.json'),
            supabaseClient.from('rating').select('*')
        ]);

        if (!postsResponse.ok) throw new Error('Impossible de charger les articles.');
        if (ratingsError) throw ratingsError;

        const allPosts = await postsResponse.json();
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

        const popularPosts = allPosts.filter(post => post.isPopular).slice(0, 3);
        
        if (popularPosts.length === 0) {
            grid.innerHTML = "<p>Aucun article populaire à afficher pour le moment.</p>";
            return;
        }

        grid.innerHTML = popularPosts.map(createPopularPostCard).join('');

    } catch (error) {
        console.error("Erreur lors du chargement des articles populaires:", error);
        grid.innerHTML = "<p>Erreur lors du chargement des articles.</p>";
    }
}


// --- SCRIPT PRINCIPAL QUI S'EXÉCUTE APRÈS LE CHARGEMENT DE LA PAGE ---
document.addEventListener('DOMContentLoaded', () => {
    
    // On lance les fonctions nécessaires au démarrage
    if (document.getElementById('popular-posts-grid')) {
        loadPopularPosts();
    }
    automateSessionBadges();

    // --- Animation de la navbar au scroll ---
    const navbar = document.getElementById('navbar');
    if(navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Animation des chiffres (compteur "à propos") ---
    const counterSection = document.querySelector('#apropos');
    if (counterSection) {
        const counters = counterSection.querySelectorAll('.partie-basse span[data-target]');
        let hasAnimated = false;

        const checkVisibilityAndAnimate = () => {
            if (hasAnimated) return;
            const rect = counterSection.getBoundingClientRect();
            const isVisible = (rect.top <= window.innerHeight) && (rect.bottom >= 0);
            if (isVisible) {
                animateCounters();
                hasAnimated = true;
                window.removeEventListener('scroll', checkVisibilityAndAnimate);
            }
        };

        const animateCounters = () => {
            counters.forEach(counter => {
                counter.innerText = '0';
                const target = +counter.getAttribute('data-target');
                const duration = 1500;
                const increment = target / (duration / 20);
                const updateCount = () => {
                    const current = +counter.innerText;
                    if (current < target) {
                        counter.innerText = `${Math.ceil(current + increment)}`;
                        setTimeout(updateCount, 20);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
            });
        };
        window.addEventListener('scroll', checkVisibilityAndAnimate);
        checkVisibilityAndAnimate();
    }

    // --- Gestion de la Popup de bienvenue ---
    const popupOverlay = document.querySelector('.popup-overlay');
    const popupClose = document.querySelector('.popup-close');
    const openPopup = () => {
        if (popupOverlay) {
            popupOverlay.classList.add('active');
        }
    };
    if (popupClose) {
        popupClose.addEventListener('click', () => {
            if (popupOverlay) popupOverlay.classList.remove('active');
        });
    }
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                popupOverlay.classList.remove('active');
            }
        });
    }

    // --- Animation des cercles flottants du Hero ---
    const canvas = document.getElementById('floatingCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let circles = [];
        let resizeTimeout;

        function setupCanvasAndCircles() {
            const heroSection = document.getElementById('hero');
            if (!heroSection) return;
            const newWidth = heroSection.clientWidth;
            const newHeight = heroSection.clientHeight;

            if (canvas.width === newWidth && canvas.height === newHeight) return;

            canvas.width = newWidth;
            canvas.height = newHeight;
            circles = [];
            
            for (let i = 0; i < 15; i++) {
                circles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: 5 + Math.random() * 15,
                    speed: 0.3 + Math.random() * 0.5,
                    opacity: 0.2 + Math.random() * 0.4,
                });
            }
        }

        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            circles.forEach(c => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
                ctx.fill();
                c.y -= c.speed;
                if (c.y + c.radius < 0) {
                    c.y = canvas.height + Math.random() * 100;
                    c.x = Math.random() * canvas.width;
                }
            });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(setupCanvasAndCircles, 250);
        });

        setupCanvasAndCircles();
        animate();
    }
});

// --- Logique du Preloader (qui déclenche la popup) ---
// Rappel : la classe "loading" doit être sur la balise <body> de votre HTML
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');

    if (preloader) {
        preloader.classList.add('hidden');
        preloader.addEventListener('transitionend', function() {
            preloader.remove();
            // On récupère la fonction openPopup qui est globale
            const openPopup = document.querySelector('.popup-overlay');
            if(openPopup) {
                setTimeout(() => openPopup.classList.add('active'), 1000); 
            }
        });
    }
});

// --- Initialisation de la bannière de cookies ---
// La fonction est globale pour être accessible par le script injecté
function initializeCookieBanner() {
    const cookieBanner = document.querySelector('.cookie-banner');
    const acceptBtn = document.querySelector('.cookie-accept-btn');
    if (!cookieBanner || !acceptBtn) return;
    if (!localStorage.getItem('cookiesAccepted')) {
        cookieBanner.style.display = 'flex';
    }
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.style.display = 'none';
    });
}
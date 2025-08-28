//animation de la navbar

const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll("nav ul li a");

  // Fonction pour retirer .active sauf sur "Accueil"
  function removeActiveClasses() {
    navLinks.forEach(link => {
      if (link.textContent.trim().toLowerCase() !== "acceuil") {
        link.classList.remove("active");
      }
    });
  }

  // Activation au scroll
  window.addEventListener("scroll", () => {
    let currentSection = null;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute("id");
      }
    });

    if (currentSection) {
      removeActiveClasses();
      const activeLink = document.querySelector(`nav ul li a[href="#${currentSection}"]`);
      if (activeLink) {
        activeLink.classList.add("active");
      }
    } else {
      // Aucun lien actif, sauf Acceuil si tu veux le forcer
      removeActiveClasses();
    }
  });

  //Animation car de formation en ligne
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Place à l'animation hero-header
// Place à l'animation hero-header
const canvas = document.getElementById('floatingCanvas');
const ctx = canvas.getContext('2d');

let circles = [];
let resizeTimeout;

// Fonction pour configurer le canvas et les cercles
function setupCanvasAndCircles() {
    // Utilisez la taille de la section hero, pas la fenêtre
    const heroSection = document.getElementById('hero');
    const newWidth = heroSection.clientWidth;
    const newHeight = heroSection.clientHeight;

    // Vérifiez si les dimensions ont vraiment changé pour éviter les recalculs inutiles
    if (canvas.width === newWidth && canvas.height === newHeight) {
        return;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    // Réinitialise le tableau de cercles avant de les recréer
    circles = [];
    
    // Création de cercles flottants
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

// Appelez la fonction une première fois au chargement
setupCanvasAndCircles();

// Écoutez l'événement 'resize' avec une technique de "débounce"
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setupCanvasAndCircles, 250);
});

// Fonction d'animation principale
function animate() {
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

// Lancez l'animation
animate();

    //animation scroll-navbar

  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });


// Place à l'animation de la section apropos (Version Corrigée)

// Place à l'animation de la section apropos (Version finale compatible Android)

document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector('#apropos');
    if (!section) return;

    const counters = section.querySelectorAll('.partie-basse span[data-target]');
    let hasAnimated = false; // Un drapeau pour s'assurer que l'animation ne se lance qu'une fois

    // La fonction qui vérifie si l'élément est visible à l'écran
    function checkVisibilityAndAnimate() {
        if (hasAnimated) return; // Si l'animation a déjà eu lieu, on ne fait rien

        const rect = section.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight) && (rect.bottom >= 0);

        // Si la section est visible
        if (isVisible) {
            animateCounters();
            hasAnimated = true;
            // Une fois l'animation lancée, on arrête d'écouter le scroll pour optimiser
            window.removeEventListener('scroll', checkVisibilityAndAnimate);
        }
    }

    // La fonction qui anime les chiffres
    function animateCounters() {
        counters.forEach(counter => {
            counter.innerText = '0'; // On remet à 0 avant de démarrer

            const target = +counter.getAttribute('data-target');
            const duration = 1500; // Durée de 1.5 secondes, un bon compromis
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
    }

    // On attache la fonction de vérification à l'événement de défilement (scroll)
    window.addEventListener('scroll', checkVisibilityAndAnimate);

    // On vérifie une première fois au chargement, au cas où la section est déjà visible
    checkVisibilityAndAnimate();
});

// Animation de la section instant video

  // Partie-preloader & Popup

// On ajoute une classe au body pour cacher le contenu principal au début
document.body.classList.add('loading');

// On utilise l'événement 'load' pour attendre que TOUT soit chargé
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    
    // On retire la classe de chargement et on ajoute la classe "prêt"
    // pour déclencher l'animation de fondu du contenu
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');

    if (preloader) {
        // On ajoute la classe pour faire disparaître le pre-loader
        preloader.classList.add('hidden');

        // On supprime complètement le pre-loader du HTML après son animation
        preloader.addEventListener('transitionend', function() {
            preloader.remove();
            
            // On affiche la popup 1 seconde APRES la fin de l'animation
            setTimeout(openPopup, 1000); 
        });
    }
});

// --- Voici la partie de votre code pour la pop-up, que l'on place à part ---

// Cette fonction est désormais globale, donc accessible depuis le script du préchargeur.
const openPopup = () => {
    const popupOverlay = document.querySelector('.popup-overlay');
    if (popupOverlay) {
        popupOverlay.classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const popupOverlay = document.querySelector('.popup-overlay');
    const popupClose = document.querySelector('.popup-close');

    // Fermeture de la pop-up en cliquant sur la croix
    if (popupClose) {
        popupClose.addEventListener('click', () => {
            if (popupOverlay) {
                popupOverlay.classList.remove('active');
            }
        });
    }

    // Fermeture de la pop-up en cliquant sur l'arrière-plan
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                popupOverlay.classList.remove('active');
            }
        });
    }

    // Le setTimeout initial pour la pop-up est supprimé car il est géré par le script du préchargeur.
});

//Place à la partie avec les Cookies

// NOUVEAU CODE DANS script.js
function initializeCookieBanner() {
    const cookieBanner = document.querySelector('.cookie-banner');
    const acceptBtn = document.querySelector('.cookie-accept-btn');
    const cookieName = 'cookiesAccepted';

    // S'il manque un des éléments, on arrête pour éviter une erreur
    if (!cookieBanner || !acceptBtn) {
        return;
    }

    // On vérifie si l'utilisateur a déjà accepté
    if (!localStorage.getItem(cookieName)) {
        // Si non, on affiche la bannière
        cookieBanner.style.display = 'flex';
    }

    // On gère le clic sur le bouton "J'accepte"
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem(cookieName, 'true');
        cookieBanner.style.display = 'none';
    });
}

// articles populaires

// --- SCRIPT POUR LES ARTICLES POPULAIRES SUR LA PAGE D'ACCUEIL ---

// On s'assure que le DOM est chargé avant de lancer le script
document.addEventListener('DOMContentLoaded', () => {
    // On vérifie qu'on est bien sur une page qui contient la grille des articles populaires
    if (document.getElementById('popular-posts-grid')) {
        loadPopularPosts();
    }
});

/**
 * Charge les données du blog, filtre les articles populaires et les affiche.
 */
async function loadPopularPosts() {
    const grid = document.getElementById('popular-posts-grid');
    
    try {
        // 1. Charger les données de tous les articles
        const response = await fetch('blog/posts.json');
        if (!response.ok) throw new Error('Impossible de charger les articles.');
        const allPosts = await response.json();

        // 2. Filtrer pour ne garder que les articles populaires (et en prendre 3 max)
        const popularPosts = allPosts.filter(post => post.isPopular).slice(0, 3);
        
        if (popularPosts.length === 0) {
            grid.innerHTML = "<p>Aucun article populaire à afficher pour le moment.</p>";
            return;
        }

        // 3. Générer le HTML pour chaque carte et l'insérer dans la grille
        let postsHtml = '';
        popularPosts.forEach(post => {
            postsHtml += createPostCard(post);
        });
        grid.innerHTML = postsHtml;

    } catch (error) {
        console.error("Erreur lors du chargement des articles populaires:", error);
        grid.innerHTML = "<p>Erreur lors du chargement des articles.</p>";
    }
}

// --- SCRIPT CORRIGÉ POUR LES ARTICLES POPULAIRES SUR LA PAGE D'ACCUEIL ---

document.addEventListener('DOMContentLoaded', () => {
    // On s'assure qu'on est bien sur une page qui contient la grille
    if (document.getElementById('popular-posts-grid')) {
        loadPopularPosts();
    }
});

// --- SCRIPT CORRIGÉ POUR LES ARTICLES POPULAIRES SUR LA PAGE D'ACCUEIL ---

document.addEventListener('DOMContentLoaded', () => {
    // On s'assure qu'on est bien sur une page qui contient la grille
    if (document.getElementById('popular-posts-grid')) {
        loadPopularPosts();
    }
});

/**
 * Charge, filtre et affiche les articles populaires.
 */
async function loadPopularPosts() {
    const grid = document.getElementById('popular-posts-grid');
    
    /**
     * Crée le HTML pour une carte d'article avec une classe de catégorie dynamique.
     * CETTE FONCTION EST LOCALE POUR ÉVITER LES CONFLITS.
     */
    const createPopularPostCard = (post) => {
        // Crée une version "propre" du nom de la catégorie pour l'utiliser comme classe CSS
        const categoryClass = post.category.toLowerCase().replace(/\s+/g, '-');
        
        const title = post.title || "Titre non disponible";
        const excerpt = post.excerpt || "";
        const category = post.category || "Inclassé";
        const coverImage = post.coverImage || "path/to/default/image.jpg";
        const id = post.id;

        return `
            <article class="post-card">
                <a href="post.html?id=${id}"><img src="${coverImage}" alt="${title}" class="post-card-image"></a>
                <div class="post-card-content">
                    <span class="post-card-category ${categoryClass}">${category}</span>
                    <a href="post.html?id=${id}" style="text-decoration: none;"><h3 class="post-card-title">${title}</h3></a>
                    <p class="post-card-excerpt">${excerpt}</p>
                    <a href="post.html?id=${id}" class="post-card-readmore">Lire la suite &rarr;</a>
                </div>
            </article>
        `;
    };

    try {
        const response = await fetch('blog/posts.json');
        if (!response.ok) throw new Error('Impossible de charger les articles.');
        const allPosts = await response.json();

        // On filtre et on prend les 3 premiers articles populaires
        const popularPosts = allPosts.filter(post => post.isPopular).slice(0, 3);
        
        if (popularPosts.length === 0) {
            grid.innerHTML = "<p>Aucun article populaire à afficher pour le moment.</p>";
            return;
        }

        let postsHtml = '';
        popularPosts.forEach(post => {
            postsHtml += createPopularPostCard(post); // On utilise notre fonction locale et sûre
        });
        grid.innerHTML = postsHtml;

    } catch (error) {
        console.error("Erreur lors du chargement des articles populaires:", error);
        grid.innerHTML = "<p>Erreur lors du chargement des articles.</p>";
    }
}

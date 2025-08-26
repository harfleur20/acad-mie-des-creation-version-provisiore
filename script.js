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

  const videoItems = document.querySelectorAll('.video-item');

  videoItems.forEach(currentItem => {
    const video = currentItem.querySelector('video');
    const playBtn = currentItem.querySelector('.play-btn');

    // Lorsqu'on clique sur le bouton
    playBtn.addEventListener('click', () => {
      // Pause toutes les autres vidéos
      videoItems.forEach(item => {
        const otherVideo = item.querySelector('video');
        const otherBtn = item.querySelector('.play-btn');
        if (otherVideo !== video) {
          otherVideo.pause();
          otherBtn.style.display = 'block';
        }
      });

      // Lancer cette vidéo et masquer le bouton
      video.play();
      playBtn.style.display = 'none';
    });

    // Quand on clique directement sur la vidéo
    video.addEventListener('click', () => {
      video.pause();
      playBtn.style.display = 'block';
    });

    // Quand la vidéo se termine
    video.addEventListener('ended', () => {
      playBtn.style.display = 'block';
    });
  });

  // Partie-preloader & Popup

window.addEventListener('DOMContentLoaded', function() {
    // Sélectionne le préchargeur
    const preloader = document.getElementById('preloader');

    if (preloader) {
        // Déclenche l'animation de fondu
        preloader.style.opacity = '0'; 

        // Quand l'animation est finie, on le masque complètement
        preloader.addEventListener('transitionend', function() {
            preloader.style.display = 'none';

            // --- C'est ici que l'on déclenche l'affichage de la pop-up ---
            
            // On attend 1 seconde (1000 ms) après que le préchargeur a disparu
            // pour afficher la pop-up, pour laisser le temps à l'utilisateur de voir la page.
            setTimeout(openPopup, 1000); 

        }, { once: true });
        
        // Option de sécurité : si la transition ne fonctionne pas (par exemple si le CSS est manquant),
        // on masque quand même le préchargeur et on affiche la pop-up après un court délai.
        setTimeout(function() {
            preloader.style.display = 'none';
            setTimeout(openPopup, 1000);
        }, 600);
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


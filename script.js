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

  // Partie-preloader

window.addEventListener('DOMContentLoaded', function() {
    // Sélectionne l'élément preloader
    const preloader = document.getElementById('preloader');

    // Assurez-vous que l'élément existe avant de continuer
    if (preloader) {
        // Ajoute la classe 'hidden' qui va le masquer
        preloader.style.opacity = '0'; // On passe l'opacité à 0 pour la transition
        preloader.addEventListener('transitionend', function() {
            preloader.style.display = 'none'; // Une fois la transition finie, on le cache complètement
        }, { once: true }); // 'once: true' assure que l'événement ne s'exécute qu'une seule fois
    }
});
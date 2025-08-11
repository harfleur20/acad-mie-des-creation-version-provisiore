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

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector('#apropos');
  if (!section) return;

  const counters = section.querySelectorAll('.partie-basse span[data-target]');
  let hasAnimated = false; // On utilise un simple "drapeau"

  function animateCounters() {
    counters.forEach(counter => {
      counter.innerText = '0'; // reset à zéro
      const target = +counter.getAttribute('data-target');
      const duration = 2000; // Durée de l'animation en millisecondes
      const increment = target / (duration / 20); // Incrément pour une animation fluide

      const updateCount = () => {
        const current = +counter.innerText;
        if (current < target) {
          counter.innerText = `${Math.ceil(current + increment)}`;
          setTimeout(updateCount, 20);
        } else {
          counter.innerText = target; // Assure que la valeur finale est exacte
        }
      };
      updateCount();
    });
  }

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      // Si la section entre dans le champ de vision ET que l'animation n'a pas encore eu lieu
      if (entry.isIntersecting && !hasAnimated) {
        animateCounters();
        hasAnimated = true; // On met le drapeau à "vrai" pour ne pas relancer
        observerInstance.unobserve(section); // On arrête d'observer pour optimiser
      }
    });
  }, {
    threshold: 0.5 // Se déclenche quand 50% de la section est visible
  });

  observer.observe(section);
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
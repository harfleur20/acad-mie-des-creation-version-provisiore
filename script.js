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

  function updateCountdowns() {
  const countdowns = document.querySelectorAll('.countdown');

  countdowns.forEach(div => {
    const startDate = new Date(div.getAttribute('data-start'));
    const now = new Date();
    const diff = startDate - now;

    if (diff <= 0) {
      div.style.display = 'none'; // cache si la date est passée
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    div.innerHTML = `<span class="compteur-label">Débute dans :</span> ${days}j ${hours}h ${minutes}min`;
    div.style.display = 'block';
  });
}

setInterval(updateCountdowns, 1000);
updateCountdowns();

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Place à l'animation hero-header

 const canvas = document.getElementById('floatingCanvas');
  const ctx = canvas.getContext('2d');

  let circles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Création de cercles flottants (réduit à 15)
  for (let i = 0; i < 15; i++) {
    circles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 5 + Math.random() * 15,
      speed: 0.3 + Math.random() * 0.5,
      opacity: 0.2 + Math.random() * 0.4,
    });
  }

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


// Place à l'animation de la section apropos

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector('#apropos');
  if (!section) return;

  const counters = section.querySelectorAll('.partie-basse span[data-target]');
  let animationCount = 0; // Nombre de fois que l'animation s'est lancée

  function animateCounters() {
    counters.forEach(counter => {
      counter.innerText = '0'; // reset à zéro
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const current = +counter.innerText;
        const increment = target / 100;

        if (current < target) {
          counter.innerText = Math.ceil(current + increment);
          setTimeout(updateCount, 20);
        } else {
          counter.innerText = target;
        }
      };
      updateCount();
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (animationCount < 2) {
          animateCounters();
          animationCount++;
        }
      }
    });
  }, {
    threshold: 0.5
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
function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error("Erreur : " + file);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error(error));
}

// 1. Lancer le chargement des composants
loadComponent('header-placeholder', 'header.html');
loadComponent('footer-placeholder', 'footer.html');

// 2. Activer l'effet de réduction au scroll pour TOUTES les pages
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (navbar) { // On vérifie que la navbar est bien chargée
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// menu-burger.js - VERSION CORRIGÉE
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que le header soit chargé
    setTimeout(() => {
        initializeBurgerMenu();
    }, 100);
});

function initializeBurgerMenu() {
    const burger = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');
    
    console.log('Initialisation menu burger:', { burger, nav });

    if (!burger || !nav) {
        console.error('Éléments du menu burger non trouvés');
        return;
    }

    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Clic sur burger');
        
        nav.classList.toggle('active');
        burger.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    
    // Fermer le menu quand on clique sur un lien
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            burger.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });
    
    // Fermer en cliquant à l'extérieur
    document.addEventListener('click', (event) => {
        if (nav.classList.contains('active') && 
            !nav.contains(event.target) && 
            !burger.contains(event.target)) {
            nav.classList.remove('active');
            burger.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
    
    // Fermer avec la touche Échap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('active')) {
            nav.classList.remove('active');
            burger.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
}
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
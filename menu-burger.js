document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // ▼▼▼ GESTION DES CLICS HORS MENU-TOGGLE ▼▼▼
        // Gère la fermeture en cliquant en dehors du menu
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = navLinks.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);

            // Si le menu est actif ET que le clic n'est ni dans le menu, ni sur le bouton toggle
            if (navLinks.classList.contains('active') && !isClickInsideMenu && !isClickOnToggle) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
        // ▲▲▲ FIN CLIC MENU-TOGGLE ▲▲▲

    }
});
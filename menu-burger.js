// --- Gestion du menu burger ---
document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            // Ajoute/Enlève la classe active sur le menu et le bouton
            nav.classList.toggle('active');
            burger.classList.toggle('active'); // Utilisez 'active' au lieu de 'toggle'
            
            // Empêche le scroll quand le menu est ouvert
            document.body.classList.toggle('no-scroll');
        });
        
        // Fermer le menu quand on clique sur un lien (optionnel mais recommandé)
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                burger.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
        
        // Fermer le menu en cliquant à l'extérieur (optionnel)
        document.addEventListener('click', (event) => {
            if (!nav.contains(event.target) && 
                !burger.contains(event.target) && 
                nav.classList.contains('active')) {
                nav.classList.remove('active');
                burger.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }
});
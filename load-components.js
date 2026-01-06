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
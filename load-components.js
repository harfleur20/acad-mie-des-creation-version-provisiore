// 1. Modifiez la fonction pour accepter un "callback" (une action à faire après)
function loadComponent(id, file, callback) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error("Erreur : " + file);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
            // C'est ici que la magie opère : si une action est prévue, on la lance MAINTENANT
            if (callback) {
                callback();
            }
        })
        .catch(error => console.error(error));
}

// 2. La fonction qui gère le burger (gardez-la telle quelle, retirez juste le DOMContentLoaded inutile autour)
function initializeBurgerMenu() {
    const burger = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');
    const closeIcon = document.querySelector('.close-icon'); // Ajout pour gérer la croix si besoin

    if (!burger || !nav) return; // Sécurité

    // Nettoyage des anciens écouteurs pour éviter les doublons si rechargé
    const newBurger = burger.cloneNode(true);
    burger.parentNode.replaceChild(newBurger, burger);
    
    newBurger.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('active');
        newBurger.classList.toggle('active'); // Pour l'animation croix/barres
        document.body.classList.toggle('no-scroll');
    });

    // Gestion de la fermeture (clic ailleurs)
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && !nav.contains(e.target) && !newBurger.contains(e.target)) {
            nav.classList.remove('active');
            newBurger.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
    
    // Gestion des liens
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            newBurger.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });
}

// 3. Lancement : On charge le header ET on lance le menu tout de suite après
// Supprimez vos anciens setTimeout et document.addEventListener('DOMContentLoaded'...)
loadComponent('header-placeholder', 'header.html', initializeBurgerMenu);
loadComponent('footer-placeholder', 'footer.html'); // Pas besoin de callback ici
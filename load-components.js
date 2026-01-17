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

// Gestion du burger avec Overlay, Flou et Logo
function initializeBurgerMenu() {
    const burger = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');
    const overlay = document.getElementById('menuOverlay');
    // On récupère le logo (l'image dans le header)
    const logo = document.querySelector('header#navbar img'); 

    if (!burger || !nav || !overlay) return;

    const newBurger = burger.cloneNode(true);
    burger.parentNode.replaceChild(newBurger, burger);
    
    const closeMenu = () => {
        nav.classList.remove('active');
        newBurger.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        // On retire le flou du logo à la fermeture
        if (logo) logo.classList.remove('logo-blur'); 
    };

    newBurger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = nav.classList.toggle('active');
        newBurger.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        
        // On ajoute ou retire le flou du logo selon l'état
        if (logo) logo.classList.toggle('logo-blur'); 
    });

    overlay.addEventListener('click', closeMenu);

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && !nav.contains(e.target) && !newBurger.contains(e.target)) {
            closeMenu();
        }
    });
}

// 3. Lancement : On charge le header ET on lance le menu tout de suite après
loadComponent('header-placeholder', 'header.html', initializeBurgerMenu);
loadComponent('footer-placeholder', 'footer.html'); 
// loader-manager.js - Version optimisée et complète
(function() {
    const CONFIG = {
        loaderId: 'preloader',
        storageKey: 'academie_intro_done',
        minDisplayTime: 800, // Temps minimum d'affichage du loader (pour la fluidité)
        maxWait: 4000, // Sécurité si chargement trop long
        debug: false // Mettre à true pour le développement
    };

    const loader = document.getElementById(CONFIG.loaderId);
    
    if (!loader) {
        if (CONFIG.debug) console.warn('Loader non trouvé, continuation normale');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        return;
    }

    function log(message) {
        if (CONFIG.debug) console.log(`[Loader] ${message}`);
    }

    // Fonction qui déclenche l'animation de fin
    function triggerTransition() {
        log('Début de la transition');
        
        // 1. Activer l'état "loaded" sur le body
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        
        // 2. Cacher le loader avec animation
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        
        // 3. Supprimer du DOM après l'animation
        setTimeout(() => {
            if (loader && loader.parentNode) {
                loader.remove();
                log('Loader retiré du DOM');
            }
        }, 1000); // Correspond à la durée de transition CSS
    }

    // Vérifier si c'est une visite de retour
    const isReturningVisitor = sessionStorage.getItem(CONFIG.storageKey);
    
    if (isReturningVisitor) {
        log('Visiteur de retour - saut du loader');
        
        // Masquer immédiatement sans animation
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        loader.style.display = 'none';
        
        // Nettoyer après un court délai
        setTimeout(() => {
            if (loader && loader.parentNode) {
                loader.remove();
            }
        }, 100);
    } else {
        log('Première visite - affichage du loader');
        
        // Marquer comme visiteur de retour pour les prochaines fois
        sessionStorage.setItem(CONFIG.storageKey, 'true');
        
        let isTransitionTriggered = false;
        const startTime = Date.now();
        
        // Fonction pour gérer la transition de manière sécurisée
        function safeTransition() {
            if (isTransitionTriggered) return;
            isTransitionTriggered = true;
            
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(CONFIG.minDisplayTime - elapsed, 0);
            
            log(`Temps écoulé: ${elapsed}ms, Délai additionnel: ${remainingTime}ms`);
            
            // S'assurer d'afficher le loader assez longtemps pour une bonne UX
            setTimeout(triggerTransition, remainingTime);
        }
        
        // Écouter l'événement de chargement complet
        window.addEventListener('load', () => {
            log('Événement load déclenché');
            safeTransition();
        });
        
        // Pour les pages qui chargent vite (déjà prêtes)
        if (document.readyState === 'complete') {
            log('Page déjà chargée');
            setTimeout(safeTransition, CONFIG.minDisplayTime);
        }
        
        // Sécurité au cas où le chargement prendrait trop de temps
        setTimeout(() => {
            if (!isTransitionTriggered) {
                log('Timeout de sécurité déclenché');
                safeTransition();
            }
        }, CONFIG.maxWait);
        
        // Optionnel: Attendre que les composants dynamiques soient chargés
        // Si vous utilisez load-components.js pour header/footer
        if (typeof window.componentsLoaded !== 'undefined') {
            window.addEventListener('componentsLoaded', safeTransition);
        }
    }
    
    // Gestion des erreurs de chargement d'image
    const loaderImage = loader.querySelector('.gif-center');
    if (loaderImage) {
        loaderImage.onerror = function() {
            log('Erreur de chargement de l\'image du loader');
            // Continuer sans l'image
            this.style.display = 'none';
        };
    }
})();

// script.js - Version simplifiée pour éviter les conflits
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé - initialisation des composants');
    
    // Votre logique existante pour les animations, etc.
    // Assurez-vous qu'elles s'exécutent APRES le loader
    
    // Exemple: Animation des compteurs
    const counterSection = document.querySelector('#apropos');
    if (counterSection) {
        // Votre code d'animation des compteurs...
    }
    
    // Exemple: Gestion de la popup
    const popupOverlay = document.querySelector('.popup-overlay');
    if (popupOverlay) {
        // Votre code pour la popup...
    }
});

// global-loader.js - Version compatible
// Ce fichier devrait contenir UNIQUEMENT la logique pour le loader global
// et être fusionné avec loader-manager.js pour éviter les conflits

// load-components.js - S'assurer qu'il ne touche pas au preloader
(function() {
    // Votre code pour charger header/footer
    // IMPORTANT: Ne pas interférer avec le preloader
    
    // Exemple de fin de chargement des composants
    window.dispatchEvent(new Event('componentsLoaded'));
})();
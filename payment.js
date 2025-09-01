// Contenu MIS À JOUR COMPLET pour le fichier : payment.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments du DOM ---
    const paymentButton = document.querySelector('.cta-button-payment');
    const modalOverlay = document.getElementById('payment-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const paymentForm = document.getElementById('payment-info-form');

    // Si les éléments n'existent pas sur la page, on ne fait rien
    if (!paymentButton || !modalOverlay || !modalCloseBtn || !paymentForm) {
        return;
    }

    // --- Fonctions pour gérer la modale ---
    const openModal = () => modalOverlay.classList.add('active');
    const closeModal = () => modalOverlay.classList.remove('active');

    // --- Écouteurs d'événements ---

    // 1. Ouvre la modale quand on clique sur "Réservez votre place !"
    paymentButton.addEventListener('click', (event) => {
        event.preventDefault();
        openModal();
    });

    // 2. Ferme la modale avec le bouton (X) ou en cliquant sur le fond gris
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    // 3. Gère la soumission du formulaire de la modale
    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = paymentForm.querySelector('.cta-button');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initialisation...';
        
        // Récupération des données de la formation depuis le bouton principal
        const formationTitle = paymentButton.dataset.title;
        const formationPrice = parseInt(paymentButton.dataset.price, 10);

        // Récupération des données du formulaire de la modale
        const clientName = document.getElementById('modal-name').value;
        const clientEmail = document.getElementById('modal-email').value;
        const clientNumber = document.getElementById('modal-phone').value;

        // Construction de la requête pour Money Fusion
        const fusionPayData = {
            totalPrice: formationPrice,
            article: [{ nom: formationTitle, montant: formationPrice }],
            orderId: `AC-COURSE-${Date.now()}`,
            clientemail: clientEmail,
            clientname: clientName,
            clientnumber: clientNumber,
            // ▼▼▼ URLS CORRIGÉES AVEC VOTRE DOMAINE ▼▼▼
            returnurl: "https://academiecreatif.com/merci.html",
            webhookurl: "https://academiecreatif.com/.netlify/functions/webhook-handler" // J'ai renommé le webhook pour plus de clarté
        };

        try {
            // On appelle notre propre fonction intermédiaire
            const response = await fetch('/.netlify/functions/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fusionPayData)
            });

            // On vérifie si la réponse de notre fonction est OK
            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `Le serveur a répondu avec une erreur ${response.status}.`);
            }

            const result = await response.json();

            if (result.statut === true && result.payment_url) {
                window.location.href = result.payment_url;
            } else {
                throw new Error(result.message || "La réponse de l'API de paiement est invalide.");
            }

        } catch (error) {
            console.error("Erreur de paiement:", error);
            alert("Impossible de lancer le paiement. Veuillez réessayer. Détail : " + error.message);
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Payer maintenant';
        }
    });
});
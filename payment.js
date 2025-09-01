// Contenu MIS À JOUR et CORRIGÉ pour le fichier : payment.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments du DOM ---
    const paymentButton = document.querySelector('.cta-button-payment');
    const modalOverlay = document.getElementById('payment-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const paymentForm = document.getElementById('payment-info-form');

    if (!paymentButton || !modalOverlay || !modalCloseBtn || !paymentForm) {
        return;
    }

    // --- Fonctions pour gérer la modale ---
    const openModal = () => modalOverlay.classList.add('active');
    const closeModal = () => modalOverlay.classList.remove('active');

    // --- Écouteurs d'événements ---
    paymentButton.addEventListener('click', (event) => {
        event.preventDefault();
        openModal();
    });

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = paymentForm.querySelector('.cta-button');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initialisation...';
        
        const formationTitle = paymentButton.dataset.title;
        const formationPrice = parseInt(paymentButton.dataset.price, 10);

        const clientName = document.getElementById('modal-name').value;
        const clientEmail = document.getElementById('modal-email').value;
        const clientNumber = document.getElementById('modal-phone').value;

        // ▼▼▼ CORRECTION DES NOMS DE CHAMPS ▼▼▼
        const fusionPayData = {
            montant_total: formationPrice,
            articles: [{ nom: formationTitle, montant: formationPrice }],
            orderId: `AC-COURSE-${Date.now()}`, // Gardé pour le suivi, même si non listé dans le tableau
            email_client: clientEmail,
            nom_client: clientName,
            numero_client: clientNumber,
            url_retour: "https://academiecreatif.com/merci.html",
            url_webhook: "https://academiecreatif.com/.netlify/functions/webhook-handler"
        };

        try {
            const response = await fetch('/.netlify/functions/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fusionPayData)
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `Le serveur a répondu avec une erreur ${response.status}.`);
            }

            const result = await response.json();

            if (result.statut === true && result.payment_url) {
                window.location.href = result.payment_url;
            } else {
                // Si Money Fusion renvoie une erreur même avec un statut 200 OK
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
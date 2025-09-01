document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments du DOM ---
    const paymentButton = document.querySelector('.cta-button-payment');
    const modalOverlay = document.getElementById('payment-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const paymentForm = document.getElementById('payment-info-form');
    const phoneInput = document.getElementById('modal-phone');

    if (!paymentButton || !modalOverlay || !modalCloseBtn || !paymentForm || !phoneInput) {
        return;
    }

    // --- Initialisation de la librairie intl-tel-input ---
    const iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        geoIpLookup: callback => {
            fetch("https://ipapi.co/json").then(res => res.json()).then(data => callback(data.country_code)).catch(() => callback("cm"));
        },
        separateDialCode: true,
        preferredCountries: ['cm', 'ci', 'sn', 'fr', 'be', 'gq', 'ga', 'cg'],
        placeholderNumberType: "MOBILE",
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

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
        if (event.target === modalOverlay) closeModal();
    });

    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!iti.isValidNumber()) {
            alert("Veuillez entrer un numéro de téléphone valide.");
            return;
        }

        const submitButton = paymentForm.querySelector('.cta-button');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initialisation...';
        
        const formationTitle = paymentButton.dataset.title;
        const formationPrice = parseInt(paymentButton.dataset.price, 10);
        const clientName = document.getElementById('modal-name').value;
        const clientEmail = document.getElementById('modal-email').value;
        const clientNumber = iti.getNumber();
        const orderId = `AC-COURSE-${Date.now()}`;

        // ▼▼▼ STRUCTURE DE DONNÉES FINALE (basée sur tous les exemples de la doc) ▼▼▼
        const fusionPayData = {
            totalPrice: formationPrice,
            article: [{ nom: formationTitle, montant: formationPrice }],
            // Le champ personal_info semble crucial d'après leur doc C#
            personal_info: [{ 
                userId: clientEmail,
                orderId: orderId
            }],
            clientName: clientName, // camelCase
            clientNumber: clientNumber, // camelCase
            return_url: "https://academiecreatif.com/merci.html", // snake_case
            webhook_url: "https://academiecreatif.com/.netlify/functions/webhook-handler" // snake_case
        };

        try {
            const response = await fetch('/.netlify/functions/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fusionPayData)
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `Le serveur a répondu une erreur.`);
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


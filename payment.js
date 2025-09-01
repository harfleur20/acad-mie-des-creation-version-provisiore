document.addEventListener('DOMContentLoaded', () => {
    const paymentButton = document.querySelector('.cta-button-payment');
    const modalOverlay = document.getElementById('payment-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const paymentForm = document.getElementById('payment-info-form');
    const phoneInput = document.getElementById('modal-phone');

    if (!paymentButton || !modalOverlay || !modalCloseBtn || !paymentForm || !phoneInput) {
        return;
    }

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

    const openModal = () => modalOverlay.classList.add('active');
    const closeModal = () => modalOverlay.classList.remove('active');

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
        const orderId = `AC-${Date.now()}`;

        // Données envoyées à notre fonction Netlify
        const dataForFunction = {
            totalPrice: formationPrice,
            description: `Paiement pour : ${formationTitle}`,
            orderId: orderId,
            customer_name: clientName, // La fonction Netlify se chargera de séparer le nom/prénom
            customer_email: clientEmail,
            customer_phone_number: clientNumber,
            return_url: "https://academiecreatif.com/merci.html",
            notify_url: "https://academiecreatif.com/.netlify/functions/webhook-cinetpay"
        };

        try {
            const response = await fetch('/.netlify/functions/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataForFunction)
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


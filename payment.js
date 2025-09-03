document.addEventListener('DOMContentLoaded', () => {
    const paymentButtons = document.querySelectorAll('.cta-button-payment');
    const modalOverlay = document.getElementById('payment-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const paymentForm = document.getElementById('payment-info-form');
    const phoneInput = document.getElementById('modal-phone');

    if (!paymentButtons.length || !modalOverlay) return;

    let currentFormationTitle = '';
    let currentFormationPrice = 0;

    const iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        geoIpLookup: cb => fetch("https://ipapi.co/json").then(r => r.json()).then(d => cb(d.country_code)).catch(() => cb("cm")),
        separateDialCode: true,
        preferredCountries: ['cm', 'ci', 'sn', 'fr', 'be', 'gq', 'ga', 'cg'],
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    const openModal = (event) => {
        // ▼▼▼ C'EST LA LIGNE MAGIQUE À AJOUTER ▼▼▼
        event.preventDefault(); // Empêche le lien de rediriger vers l'accueil
        // ▲▲▲ FIN DE L'AJOUT ▲▲▲

        currentFormationTitle = event.currentTarget.dataset.title;
        currentFormationPrice = parseInt(event.currentTarget.dataset.price, 10);
        modalOverlay.classList.add('active');
    };
    
    const closeModal = () => modalOverlay.classList.remove('active');

    paymentButtons.forEach(button => button.addEventListener('click', openModal));
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => e.target === modalOverlay && closeModal());

    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!iti.isValidNumber()) {
            alert("Veuillez entrer un numéro de téléphone valide.");
            return;
        }

        const submitButton = paymentForm.querySelector('.cta-button');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initialisation...';
        
        const dataForFunction = {
            totalPrice: currentFormationPrice,
            description: `Paiement pour: ${currentFormationTitle}`,
            orderId: `AC-${Date.now()}`,
            customer_name: document.getElementById('modal-name').value,
            customer_email: document.getElementById('modal-email').value,
            customer_phone_number: iti.getNumber(),
            return_url: `${window.location.origin}/merci.html`,
            notify_url: `${window.location.origin}/.netlify/functions/webhook-cinetpay`
        };

        try {
            const response = await fetch('/.netlify/functions/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataForFunction)
            });

            const result = await response.json();

            if (result.success && result.payment_url) {
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
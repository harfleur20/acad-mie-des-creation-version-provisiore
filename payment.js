// Contenu MIS À JOUR pour le fichier : payment.js

document.addEventListener('DOMContentLoaded', () => {
    const paymentButton = document.querySelector('.cta-button-payment');
    if (!paymentButton) {
        return;
    }

    paymentButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const formationTitle = paymentButton.dataset.title;
        const formationPrice = parseInt(paymentButton.dataset.price, 10);

        if (!formationTitle || !formationPrice) {
            alert("Erreur : Impossible de récupérer les informations de la formation.");
            return;
        }

        const clientName = prompt("Veuillez entrer votre nom complet :");
        if (!clientName) return;

        const clientEmail = prompt("Veuillez entrer votre adresse e-mail :");
        if (!clientEmail) return;

        const clientNumber = prompt("Veuillez entrer votre numéro de téléphone (avec l'indicatif, ex: 237680950319) :");
        if (!clientNumber) return;

        paymentButton.disabled = true;
        paymentButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initialisation...';

        const fusionPayData = {
            totalPrice: formationPrice,
            article: [{ nom: formationTitle, montant: formationPrice }],
            orderId: `AC-COURSE-${Date.now()}`,
            clientemail: clientEmail,
            clientname: clientName,
            clientnumber: clientNumber,
            returnurl: "https://votre-site.com/merci.html", // N'oubliez pas de mettre à jour
            webhookurl: "https://votre-site.com/webhook" // N'oubliez pas de mettre à jour
        };

        try {
            // On appelle notre propre fonction intermédiaire au lieu de l'API directe
            const response = await fetch('/.netlify/functions/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fusionPayData)
            });

            const result = await response.json();

            if (result.statut === true && result.payment_url) {
                window.location.href = result.payment_url;
            } else {
                throw new Error(result.message || "Une erreur est survenue lors de l'initialisation du paiement.");
            }

        } catch (error) {
            console.error("Erreur de paiement:", error);
            alert("Impossible de lancer le paiement. Veuillez réessayer. Détail : " + error.message);
            paymentButton.disabled = false;
            paymentButton.innerHTML = '<i class="fa-solid fa-piggy-bank"></i> Réservez votre place !';
        }
    });
});
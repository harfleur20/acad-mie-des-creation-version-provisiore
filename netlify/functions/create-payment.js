const axios = require('axios');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    const API_KEY = "931656703689aa1ac761151.31322400";
    const SITE_ID = "105904925";
    const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/v2/payment";

    // ▼▼▼ LOGIQUE DE NOM/PRÉNOM CORRIGÉE ▼▼▼
    const nameParts = data.customer_name.trim().split(' ').filter(Boolean); // Sépare le nom complet en mots
    let customer_name = data.customer_name;
    let customer_surname = ' '; // Valeur par défaut si un seul mot est entré

    if (nameParts.length > 1) {
        // Si plus d'un mot, le dernier est le nom de famille
        customer_surname = nameParts.pop();
        // Le reste constitue le(s) prénom(s)
        customer_name = nameParts.join(' ');
    }
    // Si un seul mot est entré, customer_name garde la valeur complète et surname reste un espace.
    // ▲▲▲ FIN DE LA CORRECTION ▲▲▲

    const paymentData = {
      apikey: API_KEY,
      site_id: SITE_ID,
      transaction_id: data.orderId,
      amount: data.totalPrice,
      currency: 'XAF', // Confirmé pour le Cameroun
      description: data.description,
      customer_name: customer_name, // Prénom(s)
      customer_surname: customer_surname, // Nom de famille
      customer_email: data.customer_email,
      customer_phone_number: data.customer_phone_number,
      channels: 'ALL',
      return_url: data.return_url,
      notify_url: data.notify_url
    };

    console.log("Envoi des données à CinetPay (v3):", JSON.stringify(paymentData, null, 2));

    const response = await axios.post(CINETPAY_API_URL, paymentData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log("Réponse reçue de CinetPay:", response.data);
    
    if (response.data.code === '201' && response.data.data) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                statut: true,
                payment_url: response.data.data.payment_url
            }),
        };
    } else {
        throw new Error(response.data.description || response.data.message || 'Erreur lors de l\'initialisation du paiement.');
    }

  } catch (error) {
    console.error('Erreur dans la fonction serverless:', error);
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur interne du serveur.', detail: errorMessage }),
    };
  }
};

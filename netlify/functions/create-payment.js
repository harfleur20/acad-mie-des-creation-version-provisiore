// Contenu pour : /netlify/functions/create-payment.js

const axios = require('axios');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    // ▼▼▼ VOS INFORMATIONS CINETPAY (COMPLÉTÉES) ▼▼▼
    const API_KEY = "931656703689aa1ac761151.31322400";
    const SITE_ID = "105904925";
    // ▲▲▲ VOS INFORMATIONS CINETPAY (COMPLÉTÉES) ▲▲▲

    const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/v2/payment";

    const paymentData = {
      apikey: API_KEY,
      site_id: SITE_ID,
      transaction_id: data.orderId,
      amount: data.totalPrice,
      currency: 'XOF', // Vous pouvez changer en 'XAF' si besoin
      description: data.description,
      customer_name: data.customer_name,
      customer_surname: " ", // CinetPay demande un prénom, nous mettons un espace
      customer_email: data.customer_email,
      customer_phone_number: data.customer_phone_number,
      channels: 'ALL',
      return_url: data.return_url,
      notify_url: data.notify_url
    };

    console.log("Envoi des données à CinetPay:", JSON.stringify(paymentData, null, 2));

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
        throw new Error(response.data.message || 'Erreur lors de l\'initialisation du paiement CinetPay.');
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
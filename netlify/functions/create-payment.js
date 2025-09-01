// Contenu pour : /netlify/functions/create-payment.js

const axios = require('axios');

exports.handler = async function (event) {
  // On s'assure que la requête vient bien de votre site
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const paymentData = JSON.parse(event.body);
    const FUSION_PAY_API_URL = "https://www.pay.moneyfusion.net/Academie_des_cr_atifs/81e7373c47df7204/pay/";

    console.log("Envoi des données à Money Fusion:", JSON.stringify(paymentData, null, 2));

    // Utilisation d'axios pour appeler l'API de Money Fusion
    const response = await axios.post(FUSION_PAY_API_URL, paymentData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log("Réponse reçue de Money Fusion:", response.data);

    // On renvoie directement la réponse de Money Fusion à notre site
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };

  } catch (error) {
    // Si axios rencontre une erreur (ex: erreur réseau ou réponse 4xx/5xx de l'API)
    console.error('Erreur dans la fonction serverless:', error);
    
    // On essaie de renvoyer un message d'erreur plus clair
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur interne du serveur.', detail: errorMessage }),
    };
  }
};
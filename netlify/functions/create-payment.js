// Contenu pour /netlify/functions/create-payment.js

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // On s'assure que la requête est bien de type POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const paymentData = JSON.parse(event.body);
    const FUSION_PAY_API_URL = "https://www.pay.moneyfusion.net/Academie_des_cr_atifs/81e7373c47df7204/pay/";

    const response = await fetch(FUSION_PAY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Erreur dans la fonction serverless:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur interne du serveur.' }),
    };
  }
};
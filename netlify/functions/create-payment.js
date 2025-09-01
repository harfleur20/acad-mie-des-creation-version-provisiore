const fetch = require('node-fetch');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const paymentData = JSON.parse(event.body);

    // LOG: On affiche les données reçues du site
    console.log("Données reçues par la fonction:", JSON.stringify(paymentData, null, 2));

    const FUSION_PAY_API_URL = "https://www.pay.moneyfusion.net/Academie_des_cr_atifs/81e7373c47df7204/pay/";

    const response = await fetch(FUSION_PAY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    
    const responseText = await response.text();
    // LOG: On affiche la réponse exacte de Money Fusion
    console.log("Réponse de l'API Money Fusion:", responseText);

    if (!response.ok) {
      throw new Error(`Erreur de l'API Money Fusion (status ${response.status}): ${responseText}`);
    }

    const result = JSON.parse(responseText);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Erreur dans la fonction serverless:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur interne du serveur.', detail: error.message }),
    };
  }
};
// On importe le module node-fetch
const fetch = require('node-fetch');

exports.handler = async function (event) {
  // On s'assure que la requête vient bien du formulaire de votre site
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const paymentData = JSON.parse(event.body);
    const FUSION_PAY_API_URL = "https://www.pay.moneyfusion.net/Academie_des_cr_atifs/81e7373c47df7204/pay/";

    // On appelle l'API de Money Fusion
    const response = await fetch(FUSION_PAY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });

    // ▼▼▼ PARTIE CORRIGÉE ET AMÉLIORÉE ▼▼▼
    // Si la réponse de Money Fusion n'est pas un succès (ex: erreur 400, 500)
    if (!response.ok) {
      // On lit la réponse comme du texte pour voir le message d'erreur exact
      const errorText = await response.text();
      console.error(`Erreur de l'API Money Fusion (status ${response.status}):`, errorText);
      
      // On renvoie une erreur claire à l'utilisateur
      return {
        statusCode: 502, // "Bad Gateway", signifie qu'on a eu un problème avec le service externe
        body: JSON.stringify({ message: `L'API de paiement a renvoyé une erreur : ${errorText}` }),
      };
    }

    // Si tout s'est bien passé, on continue comme avant
    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Erreur dans la fonction serverless:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur interne du serveur.', detail: error.message }),
    };
  }
};

const axios = require('axios');

exports.handler = async function (event) {
  // On s'assure que la requête est bien de type POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1. On récupère les données envoyées depuis votre formulaire (payment.js)
    const data = JSON.parse(event.body);

    // 2. ▼▼▼ VOS CLÉS SECRÈTES CINETPAY À METTRE À JOUR ▼▼▼
    // Remplacez ces valeurs par VOS propres clés que vous trouverez sur votre tableau de bord CinetPay
    const API_KEY = "1008367253689aa1371caa21.80873588"; // Mettez votre clé API ici
    const SITE_ID = "105904925";   // Mettez votre Site ID ici
    const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/v2/payment";

    // 3. On prépare les données à envoyer à CinetPay
    const paymentData = {
      apikey: API_KEY,
      site_id: SITE_ID,
      transaction_id: data.orderId, // Un identifiant unique pour la transaction
      amount: data.totalPrice,
      currency: 'XAF', // ou 'XOF' selon votre configuration
      description: data.description,
      
      // Informations sur le client
      customer_name: data.customer_name.split(' ')[0], // Prénom
      customer_surname: data.customer_name.split(' ').slice(1).join(' ') || data.customer_name, // Nom de famille
      customer_email: data.customer_email,
      customer_phone_number: data.customer_phone_number,

      // URLs de redirection après le paiement
      return_url: data.return_url,
      notify_url: data.notify_url,

      // Champs additionnels souvent requis par CinetPay
      channels: 'ALL',
      customer_address: "N/A",
      customer_city: "Douala",
      customer_country: "CM",
      customer_zip_code: "00000"
    };

    // 4. On envoie la requête à CinetPay
    const response = await axios.post(CINETPAY_API_URL, paymentData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // 5. On analyse la réponse de CinetPay
    if (response.data.code === '201' && response.data.data && response.data.data.payment_url) {
        // Si tout va bien, on renvoie l'URL de paiement à votre site
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                payment_url: response.data.data.payment_url
            }),
        };
    } else {
        // S'il y a une erreur, on la renvoie pour l'afficher
        throw new Error(response.data.description || 'Erreur CinetPay.');
    }

  } catch (error) {
    // Gestion des erreurs générales
    console.error('Erreur dans la fonction serverless:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};
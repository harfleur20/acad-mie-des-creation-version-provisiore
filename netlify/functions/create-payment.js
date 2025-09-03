const axios = require('axios');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    // ▼▼▼ VOS CLÉS SECRÈTES - Idéalement, utilisez les variables d'environnement ▼▼▼
    const API_KEY = process.env.CINETPAY_API_KEY || "VOTRE_API_KEY"; 
    const SITE_ID = process.env.CINETPAY_SITE_ID || "VOTRE_SITE_ID";   
    const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/v2/payment";

    const paymentData = {
      apikey: API_KEY,
      site_id: SITE_ID,
      transaction_id: data.orderId,
      amount: data.totalPrice,
      currency: 'XAF',
      description: data.description,
      
      customer_name: data.customer_name.split(' ')[0],
      customer_surname: data.customer_name.split(' ').slice(1).join(' ') || data.customer_name,
      customer_email: data.customer_email,
      customer_phone_number: data.customer_phone_number,

      return_url: data.return_url,
      notify_url: data.notify_url,

      channels: 'ALL' // Permet d'accepter tous les types de paiement (Mobile Money, Carte, etc.)
      
      // ▼▼▼ J'AI SUPPRIMÉ LES LIGNES SUIVANTES QUI FORÇAIENT LA LOCALISATION ▼▼▼
      // customer_address: "N/A",
      // customer_city: "Douala",
      // customer_country: "CM",
      // customer_zip_code: "00000"
    };

    const response = await axios.post(CINETPAY_API_URL, paymentData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data.code === '201' && response.data.data && response.data.data.payment_url) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                payment_url: response.data.data.payment_url
            }),
        };
    } else {
        throw new Error(response.data.description || 'Erreur CinetPay.');
    }

  } catch (error) {
    console.error('Erreur dans la fonction serverless:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};
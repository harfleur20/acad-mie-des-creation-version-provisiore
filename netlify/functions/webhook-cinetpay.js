const axios = require('axios');
const nodemailer = require('nodemailer');

// Fonction principale qui gère la notification de CinetPay
exports.handler = async function (event) {
  // CinetPay envoie une requête POST avec les infos de la transaction
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const transactionId = data.cpm_trans_id;

    if (!transactionId) {
      throw new Error("ID de transaction manquant dans la notification CinetPay.");
    }
    
    // ▼▼▼ VOS CLÉS SECRÈTES CINETPAY ▼▼▼
    const API_KEY = process.env.CINETPAY_API_KEY; 
    const SITE_ID = process.env.CINETPAY_SITE_ID;
    const CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

    // 1. On vérifie le statut réel de la transaction auprès de CinetPay
    // C'est une étape de sécurité cruciale pour éviter les fausses notifications.
    const checkResponse = await axios.post(CHECK_URL, {
      apikey: API_KEY,
      site_id: SITE_ID,
      transaction_id: transactionId
    }, { headers: { 'Content-Type': 'application/json' } });

    const paymentInfo = checkResponse.data;

    // 2. Si le paiement est confirmé ('00' signifie succès chez CinetPay)
    if (paymentInfo.code === '00' && paymentInfo.data) {
        
        // 3. On envoie un email de notification de vente
        await sendSuccessEmail(paymentInfo.data);

    } else {
        // Si le paiement a échoué, on pourrait aussi envoyer un email d'alerte
        console.log("Notification reçue pour un paiement non confirmé:", paymentInfo.description);
    }

  } catch (error) {
    console.error('Erreur dans le webhook:', error);
    // On doit quand même répondre 200 à CinetPay, sinon il essaiera de renvoyer la notification.
    return { statusCode: 200, body: `Erreur interne: ${error.message}` };
  }
  
  // 4. On répond à CinetPay pour lui dire qu'on a bien reçu la notification.
  // C'est OBLIGATOIRE.
  return { statusCode: 200, body: 'Notification reçue' };
};


// Fonction pour envoyer l'email
async function sendSuccessEmail(data) {
    // On configure le service d'envoi d'email (ici, avec les variables d'environnement)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // ex: 'smtp.gmail.com'
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER, // Votre adresse email
            pass: process.env.EMAIL_PASS, // Votre mot de passe d'application
        },
    });

    // On prépare le contenu de l'email
    const mailOptions = {
        from: `"Académie des Créatifs" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_DESTINATION, // L'email qui recevra la notification (le vôtre)
        subject: `🎉 Nouvelle Vente ! - ${data.description}`,
        html: `
            <h1>Nouvelle inscription confirmée !</h1>
            <p>Une nouvelle personne s'est inscrite à une formation.</p>
            <ul>
                <li><strong>Formation :</strong> ${data.description}</li>
                <li><strong>Montant payé :</strong> ${data.amount} ${data.currency}</li>
                <li><strong>Client :</strong> ${data.customer_name} ${data.customer_surname}</li>
                <li><strong>Email :</strong> ${data.customer_email}</li>
                <li><strong>Téléphone :</strong> ${data.customer_phone_number}</li>
                <li><strong>ID Transaction :</strong> ${data.transaction_id}</li>
                <li><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</li>
            </ul>
        `,
    };

    // On envoie l'email
    await transporter.sendMail(mailOptions);
    console.log("Email de notification de vente envoyé avec succès.");
}
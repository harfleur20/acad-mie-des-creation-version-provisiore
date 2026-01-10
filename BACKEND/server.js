// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ============================================
// ROUTES SIMPLES POUR COMMENCER
// ============================================

// Route test
app.get('/api', (req, res) => {
    res.json({
        message: 'API Académie des Créatifs',
        version: '1.0.0',
        status: 'online'
    });
});

// Route pour obtenir les formations
app.get('/api/formations', async (req, res) => {
    try {
        const fs = require('fs').promises;
        const formationsPath = path.join(__dirname, 'formations.json');
        const data = await fs.readFile(formationsPath, 'utf8');
        const formations = JSON.parse(data);
        
        res.json({
            success: true,
            count: formations.formations.length,
            formations: formations.formations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur chargement formations'
        });
    }
});

// Route pour une formation spécifique
app.get('/api/formations/:slug', async (req, res) => {
    try {
        const fs = require('fs').promises;
        const formationsPath = path.join(__dirname, 'formations.json');
        const data = await fs.readFile(formationsPath, 'utf8');
        const formations = JSON.parse(data);
        
        const formation = formations.formations.find(f => f.slug === req.params.slug);
        
        if (formation) {
            res.json({
                success: true,
                formation: formation
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Formation non trouvée'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Test de paiement Tara (simulé pour l'instant)
app.post('/api/create-payment', (req, res) => {
    const { formationId, formationSlug, formationTitre, formationPrix, customerEmail } = req.body;
    
    console.log('Demande de paiement reçue:', {
        formationId,
        formationSlug,
        formationTitre,
        formationPrix,
        customerEmail
    });
    
    // SIMULATION - À remplacer par l'API Tara réelle
    const paymentId = 'PAY_' + Date.now();
    const matricule = 'AC' + Math.floor(1000 + Math.random() * 9000);
    
    res.json({
        success: true,
        message: 'Paiement simulé avec succès',
        paymentId: paymentId,
        matricule: matricule,
        links: {
            whatsapp: `https://wa.me/?text=Paiement%20formation%20${formationTitre}`,
            telegram: `https://t.me/?text=Paiement%20formation%20${formationTitre}`,
            sms: `sms:?body=Paiement%20formation%20${formationTitre}`
        }
    });
});

// ============================================
// SERVIR LES PAGES HTML
// ============================================

// Page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Page login
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Page détail formation
app.get('/detail-formation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'detail-formation.html'));
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀  Serveur Académie des Créatifs démarré`);
    console.log(`📡  Port: ${PORT}`);
    console.log(`🌐  URL: http://localhost:${PORT}`);
    console.log(`🔗  API: http://localhost:${PORT}/api`);
    console.log(`📁  Frontend: http://localhost:5500`);
    console.log(`=========================================`);
    
    // Affiche les routes disponibles
    console.log('\n📋 Routes disponibles:');
    console.log('   GET  /api              → Status API');
    console.log('   GET  /api/formations   → Liste formations');
    console.log('   GET  /api/formations/:slug → Détail formation');
    console.log('   POST /api/create-payment → Créer paiement');
    console.log('   GET  /                 → Page d\'accueil');
    console.log('   GET  /login.html       → Page login');
    console.log('   GET  /detail-formation.html → Page détail');
    console.log(`=========================================`);
});
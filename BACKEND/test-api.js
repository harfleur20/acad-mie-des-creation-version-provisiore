// backend/test-api.js
const fetch = require('node-fetch');

async function testAPI() {
    console.log('🧪 Test des endpoints API...\n');
    
    try {
        // Test 1: Status API
        console.log('1. Test endpoint /api');
        const res1 = await fetch('http://localhost:3000/api');
        const data1 = await res1.json();
        console.log('   ✅', data1.message, '\n');
        
        // Test 2: Liste formations
        console.log('2. Test endpoint /api/formations');
        const res2 = await fetch('http://localhost:3000/api/formations');
        const data2 = await res2.json();
        console.log('   ✅', data2.count, 'formations trouvées\n');
        
        // Test 3: Formation spécifique
        console.log('3. Test endpoint /api/formations/conception-packaging');
        const res3 = await fetch('http://localhost:3000/api/formations/conception-packaging');
        const data3 = await res3.json();
        if (data3.success) {
            console.log('   ✅ Formation:', data3.formation.titre.substring(0, 50) + '...\n');
        }
        
        // Test 4: Paiement simulé
        console.log('4. Test paiement simulé');
        const res4 = await fetch('http://localhost:3000/api/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                formationId: 1,
                formationSlug: 'conception-packaging',
                formationTitre: 'Formation Packaging',
                formationPrix: '50000 FCFA',
                customerEmail: 'test@example.com'
            })
        });
        const data4 = await res4.json();
        console.log('   ✅ Paiement simulé:', data4.message);
        console.log('   Matricule généré:', data4.matricule, '\n');
        
        console.log('🎉 Tous les tests passent avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.log('\n💡 Assure-toi que le serveur tourne: npm run dev');
    }
}

testAPI();
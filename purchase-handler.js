// purchase-handler.js - Gestion intelligente des achats

document.addEventListener('DOMContentLoaded', function() {
    const purchaseBtn = document.getElementById('detail-btn-paiement');
    const statusMessage = document.getElementById('purchase-status-message');
    
    if (!purchaseBtn) return;
    
    // Vérifier immédiatement le statut de l'utilisateur
    checkUserStatus();
    
    // Gérer le clic sur le bouton d'achat
    purchaseBtn.addEventListener('click', handlePurchaseClick);
    
    function checkUserStatus() {
        const token = localStorage.getItem('auth_token');
        const isLoggedIn = !!token;
        
        if (isLoggedIn) {
            // Utilisateur connecté
            showMessage("✅ Vous êtes connecté. L'achat sera ajouté à votre compte existant.", "success");
            
            // Optionnel : Vérifier si l'utilisateur a déjà cette formation
            checkIfAlreadyPurchased();
        } else {
            // Nouveau visiteur
            showMessage("👋 Nouveau ? Après l'achat, vous recevrez un matricule pour créer votre compte.", "info");
        }
    }
    
    async function handlePurchaseClick(e) {
        e.preventDefault();
        
        const courseId = purchaseBtn.dataset.courseId;
        if (!courseId) {
            showMessage("❌ Erreur : ID de formation manquant", "error");
            return;
        }
        
        const token = localStorage.getItem('auth_token');
        const isLoggedIn = !!token;
        
        showMessage("⏳ Traitement en cours...", "loading");
        
        if (isLoggedIn) {
            // CAS A : Étudiant existant
            await purchaseForExistingStudent(courseId, token);
        } else {
            // CAS B : Nouveau visiteur
            await purchaseForNewVisitor(courseId);
        }
    }
    
    async function purchaseForExistingStudent(courseId, token) {
        try {
            // SIMULATION - À remplacer par ton API réelle
            console.log("Achat pour étudiant existant, cours ID:", courseId);
            
            // Pour l'instant, on simule
            setTimeout(() => {
                showMessage("🎉 Achat réussi ! La formation a été ajoutée à votre compte.", "success");
                
                // Redirection après 2 secondes
                setTimeout(() => {
                    window.location.href = 'dashboard-etudiant.html?purchase=success';
                }, 2000);
            }, 1500);
            
            /*
            // CODE RÉEL (à décommenter quand tu as ton backend)
            const response = await fetch('/api/purchase/add-to-account', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ courseId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage("🎉 " + result.message, "success");
                setTimeout(() => {
                    window.location.href = 'dashboard-etudiant.html?purchase=success';
                }, 2000);
            } else {
                showMessage("❌ " + result.message, "error");
            }
            */
            
        } catch (error) {
            console.error('Erreur achat:', error);
            showMessage("❌ Erreur lors de l'achat. Réessayez.", "error");
        }
    }
    
    async function purchaseForNewVisitor(courseId) {
        try {
            // SIMULATION - À remplacer par ton système de paiement
            console.log("Achat pour nouveau visiteur, cours ID:", courseId);
            
            // Demander l'email pour l'envoi du matricule
            const userEmail = prompt("Entrez votre email pour recevoir votre matricule :");
            
            if (!userEmail) {
                showMessage("❌ Email requis pour continuer", "error");
                return;
            }
            
            showMessage("🔄 Génération de votre matricule...", "loading");
            
            // Simulation d'appel API
            setTimeout(() => {
                // Générer un matricule fictif
                const matricule = 'AC' + Math.floor(1000 + Math.random() * 9000);
                
                showMessage(`📧 Votre matricule ${matricule} a été envoyé à ${userEmail}`, "success");
                
                // Redirection vers la page d'inscription avec le matricule pré-rempli
                setTimeout(() => {
                    window.location.href = `login.html?matricule=${matricule}&email=${encodeURIComponent(userEmail)}`;
                }, 3000);
            }, 2000);
            
            /*
            // CODE RÉEL avec Stripe (exemple)
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    courseId,
                    customerEmail: userEmail 
                })
            });
            
            const { sessionId } = await response.json();
            
            // Redirection vers Stripe
            const stripe = Stripe('pk_test_xxx');
            await stripe.redirectToCheckout({ sessionId });
            */
            
        } catch (error) {
            console.error('Erreur achat:', error);
            showMessage("❌ Erreur lors de l'achat. Réessayez.", "error");
        }
    }
    
    async function checkIfAlreadyPurchased() {
        // Optionnel : Vérifier si l'utilisateur a déjà acheté cette formation
        // À implémenter avec ton API
    }
    
    function showMessage(text, type) {
        if (!statusMessage) return;
        
        statusMessage.textContent = text;
        statusMessage.style.display = 'block';
        
        // Couleurs selon le type
        statusMessage.style.backgroundColor = 
            type === 'success' ? '#d4edda' :
            type === 'error' ? '#f8d7da' :
            type === 'loading' ? '#fff3cd' :
            '#d1ecf1';
        
        statusMessage.style.color = 
            type === 'success' ? '#155724' :
            type === 'error' ? '#721c24' :
            type === 'loading' ? '#856404' :
            '#0c5460';
        
        statusMessage.style.border = `1px solid ${
            type === 'success' ? '#c3e6cb' :
            type === 'error' ? '#f5c6cb' :
            type === 'loading' ? '#ffeeba' :
            '#bee5eb'
        }`;
    }
});
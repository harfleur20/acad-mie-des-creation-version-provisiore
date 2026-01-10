document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('formations.json');
        const data = await response.json();

        // 1. Gestion Accueil
        if (document.getElementById('container-formations-ligne') || document.getElementById('container-formations-presentiel')) {
            chargerAccueil(data);
            lancerAnimationStats(); 
            injecterRatingsSupabase();
        }

        // 2. Gestion Page Détails
        if (document.getElementById('detail-titre')) {
            chargerDetails(data);
        }

        // 3. Lancement du Compte à rebours
        lancerCompteARebours();

    } catch (error) {
        console.error("Erreur chargement global:", error);
    }
});

// ============================================================
// CHARGEMENT ACCUEIL (BADGES SUPERPOSÉS & PRIX ROUGE)
// ============================================================
function chargerAccueil(data) {
    if (data.stats_accueil) {
        const stats = document.querySelectorAll('.decompte-chiffre span');
        if(stats[0]) stats[0].setAttribute('data-target', data.stats_accueil.etudiants);
        if(stats[1]) stats[1].setAttribute('data-target', data.stats_accueil.formateurs);
        if(stats[2]) stats[2].setAttribute('data-target', data.stats_accueil.communaute);
    }

    const containerLigne = document.getElementById('container-formations-ligne');
    const containerPresentiel = document.getElementById('container-formations-presentiel');

    if(containerLigne) containerLigne.innerHTML = '';
    if(containerPresentiel) containerPresentiel.innerHTML = '';

    const formationsLigne = data.formations.filter(f => f.type === 'ligne');
    const formationsPresentiel = data.formations.filter(f => f.type === 'presentiel');

    if (containerLigne) {
        if (formationsLigne.length > 0) {
            formationsLigne.forEach(f => containerLigne.innerHTML += genererHTMLCarte(f));
        } else {
            containerLigne.innerHTML = `<div class="aucune-formation"><i class="fa-solid fa-box-open"></i><p>Aucune formation en ligne n'est encore disponible.</p></div>`;
        }
    }

    if (containerPresentiel) {
        if (formationsPresentiel.length > 0) {
            formationsPresentiel.forEach(f => containerPresentiel.innerHTML += genererHTMLCarte(f));
        } else {
            containerPresentiel.innerHTML = `<div class="aucune-formation"><i class="fa-solid fa-calendar-xmark"></i><p>Aucune formation en présentiel n'est encore disponible.</p></div>`;
        }
    }
}

function genererHTMLCarte(f) {
    const etat = determinerEtat(f.date_evenement);
    const lienFinal = `detail-formation.html?slug=${f.slug}`;
    let badgeSessionHTML = '';
    let compteurHTML = '';

    if (!etat.estPasse) {
        const dateBadge = formaterDateBadge(f.date_evenement);
        badgeSessionHTML = `<div class="session-badge"><i class="fa-solid fa-clock"></i> <span>ProchaineSession : ${dateBadge}</span></div>`;
        const diffJours = (new Date(f.date_evenement).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        if (diffJours <= 5) compteurHTML = genererHTMLCompteur();
    }

    const aUnePromo = (f.prix.original && f.prix.original !== "" && f.prix.original !== f.prix.actuel);
    let listeBadges = f.badges ? [...f.badges] : [];
    if (aUnePromo) listeBadges.push('promo');

    let badgesSpeciauxHTML = '';
    if (listeBadges.length > 0) {
        let content = '';
        listeBadges.forEach(b => {
            if (b === 'premium') content += `<div class="special-badge badge-premium"><i class="fa-solid fa-crown"></i> Premium</div>`;
            else if (b === 'populaire') content += `<div class="special-badge badge-populaire"><i class="fa-solid fa-fire"></i> Populaire</div>`;
            else if (b === 'promo') content += `<div class="special-badge badge-promo"><i class="fa-solid fa-tags"></i> Promo</div>`;
        });
        badgesSpeciauxHTML = `<div class="badges-column">${content}</div>`;
    }

    

    return `
        <div class="card-bloc new-design">
            <div class="card-image countdown-card" data-end="${f.date_evenement}">
                <img src="${f.image_principale}" alt="${f.titre}">
                ${badgeSessionHTML}
                ${compteurHTML}
            </div>
            
            <div class="card-content">
                <h3 class="card-title">${f.titre}</h3>
                <div class="card-instructor"><i class="fa-solid fa-chalkboard-user"></i> <span>${f.formateur}</span></div>
                
                <div class="card-rating" data-for-slug="${f.slug}">
                    <span class="review-count" style="font-size: 0.8rem; color: #002462;">Chargement des avis...</span>
                </div>

                <div class="card-meta-row">
                    <div class="card-platforms">
                        <span class="platform-label">Plateforme :</span>
                        <img src="Assets/Microsoft_Office_Teams.webp" alt="Teams">
                        <img src="Assets/whatsapp.png" alt="WhatsApp">
                    </div>
                    ${badgesSpeciauxHTML}
                </div>

                <div class="card-divider"></div>
                <div class="card-footer">
                    <div class="price-block">
                        <span class="old-price">${f.prix.original || ''}</span>
                        <span class="current-price ${aUnePromo ? 'price-promo' : ''}">${f.prix.actuel}</span>
                    </div>
                    <a href="${lienFinal}" class="btn-card-action">Voir</a>
                </div>
            </div>
        </div>`;
}

// ============================================================
// CHARGEMENT PAGE DÉTAILS (CORRIGÉ & COMPLET)
// ============================================================
function chargerDetails(data) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) return; 

    const f = data.formations.find(item => item.slug === slug);
    if (!f) return;

    // 1. Textes de base
    document.title = f.titre;
    setText('detail-titre', f.titre);
    setText('detail-description', f.description_seo);
    setImage('detail-image', f.image_principale);
    setText('detail-prix-actuel', f.prix.actuel);
    setText('detail-prix-barre', f.prix.original);
    setText('detail-audience', f.audience);

    // 2. État du bouton Paiement & Compteur
    const etat = determinerEtat(f.date_evenement);
    const btnPay = document.getElementById('detail-btn-paiement');
    const compteur = document.getElementById('detail-compteur');

    if(btnPay) {
        if (!etat.estPasse) {
            btnPay.innerHTML = `<i class="fa-solid fa-piggy-bank"></i> ${etat.texteDetail}`;
            btnPay.dataset.price = f.prix.valeur_cinetpay;
            btnPay.style.backgroundColor = ""; 
            btnPay.style.cursor = "";
            
            // AJOUT IMPORTANT : Configurer le gestionnaire d'achat
            setupPurchaseHandler(f);
        } else {
            btnPay.innerHTML = `<i class="fa-solid fa-lock"></i> Inscriptions closes`;
            btnPay.style.backgroundColor = "#95a5a6";
            btnPay.style.cursor = "not-allowed";
            btnPay.onclick = (e) => e.preventDefault();
        }
    }

    if(compteur) {
        compteur.innerHTML = ''; 
        if(!etat.estPasse) {
            const diffJours = (new Date(f.date_evenement).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
            if (diffJours <= 5) {
                compteur.innerHTML = genererHTMLCompteur();
                compteur.setAttribute('data-end-date', f.date_evenement);
            }
        } else {
            compteur.innerHTML = "<div style='padding:20px; text-align:center; background:#f8d7da; color:#721c24; border-radius:10px; font-weight:bold;'>Offre terminée</div>";
        }
    }

    // 3. Listes (Points clés & Objectifs)
    fillList('detail-points', f.points_cles);
    fillList('detail-objectifs', f.objectifs);
    
    // 4. Travaux Pratiques (Images)
    const tpContainer = document.getElementById('detail-tp');
    if(tpContainer && f.travaux_pratiques) {
        tpContainer.innerHTML = f.travaux_pratiques.map(img => `<img src="${img}" alt="TP">`).join('');
    }

    // 5. Modules (Accordéon)
    const modContainer = document.getElementById('detail-modules');
    if(modContainer && f.modules) {
        modContainer.innerHTML = f.modules.map(m => `
            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <span>${m.nom}</span> <i class="fas fa-chevron-down"></i>
                </div>
                <div class="accordion-content">${m.points.map(p => `<p>${p}</p>`).join('')}</div>
            </div>`).join('');
    }

    // 6. FAQ (Accordéon)
    const faqContainer = document.getElementById('detail-faq');
    if(faqContainer && f.faq) {
        faqContainer.innerHTML = f.faq.map(item => `
            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <span>${item.q}</span> <i class="fas fa-chevron-down"></i>
                </div>
                <div class="accordion-content"><p>${item.r}</p></div>
            </div>`).join('');
    }
}


// ============================================================
// GESTION ACHAT (NOUVELLE FONCTION)
// ============================================================
function setupPurchaseHandler(f) {
    const purchaseBtn = document.getElementById('detail-btn-paiement');
    const statusMessage = document.getElementById('purchase-status-message');
    
    if (!purchaseBtn) return;
    
    // Créer le message de statut s'il n'existe pas
    if (!statusMessage) {
        const newStatusMsg = document.createElement('div');
        newStatusMsg.id = 'purchase-status-message';
        newStatusMsg.style.cssText = 'display: none; margin-top: 10px; padding: 10px; border-radius: 5px; font-size: 0.9rem;';
        purchaseBtn.parentNode.insertBefore(newStatusMsg, purchaseBtn.nextSibling);
    }
    
    // Stocker les données de formation dans le bouton
    purchaseBtn.dataset.formationId = f.id;
    purchaseBtn.dataset.formationSlug = f.slug;
    purchaseBtn.dataset.formationTitre = f.titre;
    purchaseBtn.dataset.formationPrix = f.prix.actuel;
    purchaseBtn.dataset.formationValeur = f.prix.valeur_cinetpay || '50000';
    
    console.log('Formation configurée pour achat:', {
        id: f.id,
        slug: f.slug,
        titre: f.titre,
        prix: f.prix.actuel
    });
    
    // Ajouter l'event listener
    purchaseBtn.addEventListener('click', handlePurchase);
    
    // Afficher un message selon le statut de connexion
    updatePurchaseStatusMessage();
}

// Dans script.js - Modifier handlePurchase
async function handlePurchase(e) {
    e.preventDefault();
    
    const purchaseBtn = e.target;
    const formationId = purchaseBtn.dataset.formationId;
    const formationSlug = purchaseBtn.dataset.formationSlug;
    const formationTitre = purchaseBtn.dataset.formationTitre;
    const formationPrix = purchaseBtn.dataset.formationPrix;
    const formationValeur = purchaseBtn.dataset.formationValeur;
    
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('auth_token');
    const isLoggedIn = !!token;
    
    if (isLoggedIn) {
        // Utilisateur connecté - Ajout direct au compte
        await purchaseForLoggedInUser(formationId, formationSlug, token);
    } else {
        // Nouveau visiteur - Paiement via Tara
        await initiateTaraPayment({
            formationId,
            formationSlug,
            formationTitre,
            formationPrix,
            formationValeur
        });
    }
}

// Nouvelle fonction pour Tara Payment
async function initiateTaraPayment(paymentData) {
    const statusMessage = document.getElementById('purchase-status-message');
    
    // 1. Demander l'email du client
    const customerEmail = prompt("Entrez votre email pour recevoir votre matricule :");
    if (!customerEmail) {
        alert('Email requis pour continuer');
        return;
    }
    
    // 2. Préparer les données pour l'API Tara
    const productPrice = parseFloat(paymentData.formationValeur) || 
                        parseFloat(paymentData.formationPrix.replace(/[^\d]/g, ''));
    
    const taraPaymentData = {
        productId: `formation_${paymentData.formationId}_${Date.now()}`,
        productName: paymentData.formationTitre,
        productPrice: productPrice,
        productDescription: `Formation: ${paymentData.formationTitre}`,
        productPictureUrl: document.getElementById('detail-image')?.src || '',
        customerEmail: customerEmail,
        formationId: paymentData.formationId,
        formationSlug: paymentData.formationSlug,
        // Ces URLs seront utilisées par ton backend
        returnUrl: `${window.location.origin}/payment-success.html?formation=${paymentData.formationSlug}&email=${encodeURIComponent(customerEmail)}`,
        webHookUrl: `${window.location.origin}/api/tara-webhook`
    };
    
    if (statusMessage) {
        statusMessage.textContent = "Génération des liens de paiement...";
        statusMessage.style.display = 'block';
        statusMessage.style.backgroundColor = '#fff3cd';
        statusMessage.style.color = '#856404';
    }
    
    try {
        // Appeler TON backend qui appellera l'API Tara
        const response = await fetch('/api/create-tara-payment', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(taraPaymentData)
        });
        
        const result = await response.json();
        
        if (result.success && result.links) {
            // Afficher les options de paiement
            window.taraPayment.showPaymentOptions(result.links);
            
            if (statusMessage) {
                statusMessage.textContent = "Sélectionnez votre mode de paiement";
                statusMessage.style.backgroundColor = '#d1ecf1';
                statusMessage.style.color = '#0c5460';
            }
            
            // Stocker les données en localStorage pour après paiement
            localStorage.setItem('pending_purchase', JSON.stringify({
                customerEmail,
                formationId: paymentData.formationId,
                formationSlug: paymentData.formationSlug,
                productId: taraPaymentData.productId,
                timestamp: Date.now()
            }));
            
        } else {
            throw new Error(result.message || 'Erreur lors de la génération des liens');
        }
    } catch (error) {
        console.error('Erreur paiement:', error);
        if (statusMessage) {
            statusMessage.textContent = `❌ Erreur: ${error.message}`;
            statusMessage.style.backgroundColor = '#f8d7da';
            statusMessage.style.color = '#721c24';
        }
    }
}

function purchaseForLoggedInUser(formationId, formationSlug, token) {
    const statusMessage = document.getElementById('purchase-status-message');
    
    if (statusMessage) {
        statusMessage.textContent = `Ajout de la formation à votre compte...`;
        statusMessage.style.display = 'block';
        statusMessage.style.backgroundColor = '#fff3cd';
        statusMessage.style.color = '#856404';
    }
    
    // SIMULATION - À remplacer par ton API
    setTimeout(() => {
        if (statusMessage) {
            statusMessage.textContent = `✅ Formation ajoutée à votre compte !`;
            statusMessage.style.backgroundColor = '#d4edda';
            statusMessage.style.color = '#155724';
        }
        
        // Redirection après 2 secondes
        setTimeout(() => {
            window.location.href = 'dashboard-etudiant.html?purchase=success&formation=' + formationSlug;
        }, 2000);
    }, 1500);
}

function purchaseForNewVisitor(formationId, formationSlug, formationTitre, formationPrix) {
    // Demander l'email
    const userEmail = prompt(`Entrez votre email pour recevoir votre matricule :\n\nFormation: ${formationTitre}\nPrix: ${formationPrix}`);
    
    if (!userEmail) {
        alert('Email requis pour continuer');
        return;
    }
    
    // Valider l'email
    if (!isValidEmail(userEmail)) {
        alert('Veuillez entrer un email valide');
        return;
    }
    
    const statusMessage = document.getElementById('purchase-status-message');
    
    if (statusMessage) {
        statusMessage.textContent = `Traitement de votre achat...`;
        statusMessage.style.display = 'block';
        statusMessage.style.backgroundColor = '#fff3cd';
        statusMessage.style.color = '#856404';
    }
    
    // SIMULATION d'achat
    setTimeout(() => {
        // Générer un matricule fictif
        const matricule = 'AC' + Math.floor(1000 + Math.random() * 9000);
        
        if (statusMessage) {
            statusMessage.innerHTML = `
                ✅ Achat réussi !<br>
                <strong>Votre matricule: ${matricule}</strong><br>
                Un email a été envoyé à ${userEmail}
            `;
            statusMessage.style.backgroundColor = '#d4edda';
            statusMessage.style.color = '#155724';
        }
        
        // Redirection vers l'inscription avec pré-remplissage
        setTimeout(() => {
            window.location.href = `login.html?matricule=${matricule}&email=${encodeURIComponent(userEmail)}&formation=${formationSlug}`;
        }, 3000);
    }, 2000);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function updatePurchaseStatusMessage() {
    const statusMessage = document.getElementById('purchase-status-message');
    if (!statusMessage) return;
    
    const token = localStorage.getItem('auth_token');
    const isLoggedIn = !!token;
    
    if (isLoggedIn) {
        // Récupérer le nom de l'utilisateur depuis le token (simplifié)
        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const userName = tokenData.name || 'Utilisateur';
            statusMessage.textContent = `✅ Connecté en tant que ${userName}. L'achat sera ajouté à votre compte.`;
            statusMessage.style.backgroundColor = '#d4edda';
            statusMessage.style.color = '#155724';
        } catch {
            statusMessage.textContent = `✅ Vous êtes connecté. L'achat sera ajouté à votre compte.`;
            statusMessage.style.backgroundColor = '#d4edda';
            statusMessage.style.color = '#155724';
        }
    } else {
        statusMessage.textContent = `👋 Nouveau ? Après l'achat, vous recevrez un matricule pour créer votre compte.`;
        statusMessage.style.backgroundColor = '#d1ecf1';
        statusMessage.style.color = '#0c5460';
    }
    
    statusMessage.style.display = 'block';
}




// ============================================================
// OUTILS TECHNIQUES (Commun)
// ============================================================
function formaterDateBadge(dateString) {
    const date = new Date(dateString);
    const mois = ["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
    return `${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`;
}

function determinerEtat(dateEvent) {
    const now = new Date();
    const eventDate = new Date(dateEvent);
    return { estPasse: now > eventDate, texteDetail: "Réservez votre place !" };
}

function genererHTMLCompteur() {
    return `
    <div class="countdown">
        <div class="countdown-item"><span class="countdown-value days">00</span><span class="countdown-label">J</span></div>
        <div class="countdown-item"><span class="countdown-value hours">00</span><span class="countdown-label">H</span></div>
        <div class="countdown-item"><span class="countdown-value minutes">00</span><span class="countdown-label">M</span></div>
        <div class="countdown-item"><span class="countdown-value seconds">00</span><span class="countdown-label">S</span></div>
    </div>`;
}

function lancerCompteARebours() {
    setInterval(() => {
        document.querySelectorAll('.countdown-card, #detail-compteur').forEach(bloc => {
            const dateStr = bloc.getAttribute('data-end') || bloc.getAttribute('data-end-date');
            if (!dateStr) return;
            const distance = new Date(dateStr).getTime() - new Date().getTime();
            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                if(bloc.querySelector('.days')) bloc.querySelector('.days').innerText = days < 10 ? "0"+days : days;
                if(bloc.querySelector('.hours')) bloc.querySelector('.hours').innerText = hours < 10 ? "0"+hours : hours;
                if(bloc.querySelector('.minutes')) bloc.querySelector('.minutes').innerText = minutes < 10 ? "0"+minutes : minutes;
                if(bloc.querySelector('.seconds')) bloc.querySelector('.seconds').innerText = seconds < 10 ? "0"+seconds : seconds;
            }
        });
    }, 1000);
}

function lancerAnimationStats() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                let count = 0;
                const update = () => {
                    const speed = target / 100;
                    if (count < target) {
                        count += speed;
                        counter.innerText = Math.ceil(count);
                        setTimeout(update, 20);
                    } else counter.innerText = target;
                };
                update();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.decompte-chiffre span').forEach(s => observer.observe(s));
}

function setText(id, text) { const el = document.getElementById(id); if(el) el.textContent = text || ''; }
function setImage(id, src) { const el = document.getElementById(id); if(el) el.src = src || ''; }
function fillList(id, array) { const el = document.getElementById(id); if(el && array) el.innerHTML = array.map(i => `<li><i class="fas fa-check"></i> ${i}</li>`).join(''); }

//fonction pour gerer les votes dans vote.js


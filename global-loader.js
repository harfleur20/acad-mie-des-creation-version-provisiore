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
// CHARGEMENT PAGE DÉTAILS
// ============================================================
// ============================================================
// CHARGEMENT PAGE DÉTAILS (COMPLÈTE)
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

    // 2. Gestion INTELLIGENTE du Bouton "Réserver"
    const btnPay = document.getElementById('detail-btn-paiement');
    const etat = determinerEtat(f.date_evenement);

    if(btnPay) {
        // On clone le bouton pour supprimer TOUS les anciens écouteurs parasites
        const newBtn = btnPay.cloneNode(true);
        btnPay.parentNode.replaceChild(newBtn, btnPay);

        // CAS A : La date est passée -> GRIS (Fermé)
        if (etat.estPasse) {
            newBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Inscriptions closes`;
            newBtn.style.backgroundColor = "#95a5a6"; // Gris
            newBtn.style.cursor = "not-allowed";
            newBtn.style.opacity = "1";
            newBtn.onclick = (e) => e.preventDefault();
        } 
        // CAS B : Date OK mais Pas de lien -> ORANGE (Bientôt)
        else if (!f.lien_reservation || f.lien_reservation.trim() === "") {
            newBtn.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Bientôt les inscriptions`;
            newBtn.style.backgroundColor = "#f39c12"; // Orange
            newBtn.style.cursor = "not-allowed";
            newBtn.style.opacity = "0.8";
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const msgDiv = createMessageDivIfNeeded(newBtn);
                msgDiv.innerHTML = "⚠️ Les inscriptions ne sont pas encore ouvertes pour cette session.";
                msgDiv.style.display = 'block';
                msgDiv.style.backgroundColor = '#fff3cd'; // Jaune pâle
                msgDiv.style.color = '#856404';
                setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
            });
        }
        // CAS C : Date OK et Lien OK -> VERT (Go !)
        else {
            newBtn.innerHTML = `<i class="fa-solid fa-piggy-bank"></i> Réservez votre place !`;
            newBtn.style.backgroundColor = ""; // Garde le vert du CSS
            newBtn.style.cursor = "pointer";
            newBtn.style.opacity = "1";

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const msgDiv = createMessageDivIfNeeded(newBtn);
                msgDiv.innerHTML = "🚀 Tous les paiements sont acceptés : Mobile Money, VISA et Autres";
                msgDiv.style.display = 'block';
                msgDiv.style.backgroundColor = '#cae3f2'; // Vert pâle
                msgDiv.style.color = '#005586';

                setTimeout(() => {
                    window.open(f.lien_reservation, '_self');
                }, 1000);
            });
        }
    }

    // 3. Gestion du Compte à rebours
    const compteur = document.getElementById('detail-compteur');
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

    // 4. Remplissage des listes
    fillList('detail-points', f.points_cles);
    fillList('detail-objectifs', f.objectifs);
    
    // 5. GESTION DES TP AVEC PREVIEW AUTOMATIQUE POUR VIDÉOS (GRAND FORMAT PAYSAGE)
const tpContainer = document.getElementById('detail-tp');
if(tpContainer && f.travaux_pratiques) {
    // 1. Sauvegarder la liste complète dans la variable globale
    currentGalleryItems = f.travaux_pratiques;

    // 2. Générer le HTML avec preview automatique pour vidéos
    tpContainer.innerHTML = f.travaux_pratiques.map((src, index) => {
        const isVideo = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');
        
        if(isVideo) {
            // SOLUTION SIMPLE : vidéo avec première frame comme preview
            return `
                <div class="tp-item video-thumbnail landscape" onclick="openLightbox(${index})" data-video-src="${src}">
                    <div class="video-preview-container">
                        <!-- Poster sera généré automatiquement -->
                        <img class="video-poster" src="" alt="Preview vidéo">
                        <video 
                            class="video-source"
                            src="${src}" 
                            muted 
                            playsinline 
                            webkit-playsinline 
                            preload="metadata"
                            crossorigin="anonymous"
                            style="display: none;"
                        ></video>
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="video-badge">
                            <i class="fas fa-video"></i> Vidéo
                        </div>
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                    </div>
                </div>`;
        } else {
            return `<img src="${src}" alt="TP" class="tp-item image-thumbnail" onclick="openLightbox(${index})">`;
        }
    }).join('');
    
    // 3. GÉNÉRER LES PREVIEWS APRÈS LE CHARGEMENT
    setTimeout(() => {
        generateVideoPreviews();
    }, 1000);
    
    // Si aucune TP, afficher un message
    if(f.travaux_pratiques.length === 0) {
        tpContainer.innerHTML = `
            <div class="no-tp-message">
                <i class="fas fa-photo-video"></i>
                <h3>Aucun travail pratique disponible</h3>
                <p>Les supports de TP seront ajoutés prochainement</p>
            </div>`;
    }
}

    // 6. Gestion des modules
    const modContainer = document.getElementById('detail-modules');
    if(modContainer && f.modules) {
        modContainer.innerHTML = f.modules.map(m => `
            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <span>${m.nom}</span> <i class="fas fa-chevron-down"></i>
                </div>
                <div class="accordion-content">${m.points ? m.points.map(p => `<p>${p}</p>`).join('') : (m.modules ? m.modules.map(p => `<p>${p}</p>`).join('') : '')}</div>
            </div>`).join('');
    }

    // 7. Gestion de la FAQ
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

    // 8. Initialiser le partage social
    setupSocialSharing(f.titre);

    // 9. FORCER LA PREVIEW DES VIDÉOS APRÈS CHARGEMENT
    setTimeout(() => {
        document.querySelectorAll('.video-thumbnail video').forEach(video => {
            // S'assurer que la première frame est affichée
            video.addEventListener('loadeddata', function() {
                if(this.readyState >= 2) { // HAVE_CURRENT_DATA
                    this.currentTime = 0.1;
                    this.pause();
                }
            });
            
            // Si déjà chargé
            if(video.readyState >= 2) {
                video.currentTime = 0.1;
                video.pause();
            }
        });
    }, 500);
}

// ============================================================
// GÉNÉRATION DES PREVIEWS VIDÉO
// ============================================================
async function generateVideoPreviews() {
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    videoThumbnails.forEach(async (thumbnail, index) => {
        const videoSrc = thumbnail.getAttribute('data-video-src');
        const videoElement = thumbnail.querySelector('.video-source');
        const posterImg = thumbnail.querySelector('.video-poster');
        const spinner = thumbnail.querySelector('.loading-spinner');
        
        if (!videoSrc || !videoElement || !posterImg) return;
        
        try {
            // Afficher le spinner
            if (spinner) spinner.style.display = 'flex';
            
            // Créer un élément vidéo temporaire pour capturer la preview
            const tempVideo = document.createElement('video');
            tempVideo.crossOrigin = 'anonymous';
            tempVideo.muted = true;
            tempVideo.preload = 'metadata';
            tempVideo.src = videoSrc;
            
            // Attendre que la vidéo soit prête
            await new Promise((resolve, reject) => {
                tempVideo.addEventListener('loadeddata', resolve);
                tempVideo.addEventListener('error', reject);
                tempVideo.addEventListener('stalled', reject);
                
                // Timeout de sécurité
                setTimeout(() => reject(new Error('Timeout loading video')), 5000);
            });
            
            // Créer un canvas pour capturer la première frame
            tempVideo.currentTime = 0.5; // Un peu après le début
            await new Promise((resolve) => {
                tempVideo.addEventListener('seeked', resolve);
                setTimeout(resolve, 1000);
            });
            
            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            
            // Convertir en image
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            posterImg.src = dataUrl;
            posterImg.style.display = 'block';
            
            // Cacher le spinner
            if (spinner) spinner.style.display = 'none';
            
            // Nettoyer
            tempVideo.remove();
            
        } catch (error) {
            console.error(`Erreur génération preview pour ${videoSrc}:`, error);
            
            // Fallback : utiliser une image placeholder
            posterImg.src = 'Assets/video-placeholder.jpg'; // Créez cette image
            posterImg.style.display = 'block';
            
            // Cacher le spinner
            if (spinner) spinner.style.display = 'none';
        }
    });
}

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

// Petit utilitaire pour créer la div de message si elle n'existe pas
function createMessageDivIfNeeded(btnElement) {
    let msgDiv = document.getElementById('purchase-status-message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'purchase-status-message';
        msgDiv.style.marginTop = '10px';
        msgDiv.style.padding = '10px';
        msgDiv.style.borderRadius = '5px';
        msgDiv.style.textAlign = 'center';
        msgDiv.style.fontWeight = 'bold';
        btnElement.parentNode.insertBefore(msgDiv, btnElement.nextSibling);
    }
    return msgDiv;
}

// Fonctions de remplissage de base
function setText(id, text) { 
    const el = document.getElementById(id); 
    if(el) el.textContent = text || ''; 
}

function setImage(id, src) { 
    const el = document.getElementById(id); 
    if(el) el.src = src || ''; 
}

function fillList(id, array) { 
    const el = document.getElementById(id); 
    if(el && array) el.innerHTML = array.map(i => `<li><i class="fas fa-check"></i> ${i}</li>`).join(''); 
}

// Petit utilitaire pour créer la div de message si elle n'existe pas
function createMessageDivIfNeeded(btnElement) {
    let msgDiv = document.getElementById('purchase-status-message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'purchase-status-message';
        msgDiv.style.marginTop = '10px';
        msgDiv.style.padding = '10px';
        msgDiv.style.borderRadius = '5px';
        msgDiv.style.textAlign = 'center';
        msgDiv.style.fontWeight = 'bold';
        btnElement.parentNode.insertBefore(msgDiv, btnElement.nextSibling);
    }
    return msgDiv;
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

// ============================================================
// GESTION DU PARTAGE (Réseaux Sociaux)
// ============================================================
function setupSocialSharing(titreFormation) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Découvre cette formation incroyable : ${titreFormation}`);
    
    // 1. Configuration Facebook
    const btnFb = document.getElementById('share-facebook');
    if(btnFb) btnFb.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

    // 2. Configuration WhatsApp
    const btnWa = document.getElementById('share-whatsapp');
    if(btnWa) btnWa.href = `https://api.whatsapp.com/send?text=${text}%20${url}`;

    // 3. Configuration Copie Lien
    const btnCopy = document.getElementById('share-copy');
    if(btnCopy) {
        btnCopy.onclick = async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                // Petit feedback visuel
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-copied';
                tooltip.innerText = 'Lien copié dans le presse-papier !';
                document.body.appendChild(tooltip);
                setTimeout(() => tooltip.remove(), 2000);
            } catch (err) {
                console.error('Erreur copie', err);
                alert('Lien : ' + window.location.href);
            }
        };
    }

    // 4. Configuration Partage Natif (Mobile)
    if (navigator.share) {
        const btnNative = document.getElementById('share-native');
        const btnsClassique = document.querySelectorAll('.share-btn:not(.native)');
        
        if(btnNative) {
            btnNative.style.display = 'flex';
            
            btnNative.onclick = () => {
                navigator.share({
                    title: document.title,
                    text: `Je viens de voir cette formation : ${titreFormation}`,
                    url: window.location.href
                }).catch(console.error);
            };
        }
    }
}

// ============================================================
// LIGHTBOX MODERNE (NAVIGATION & ZERO OMBRE)
// ============================================================

// Variables globales pour la galerie
let currentGalleryItems = []; 
let currentGalleryIndex = 0;

// Fonction appelée au clic sur une miniature
function openLightbox(index) {
    const modal = document.getElementById('lightbox-modal');
    if (!modal || currentGalleryItems.length === 0) return;

    currentGalleryIndex = index; // On définit l'image de départ
    updateLightboxContent(); // On affiche l'image
    
    modal.style.display = "flex";

    // Gestion fermeture
    const span = document.getElementsByClassName("close-lightbox")[0];
    if(span) span.onclick = closeLightbox;
    
    // Fermer si clic en dehors (fond noir)
    modal.onclick = function(event) {
        if (event.target === modal) closeLightbox();
    }
    document.addEventListener('keydown', handleKeyboardNav);
}

// Fonction pour changer de slide (+1 ou -1)
function changeSlide(n) {
    currentGalleryIndex += n;
    
    // Boucle infinie
    if (currentGalleryIndex >= currentGalleryItems.length) {
        currentGalleryIndex = 0;
    }
    if (currentGalleryIndex < 0) {
        currentGalleryIndex = currentGalleryItems.length - 1;
    }
    
    updateLightboxContent();
}

// Met à jour l'image ou la vidéo affichée
function updateLightboxContent() {
    const modalImg = document.getElementById('lightbox-img');
    const modalVid = document.getElementById('lightbox-video');
    
    const src = currentGalleryItems[currentGalleryIndex];
    const isVideo = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');

    if (isVideo) {
        // Cacher l'image
        modalImg.style.display = 'none';
        
        // Configurer la vidéo pour un grand affichage
        modalVid.style.display = 'block';
        modalVid.style.maxWidth = '90vw';
        modalVid.style.maxHeight = '80vh';
        modalVid.style.width = 'auto';
        modalVid.style.height = 'auto';
        modalVid.style.borderRadius = '8px';
        modalVid.style.backgroundColor = '#000';
        
        // Mettre à jour la source
        modalVid.src = src;
        
        // Forcer le rechargement
        modalVid.load();
        
        // Ajouter des attributs pour un bon affichage
        modalVid.setAttribute('controls', 'true');
        modalVid.setAttribute('playsinline', 'true');
        modalVid.setAttribute('webkit-playsinline', 'true');
        
        // Essayer de jouer automatiquement
        modalVid.play().catch(e => {
            console.log("Auto-play bloqué - l'utilisateur doit cliquer pour jouer");
        });
        
    } else {
        // Cacher la vidéo
        modalVid.style.display = 'none';
        modalVid.pause();
        modalVid.currentTime = 0;
        
        // Afficher l'image en grand
        modalImg.style.display = 'block';
        modalImg.src = src;
        modalImg.style.maxWidth = '90vw';
        modalImg.style.maxHeight = '80vh';
        modalImg.style.width = 'auto';
        modalImg.style.height = 'auto';
        modalImg.style.objectFit = 'contain';
        modalImg.style.borderRadius = '8px';
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    const modalVid = document.getElementById('lightbox-video');
    if(modal) {
        modal.style.display = "none";
        if(modalVid) {
            modalVid.pause();
            modalVid.currentTime = 0; // Reset vidéo
        }
    }
    document.removeEventListener('keydown', handleKeyboardNav);
}

// Navigation clavier (Flèches + Echap)
function handleKeyboardNav(e) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") changeSlide(1);
    if (e.key === "ArrowLeft") changeSlide(-1);
}
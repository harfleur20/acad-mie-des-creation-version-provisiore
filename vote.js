// ===================================================================
//   SCRIPT DE GESTION DES VOTES FORMATION (VERROUILLAGE VISUEL)
// ===================================================================

function initializeStarRating() {
    const stars = document.querySelectorAll('#stars-container i');
    const voteText = document.getElementById('vote-count');
    const starsContainer = document.getElementById('stars-container');
    
    if (!stars.length) return; 

    const urlParams = new URLSearchParams(window.location.search);
    const formationSlug = urlParams.get('slug') || "formation_generale";
    const storageKey = `vote_formation_${formationSlug}`;
    
    let userVote = localStorage.getItem(storageKey);

    // Charger la moyenne globale depuis Supabase
    recupererMoyenneFormation(formationSlug);

    // --- FONCTION POUR FIXER L'APPARENCE ---
    function applyVisualVote(rating) {
        stars.forEach(s => {
            const sVal = s.getAttribute('data-value');
            if (parseInt(sVal) <= parseInt(rating)) {
                s.classList.replace('fa-regular', 'fa-solid'); // Devient pleine
                s.classList.add('selected'); // Classe pour le jaune (CSS)
                s.style.color = "#FFD700"; // Force la couleur jaune en JS au cas où
            } else {
                s.classList.replace('fa-solid', 'fa-regular');
                s.classList.remove('selected');
                s.style.color = "#ddd"; // Gris pour les autres
            }
        });

        // Verrouillage technique
        if (starsContainer) {
            starsContainer.style.pointerEvents = 'none'; 
            starsContainer.style.cursor = 'default';
        }
        if (voteText) voteText.innerText = "(Votre note est enregistrée)";
    }

    // Si déjà voté auparavant, on applique le visuel direct
    if (userVote) {
        applyVisualVote(userVote);
    }

    stars.forEach((star) => {
        // Effet au survol (uniquement si pas voté)
        star.addEventListener('mouseover', () => {
            if (!localStorage.getItem(storageKey)) {
                const val = star.getAttribute('data-value');
                highlightTemporary(val);
            }
        });

        // Clic pour voter
        star.addEventListener('click', async () => {
            if (localStorage.getItem(storageKey)) return;

            const currentRating = star.getAttribute('data-value');
            
            // 1. Sauvegarde locale
            localStorage.setItem(storageKey, currentRating);
            
            // 2. Application visuelle immédiate (les étoiles deviennent jaunes et se figent)
            applyVisualVote(currentRating);
            
            // 3. Envoi Supabase
            await envoyerVoteFormationSupabase(currentRating, formationSlug);
        });
    });

    // Remet à gris si on sort des étoiles sans avoir voté
    document.getElementById('stars-container').addEventListener('mouseleave', () => {
        if (!localStorage.getItem(storageKey)) {
            highlightTemporary(0);
        }
    });

    function highlightTemporary(val) {
        stars.forEach(s => {
            const sVal = s.getAttribute('data-value');
            if (parseInt(sVal) <= parseInt(val)) {
                s.style.color = "#FFD700";
            } else {
                s.style.color = "#ddd";
            }
        });
    }
}

// Fonction d'envoi (ne pas oublier d'utiliser supabaseClient comme dans ton script.js)
async function envoyerVoteFormationSupabase(note, slug) {
    try {
        const { error } = await supabaseClient
            .from('avis_formations')
            .insert([{ formation_id: slug, note: parseInt(note) }]);
        if (error) throw error;
    } catch (error) {
        console.error("Erreur Supabase :", error.message);
    }
}

async function recupererMoyenneFormation(slug) {
    const voteText = document.getElementById('vote-count');
    try {
        const { data, error } = await supabaseClient
            .from('avis_formations')
            .select('note')
            .eq('formation_id', slug);

        if (data && data.length > 0 && !localStorage.getItem(`vote_formation_${slug}`)) {
            const nbVotes = data.length;
            const somme = data.reduce((acc, curr) => acc + curr.note, 0);
            const moyenne = (somme / nbVotes).toFixed(1);
            if (voteText) voteText.innerText = `(${moyenne}/5 - ${nbVotes} avis)`;
        }
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', initializeStarRating);
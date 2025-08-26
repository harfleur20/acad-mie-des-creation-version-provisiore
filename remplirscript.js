document.addEventListener('DOMContentLoaded', function () {
    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    const multiStepForm = document.getElementById('multiStepForm');
    const whatsappInput = document.getElementById('whatsapp');
    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    const phase3 = document.getElementById('phase3');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLine = document.querySelector('.progress-bar .progress-line');

    const nomInput = document.getElementById('nom');
    const emailInput = document.getElementById('email');
    const professionSelect = document.getElementById('profession');
    // On sélectionne le nouveau champ de pays
    const paysSelect = document.getElementById('pays'); 

    // --- INITIALISATION DE intl-tel-input ---
    const iti = window.intlTelInput(whatsappInput, {
        initialCountry: "auto",
        geoIpLookup: function(callback) {
            fetch("https://ipapi.co/json")
                .then(res => res.json())
                .then(data => callback(data.country_code))
                .catch(() => callback("cm")); // Cameroun par défaut
        },
        separateDialCode: true,
        preferredCountries: ['cm', 'ci', 'sn', 'fr', 'be'],
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    let currentPhase = 1;

    // --- RÈGLES DE VALIDATION (avec le pays) ---
    const validationRules = {
        nom: { validate: value => value.trim().length >= 3, message: "Le nom doit contenir au moins 3 caractères." },
        email: { validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: "Veuillez entrer une adresse email valide." },
        profession: { validate: value => value !== "", message: "Veuillez sélectionner une profession." },
        pays: { validate: value => value !== "", message: "Veuillez sélectionner votre pays." },
        whatsapp: { 
            validate: () => iti.isValidNumber(),
            message: "Ce numéro n'est pas valide pour le pays sélectionné." 
        }
    };

    // --- FONCTIONS DE GESTION DES ERREURS (inchangées) ---
    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorDiv = formGroup.querySelector('.error-message');
        const fieldContainer = formGroup.querySelector('.iti') || inputElement;
        fieldContainer.classList.add('invalid');
        errorDiv.textContent = message || "Ce champ est obligatoire.";
        errorDiv.classList.add('visible');
    }

    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorDiv = formGroup.querySelector('.error-message');
        const fieldContainer = formGroup.querySelector('.iti') || inputElement;
        fieldContainer.classList.remove('invalid');
        errorDiv.classList.remove('visible');
    }

    // --- FONCTION DE VALIDATION UNIQUE (inchangée) ---
    function validateField(inputElement) {
        if (inputElement.id === 'whatsapp') {
            if (inputElement.value.trim() === "") { showError(inputElement, "Le numéro est obligatoire."); return false; }
            return iti.isValidNumber() ? (clearError(inputElement), true) : (showError(inputElement, validationRules.whatsapp.message), false);
        }
        const rule = validationRules[inputElement.id];
        const value = inputElement.value;
        if (value.trim() === "") { showError(inputElement, "Ce champ est obligatoire."); return false; }
        if (rule && !rule.validate(value)) { showError(inputElement, rule.message); return false; }
        clearError(inputElement);
        return true;
    }

    // --- GESTION DE LA NAVIGATION (inchangée) ---
    function updateProgress() {
        progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index < currentPhase);
        });
        const width = ((currentPhase - 1) / (progressSteps.length - 1)) * 100;
        progressLine.style.width = `${width}%`;
    }

    function goToPhase(phaseNumber) {
        document.querySelectorAll('.form-phase').forEach(phase => phase.classList.remove('active'));
        const targetPhase = document.getElementById(`phase${phaseNumber}`);
        if(targetPhase) { targetPhase.classList.add('active'); }
        currentPhase = phaseNumber;
        if(phaseNumber < 3) {
            updateProgress();
        } else {
            document.querySelector('.progress-bar').style.display = 'none';
        }
    }

    // --- ÉVÉNEMENTS (mis à jour) ---
    nextBtn.addEventListener('click', () => {
        const isNomValid = validateField(nomInput);
        const isEmailValid = validateField(emailInput);
        const isProfessionValid = validateField(professionSelect);
        const isPaysValid = validateField(paysSelect); // On ajoute la validation du pays
        const isWhatsappValid = validateField(whatsappInput);

        if (isNomValid && isEmailValid && isProfessionValid && isPaysValid && isWhatsappValid) {
            goToPhase(2);
        }
    });

    prevBtn.addEventListener('click', () => { goToPhase(1); });
    
    // On ajoute 'paysSelect' à la validation en temps réel
    [nomInput, emailInput, professionSelect, paysSelect, whatsappInput].forEach(input => {
        const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
        input.addEventListener(eventType, () => {
            validateField(input);
        });
    });

    // --- GESTION DE L'ENVOI (inchangée) ---
    multiStepForm.addEventListener('submit', function (event) {
        event.preventDefault(); 
        const submitButton = multiStepForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Envoi en cours... <i class="fa-solid fa-spinner fa-spin"></i>';
        const formData = new FormData(multiStepForm);
        formData.append('full_whatsapp', iti.getNumber());
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        }).then(() => {
            goToPhase(3);
        }).catch((error) => {
            alert("Une erreur est survenue. Veuillez réessayer.");
            submitButton.disabled = false;
            submitButton.innerHTML = 'Soumettre <i class="fa-solid fa-paper-plane"></i>';
        });
    });
    
    goToPhase(1);
});
document.addEventListener('DOMContentLoaded', function () {
    const multiStepForm = document.getElementById('multiStepForm');
    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    const phase3 = document.getElementById('phase3');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLine = document.querySelector('.progress-bar .progress-line');

    const nomInput = document.getElementById('nom');
    const emailInput = document.getElementById('email');
    const whatsappInput = document.getElementById('whatsapp');
    const professionSelect = document.getElementById('profession');

    let currentPhase = 1;

    const validationRules = {
        nom: { validate: value => value.trim().length >= 3, message: "Le nom doit contenir au moins 3 caractères." },
        email: { validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: "Veuillez entrer une adresse email valide." },
        whatsapp: { validate: value => /^6\d{8}$/.test(value), message: "Le numéro doit commencer par 6 et avoir 9 chiffres." },
        profession: { validate: value => value !== "", message: "Veuillez sélectionner une profession." }
    };

    function showError(inputElement, message) {
        const formGroup = inputElement.parentElement;
        const errorDiv = formGroup.querySelector('.error-message');
        inputElement.classList.add('invalid');
        errorDiv.textContent = message || "Ce champ est obligatoire.";
        errorDiv.classList.add('visible');
    }

    function clearError(inputElement) {
        const formGroup = inputElement.parentElement;
        const errorDiv = formGroup.querySelector('.error-message');
        inputElement.classList.remove('invalid');
        errorDiv.classList.remove('visible');
    }

    function validateField(inputElement) {
        const rule = validationRules[inputElement.id];
        const value = inputElement.value;
        if (value.trim() === "") {
            showError(inputElement, "Ce champ est obligatoire.");
            return false;
        }
        if (rule && !rule.validate(value)) {
            showError(inputElement, rule.message);
            return false;
        }
        clearError(inputElement);
        return true;
    }

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
        if(targetPhase) {
            targetPhase.classList.add('active');
        }
        currentPhase = phaseNumber;
        if(phaseNumber < 3) {
            updateProgress();
        } else {
            // Cacher la barre de progression pour la phase de succès
            document.querySelector('.progress-bar').style.display = 'none';
        }
    }

    nextBtn.addEventListener('click', () => {
        const isNomValid = validateField(nomInput);
        const isEmailValid = validateField(emailInput);
        const isWhatsappValid = validateField(whatsappInput);
        const isProfessionValid = validateField(professionSelect);

        if (isNomValid && isEmailValid && isWhatsappValid && isProfessionValid) {
            goToPhase(2);
        }
    });

    prevBtn.addEventListener('click', () => { goToPhase(1); });
    
    [nomInput, emailInput, whatsappInput, professionSelect].forEach(input => {
        input.addEventListener('input', () => { validateField(input); });
    });

    // --- NOUVELLE PARTIE : GESTION DE L'ENVOI DU FORMULAIRE ---
    multiStepForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Empêche le rechargement de la page

        const submitButton = multiStepForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Envoi en cours... <i class="fa-solid fa-spinner fa-spin"></i>';

        const formData = new FormData(multiStepForm);
        
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        })
        .then(() => {
            // Si l'envoi réussit, on passe à la phase 3
            goToPhase(3);
        })
        .catch((error) => {
            alert("Une erreur est survenue. Veuillez réessayer.");
            submitButton.disabled = false;
            submitButton.innerHTML = 'Soumettre <i class="fa-solid fa-paper-plane"></i>';
        });
    });

    // Initialisation
    goToPhase(1);
});
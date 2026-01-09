document.addEventListener('DOMContentLoaded', () => {
    // --- NAVIGATION TABS ---
    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');

    if (toRegister) {
        toRegister.onclick = () => { loginBox.classList.remove('active'); registerBox.classList.add('active'); };
        toLogin.onclick = () => { registerBox.classList.remove('active'); loginBox.classList.add('active'); };
    }

    // --- VISIBILITÉ MOT DE PASSE ---
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = document.getElementById(this.dataset.target);
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // --- VARIABLES ---
    const regName = document.getElementById('regName');
    const nameError = document.getElementById('nameError');
    
    const regEmail = document.getElementById('regEmail');
    const emailError = document.getElementById('emailError');

    const regPass = document.getElementById('regPass');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strength-text');
    const strengthMeter = document.querySelector('.strength-meter');

    // --- FONCTIONS D'ANIMATION (Updated) ---
    function showMessage(input, element, message, isError = true) {
        element.textContent = message;
        element.classList.add('visible'); // Déclenche l'animation CSS
        
        if (isError) {
            input.classList.add('invalid');
            input.classList.remove('valid');
        } else {
            // Pour les messages informatifs (force mdp)
            input.classList.remove('invalid');
        }
    }

    function hideMessage(input, element) {
        element.classList.remove('visible'); // Cache avec animation
        if (input) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        }
    }

    // --- 1. VALIDATION NOM ---
    regName.addEventListener('input', () => {
        const val = regName.value.trim();
        const isOnlyNumbers = /^\d+$/.test(val);

        if (val.length === 0) {
            showMessage(regName, nameError, "Le nom est requis.");
        } else if (isOnlyNumbers) {
            showMessage(regName, nameError, "Un nom ne peut pas être composé uniquement de chiffres.");
        } else if (val.length < 2) {
            showMessage(regName, nameError, "Le nom doit contenir au moins 2 caractères.");
        } else {
            hideMessage(regName, nameError);
        }
    });

    // --- 2. VALIDATION EMAIL ---
    regEmail.addEventListener('input', () => {
        const val = regEmail.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (val.length === 0) {
            showMessage(regEmail, emailError, "L'email est requis.");
        } else if (!emailRegex.test(val)) {
            showMessage(regEmail, emailError, "Veuillez entrer une adresse email valide.");
        } else {
            hideMessage(regEmail, emailError);
        }
    });

    // --- 3. VALIDATION MOT DE PASSE & FORCE ---
    regPass.addEventListener('input', () => {
        const val = regPass.value;
        let score = 0;

        if (val.length === 0) {
            strengthMeter.style.display = 'none';
            strengthText.classList.remove('visible'); // Cache le texte
            regPass.classList.remove('valid', 'invalid');
            return;
        }
        
        strengthMeter.style.display = 'block';
        strengthText.classList.add('visible'); // Affiche le texte avec animation

        // Critères
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        strengthBar.style.width = (score * 25) + "%";
        
        if (score <= 2) {
            strengthBar.style.backgroundColor = "#ff4757";
            strengthText.textContent = "Faible";
            strengthText.style.color = "#ff4757";
            regPass.classList.add('invalid');
            regPass.classList.remove('valid');
        } else if (score === 3) {
            strengthBar.style.backgroundColor = "#ffa502";
            strengthText.textContent = "Moyen";
            strengthText.style.color = "#ffa502";
            regPass.classList.remove('invalid', 'valid');
        } else {
            strengthBar.style.backgroundColor = "#2ed573";
            strengthText.textContent = "Fort";
            strengthText.style.color = "#2ed573";
            regPass.classList.add('valid');
            regPass.classList.remove('invalid');
        }
    });

    // --- SOUMISSION ---
    document.getElementById('registerForm').onsubmit = (e) => {
        e.preventDefault();
        
        // Simuler un événement 'input' pour afficher les erreurs si champs vides
        regName.dispatchEvent(new Event('input'));
        regEmail.dispatchEvent(new Event('input'));

        const isNameValid = regName.classList.contains('valid');
        const isEmailValid = regEmail.classList.contains('valid');
        const isPassValid = !regPass.classList.contains('invalid') && regPass.value.length >= 8;

        if (!isNameValid || !isEmailValid || !isPassValid) {
            // Animation de "secousse" (Shake) optionnelle si erreur
            const btn = document.querySelector('.btn-auth');
            btn.style.animation = "shake 0.5s ease";
            setTimeout(() => btn.style.animation = "none", 500);
            return;
        }

        alert("Inscription validée ! Redirection...");
    };
});
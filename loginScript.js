document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES GLOBALES ---
    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    
    // Éléments de l'étape 1
    const regName = document.getElementById('regName');
    const nameError = document.getElementById('nameError');
    const regEmail = document.getElementById('regEmail');
    const emailError = document.getElementById('emailError');
    const regPass = document.getElementById('regPass');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strength-text');
    const strengthMeter = document.querySelector('.strength-meter');
    
    // Éléments de l'étape 2
    const step1Form = document.getElementById('registerFormStep1');
    const step2Form = document.getElementById('registerFormStep2');
    const studentSection = document.getElementById('studentSection');
    const teacherSection = document.getElementById('teacherSection');
    const studentCode = document.getElementById('studentCode');
    const studentCodeError = document.getElementById('studentCodeError');
    const teacherCode = document.getElementById('teacherCode');
    const teacherCodeError = document.getElementById('teacherCodeError');
    const teacherQualifications = document.getElementById('teacherQualifications');
    const teacherQualificationsError = document.getElementById('teacherQualificationsError');
    
    // Éléments UI
    const registerTitle = document.getElementById('registerTitle');
    const registerSubtext = document.getElementById('registerSubtext');
    const switchLoginText = document.getElementById('switchLoginText');
    const successMessage = document.getElementById('successMessage');
    const successContent = document.getElementById('successContent');
    const teacherPendingMessage = document.getElementById('teacherPendingMessage');
    const successTitle = document.getElementById('successTitle');
    const successSubtext = document.getElementById('successSubtext');
    
    // Données temporaires
    let step1Data = {};
    let selectedRole = 'etudiant';
    
    // --- INITIALISATION ---
    initRegistrationForm();
    
    // --- FONCTIONS D'INITIALISATION ---
    function initRegistrationForm() {
        // Navigation entre login/register
        if (toRegister) {
            toRegister.onclick = () => { 
                loginBox.classList.remove('active'); 
                registerBox.classList.add('active'); 
                resetRegistrationForm();
            };
            toLogin.onclick = () => { 
                registerBox.classList.remove('active'); 
                loginBox.classList.add('active'); 
                resetRegistrationForm();
            };
        }
        
        // Toggle password visibility
        initPasswordToggles();
        
        // Validation des champs étape 1
        initStep1Validation();
        
        // Gestion des options enseignant
        initTeacherOptions();
        
        // Soumission des formulaires
        initFormSubmissions();
        
        // Gestion du retour à l'accueil
        document.getElementById('returnHomeBtn')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    function initPasswordToggles() {
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
    }
    
    function initStep1Validation() {
        // Validation nom
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
        
        // Validation email
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
        
        // Validation mot de passe
        regPass.addEventListener('input', () => {
            const val = regPass.value;
            let score = 0;
            
            if (val.length === 0) {
                strengthMeter.style.display = 'none';
                strengthText.classList.remove('visible');
                regPass.classList.remove('valid', 'invalid');
                return;
            }
            
            strengthMeter.style.display = 'block';
            strengthText.classList.add('visible');
            
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
    }
    
    function initTeacherOptions() {
        // Gestion du changement d'option enseignant
        document.querySelectorAll('input[name="teacherVerif"]').forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'code') {
                    // Réinitialiser les erreurs de demande
                    hideMessage(teacherQualifications, teacherQualificationsError);
                }
            });
        });
        
        // Validation code enseignant
        teacherCode?.addEventListener('input', () => {
            const val = teacherCode.value.trim().toUpperCase();
            if (val.length === 0) {
                hideMessage(teacherCode, teacherCodeError);
                return;
            }
            const codeRegex = /^PR-\w{4}-\w{4}$/;
            if (!codeRegex.test(val)) {
                showMessage(teacherCode, teacherCodeError, "Format: PR-XXXX-XXXX (ex: PR-2024-A1B2)");
            } else if (!isValidTeacherCode(val)) {
                showMessage(teacherCode, teacherCodeError, "Code d'invitation invalide ou expiré.");
            } else {
                hideMessage(teacherCode, teacherCodeError);
            }
        });
        
        // Validation qualifications enseignant
        teacherQualifications?.addEventListener('input', () => {
            const val = teacherQualifications.value.trim();
            if (val.length === 0) {
                showMessage(teacherQualifications, teacherQualificationsError, "Veuillez décrire vos qualifications.");
            } else if (val.length < 50) {
                showMessage(teacherQualifications, teacherQualificationsError, "Veuillez fournir plus de détails (minimum 50 caractères).");
            } else {
                hideMessage(teacherQualifications, teacherQualificationsError);
            }
        });
        
        // Validation code étudiant
        studentCode?.addEventListener('input', () => {
            const val = studentCode.value.trim().toUpperCase();
            if (val.length === 0) {
                hideMessage(studentCode, studentCodeError);
                return;
            }
            const codeRegex = /^AC\d{4}$/;
            if (!codeRegex.test(val)) {
                showMessage(studentCode, studentCodeError, "Format: ACXXXX (ex: AC2035)");
            } else if (!isValidStudentCode(val)) {
                showMessage(studentCode, studentCodeError, "Code académique non reconnu.");
            } else {
                hideMessage(studentCode, studentCodeError);
            }
        });
    }
    
    function initFormSubmissions() {
        // Soumission étape 1
        step1Form.onsubmit = (e) => {
            e.preventDefault();
            
            // Valider les champs
            regName.dispatchEvent(new Event('input'));
            regEmail.dispatchEvent(new Event('input'));
            regPass.dispatchEvent(new Event('input'));
            
            const isNameValid = regName.classList.contains('valid');
            const isEmailValid = regEmail.classList.contains('valid');
            const isPassValid = !regPass.classList.contains('invalid') && regPass.value.length >= 8;
            
            if (!isNameValid || !isEmailValid || !isPassValid) {
                const btn = document.getElementById('nextStepBtn');
                btn.style.animation = "shake 0.5s ease";
                setTimeout(() => btn.style.animation = "none", 500);
                return;
            }
            
            // Sauvegarder les données
            step1Data = {
                name: regName.value.trim(),
                email: regEmail.value.trim(),
                password: regPass.value,
                role: document.querySelector('input[name="role"]:checked').value
            };
            
            selectedRole = step1Data.role;
            
            // Passer à l'étape 2
            showStep2();
        };
        
        // Soumission étape 2
        step2Form.onsubmit = (e) => {
            e.preventDefault();
            
            if (selectedRole === 'etudiant') {
                validateStudentSubmission();
            } else {
                validateTeacherSubmission();
            }
        };
        
        // Bouton retour étape 1
        document.getElementById('backToStep1').onclick = () => {
            step2Form.style.animation = "slideOutRight 0.4s ease forwards";
            
            setTimeout(() => {
                step2Form.style.display = 'none';
                step1Form.style.display = 'block';
                step1Form.style.animation = "slideInLeft 0.4s ease forwards";
                
                registerTitle.textContent = "Créer un compte";
                registerSubtext.textContent = "Choisissez votre rôle et commencez l'aventure.";
                switchLoginText.style.opacity = '1';
            }, 400);
        };
    }
    
    // --- FONCTIONS DE VALIDATION ---
    function validateStudentSubmission() {
        studentCode.dispatchEvent(new Event('input'));
        
        if (!studentCode.classList.contains('valid') && studentCode.value.trim() !== '') {
            showMessage(studentCode, studentCodeError, "Code académique invalide.");
            return;
        }
        
        if (studentCode.value.trim() === '') {
            showMessage(studentCode, studentCodeError, "Le code académique est requis.");
            return;
        }
        
        step1Data.academicCode = studentCode.value.trim().toUpperCase();
        completeRegistration(false);
    }
    
    function validateTeacherSubmission() {
        const verificationType = document.querySelector('input[name="teacherVerif"]:checked').value;
        
        if (verificationType === 'code') {
            teacherCode.dispatchEvent(new Event('input'));
            
            if (!teacherCode.classList.contains('valid') && teacherCode.value.trim() !== '') {
                showMessage(teacherCode, teacherCodeError, "Code d'invitation invalide.");
                return;
            }
            
            if (teacherCode.value.trim() === '') {
                showMessage(teacherCode, teacherCodeError, "Le code d'invitation est requis.");
                return;
            }
            
            step1Data.teacherCode = teacherCode.value.trim().toUpperCase();
            step1Data.verificationType = 'code';
            completeRegistration(false);
            
        } else {
            // Demande d'approbation
            teacherQualifications.dispatchEvent(new Event('input'));
            
            if (!teacherQualifications.classList.contains('valid')) {
                return;
            }
            
            step1Data.verificationType = 'request';
            step1Data.specialty = document.getElementById('teacherSpecialty').value;
            step1Data.experience = document.getElementById('teacherExperience').value;
            step1Data.qualifications = teacherQualifications.value.trim();
            step1Data.portfolio = document.getElementById('teacherPortfolio').value.trim();
            
            completeRegistration(true); // true = en attente d'approbation
        }
    }
    
    // --- FONCTIONS D'AFFICHAGE ---
    function showStep2() {
        step1Form.style.animation = "slideOutLeft 0.4s ease forwards";
        
        setTimeout(() => {
            step1Form.style.display = 'none';
            step2Form.style.display = 'block';
            step2Form.style.animation = "slideInRight 0.4s ease forwards";
            
            // Afficher la section appropriée
            if (selectedRole === 'etudiant') {
                studentSection.style.display = 'block';
                teacherSection.style.display = 'none';
                registerTitle.textContent = "Validation académique";
                registerSubtext.textContent = "Entrez votre code étudiant";
            } else {
                studentSection.style.display = 'none';
                teacherSection.style.display = 'block';
                registerTitle.textContent = "Validation enseignant";
                registerSubtext.textContent = "Choisissez votre méthode de vérification";
            }
            
            switchLoginText.style.opacity = '0.5';
        }, 400);
    }
    
    function completeRegistration(isPending = false) {
        // Cacher les formulaires
        step1Form.style.display = 'none';
        step2Form.style.display = 'none';
        switchLoginText.style.display = 'none';
        
        // Afficher le message approprié
        successMessage.style.display = 'block';
        
        if (isPending && selectedRole === 'professeur') {
            // Enseignant en attente d'approbation
            successContent.style.display = 'none';
            teacherPendingMessage.style.display = 'block';
        } else {
            // Inscription immédiate (étudiant ou enseignant avec code)
            successContent.style.display = 'block';
            teacherPendingMessage.style.display = 'none';
            
            successTitle.textContent = selectedRole === 'etudiant' 
                ? "Étudiant inscrit !" 
                : "Enseignant inscrit !";
                
            successSubtext.textContent = selectedRole === 'etudiant'
                ? "Vous avez accès à toutes les formations."
                : "Vous pouvez maintenant créer vos cours.";
        }
        
        console.log("Données d'inscription:", step1Data);
        
        // Simulation d'envoi au backend
        if (!isPending) {
            setTimeout(() => {
                alert(`Inscription réussie !\nRôle: ${selectedRole}\nEmail: ${step1Data.email}`);
                // window.location.href = 'dashboard.html';
            }, 2000);
        }
    }
    
    // --- FONCTIONS UTILITAIRES ---
    function showMessage(input, element, message, isError = true) {
        element.textContent = message;
        element.classList.add('visible');
        
        if (isError && input) {
            input.classList.add('invalid');
            input.classList.remove('valid');
        } else if (input) {
            input.classList.remove('invalid');
        }
    }
    
    function hideMessage(input, element) {
        element.classList.remove('visible');
        if (input) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        }
    }
    
    function resetRegistrationForm() {
        // Réinitialiser l'affichage
        step1Form.style.display = 'block';
        step1Form.style.animation = 'none';
        step2Form.style.display = 'none';
        successMessage.style.display = 'none';
        successContent.style.display = 'block';
        teacherPendingMessage.style.display = 'none';
        switchLoginText.style.display = 'block';
        switchLoginText.style.opacity = '1';
        
        // Réinitialiser les titres
        registerTitle.textContent = "Créer un compte";
        registerSubtext.textContent = "Choisissez votre rôle et commencez l'aventure.";
        
        // Réinitialiser les données
        step1Data = {};
        selectedRole = 'etudiant';
        
        // Réinitialiser les champs
        regName.value = '';
        regEmail.value = '';
        regPass.value = '';
        studentCode.value = '';
        teacherCode.value = '';
        teacherQualifications.value = '';
        document.getElementById('teacherSpecialty').value = '';
        document.getElementById('teacherExperience').value = '';
        document.getElementById('teacherPortfolio').value = '';
        
        // Réinitialiser les erreurs
        hideMessage(regName, nameError);
        hideMessage(regEmail, emailError);
        hideMessage(studentCode, studentCodeError);
        hideMessage(teacherCode, teacherCodeError);
        hideMessage(teacherQualifications, teacherQualificationsError);
        
        // Réinitialiser le password meter
        regPass.classList.remove('valid', 'invalid');
        strengthMeter.style.display = 'none';
        strengthText.classList.remove('visible');
        
        // Réinitialiser les radios
        document.querySelector('input[name="role"][value="etudiant"]').checked = true;
        document.querySelector('input[name="teacherVerif"][value="code"]').checked = true;
    }
    
    // --- FONCTIONS DE VÉRIFICATION DES CODES ---
    function isValidStudentCode(code) {
        const validCodes = [
            'AC2035', 'AC0001', 'AC1234', 'AC5678', 'AC9999',
            'AC2024', 'AC2025', 'AC3030', 'AC4040', 'AC5050'
        ];
        return validCodes.includes(code);
    }
    
    function isValidTeacherCode(code) {
        const validCodes = [
            'PR-2024-A1B2', 'PR-2024-C3D4', 'PR-2024-E5F6',
            'PR-2024-G7H8', 'PR-2024-I9J0', 'PR-2024-K1L2'
        ];
        return validCodes.includes(code);
    }
    
    // --- CONNEXION ---
    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        alert("Fonctionnalité de connexion à implémenter.");
    };
});
document.addEventListener('DOMContentLoaded', () => {
    // Sélectionne toutes les cartes qui doivent avoir un compteur
    const countdownCards = document.querySelectorAll('.countdown-card');

    countdownCards.forEach(cardWithCountdown => {
        const endDateString = cardWithCountdown.dataset.end;
        
        if (!endDateString) return; // Ignore la carte si aucune date n'est définie

        const endDate = new Date(endDateString).getTime();
        const now = new Date().getTime();
        const initialDistance = endDate - now;

        if (initialDistance > 0) {
            // Création des éléments HTML du compteur pour cette carte
            const introText = document.createElement('p');
            introText.className = 'countdown-intro-text';
            introText.textContent = 'Réserve ta place, la formation débute dans :';

            const countdown = document.createElement('div');
            countdown.className = 'countdown';
            countdown.innerHTML = `
                <div class="countdown-item">
                    <span class="countdown-value days">00</span>
                    <span class="countdown-label">J</span>
                </div>
                <span class="countdown-separator">:</span>
                <div class="countdown-item">
                    <span class="countdown-value hours">00</span>
                    <span class="countdown-label">h</span>
                </div>
                <span class="countdown-separator">:</span>
                <div class="countdown-item">
                    <span class="countdown-value minutes">00</span>
                    <span class="countdown-label">min</span>
                </div>
                <span class="countdown-separator">:</span>
                <div class="countdown-item">
                    <span class="countdown-value seconds">00</span>
                    <span class="countdown-label">s</span>
                </div>
            `;

            // Insertion des éléments dans le DOM de la carte en cours de traitement
            cardWithCountdown.appendChild(introText);
            cardWithCountdown.appendChild(countdown);

            // Définition de la fonction de mise à jour pour cette carte
            const updateCountdown = () => {
                const now = new Date().getTime();
                const distance = endDate - now;

                if (distance < 0) {
                    clearInterval(interval);
                    countdown.remove();
                    introText.remove();
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                countdown.querySelector('.days').textContent = String(days).padStart(2, '0');
                countdown.querySelector('.hours').textContent = String(hours).padStart(2, '0');
                countdown.querySelector('.minutes').textContent = String(minutes).padStart(2, '0');
                countdown.querySelector('.seconds').textContent = String(seconds).padStart(2, '0');
            };

            const interval = setInterval(updateCountdown, 1000);
            updateCountdown();
        }
    });
});
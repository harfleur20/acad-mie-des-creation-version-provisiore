document.addEventListener('DOMContentLoaded', function () {
    const countdownCards = document.querySelectorAll('.countdown-card');

    countdownCards.forEach(card => {
        const endDateString = card.getAttribute('data-end-date');
        if (!endDateString) return;

        const endOfFormation = new Date(endDateString).getTime();
        const now = new Date().getTime();
        const distance = endOfFormation - now;

        // Si la date de fin n'est pas encore passée...
        if (distance > 0) {
            // ...Alors on affiche le compteur...
            card.style.display = 'flex'; // ou 'block' selon votre mise en page

            const daysSpan = card.querySelector('.days');
            const hoursSpan = card.querySelector('.hours');
            const minutesSpan = card.querySelector('.minutes');
            const secondsSpan = card.querySelector('.seconds');

            // ...Et on lance l'intervalle pour le mettre à jour.
            const countdownInterval = setInterval(function() {
                const nowUpdated = new Date().getTime();
                const distanceUpdated = endOfFormation - nowUpdated;

                // Si le temps est écoulé pendant que l'utilisateur regarde la page
                if (distanceUpdated < 0) {
                    clearInterval(countdownInterval);
                    card.style.display = 'none'; // On le cache à nouveau
                    return;
                }

                const days = Math.floor(distanceUpdated / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distanceUpdated % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distanceUpdated % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distanceUpdated % (1000 * 60)) / 1000);

                daysSpan.innerHTML = days.toString().padStart(2, '0');
                hoursSpan.innerHTML = hours.toString().padStart(2, '0');
                minutesSpan.innerHTML = minutes.toString().padStart(2, '0');
                secondsSpan.innerHTML = seconds.toString().padStart(2, '0');

            }, 1000);
        }
        // Si la date est déjà passée, on ne fait rien. Le compteur restera caché grâce au CSS.
    });
});
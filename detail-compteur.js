// Le script générique pour plusieurs compteurs (copié-collé)
const countdownCards = document.querySelectorAll('.countdown-card');

countdownCards.forEach(card => {
  const endDate = card.getAttribute('data-end-date');
  const endOfFormation = new Date(endDate).getTime();
  
  // Sélectionnez les éléments à l'intérieur de la carte actuelle
  const timerContainer = card.querySelector('.countdown-timer');
  const daysSpan = timerContainer.querySelector('.days');
  const hoursSpan = timerContainer.querySelector('.hours');
  const minutesSpan = timerContainer.querySelector('.minutes');
  const secondsSpan = timerContainer.querySelector('.seconds');
  
  const countdownInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = endOfFormation - now;
    
    if (distance < 0) {
      clearInterval(countdownInterval);
      card.style.display = 'none';
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    daysSpan.innerHTML = days.toString().padStart(2, '0');
    hoursSpan.innerHTML = hours.toString().padStart(2, '0');
    minutesSpan.innerHTML = minutes.toString().padStart(2, '0');
    secondsSpan.innerHTML = seconds.toString().padStart(2, '0');
  }, 1000);
});
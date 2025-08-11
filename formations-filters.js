document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const formationCards = document.querySelectorAll('.formations-grid .card-bloc');

    if (!filterButtons.length || !formationCards.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Gère l'état visuel des onglets
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const activeCategory = button.dataset.filter;

            formationCards.forEach(card => {
                const category = card.dataset.category;
                
                // On cache ou montre la carte selon la catégorie
                if (activeCategory === 'all' || category === activeCategory) {
                    card.classList.remove('hide');
                } else {
                    card.classList.add('hide');
                }
            });
        });
    });
});
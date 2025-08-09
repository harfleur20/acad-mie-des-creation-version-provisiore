document.addEventListener('DOMContentLoaded', function () {
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            // Ferme tous les autres accordéons
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Ouvre ou ferme l'accordéon cliqué
            item.classList.toggle('active');
        });
    });
});

// --------------------------------------------------------------------------------------


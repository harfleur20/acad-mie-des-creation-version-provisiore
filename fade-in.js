const animatedElements = document.querySelectorAll('.animated-item');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Ciblez la section parente de l'élément animé
            const parentSection = entry.target.closest('section');
            if (parentSection && parentSection.classList.contains('fade-in')) {
                // Obtenez tous les éléments animés dans la section visible
                const sectionItems = parentSection.querySelectorAll('.animated-item');
                
                // Pour chaque élément, ajoutez la classe 'visible' avec un décalage
                sectionItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, index * 200); // 200ms de décalage entre chaque élément
                });
            }
            // Arrête d'observer la section parente une fois l'animation lancée
            observer.unobserve(parentSection);
        }
    });
}, {
    threshold: 0.3 // Déclenche l'animation quand 30% de la section est visible
});

// Ciblez les sections entières pour l'observateur
const sectionsToAnimate = document.querySelectorAll('.fade-in');

sectionsToAnimate.forEach(section => {
    observer.observe(section);
});
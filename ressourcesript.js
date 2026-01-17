
// Variables globales
let resources = [];
let filteredResources = [];
let selectedCategory = 'Tous';
let searchTerm = '';
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// Icons SVG
const icons = {
    pdf: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    video: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
    archive: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>',
    template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    link: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
    heart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
};

// Charger les ressources depuis le JSON
async function loadResources() {
    try {
        const response = await fetch('resource.json');
        if (!response.ok) {
            throw new Error('Erreur de chargement des ressources');
        }
        const data = await response.json();
        resources = data.resources;
        filteredResources = [...resources];
        
        // Initialiser l'interface
        renderCategoryButtons();
        renderResources();
        updateResourceCount();
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('resourcesGrid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: #ef4444; font-size: 1.125rem; font-weight: 600;">
                    ❌ Erreur de chargement des ressources
                </p>
                <p style="color: #64748b; margin-top: 0.5rem;">
                    Les ressources sont temporairement indisponibles.
                </p>
            </div>
        `;
    }
}

// Get category icon
function getCategoryIcon(category) {
    const iconMap = {
        'PDF': icons.pdf,
        'Vidéo': icons.video,
        'Archive': icons.archive,
        'Template': icons.template
    };
    return iconMap[category] || icons.pdf;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Toggle favorite
function toggleFavorite(id) {
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderResources();
}

// Filter resources
function filterResources() {
    filteredResources = resources.filter(resource => {
        const matchesCategory = selectedCategory === 'Tous' || resource.category === selectedCategory;
        const matchesSearch = !searchTerm || 
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesCategory && matchesSearch;
    });
    
    renderResources();
    updateResourceCount();
}

// Update resource count
function updateResourceCount() {
    const count = filteredResources.length;
    document.getElementById('resourceCount').textContent = 
        `${count} ressource${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`;
}

// Render category buttons
function renderCategoryButtons() {
    const categories = ['Tous', 'PDF', 'Vidéo', 'Template', 'Archive'];
    const container = document.getElementById('categoryButtons');
    
    container.innerHTML = categories.map(cat => `
        <button class="category-btn ${cat === selectedCategory ? 'active' : ''}" 
                onclick="selectCategory('${cat}')">
            ${cat}
        </button>
    `).join('');
}

// Select category
function selectCategory(category) {
    selectedCategory = category;
    renderCategoryButtons();
    filterResources();
}

// Render resources
function renderResources() {
    const grid = document.getElementById('resourcesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredResources.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    grid.innerHTML = filteredResources.map(resource => `
        <div class="resource-card">
            <div class="card-thumbnail">
                <img src="${resource.thumbnail}" alt="${resource.title}">
                ${resource.isNew ? '<div class="new-badge">NOUVEAU</div>' : ''}
                <div class="category-icon">
                    ${getCategoryIcon(resource.category)}
                </div>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${resource.title}</h3>
                    <button class="favorite-btn ${favorites.includes(resource.id) ? 'active' : ''}" 
                            onclick="toggleFavorite(${resource.id})">
                        ${icons.heart}
                    </button>
                </div>
                <p class="card-description">${resource.description}</p>
                <div class="card-tags">
                    ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="card-footer">
                    <div class="card-meta">
                        <div class="meta-date">
                            ${icons.calendar}
                            ${formatDate(resource.date)}
                        </div>
                        ${resource.fileSize ? `<span>${resource.fileSize}</span>` : ''}
                    </div>
                    <button class="download-btn" onclick="window.open('${resource.url}', '_blank')">
                        ${resource.type === 'download' ? icons.download : icons.link}
                        ${resource.type === 'download' ? 'Télécharger' : 'Accéder'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Search input
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    filterResources();
});

// Charger les ressources au démarrage
loadResources();
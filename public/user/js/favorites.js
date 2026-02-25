document.addEventListener('DOMContentLoaded', function () {
    const favoritesList = document.getElementById('favorites-list');
    const favoritesCount = document.getElementById('favorites-count');

    function normalizeId(id) {
        return String(id);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getFavorites() {
        try {
            const raw = JSON.parse(localStorage.getItem('horse_favorites')) || [];
            if (!Array.isArray(raw)) return [];
            return [...new Set(raw.map((item) => normalizeId(item && typeof item === 'object' ? item.id : item)))];
        } catch (e) {
            return [];
        }
    }

    function renderNoFavorites() {
        favoritesList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-heart"></i>
                <h3>Vous n'avez pas de chevaux en favoris</h3>
                <p>Ajoutez des chevaux depuis la liste ou leur page profil.</p>
            </div>
        `;
    }

    function createCard(horse) {
        const card = document.createElement('div');
        card.className = 'horse-card';
        card.innerHTML = `
            <div class="horse-card-header">
                <h3 class="horse-card-title">${escapeHtml(horse.nom)}</h3>
                <p class="horse-card-subtitle">${escapeHtml(horse.race ?? '-')}  ${escapeHtml(horse.robe ?? '-')}</p>
                <i class="fas fa-horse-head"></i>
            </div>
            <div class="horse-card-body">
                <div class="horse-card-details">
                    <div class="horse-card-detail">
                        <span class="detail-label">Sexe</span>
                        <span class="detail-value">${escapeHtml(horse.sexe ?? '-')}</span>
                    </div>
                    <div class="horse-card-detail">
                        <span class="detail-label">Annee de naissance</span>
                        <span class="detail-value">${escapeHtml(horse.annee_naissance ?? '-')}</span>
                    </div>
                    <div class="horse-card-detail">
                        <span class="detail-label">Taille</span>
                        <span class="detail-value">${escapeHtml(horse.taille ?? '-')} m</span>
                    </div>
                    <div class="horse-card-detail">
                        <span class="detail-label">Robe</span>
                        <span class="detail-value">${escapeHtml(horse.robe ?? '-')}</span>
                    </div>
                </div>
                <div class="horse-card-actions">
                    <a href="/utilisateur/chevaux/${horse.id}" class="btn-small btn-view" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-eye"></i> Voir profil
                    </a>
                </div>
            </div>
        `;
        return card;
    }

    function init() {
        const favorites = getFavorites();
        const favoriteHorses = allHorses.filter((horse) => favorites.includes(normalizeId(horse.id)));

        favoritesCount.textContent = favoriteHorses.length;

        if (favoriteHorses.length === 0) {
            renderNoFavorites();
            return;
        }

        favoritesList.innerHTML = '';
        favoriteHorses.forEach((horse) => favoritesList.appendChild(createCard(horse)));
    }

    init();
});

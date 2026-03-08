const csrfToken = document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content");
document.addEventListener('DOMContentLoaded', function () {
    const favoritesList = document.getElementById('favorites-list');
    const favoritesCount = document.getElementById('favorites-count');

    function normalizeId(id) {
        return String(id);
    }


    function cardClassFromSex(value) {
        const v = String(value || '').toLowerCase();
        if (v.includes('fem')) return 'card-grey';
        if (v.includes('male') || v.includes('mâ') || v.includes('mal') || v.includes('hongre')) return 'card-bay';
        return 'card-bay';
    }

    function initialsFromName(name) {
        const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '•';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    function genderSymbol(value) {
        const v = String(value || '').toLowerCase();
        if (v.includes('fem')) return { symbol: '♀', className: 'gender-female' };
        if (v.includes('male') || v.includes('mâ') || v.includes('mal') || v.includes('hongre')) {
            return { symbol: '♂', className: 'gender-male' };
        }
        return { symbol: '', className: '' };
    }    function escapeHtml(value) {
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
        const sexClass = cardClassFromSex(horse.sexe);
        const initials = initialsFromName(horse.nom);
        const gender = genderSymbol(horse.sexe);

        card.classList.add(sexClass);
        card.innerHTML = `
            <div class="card-header">
                <div class="horse-initials">${escapeHtml(initials)}</div>
            </div>
            <div class="card-body">
                <div class="horse-name">${escapeHtml(horse.nom)}
                    ${gender.symbol ? `<span class="gender-symbol ${gender.className}">${gender.symbol}</span>` : ''}
                </div>
                <div class="horse-breed-tag">${escapeHtml(horse.race ?? '-')}</div>
                <div class="divider"></div>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Robe</label>
                        <span><span class="robe-dot"></span>${escapeHtml(horse.robe ?? '-')}</span>
                    </div>
                    <div class="info-item">
                        <label>Taille</label>
                        <span>${escapeHtml(horse.taille ?? '-')} m</span>
                    </div>
                    <div class="info-item">
                        <label>Naissance</label>
                        <span>${escapeHtml(horse.annee_naissance ?? '-')}</span>
                    </div>
                    <div class="info-item">
                        <label>Sexe</label>
                        <span>${escapeHtml(horse.sexe ?? '-')}</span>
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





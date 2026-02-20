/**
 * Script pour la page d'accueil - Ecuries Royales
 * Gere la liste des chevaux, la recherche, les filtres et les favoris.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page d accueil Ecuries Royales chargee');

    // Recuperation des elements DOM
    const horsesList = document.getElementById('horses-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const raceFilter = document.getElementById('race-filter');
    const sexFilter = document.getElementById('sex-filter');
    const ageFilter = document.getElementById('age-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const favoritesLink = document.getElementById('favorites-link');
    const favoritesCount = document.getElementById('favorites-count');
    const logoutBtn = document.getElementById('logout-btn-user');

    // Variables d etat
    let currentFilteredHorses = [];
    let favorites = JSON.parse(localStorage.getItem('horse_favorites')) || [];

    function normalizeHorseId(id) {
        return String(id);
    }

    function sanitizeFavorites(list) {
        if (!Array.isArray(list)) return [];
        return [...new Set(list.map((item) => {
            if (item && typeof item === 'object' && 'id' in item) {
                return normalizeHorseId(item.id);
            }
            return normalizeHorseId(item);
        }))];
    }

    function isFavoriteHorse(id) {
        return favorites.includes(normalizeHorseId(id));
    }

    // Harmonise les valeurs de sexe venant de la BDD/UI.
    function normalizeSex(value) {
        return String(value || '').toLowerCase().trim();
    }

    function isFemaleSex(value) {
        return ['femelle', 'female'].includes(normalizeSex(value));
    }

    function isMaleSex(value) {
        return ['male', 'mle', 'male '].includes(normalizeSex(value));
    }

    favorites = sanitizeFavorites(favorites);

    /**
     * Initialise la page
     */
    function initPage() {
        // Nettoie/migre les anciens formats de favoris et retire les IDs inexistants.
        favorites = sanitizeFavorites(favorites).filter((favoriteId) =>
            allHorses.some((horse) => normalizeHorseId(horse.id) === favoriteId)
        );
        localStorage.setItem('horse_favorites', JSON.stringify(favorites));

        displayHorses(allHorses);
        currentFilteredHorses = [...allHorses];
        updateFavoritesCount();
        updateStatistics();
        initEventListeners();
    }

    /**
     * Initialise les ecouteurs d evenements
     */
    function initEventListeners() {
        // Recherche
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') handleSearch();
        });

        // Filtres
        raceFilter.addEventListener('change', handleFilter);
        sexFilter.addEventListener('change', handleFilter);
        ageFilter.addEventListener('change', handleFilter);

        // Reinitialisation des filtres
        resetFiltersBtn.addEventListener('click', resetFilters);

        // Lien favoris (navigation vers page dediee)
        if (favoritesLink) {
            favoritesLink.addEventListener('click', function() {
                localStorage.setItem('horse_favorites', JSON.stringify(favorites));
            });
        }

        // Deconnexion
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    function setCsrfToken(token) {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta && token) meta.setAttribute('content', token);
    }

    async function refreshCsrfToken() {
        const response = await fetch('/csrf-token', {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Impossible de rafraichir le token CSRF');
        const data = await response.json();
        if (!data?.csrf_token) throw new Error('Token CSRF invalide');
        setCsrfToken(data.csrf_token);
        return data.csrf_token;
    }

    async function postWithCsrf(url, payload, retry = true) {
        const token = getCsrfToken();
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify({ ...payload, _token: token })
        });

        if (response.status === 419 && retry) {
            const newToken = await refreshCsrfToken();
            return fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': newToken
                },
                body: JSON.stringify({ ...payload, _token: newToken })
            });
        }

        return response;
    }

    /**
     * Gere la deconnexion avec confirmation utilisateur
     */
    async function handleLogout() {
        const confirmed = await showLogoutConfirmationModal();
        if (!confirmed) return;

        try {
            // Evite les tokens perimes juste apres login ou changement de session.
            await refreshCsrfToken();
            const response = await postWithCsrf('/logout', {});

            if (!response.ok) {
                throw new Error(`Echec de la deconnexion (${response.status})`);
            }

            window.location.href = '/';
        } catch (error) {
            // Fallback robuste: soumission classique du formulaire POST /logout.
            submitLogoutFormFallback();
            console.error('Erreur logout:', error);
        }
    }

    function submitLogoutFormFallback() {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';
        form.style.display = 'none';

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = getCsrfToken();

        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
    }
    /**
     * Affiche une modale de confirmation de deconnexion
     * @returns {Promise<boolean>}
     */
    function showLogoutConfirmationModal() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'logout-modal-overlay';
            overlay.innerHTML = `
                <div class="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
                    <div class="logout-modal-icon">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <h3 id="logout-modal-title">Confirmer la deconnexion</h3>
                    <p>Souhaitez-vous vraiment vous deconnecter maintenant ?</p>
                    <div class="logout-modal-actions">
                        <button type="button" class="logout-modal-btn cancel-btn">Annuler</button>
                        <button type="button" class="logout-modal-btn confirm-btn">Se deconnecter</button>
                    </div>
                </div>
            `;

            const modal = overlay.querySelector('.logout-modal');
            const cancelBtn = overlay.querySelector('.cancel-btn');
            const confirmBtn = overlay.querySelector('.confirm-btn');
            const previousOverflow = document.body.style.overflow;

            const cleanup = (result) => {
                document.removeEventListener('keydown', onKeyDown);
                document.body.style.overflow = previousOverflow;
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 150);
            };

            const onKeyDown = (event) => {
                if (event.key === 'Escape') cleanup(false);
            };

            cancelBtn.addEventListener('click', () => cleanup(false));
            confirmBtn.addEventListener('click', () => cleanup(true));
            overlay.addEventListener('click', (event) => {
                if (!modal.contains(event.target)) cleanup(false);
            });
            document.addEventListener('keydown', onKeyDown);

            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => overlay.classList.add('show'));
            confirmBtn.focus();
        });
    }

    /**
     * Affiche les chevaux dans la grille
     * @param {Array} horses - Liste des chevaux a afficher
     */
    function displayHorses(horses) {
        if (horses.length === 0) {
            horsesList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-horse-head"></i>
                    <h3>Aucun cheval trouve</h3>
                    <p>Essayez de modifier vos criteres de recherche</p>
                </div>
            `;
            return;
        }

        horsesList.innerHTML = '';
        horses.forEach(horse => {
            const isFavorite = isFavoriteHorse(horse.id);
            const horseCard = createHorseCard(horse, isFavorite);
            horsesList.appendChild(horseCard);
        });
    }

    /**
     * Cree une carte cheval
     * @param {Object} horse - Donnees du cheval
     * @param {boolean} isFavorite - Si le cheval est en favori
     * @returns {HTMLElement} Element de carte
     */
    function createHorseCard(horse, isFavorite) {
        const card = document.createElement('div');
        card.className = 'horse-card';
        card.dataset.id = horse.id;

        // Icone selon le sexe.
        const genderIcon = isFemaleSex(horse.sexe) ? 'fa-venus' : 'fa-mars';

        card.innerHTML = `
            <div class="horse-card-header">
                <button class="horse-card-fav ${isFavorite ? 'active' : ''}" data-id="${horse.id}">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <h3 class="horse-card-title">${horse.nom}</h3>
                <p class="horse-card-subtitle">${horse.race ?? '-'}</p>
                <i class="fas ${genderIcon}"></i>
            </div>
            <div class="horse-card-body">
                <div class="horse-card-details">
                    <div class="horse-card-detail">
                        <span class="detail-label">Sexe</span>
                        <span class="detail-value">${horse.sexe}</span>
                    </div>
                    <div class="horse-card-detail">
                        <span class="detail-label">Annee de naissance</span>
                        <span class="detail-value">${horse.annee_naissance ?? '-'}</span>
                    </div>
                    <div class="horse-card-detail">
                        <span class="detail-label">Taille</span>
                        <span class="detail-value">${horse.taille} m</span>
                    </div>
                    <div class="horse-card-detail">
                        <span class="detail-label">Robe</span>
                        <span class="detail-value">${horse.robe ?? '-'}</span>
                    </div>
                </div>
                <div class="horse-card-actions">
                    <a href="/utilisateur/chevaux/${horse.id}" class="btn-small btn-view" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-eye"></i> Voir profil
                    </a>
                </div>
            </div>
        `;

        // Bouton favori
        const favBtn = card.querySelector('.horse-card-fav');
        favBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(horse.id);
        });

        // Clic sur la carte vers le profil
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.horse-card-fav') && !e.target.closest('.btn-view')) {
                window.location.href = `/utilisateur/chevaux/${horse.id}`;
            }
        });

        return card;
    }

    /**
     * Gere la recherche
     * Recherche sur: nom, race, robe
     */
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm === '') {
            applyFilters();
            return;
        }

        const filtered = allHorses.filter(horse => {
            return (
                (horse.nom ?? '').toLowerCase().includes(searchTerm) ||
                (horse.race ?? '').toLowerCase().includes(searchTerm) ||
                (horse.robe ?? '').toLowerCase().includes(searchTerm)
            );
        });

        currentFilteredHorses = filtered;
        displayHorses(filtered);
        updateStatistics();
    }

    /**
     * Gere les filtres
     */
    function handleFilter() {
        applyFilters();
    }

    /**
     * Applique tous les filtres actifs
     */
    function applyFilters() {
        let filtered = [...allHorses];

        // Filtre par race
        const selectedRace = raceFilter.value;
        if (selectedRace) {
            filtered = filtered.filter(horse =>
                (horse.race ?? '').toLowerCase() === selectedRace.toLowerCase()
            );
        }

        // Filtre par sexe
        const selectedSex = sexFilter.value;
        if (selectedSex) {
            filtered = filtered.filter(horse =>
                normalizeSex(horse.sexe) === normalizeSex(selectedSex)
            );
        }

        // Filtre par age
        const selectedAge = ageFilter.value;
        if (selectedAge) {
            const parts = selectedAge.split('-').map(Number);
            const min = parts[0];
            const max = parts[1];
            if (max) {
                filtered = filtered.filter(horse => horse.age >= min && horse.age <= max);
            } else {
                // Cas "16+" ou dernier intervalle sans max
                filtered = filtered.filter(horse => horse.age >= min);
            }
        }

        currentFilteredHorses = filtered;
        displayHorses(filtered);
        updateStatistics();
    }

    /**
     * Reinitialise tous les filtres et la recherche
     */
    function resetFilters() {
        searchInput.value = '';
        raceFilter.value = '';
        sexFilter.value = '';
        ageFilter.value = '';

        currentFilteredHorses = [...allHorses];
        displayHorses(allHorses);
        updateStatistics();
    }

    /**
     * Affiche uniquement les chevaux favoris
     */
    function showOnlyFavorites() {
        const favoriteHorses = allHorses.filter(horse => isFavoriteHorse(horse.id));

        if (favoriteHorses.length === 0) {
            alert('Vous n\'avez aucun cheval en favoris');
            return;
        }

        currentFilteredHorses = favoriteHorses;
        displayHorses(favoriteHorses);
        updateStatistics();
    }

    /**
     * Bascule l etat favori d un cheval
     * @param {string|number} horseId - ID du cheval
     */
    function toggleFavorite(horseId) {
        const normalizedHorseId = normalizeHorseId(horseId);
        const index = favorites.indexOf(normalizedHorseId);

        if (index === -1) {
            favorites.push(normalizedHorseId);
            showNotification(`${getHorseName(horseId)} ajoute aux favoris`, 'success');
        } else {
            favorites.splice(index, 1);
            showNotification(`${getHorseName(horseId)} retire des favoris`, 'info');
        }

        favorites = sanitizeFavorites(favorites);
        localStorage.setItem('horse_favorites', JSON.stringify(favorites));
        updateFavoritesDisplay();
        updateStatistics();
    }

    /**
     * Recupere le nom d un cheval par son ID
     * @param {string|number} horseId
     * @returns {string}
     */
    function getHorseName(horseId) {
        const horse = allHorses.find(h => normalizeHorseId(h.id) === normalizeHorseId(horseId));
        return horse ? horse.nom : 'Cheval';
    }

    /**
     * Met a jour l affichage des boutons favoris et le compteur
     */
    function updateFavoritesDisplay() {
        updateFavoritesCount();

        document.querySelectorAll('.horse-card-fav').forEach(btn => {
            const horseId = btn.dataset.id;
            const isFavorite = isFavoriteHorse(horseId);

            if (isFavorite) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="far fa-heart"></i>';
            }
        });
    }

    /**
     * Met a jour le compteur de favoris
     */
    function updateFavoritesCount() {
        favoritesCount.textContent = favorites.length;
    }

    /**
     * Met a jour les statistiques affichees
     */
    function updateStatistics() {
        const horsesToCount = currentFilteredHorses.length > 0 ? currentFilteredHorses : allHorses;

        document.getElementById('total-horses').textContent = horsesToCount.length;

        // Femelles
        const femaleCount = horsesToCount.filter(h => isFemaleSex(h.sexe)).length;
        document.getElementById('female-horses').textContent = femaleCount;

        // Males
        const maleCount = horsesToCount.filter(h => isMaleSex(h.sexe)).length;
        document.getElementById('male-horses').textContent = maleCount;

        // Favoris parmi les chevaux affiches
        const favCount = horsesToCount.filter(h => isFavoriteHorse(h.id)).length;
        document.getElementById('fav-horses').textContent = favCount;
    }

    /**
     * Affiche une notification temporaire
     * @param {string} message
     * @param {string} type - 'success' | 'info' | 'error'
     */
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Styles des notifications
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: white;
            color: var(--text-dark);
            padding: 15px 20px;
            border-radius: var(--radius);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            border-left: 4px solid var(--primary);
        }
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        .notification-success { border-left-color: #27ae60; }
        .notification-info    { border-left-color: #3498db; }
        .notification-error   { border-left-color: #e74c3c; }
        .notification i { font-size: 1.2rem; }
        .logout-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.15s ease;
            padding: 16px;
        }
        .logout-modal-overlay.show { opacity: 1; }
        .logout-modal {
            width: min(420px, 100%);
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 18px 35px rgba(0, 0, 0, 0.2);
            padding: 24px;
            transform: translateY(10px) scale(0.98);
            transition: transform 0.15s ease;
            text-align: center;
        }
        .logout-modal-overlay.show .logout-modal { transform: translateY(0) scale(1); }
        .logout-modal-icon {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            margin: 0 auto 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fdecea;
            color: #c0392b;
            font-size: 1.4rem;
        }
        .logout-modal h3 {
            margin: 0 0 8px;
            color: var(--text-dark);
        }
        .logout-modal p {
            margin: 0 0 18px;
            color: var(--text-light);
        }
        .logout-modal-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .logout-modal-btn {
            border: none;
            border-radius: 10px;
            padding: 10px 14px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            min-width: 130px;
        }
        .logout-modal-btn.cancel-btn {
            background: #ecf0f1;
            color: #2c3e50;
        }
        .logout-modal-btn.cancel-btn:hover {
            background: #dce3e6;
        }
        .logout-modal-btn.confirm-btn {
            background: #c0392b;
            color: #fff;
        }
        .logout-modal-btn.confirm-btn:hover {
            background: #922b21;
        }
    `;
    document.head.appendChild(notificationStyle);

    // Lancement
    initPage();
});


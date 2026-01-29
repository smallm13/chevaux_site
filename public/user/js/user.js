/**
 * Script pour la page d'accueil - Écuries Royales
 * Gère la liste des chevaux, la recherche, les filtres et les favoris
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    console.log('Page d\'accueil Écuries Royales chargée');
    
    // Récupération des éléments DOM
    const horsesList = document.getElementById('horses-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const raceFilter = document.getElementById('race-filter');
    const sexFilter = document.getElementById('sex-filter');
    const ageFilter = document.getElementById('age-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const favoritesLink = document.getElementById('favorites-link');
    const favoritesCount = document.getElementById('favorites-count');
    
    // Variables d'état
    let currentFilteredHorses = [];
    let favorites = JSON.parse(localStorage.getItem('horse_favorites')) || [];
    
    /**
     * Initialise la page
     */
    function initPage() {
        // Afficher les chevaux
        displayHorses(allHorses);
        currentFilteredHorses = [...allHorses];
        
        // Mettre à jour le compteur de favoris
        updateFavoritesCount();
        
        // Mettre à jour les statistiques
        updateStatistics();
        
        // Écouteurs d'événements
        initEventListeners();
    }
    
    /**
     * Initialise les écouteurs d'événements
     */
    function initEventListeners() {
        // Recherche
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });
        
        // Filtres
        raceFilter.addEventListener('change', handleFilter);
        sexFilter.addEventListener('change', handleFilter);
        ageFilter.addEventListener('change', handleFilter);
        
        // Réinitialisation des filtres
        resetFiltersBtn.addEventListener('click', resetFilters);
        
        // Lien favoris
        favoritesLink.addEventListener('click', function(e) {
            e.preventDefault();
            showOnlyFavorites();
        });
        
       
    }
    
    /**
     * Affiche les chevaux dans la grille
     * @param {Array} horses - Liste des chevaux à afficher
     */
    function displayHorses(horses) {
        if (horses.length === 0) {
            horsesList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-horse-head"></i>
                    <h3>Aucun cheval trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                </div>
            `;
            return;
        }
        
        horsesList.innerHTML = '';
        
        horses.forEach(horse => {
            const isFavorite = favorites.includes(horse.id);
            const horseCard = createHorseCard(horse, isFavorite);
            horsesList.appendChild(horseCard);
        });
    }
    
    /**
     * Crée une carte cheval
     * @param {Object} horse - Données du cheval
     * @param {boolean} isFavorite - Si le cheval est en favori
     * @returns {HTMLElement} Élément de carte
     */
    function createHorseCard(horse, isFavorite) {
        const card = document.createElement('div');
        card.className = 'horse-card';
        card.dataset.id = horse.id;
        
        // Déterminer l'icône selon le sexe
        const genderIcon = horse.sexe === 'Femelle' ? 'fa-venus' : 'fa-mars';
        
        card.innerHTML = `
            <div class="horse-card-header">
                <button class="horse-card-fav ${isFavorite ? 'active' : ''}" data-id="${horse.id}">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <h3 class="horse-card-title">${horse.nom}</h3>
                <p class="horse-card-subtitle">${horse.race} • ${horse.robe}</p>
                <i class="fas ${genderIcon}"></i>
            </div>
            <div class="horse-card-body">
                <div class="horse-card-details">
                    <div class="horse-card-detail">
                        <span class="detail-label">Sexe</span>
                        <span class="detail-value">${horse.sexe}</span>
                    </div>
                    <div class="horse-card-detail">
                        <span class="detail-label">Âge</span>
                        <span class="detail-value">${horse.age} ans</span>
                    </div>
                    <div class="horse-card-detail">
                        <span class="detail-label">Naissance</span>
                        <span class="detail-value">${horse.annee_naissance}</span>
                    </div>
                    <div class="horse-card-detail">
                        <span class="detail-label">SIRE</span>
                        <span class="detail-value">${horse.sire}</span>
                    </div>
                </div>
                <div class="horse-card-actions">
                    <a href="horse-profile.html?id=${horse.id}" class="btn-small btn-view">
                        <i class="fas fa-eye"></i> Voir profil
                    </a>
                    <button class="btn-small btn-edit">
                        <i class="fas fa-edit"></i> Éditer
                    </button>
                </div>
            </div>
        `;
        
        // Écouteur pour le bouton favori
        const favBtn = card.querySelector('.horse-card-fav');
        favBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(horse.id);
        });
        
        // Écouteur pour la carte entière (navigation vers le profil)
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.horse-card-fav') && !e.target.closest('.btn-edit')) {
                window.location.href = `horse-profile.html?id=${horse.id}`;
            }
        });
        
        return card;
    }
    
    /**
     * Gère la recherche
     */
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            applyFilters();
            return;
        }
        
        const filtered = allHorses.filter(horse => {
            return horse.nom.toLowerCase().includes(searchTerm) ||
                   horse.race.toLowerCase().includes(searchTerm) ||
                   horse.robe.toLowerCase().includes(searchTerm) ||
                   horse.sire.toLowerCase().includes(searchTerm);
        });
        
        currentFilteredHorses = filtered;
        displayHorses(filtered);
        updateStatistics();
    }
    
    /**
     * Gère les filtres
     */
    function handleFilter() {
        applyFilters();
    }
    
    /**
     * Applique tous les filtres
     */
    function applyFilters() {
        let filtered = [...allHorses];
        
        // Filtre par race
        const selectedRace = raceFilter.value;
        if (selectedRace) {
            filtered = filtered.filter(horse => horse.race_key === selectedRace);
        }
        
        // Filtre par sexe
        const selectedSex = sexFilter.value;
        if (selectedSex) {
            filtered = filtered.filter(horse => horse.sexe_key === selectedSex);
        }
        
        // Filtre par âge
        const selectedAge = ageFilter.value;
        if (selectedAge) {
            const [min, max] = selectedAge.split('-').map(Number);
            if (max) {
                filtered = filtered.filter(horse => horse.age >= min && horse.age <= max);
            } else {
                filtered = filtered.filter(horse => horse.age >= 16);
            }
        }
        
        currentFilteredHorses = filtered;
        displayHorses(filtered);
        updateStatistics();
    }
    
    /**
     * Réinitialise tous les filtres
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
     * Affiche seulement les chevaux favoris
     */
    function showOnlyFavorites() {
        if (favorites.length === 0) {
            alert('Vous n\'avez aucun cheval en favoris');
            return;
        }
        
        const favoriteHorses = allHorses.filter(horse => favorites.includes(horse.id));
        currentFilteredHorses = favoriteHorses;
        displayHorses(favoriteHorses);
        updateStatistics();
    }
    
    /**
     * Bascule l'état favori d'un cheval
     * @param {string} horseId - ID du cheval
     */
    function toggleFavorite(horseId) {
        const index = favorites.indexOf(horseId);
        
        if (index === -1) {
            // Ajouter aux favoris
            favorites.push(horseId);
            showNotification(`${getHorseName(horseId)} ajouté aux favoris`, 'success');
        } else {
            // Retirer des favoris
            favorites.splice(index, 1);
            showNotification(`${getHorseName(horseId)} retiré des favoris`, 'info');
        }
        
        // Sauvegarder dans localStorage
        localStorage.setItem('horse_favorites', JSON.stringify(favorites));
        
        // Mettre à jour l'affichage
        updateFavoritesDisplay();
        updateStatistics();
    }
    
    /**
     * Récupère le nom d'un cheval par son ID
     * @param {string} horseId - ID du cheval
     * @returns {string} Nom du cheval
     */
    function getHorseName(horseId) {
        const horse = allHorses.find(h => h.id === horseId);
        return horse ? horse.nom : 'Cheval';
    }
    
    /**
     * Met à jour l'affichage des favoris
     */
    function updateFavoritesDisplay() {
        // Mettre à jour le compteur
        updateFavoritesCount();
        
        // Mettre à jour les boutons favoris
        document.querySelectorAll('.horse-card-fav').forEach(btn => {
            const horseId = btn.dataset.id;
            const isFavorite = favorites.includes(horseId);
            
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
     * Met à jour le compteur de favoris
     */
    function updateFavoritesCount() {
        favoritesCount.textContent = favorites.length;
    }
    
    /**
     * Met à jour les statistiques
     */
    function updateStatistics() {
        const horsesToCount = currentFilteredHorses.length > 0 ? currentFilteredHorses : allHorses;
        
        // Total
        document.getElementById('total-horses').textContent = horsesToCount.length;
        
        // Femelles
        const femaleCount = horsesToCount.filter(h => h.sexe === 'Femelle').length;
        document.getElementById('female-horses').textContent = femaleCount;
        
        // Mâles
        const maleCount = horsesToCount.filter(h => h.sexe !== 'Femelle').length;
        document.getElementById('male-horses').textContent = maleCount;
        
        // Favoris parmi ceux affichés
        const favCount = horsesToCount.filter(h => favorites.includes(h.id)).length;
        document.getElementById('fav-horses').textContent = favCount;
    }
    
    /**
     * 
     */
    function goToPrevPage() {
        console.log('Page précédente');
        // Implémentation réelle nécessiterait un backend
    }
    
    function goToNextPage() {
        console.log('Page suivante');
        // Implémentation réelle nécessiterait un backend
    }
    
    /**
     * Affiche une notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification (success, info, error)
     */
    function showNotification(message, type) {
        // Dans une application réelle, on utiliserait un système de notifications
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Pour la démonstration, on utilise une alerte stylisée
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'apparition
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Disparition après 3 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Style pour les notifications
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
        
        .notification-success {
            border-left-color: #27ae60;
        }
        
        .notification-info {
            border-left-color: #3498db;
        }
        
        .notification-error {
            border-left-color: #e74c3c;
        }
        
        .notification i {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(notificationStyle);
    
    // Initialiser la page
    initPage();
});
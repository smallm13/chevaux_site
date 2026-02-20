/**
 * Script pour la page de profil de cheval - Ecuries Royales
 * Gere le bouton favori et quelques interactions UI.
 */
document.addEventListener('DOMContentLoaded', function () {
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn) return;

    const favoriteIcon = favoriteBtn.querySelector('i');
    const favoriteText = favoriteBtn.querySelector('span');
    const infoCards = document.querySelectorAll('.info-card, .pedigree-card');
    const horseName = favoriteBtn.dataset.horseName || 'Ce cheval';
    const horseId = String(favoriteBtn.dataset.horseId || horseName.toLowerCase().replace(/\s+/g, '_'));
    const favoriteStorageKey = 'horse_favorites';

    let isFavorite = false;

    function handleFavoriteClick() {
        isFavorite = !isFavorite;
        if (isFavorite) {
            activateFavorite();
        } else {
            deactivateFavorite();
        }
    }

    function activateFavorite() {
        favoriteBtn.classList.add('active');
        favoriteIcon.classList.remove('far', 'fa-heart');
        favoriteIcon.classList.add('fas', 'fa-heart');
        favoriteText.textContent = 'Retirer des favoris';
        triggerHeartAnimation();
        saveFavoriteState(true);
        showNotification(`${horseName} a ete ajoute a vos favoris`, 'success');
    }

    function deactivateFavorite() {
        favoriteBtn.classList.remove('active');
        favoriteIcon.classList.remove('fas', 'fa-heart');
        favoriteIcon.classList.add('far', 'fa-heart');
        favoriteText.textContent = 'Ajouter aux favoris';
        saveFavoriteState(false);
        showNotification(`${horseName} a ete retire de vos favoris`, 'info');
    }

    function triggerHeartAnimation() {
        favoriteIcon.style.animation = 'none';
        setTimeout(() => {
            favoriteIcon.style.animation = 'pulse 0.5s ease';
        }, 10);
    }

    function saveFavoriteState(state) {
        try {
            const favorites = loadFavorites();
            const index = favorites.indexOf(horseId);

            if (state && index === -1) {
                favorites.push(horseId);
            }
            if (!state && index !== -1) {
                favorites.splice(index, 1);
            }

            localStorage.setItem(favoriteStorageKey, JSON.stringify([...new Set(favorites)]));
        } catch (e) {
            console.log('Impossible d enregistrer l etat favori');
        }
    }

    function loadFavorites() {
        try {
            const raw = JSON.parse(localStorage.getItem(favoriteStorageKey)) || [];
            return Array.isArray(raw)
                ? raw.map((item) => String(item && typeof item === 'object' ? item.id : item))
                : [];
        } catch (e) {
            return [];
        }
    }

    function loadFavoriteState() {
        try {
            return loadFavorites().includes(horseId);
        } catch (e) {
            return false;
        }
    }

    function showNotification(message) {
        const originalText = favoriteText.textContent;
        favoriteText.textContent = message;
        favoriteText.style.fontWeight = 'bold';

        setTimeout(() => {
            favoriteText.textContent = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
            favoriteText.style.fontWeight = '';
        }, 1500);
    }

    function initCardHoverEffects() {
        infoCards.forEach((card) => {
            card.addEventListener('mouseenter', function () {
                this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            });

            card.addEventListener('click', function () {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }

    function initPageState() {
        const savedFavoriteState = loadFavoriteState();
        if (savedFavoriteState) {
            isFavorite = true;
            favoriteBtn.classList.add('active');
            favoriteIcon.classList.remove('far', 'fa-heart');
            favoriteIcon.classList.add('fas', 'fa-heart');
            favoriteText.textContent = 'Retirer des favoris';
        }
        initCardHoverEffects();
    }

    favoriteBtn.addEventListener('click', handleFavoriteClick);
    initPageState();
});

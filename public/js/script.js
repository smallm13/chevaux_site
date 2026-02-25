let coatChartInstance;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', function () {
    // === Gestion de la modale de connexion ===
    const modal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');
    const homeBtn = document.getElementById('home-btn');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('login-form');
    const userControls = document.querySelector('.user-controls');
    const loader = document.getElementById('loader');
    const horsesGrid = document.getElementById('horses-grid');
    const loginMessage = document.getElementById('login-message');
    const statsDom = {
        searchTotal: document.getElementById('search-total-value'),
        searchCoat1Value: document.getElementById('search-coat-1-value'),
        searchCoat1Label: document.getElementById('search-coat-1-label'),
        searchCoat2Value: document.getElementById('search-coat-2-value'),
        searchCoat2Label: document.getElementById('search-coat-2-label'),
        statsTotal: document.getElementById('stats-total-value'),
        statsCoat1Value: document.getElementById('stats-coat-1-value'),
        statsCoat1Label: document.getElementById('stats-coat-1-label'),
        statsCoat2Value: document.getElementById('stats-coat-2-value'),
        statsCoat2Label: document.getElementById('stats-coat-2-label'),
        statsMale: document.getElementById('stats-male-value'),
        statsFemale: document.getElementById('stats-female-value'),
    };

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
        if (!response.ok) {
            throw new Error('Impossible de rafraichir le token CSRF');
        }
        const data = await response.json();
        if (!data?.csrf_token) {
            throw new Error('Token CSRF invalide');
        }
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

    loginBtn.addEventListener('click', () => modal.style.display = 'block');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        loginMessage.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            loginMessage.style.display = 'none';
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        loginMessage.textContent = '';
        loginMessage.className = 'validation-message';
        loginMessage.style.display = 'none';

        if (!email || !password) {
            loginMessage.textContent = 'Veuillez remplir tous les champs.';
            loginMessage.classList.add('error');
            loginMessage.style.display = 'block';
            return;
        }

        try {
            const response = await postWithCsrf('/login', { email, password });

            const data = await response.json();

            if (data.success) {
                loginMessage.textContent = 'Connexion réussie !';
                loginMessage.classList.add('success');
                loginMessage.style.display = 'block';

                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logout-btn';
                logoutBtn.className = 'btn btn-logout';
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Déconnexion';
                //userControls.insertBefore(logoutBtn, loginBtn);
                //modal.style.display = 'none';
                  setTimeout(() => {
                    window.location.href = data.redirect;
                }, 10);


                // === Déconnexion ===
                logoutBtn.addEventListener('click', async () => {
                    try {
                        const res = await postWithCsrf('/logout', {});

                        if (res.ok) {
                            document.querySelector('.user-greeting')?.remove();
                            logoutBtn.remove();
                            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
                            loginBtn.classList.remove('btn-primary');
                            loginBtn.classList.add('btn-login');

                            const logoutMessage = document.createElement('div');
                            logoutMessage.className = 'user-greeting animate-pop';
                            logoutMessage.innerHTML = `<i class="fas fa-check-circle"></i> Déconnecté avec succès.`;
                            document.body.prepend(logoutMessage);

                            setTimeout(() => {
                                window.location.href = '/';
                            }, 1000);
                        } else {
                            alert('Erreur lors de la déconnexion');
                        }
                    } catch (err) {
                        console.error("Erreur logout :", err);
                    }
                });

            } else {
                loginMessage.textContent = data.message || 'Échec de connexion';
                loginMessage.classList.add('error');
                loginMessage.style.display = 'block';
            }
        } catch (error) {
            loginMessage.textContent = (error?.message || '').includes('fetch')
                ? 'Echec reseau. Verifiez que vous utilisez la meme URL (localhost ou 127.0.0.1) puis rechargez.'
                : (error.message || 'Erreur');
            loginMessage.classList.add('error');
            loginMessage.style.display = 'block';
        }
    });

    // === Gestion de la modale d'inscription ===
    const signupModal = document.getElementById('signup-modal');
    const signupForm = document.getElementById('signup-form');
    const showLoginLink = document.getElementById('show-login');
    const signupMessage = document.getElementById('signup-message');

    document.getElementById('create-account').addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
        signupModal.style.display = 'block';
    });

    signupModal.querySelector('.close').addEventListener('click', () => {
        signupModal.style.display = 'none';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'none';
        modal.style.display = 'block';
    });

    document.getElementById('signup-password').addEventListener('input', function () {
        const password = this.value;
        updateRequirement('req-length', password.length >= 8);
        updateRequirement('req-uppercase', /[A-Z]/.test(password));
        updateRequirement('req-number', /[0-9]/.test(password));
    });

    function updateRequirement(id, isValid) {
        const element = document.getElementById(id);
        element.querySelector('i').className = isValid ? 'fas fa-check-circle' : 'fas fa-circle';
        element.style.color = isValid ? '#4CAF50' : '#555';
    }

    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        signupMessage.textContent = '';
        signupMessage.className = 'validation-message';

        const nom = document.getElementById('signup-lastname').value.trim();
        const prenom = document.getElementById('signup-firstname').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const password_confirmation = document.getElementById('signup-confirm').value;
        const terms = document.getElementById('terms').checked;

        if (!nom || !prenom || !email || !password || !password_confirmation) {
            showSignupMessage('Veuillez remplir tous les champs.', 'error');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
            showSignupMessage('Veuillez entrer une adresse email valide.', 'error');
            return;
        }
        if (password !== password_confirmation) {
            showSignupMessage('Les mots de passe ne correspondent pas.', 'error');
            return;
        }
        if (!terms) {
            showSignupMessage('Vous devez accepter les conditions.', 'error');
            return;
        }

        const requirements = [
            password.length >= 8,
            /[A-Z]/.test(password),
            /[0-9]/.test(password)
        ];

        if (requirements.some(req => !req)) {
            showSignupMessage('Le mot de passe ne respecte pas toutes les exigences.', 'error');
            return;
        }

        try {
            const response = await postWithCsrf('/users', {
                nom, prenom, email, password, password_confirmation, role: 'user'
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erreur lors de l'inscription");

            showSignupMessage('Inscription réussie ! Redirection en cours...', 'success');
            setTimeout(() => {
                signupForm.reset();
                signupModal.style.display = 'none';
                modal.style.display = 'block';
                showSignupMessage('', '');
            }, 2000);

        } catch (error) {
            showSignupMessage(error.message || "Une erreur est survenue", 'error');
            console.error("Erreur d'inscription:", error);
        }
    });

    function showSignupMessage(message, type) {
        signupMessage.textContent = message;
        signupMessage.className = 'validation-message';
        if (type) signupMessage.classList.add(type);
        signupMessage.style.display = message ? 'block' : 'none';
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
        if (event.target === signupModal) signupModal.style.display = 'none';
    });

    // === Gestion des onglets ===
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.getAttribute('data-tab')}-tab`).classList.add('active');
        });
    });

    homeBtn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        document.querySelector('[data-tab="home"]').classList.add('active');
        document.getElementById('home-tab').classList.add('active');
    });

    // === Affichage des chevaux ===
    function displayHorses(horses, searchTerm = '') {
        horsesGrid.innerHTML = '';
        if (!horses || horses.length === 0) {
            horsesGrid.innerHTML = '<p class="no-results">Aucun cheval trouvé pour votre recherche.</p>';
            return;
        }

        horses.forEach((horse, index) => {
            const horseCard = document.createElement('div');
            horseCard.className = 'horse-card';

            const highlightTerm = (text) => {
                const safeText = escapeHtml(text);
                if (!searchTerm) return safeText;
                const safeNeedle = escapeHtml(searchTerm).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (!safeNeedle) return safeText;
                const regex = new RegExp(`(${safeNeedle})`, 'gi');
                return safeText.replace(regex, '<mark>$1</mark>');
            };

            horseCard.innerHTML = `
                <div class="horse-image"><i class="fas fa-horse"></i></div>
                <div class="horse-info">
                    <h3 class="horse-name">${highlightTerm(horse.name)}</h3>
                    <div class="horse-details">
                        <div class="detail-item"><span class="detail-label">Race</span><span class="detail-value">${highlightTerm(horse.breed)}</span></div>
                        <div class="detail-item"><span class="detail-label">Taille</span><span class="detail-value">${escapeHtml(horse.height)} m</span></div>
                        <div class="detail-item"><span class="detail-label">Robe</span><span class="detail-value">${highlightTerm(horse.coat)}</span></div>
                        <div class="detail-item"><span class="detail-label">Annee de naissance</span><span class="detail-value">${escapeHtml(horse.birth_year ?? '-')}</span></div>
                    </div>
                </div>
            `;
            horsesGrid.appendChild(horseCard);
            setTimeout(() => horseCard.classList.add('visible', 'slide-up'), index * 100);
        });
    }

    function setText(el, value) {
        if (!el) return;
        el.textContent = value;
    }

    function updateStatsCards(horses, coatStats) {
        const total = Array.isArray(horses) ? horses.length : 0;
        const top1 = coatStats?.[0] || null;
        const top2 = coatStats?.[1] || null;

        const maleCount = (horses || []).filter(h => String(h?.sex || '').toLowerCase().startsWith('m')).length;
        const femaleCount = (horses || []).filter(h => String(h?.sex || '').toLowerCase().startsWith('f')).length;

        setText(statsDom.searchTotal, total);
        setText(statsDom.searchCoat1Value, top1 ? top1.count : '--');
        setText(statsDom.searchCoat1Label, top1 ? top1.coat : 'Robe #1');
        setText(statsDom.searchCoat2Value, top2 ? top2.count : '--');
        setText(statsDom.searchCoat2Label, top2 ? top2.coat : 'Robe #2');

        setText(statsDom.statsTotal, total);
        setText(statsDom.statsCoat1Value, top1 ? top1.count : '--');
        setText(statsDom.statsCoat1Label, top1 ? top1.coat : 'Robe #1');
        setText(statsDom.statsCoat2Value, top2 ? top2.count : '--');
        setText(statsDom.statsCoat2Label, top2 ? top2.coat : 'Robe #2');
        setText(statsDom.statsMale, maleCount);
        setText(statsDom.statsFemale, femaleCount);
    }

    // === Récupérer tous les chevaux ===
    async function fetchHorses() {
        loader.style.display = 'block';
        try {
            const response = await fetch('/horses');
            const horses = await response.json();
            displayHorses(horses);
        } catch (error) {
            console.error("Erreur de récupération des chevaux :", error);
            horsesGrid.innerHTML = '<p class="no-results">Impossible de charger les chevaux.</p>';
        } finally {
            loader.style.display = 'none';
        }
    }

    document.getElementById('show-all-btn').addEventListener('click', fetchHorses);

    // === Recherche ===
    document.getElementById('search-btn').addEventListener('click', async () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        if (!searchTerm) return;

        loader.style.display = 'block';
        try {
            const response = await fetch(`/horses/search?q=${encodeURIComponent(searchTerm)}`);
            const horses = await response.json();
            displayHorses(horses, searchTerm);
        } catch (error) {
            console.error("Erreur recherche :", error);
            horsesGrid.innerHTML = '<p class="no-results">Erreur lors de la recherche.</p>';
        } finally {
            loader.style.display = 'none';
        }
    });

    // === Statistiques dynamiques ===
    const coatChart = document.getElementById('coatChart');
    async function loadStats() {
        try {
            const [statsResponse, horsesResponse] = await Promise.all([
                fetch('/horses/stats'),
                fetch('/horses')
            ]);

            const stats = await statsResponse.json();
            const horses = await horsesResponse.json();

            const labels = stats.map(s => s.coat);
            const data = stats.map(s => s.count);
            updateStatsCards(horses, stats);

            if (coatChartInstance instanceof Chart) {
                coatChartInstance.destroy();
            }

            coatChartInstance = new Chart(coatChart, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Répartition par robe',
                        data: data,
                        backgroundColor: ['#8B4513', '#A0522D', '#000000', '#808080', '#FFD700', '#FFF8DC', '#F0E68C', '#D2B48C'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' },
                        tooltip: {
                            callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} chevaux` }
                        }
                    }
                }
            });
        } catch (err) {
            console.error("Erreur chargement stats :", err);
        }
    }

    // Connexion sociale future
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.classList.contains('google') ? 'Google' :
                             btn.classList.contains('facebook') ? 'Facebook' : 'Twitter';
            alert(`Connexion via ${platform} sera implémentée dans une version future`);
        });
    });

    // Charger automatiquement les données au démarrage
    setTimeout(fetchHorses, 500);
    setTimeout(loadStats, 1000);
});

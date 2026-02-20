<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Ecuries Royales - Gestion des Chevaux</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('user/css/user.css') }}">
</head>

<body>
    @php
        $user = auth()->user();
        $firstName = $user->prenom ?? $user->name ?? 'Utilisateur';
        $lastName = $user->nom ?? '';
        $parts = preg_split('/\s+/', trim($firstName . ' ' . $lastName)) ?: [];
        $initials = '';
        foreach ($parts as $part) {
            if ($part !== '') {
                $initials .= strtoupper(substr($part, 0, 1));
            }
            if (strlen($initials) >= 2) {
                break;
            }
        }
        $initials = $initials !== '' ? $initials : 'U';
    @endphp
    <!-- En-tete avec navigation -->
    <header>
        <div class="container header-content">
            <div class="logo">
                <i class="fas fa-horse-head"></i>
                <h1>Ecuries Royales</h1>
            </div>
            <div class="user-menu">
                <span>Bienvenue, {{ $firstName }}</span>
                <div class="user-avatar">{{ $initials }}</div>
                <button id="logout-btn-user" class="btn-logout-user" type="button">
                    <i class="fas fa-sign-out-alt"></i> Deconnexion
                </button>
            </div>
        </div>

        <!-- Navigation principale -->
        <nav class="main-nav">
            <div class="container">
                <ul class="nav-links">
                    <li><a href="index.html" class="active"><i class="fas fa-home"></i> Accueil</a></li>
                    <li><a href="{{ route('user.favorites') }}" id="favorites-link"><i class="fas fa-heart"></i> Mes favoris <span
                                id="favorites-count" class="badge">0</span></a></li>
                    <li><a href="#"><i class="fas fa-chart-bar"></i> Statistiques</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <!-- Barre de recherche et filtres -->
    <section class="search-section">
        <div class="container">
            <div class="search-header">
                <h2><i class="fas fa-horse"></i> Liste des Chevaux</h2>
                <p class="subtitle">Gerez votre ecurie professionnellement</p>
            </div>

            <div class="search-filters">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="search-input" placeholder="Rechercher un cheval par nom, race, robe...">
                    <button id="search-btn" class="btn-primary">Rechercher</button>
                </div>

                <div class="filter-options">
                    <div class="filter-group">
                        <label for="race-filter"><i class="fas fa-dna"></i> Race :</label>
                        <select id="race-filter">
                            <option value="">Toutes les races</option>
                            <option value="selle-francais">Selle Francais</option>
                            <option value="pur-sang">Pur-sang</option>
                            <option value="trotteur">Trotteur Francais</option>
                            <option value="arabe">Arabe</option>
                            <option value="quarter">Quarter Horse</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="sex-filter"><i class="fas fa-venus-mars"></i> Sexe :</label>
                        <select id="sex-filter">
                            <option value="">Tous</option>
                            <option value="Male">Male</option>
                            <option value="Femelle">Femelle</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="age-filter"><i class="fas fa-birthday-cake"></i> Age :</label>
                        <select id="age-filter">
                            <option value="">Tous ages</option>
                            <option value="0-5">0-5 ans</option>
                            <option value="6-10">6-10 ans</option>
                            <option value="11-15">11-15 ans</option>
                            <option value="16+">16+ ans</option>
                        </select>
                    </div>

                    <button id="reset-filters" class="btn-secondary">
                        <i class="fas fa-redo"></i> Reinitialiser
                    </button>
                </div>
            </div>
        </div>
    </section>
    <div class="horses-grid" id="horses-list">
        <!-- Les chevaux seront generes par JavaScript -->
    </div>
    <!-- Statistiques rapides -->
    <section class="stats-section">
        <div class="container">
            <h3><i class="fas fa-chart-pie"></i> Vue d'ensemble de l'ecurie</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-horse"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Total chevaux</h4>
                        <p class="stat-number" id="total-horses">12</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-venus"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Juments</h4>
                        <p class="stat-number" id="female-horses">7</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-mars"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Etalons / Hongres</h4>
                        <p class="stat-number" id="male-horses">5</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="stat-info">
                        <h4>En favoris</h4>
                        <p class="stat-number" id="fav-horses">3</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Pied de page -->
    <footer>
        <div class="container footer-content">
            <div class="footer-logo">
                <i class="fas fa-horse-head"></i>
                <span>Ecuries Royales</span>
            </div>
            <p>Gestion equestre professionnelle &copy; 2023 - Tous droits reserves</p>
            <p class="copyright">Ce systeme est destine a un usage interne exclusif.</p>
        </div>
    </footer>
    <script>
        const allHorses = @json($horses);
    </script>
    <script src="{{ asset('user/js/user.js') }}"></script>
</body>

</html>



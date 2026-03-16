<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Statistiques - Écuries Royales</title>
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
    <header>
        <div class="container header-content">
            <div class="logo">
                <i class="fas fa-horse-head"></i>
                <h1>Écuries Royales</h1>
            </div>
            <div class="user-menu">
                <span>Bienvenue, {{ $firstName }}</span>
                <div class="user-avatar">{{ $initials }}</div>
                <button id="logout-btn-user" class="btn-logout-user" type="button">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </button>
            </div>
        </div>

        <nav class="main-nav">
            <div class="container">
                <ul class="nav-links">
                    <li><a href="{{ route('user.horses') }}" class="{{ request()->routeIs('user.horses') ? 'active' : '' }}"><i class="fas fa-home"></i> Accueil</a></li>
                    <li><a href="{{ route('user.favorites') }}" id="favorites-link" class="{{ request()->routeIs('user.favorites') ? 'active' : '' }}"><i class="fas fa-heart"></i> Mes favoris <span id="favorites-count" class="badge">0</span></a></li>
                    <li><a href="{{ route('user.stats') }}" class="{{ request()->routeIs('user.stats') ? 'active' : '' }}"><i class="fas fa-chart-bar"></i> Statistiques</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <section class="stats-page">
        <div class="container">
            <div class="stats-page-header">
                <h2><i class="fas fa-chart-bar"></i> Statistiques</h2>
                <p class="subtitle">Choisissez une répartition pour afficher les graphiques.</p>
            </div>

            <div class="stats-controls">
                <button class="stats-toggle" data-chart="sex"><i class="fas fa-venus-mars"></i> Par sexe</button>
                <button class="stats-toggle" data-chart="coat"><i class="fas fa-palette"></i> Par robe</button>
                <button class="stats-toggle" data-chart="discipline"><i class="fas fa-medal"></i> Par discipline</button>
                <button class="stats-toggle" data-chart="age"><i class="fas fa-hourglass-half"></i> Par âge</button>
                <div class="stats-color">
                    <label for="stats-color-input"><i class="fas fa-droplet"></i> Couleur graphique</label>
                    <input type="color" id="stats-color-input" value="#8B4513" aria-label="Couleur du graphique">
                </div>
            </div>

            <div class="stats-chart-card">
                <canvas id="stats-chart" height="120"></canvas>
            </div>

            <div class="stats-summary" id="stats-summary"></div>
        </div>
    </section>

    <footer>
        <div class="container footer-content">
            <div class="footer-logo">
                <i class="fas fa-horse-head"></i>
                <span>Écuries Royales</span>
            </div>
            <p>Gestion équestre professionnelle &copy; 2023 - Tous droits réservés</p>
            <p class="copyright">Ce système est destiné à un usage interne exclusif.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <script src="{{ asset('user/js/stats.js') }}"></script>
</body>

</html>

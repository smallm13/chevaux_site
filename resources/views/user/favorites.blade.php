<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Mes favoris - Ecuries Royales</title>
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
                <h1>Ecuries Royales</h1>
            </div>
            <div class="user-menu">
                <span>Bienvenue, {{ $firstName }}</span>
                <div class="user-avatar">{{ $initials }}</div>
            </div>
        </div>

        <nav class="main-nav">
            <div class="container">
                <ul class="nav-links">
                    <li><a href="{{ route('user.horses') }}"><i class="fas fa-home"></i> Accueil</a></li>
                    <li><a href="{{ route('user.favorites') }}" class="active"><i class="fas fa-heart"></i> Mes favoris <span
                                id="favorites-count" class="badge">0</span></a></li>
                </ul>
            </div>
        </nav>
    </header>

    <section class="search-section">
        <div class="container">
            <div class="search-header">
                <h2><i class="fas fa-heart"></i> Mes chevaux favoris</h2>
                <p class="subtitle">Retrouvez rapidement les chevaux que vous avez ajoutes en favoris</p>
            </div>
        </div>
    </section>

    <div class="horses-grid" id="favorites-list"></div>

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
    <script src="{{ asset('user/js/favorites.js') }}"></script>
</body>

</html>

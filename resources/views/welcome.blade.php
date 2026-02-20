<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Écuries Royales - Gestion des Chevaux</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Raleway:wght@300;400;600&display=swap"
        rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="{{ asset('js/script.js') }}" defer></script>


</head>


<body>
    <!-- Header avec image de fond -->
    <div class="header">
        <div class="user-controls">
            <button id="home-btn" class="btn btn-home">
                <i class="fas fa-home"></i> Accueil
            </button>
            <button id="login-btn" class="btn btn-login">
                <i class="fas fa-sign-in-alt"></i> Connexion
            </button>
        </div>
        <div class="header-content">
            <h1>Écuries Royales</h1>
            <p>Excellence équestre depuis 1850 - Gestion complète de votre élevage</p>
        </div>
    </div>

    <!-- Zone de contenu principal -->
    <div class="container">
        <!-- Onglets de navigation -->
        <div class="tabs">
            <div class="tab active" data-tab="home">
                <i class="fas fa-home"></i> Accueil
            </div>
            <div class="tab" data-tab="search">
                <i class="fas fa-search"></i> Recherche
            </div>
            <div class="tab" data-tab="stats">
                <i class="fas fa-chart-bar"></i> Statistiques
            </div>
        </div>

        <!-- Section Accueil -->
        <div class="tab-content active" id="home-tab">
            <div class="card">
                <div class="home-content">
                    <h2>Bienvenue aux Écuries Royales</h2>
                    <p>Depuis 1850, nous préservons l'art équestre et l'excellence dans l'élevage de chevaux de
                        prestige. Notre plateforme vous permet de gérer efficacement votre élevage avec des outils
                        modernes et intuitifs.</p>

                    <div class="features">
                        <div class="feature-card">
                            <i class="fas fa-horse"></i>
                            <h3>Recherche Avancée</h3>
                            <p>Trouvez rapidement vos chevaux par nom, robe, propriétaire ou autres critères.</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-chart-pie"></i>
                            <h3>Statistiques Complètes</h3>
                            <p>Analysez votre élevage avec des graphiques détaillés et des indicateurs clés.</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-shield-alt"></i>
                            <h3>Sécurité Maximale</h3>
                            <p>Vos données sont protégées avec les dernières technologies de sécurité.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section Recherche -->
        <div class="tab-content" id="search-tab">
            <div class="card">
                <h2 class="card-title"><i class="fas fa-search"></i> Rechercher un cheval</h2>
                <div class="search-section">
                    <input type="text" class="search-input" id="search-input" placeholder="Nom, robe, propriétaire...">
                    <button class="btn btn-primary" id="search-btn">
                        <i class="fas fa-search"></i> Rechercher
                    </button>
                    <button class="btn" id="show-all-btn">
                        <i class="fas fa-list"></i> Afficher tous
                    </button>
                </div>

                <div class="stats-container">
                    <div class="stat-card">
                        <div class="stat-value">24</div>
                        <div class="stat-label">Chevaux au total</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">8</div>
                        <div class="stat-label">Alezans</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">5</div>
                        <div class="stat-label">Poneys</div>
                    </div>
                </div>

                <div id="results-container">
                    <div class="info-message">
                        <p><i class="fas fa-info-circle"></i> Utilisez la barre de recherche pour trouver vos chevaux
                        </p>
                        <p>Ou cliquez sur "Afficher tous" pour voir l'ensemble de vos équidés</p>
                    </div>
                    <div class="loader" id="loader"></div>
                    <div class="horses-grid" id="horses-grid">
                        <!-- Les résultats seront affichés ici dynamiquement -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Section Statistiques -->
        <div class="tab-content" id="stats-tab">
            <div class="card">
                <h2 class="card-title"><i class="fas fa-chart-bar"></i> Statistiques de l'élevage</h2>
                <div class="stats-container">
                    <div class="stat-card">
                        <div class="stat-value">24</div>
                        <div class="stat-label">Chevaux au total</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">8</div>
                        <div class="stat-label">Alezans</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">5</div>
                        <div class="stat-label">Poneys</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">12</div>
                        <div class="stat-label">Étalons</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">12</div>
                        <div class="stat-label">Juments</div>
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <h3 style="margin-bottom: 20px; text-align: center; color: var(--primary);">
                        <i class="fas fa-chart-pie"></i> Répartition par robe
                    </h3>
                    <div
                        style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: var(--shadow);">
                        <canvas id="coatChart" height="300"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modale de connexion -->
    <div id="login-modal" class="modal">
        <div class="modal-content animate-pop">
            <span class="close">&times;</span>

            <div class="login-logo">
                <i class="fas fa-horse-head"></i>
            </div>

            <h2 class="login-title">Connexion aux Écuries</h2>

            <form id="login-form">
                <div class="form-group">
                    <label for="email">Adresse email</label>
                    <input type="email" id="email" class="form-control" placeholder="votre@email.com" required>
                </div>

                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="password" class="form-control" placeholder="Votre mot de passe" required>
                </div>

                <div class="form-group">
                    <input type="checkbox" id="remember">
                    <label for="remember">Se souvenir de moi</label>
                </div>

                <div class="validation-message" id="login-message"></div>

                <button type="submit" class="btn-modal">
                    <i class="fas fa-sign-in-alt"></i> Se connecter
                </button>

                <div class="login-options">
                    <a href="#" id="forgot-password">Mot de passe oublié ?</a>
                    <a href="#" id="create-account">Créer un compte</a>
                </div>
            </form>

        </div>
    </div>

    <!-- Modale de création de compte -->
    <div id="signup-modal" class="modal">
        <div class="modal-content animate-pop">
            <span class="close">&times;</span>

            <div class="login-logo">
                <i class="fas fa-horse-head"></i>
            </div>

            <h2 class="login-title">Créer un compte</h2>
            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form id="signup-form" method="POST" action="/users">
                @csrf

                <div class="form-group">
                    <label for="signup-firstname">Prénom</label>
                    <input type="text" id="signup-firstname" name="prenom" class="form-control"
                        placeholder="Votre prénom" required>
                </div>

                <div class="form-group">
                    <label for="signup-lastname">Nom</label>
                    <input type="text" id="signup-lastname" name="nom" class="form-control" placeholder="Votre nom"
                        required>
                </div>

                <div class="form-group">
                    <label for="signup-email">Adresse email</label>
                    <input type="email" id="signup-email" name="email" class="form-control"
                        placeholder="votre@email.com" required>
                </div>


                <div class="form-group">
                    <label for="signup-password">Mot de passe</label>
                    <input type="password" id="signup-password" name="password" class="form-control"
                        placeholder="Créez un mot de passe" required>
                    <div class="password-requirements">
                        <div class="requirement" id="req-length">
                            <i class="fas fa-circle"></i> 8 caractères minimum
                        </div>
                        <div class="requirement" id="req-uppercase">
                            <i class="fas fa-circle"></i> 1 lettre majuscule
                        </div>
                        <div class="requirement" id="req-number">
                            <i class="fas fa-circle"></i> 1 chiffre
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="signup-confirm">Confirmer le mot de passe</label>
                    <input type="password" id="signup-confirm" name="password_confirmation" class="form-control"
                        placeholder="Confirmez votre mot de passe" required>
                </div>

                <div class="form-group">
                    <input type="checkbox" id="terms" name="terms">
                    <label for="terms">J'accepte les <a href="#" style="color: #8B4513;">conditions d'utilisation</a> et
                        la <a href="#" style="color: #8B4513;">politique de confidentialité</a></label>
                </div>

                <div class="validation-message" id="signup-message"></div>

                <button type="submit" class="btn-modal">
                    <i class="fas fa-user-plus"></i> Créer mon compte
                </button>

                <div class="login-options" style="justify-content: center;">
                    <p>Déjà un compte ? <a href="#" id="show-login" style="color: #8B4513;">Se connecter</a></p>
                </div>
            </form>
        </div>
    </div>

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h3 class="footer-title">Écuries Royales</h3>
                <p>Depuis 1850, nous préservons l'art équestre et l'excellence dans l'élevage de chevaux de prestige.
                </p>
                <div class="social-icons">
                    <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-youtube"></i></a>
                </div>
            </div>

            <div class="footer-section">
                <h3 class="footer-title">Contact</h3>
                <div class="footer-contact">
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt contact-icon"></i>
                        <div>
                            <p>Château des Écuries Royales</p>
                            <p>123 Avenue des Chevaux, 75000 Paris</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone contact-icon"></i>
                        <div>
                            <p>+33 1 23 45 67 89</p>
                            <p>Lun-Sam: 9h-18h</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope contact-icon"></i>
                        <div>
                            <p>contact@ecuriesroyales.fr</p>
                            <p>info@ecuriesroyales.fr</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-section">
                <h3 class="footer-title">Liens rapides</h3>
                <div class="footer-links">
                    <a href="#"><i class="fas fa-chevron-right"></i> Accueil</a>
                    <a href="#"><i class="fas fa-chevron-right"></i> Nos chevaux</a>
                    <a href="#"><i class="fas fa-chevron-right"></i> Services</a>
                    <a href="#"><i class="fas fa-chevron-right"></i> Galerie</a>
                    <a href="#"><i class="fas fa-chevron-right"></i> Événements</a>
                    <a href="#"><i class="fas fa-chevron-right"></i> Contact</a>
                </div>
            </div>

            <div class="footer-section">
                <h3 class="footer-title">Horaires</h3>
                <div class="footer-contact">
                    <div class="contact-item">
                        <i class="far fa-clock contact-icon"></i>
                        <div>
                            <p><strong>Lun-Ven:</strong> 8h00 - 19h00</p>
                            <p><strong>Samedi:</strong> 9h00 - 18h00</p>
                            <p><strong>Dimanche:</strong> Fermé</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-horse contact-icon"></i>
                        <div>
                            <p>Visites sur rendez-vous</p>
                            <p>Cours d'équitation disponibles</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; 2025 Écuries Royales - Tous droits réservés</p>
            <p>Développé avec <i class="fas fa-heart" style="color: var(--danger);"></i> pour les passionnés de chevaux
            </p>
        </div>
    </footer>


</body>

</html>

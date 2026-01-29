<!DOCTYPE html>
<html lang="fr">

<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard Admin</title>
    <link rel="stylesheet" href="{{ asset('admin1/css/admin.css') }}">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>

<body>
    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2>Écuries</h2>
                <button id="sidebar-toggle" class="toggle-btn">☰</button>
            </div>
            <div class="profile-section">
                <img src="https://picsum.photos/100" alt="Admin" class="profile-pic" />
                <p class="admin-name">Administrateur</p>
            </div>
            <nav class="nav-links">
                <a href="#" id="horses-btn">Chevaux</a>
                <a href="#" id="users-btn">Utilisateurs</a>
                <a href="#" id="stats-btn">Statistiques</a>
            </nav>
            <div class="logout-section">
                <button class="logout-btn">➜ Déconnexion</button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <h2>Bienvenue </h2>

            <!-- Stats Cards -->
            <section class="stats-cards" id="stats-section">
                <div class="card" id="user-card">
                    <h3>Utilisateurs inscrits</h3>
                    <p id="user-count"></p>
                </div>
                <div class="card" id="horse-card">
                    <h3>Nombre de Chevaux</h3>
                    <p id="horse-count"></p>
                </div>
            </section>

            <!-- Section Utilisateurs -->
            <section id="user-section">
                                                <div class="search-box">
    <input
        type="text"
        id="user-search"
        placeholder="Rechercher un utilisateur (nom, prénom, email...)">
    <button id="user-search-btn">Rechercher</button>
</div>
                <h2>Liste des utilisateurs</h2>

                <table id="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="user-list"></tbody>
                </table>

            </section>

            <!-- Section Chevaux -->
            <section id="horse-section">
                <div class="search-box">
                    <input
        type="text"
        id="horse-search"
        placeholder="Rechercher un cheval (nom, race, robe...)">
    <button id="horse-search-btn">Rechercher</button>
</div>
                <div class="horse-header">
                    <h2>Liste des chevaux</h2>
                    <button id="add-horse-btn">+ Ajouter Cheval</button>
                </div>
  
                <table id="horse-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Race</th>
                            <th>Robe</th>
                            <th>Âge</th>
                            <th>Taille</th>
                            <th>Propriétaire</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="horse-list"></tbody>
                </table>
      

            </section>
        </main>
    </div>

    <!-- Modal Ajouter Cheval -->
    <div id="add-horse-modal">
        <div class="modal-content">
            <h3>Ajouter un cheval</h3>
            <form id="add-horse-form">
                <label>Nom :</label>
                <input type="text" name="nom" required />

                <label>Race :</label>
                <input type="text" name="race" required />

                <label>Robe :</label>
                <input type="text" name="robe" required />

                <label>Âge :</label>
                <input type="number" name="age" required />

                <label>Taille :</label>
                <input type="text" name="taille" required />

                <label>Propriétaire :</label>
                <input type="text" name="proprietaire" required />

                <div class="modal-buttons">
                    <button type="button" id="close-modal-btn" class="btn-cancel">Annuler</button>
                    <button type="submit" class="btn-submit">Ajouter</button>
                </div>
            </form>
        </div>
    </div>

    <script src="{{ asset('admin1/js/admin.js') }}"></script>
</body>

</html>
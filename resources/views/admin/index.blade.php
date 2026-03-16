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
        <!-- Main Content -->
        <main class="main-content">
            <div class="top-bar">
                <h2>Bienvenue</h2>
                <button class="logout-btn">Déconnexion</button>
            </div>

            <nav class="admin-navbar">
                <button type="button" class="nav-link active" id="chevaux-btn">Chevaux</button>
                <button type="button" class="nav-link" id="utilisateurs-btn">Utilisateurs</button>
                <button type="button" class="nav-link" id="statisques-btn">Statisques</button>
            </nav>

            <!-- Stats Cards -->
            <section class="stats-cards" id="stats-section">
                <div class="dashboard-admin">
                    <div class="dashboard-header">
                        <h2>Dashboard Haras</h2>
                    </div>

                    <div class="dashboard-grid">
                        <div class="stat-card">
                            <div class="label">Utilisateurs inscrits</div>
                            <div class="value" id="user-count">0</div>
                            <div class="sub">total membres</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">Nombre de chevaux</div>
                            <div class="value" id="horse-count">0</div>
                            <div class="sub">equides</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">Connectes</div>
                            <div class="value" id="online-count">0</div>
                            <div class="sub">en ce moment</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">Actifs (24h)</div>
                            <div class="value" id="active-count">0</div>
                            <div class="sub">derniere journee</div>
                        </div>
                    </div>

                    <div class="dashboard-middle">
                        <div class="panel">
                            <h3>Utilisateurs</h3>
                            <div class="stats-mini">
                                <div class="mini-item">
                                    <div class="period">Nouveaux (24h)</div>
                                    <div class="number" id="new-users-24h">0</div>
                                    <div class="note">vs hier : stable</div>
                                </div>
                                <div class="mini-item">
                                    <div class="period">Nouveaux (7j)</div>
                                    <div class="number" id="new-users-7d">0</div>
                                    <div class="note">moyenne 7j</div>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>Inscrits: <strong id="user-count-inline">0</strong></span>
                                <span>Connectes: <strong id="online-count-inline">0</strong></span>
                                <span>Actifs: <strong id="active-count-inline">0</strong></span>
                            </div>
                        </div>

                        <div class="panel">
                            <h3>Chevaux</h3>
                            <div class="stats-mini">
                                <div class="mini-item">
                                    <div class="period">Nouveaux (24h)</div>
                                    <div class="number" id="new-horses-24h">0</div>
                                    <div class="note">aucun ajout</div>
                                </div>
                                <div class="mini-item">
                                    <div class="period">Nouveaux (7j)</div>
                                    <div class="number" id="new-horses-7d">0</div>
                                    <div class="note">periode calme</div>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>Chevaux: <strong id="horse-count-inline">0</strong></span>
                                <span class="badge">croissance 0%</span>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-footer">
                        <span>mise a jour en continu · <span id="admin-date"></span></span>
                    </div>
                </div>
            </section>

            <!-- Section Utilisateurs -->
            <section id="user-section">
                                                <div class="search-box">
    <input
        type="text"
        id="user-search"
        placeholder="Rechercher un utilisateur (nom, prenom, email...)">
    <button id="user-search-btn">Rechercher</button>
</div>
                <h2>Liste des utilisateurs</h2>

                <table id="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Prenom</th>
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
                    <div class="horse-actions">
                        <button id="add-horse-btn">+ Ajouter un cheval</button>
                        <button id="bulk-select-horses-btn" class="bulk-btn">Supprimer des chevaux</button>
                        <button id="bulk-delete-horses-btn" class="bulk-btn danger" style="display:none;" disabled>
                            Supprimer la selection (0)
                        </button>
                    </div>
                </div>
  
                <table id="horse-table">
                    <thead>
                        <tr>
                            <th class="selection-col" style="display:none;">Sel.</th>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Race</th>
                            <th>Robe</th>
                            <th>Annee de naissance</th>
                            <th>Taille</th>
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
            <form id="add-horse-form" enctype="multipart/form-data">
                @csrf
                <div class="horse-form-section">
                    <h4>Identite du cheval</h4>
                    <div class="horse-form-grid">
                        <div class="field">
                            <label>Nom *</label>
                            <input type="text" name="nom" required />
                        </div>
                        <div class="field">
                            <label>Race</label>
                            <input type="text" name="race" />
                        </div>
                        <div class="field">
                            <label>Sexe</label>
                            <select name="sexe">
                                <option value="">-</option>
                                <option value="Male">Male</option>
                                <option value="Femelle">Femelle</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Robe</label>
                            <input type="text" name="robe" />
                        </div>
                        <div class="field">
                            <label>Annee de naissance</label>
                            <input type="number" name="annee_naissance" min="1900" max="2100" />
                        </div>
                        <div class="field">
                            <label>Date de naissance</label>
                            <div class="year-only-group">
                                <input type="date" name="date_naissance" />
                                <label class="year-only-toggle">
                                    <input type="checkbox" data-year-only-for="date_naissance">
                                    Année seulement
                                </label>
                                <input type="number" name="date_naissance_year" class="year-only-input" min="1900" max="2100" placeholder="Année" disabled>
                            </div>
                        </div>
                        <div class="field">
                            <label>Taille (m)</label>
                            <input type="number" name="taille" step="0.01" />
                        </div>
                        <div class="field">
                            <label>Lieu de naissance</label>
                            <input type="text" name="lieu_naissance" />
                        </div>
                    </div>
                </div>

                <div class="horse-form-section">
                    <h4>Identifiants officiels</h4>
                    <div class="horse-form-grid">
                        <div class="field">
                            <label>Numero SIRE</label>
                            <input type="text" name="sire_numero" />
                        </div>
                        <div class="field">
                            <label>Numero UELN</label>
                            <input type="text" name="ueln_numero" />
                        </div>
                        <div class="field">
                            <label>Stud-book</label>
                            <input type="text" name="studbook_naissance" />
                        </div>
                        <div class="field">
                            <label>Transpondeur</label>
                            <select name="transpondeur">
                                <option value="">-</option>
                                <option value="1">Oui</option>
                                <option value="0">Non</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Numero transpondeur</label>
                            <input type="text" name="numero_transpondeur" />
                        </div>
                        <div class="field">
                            <label>Date pose transpondeur</label>
                            <div class="year-only-group">
                                <input type="date" name="date_pose_transpondeur" />
                                <label class="year-only-toggle">
                                    <input type="checkbox" data-year-only-for="date_pose_transpondeur">
                                    Année seulement
                                </label>
                                <input type="number" name="date_pose_transpondeur_year" class="year-only-input" min="1900" max="2100" placeholder="Année" disabled>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="horse-form-section">
                    <h4>Carnet de sante</h4>
                    <div class="horse-form-grid">
                        <div class="field field-wide">
                            <label>Photo du carnet de sante</label>
                            <input type="file" name="carnet_sante_photo" accept="image/*" />
                        </div>
                    </div>
                </div>

                <div class="horse-form-section">
                    <h4>Pedigree</h4>
                    <div class="horse-form-grid">
                        <div class="field">
                            <label>Nom pere</label>
                            <input type="text" name="pere_nom" />
                        </div>
                        <div class="field">
                            <label>SIRE pere</label>
                            <input type="text" name="pere_sire_numero" />
                        </div>
                        <div class="field">
                            <label>UELN pere</label>
                            <input type="text" name="pere_ueln_numero" />
                        </div>
                        <div class="field">
                            <label>Date naissance pere</label>
                            <div class="year-only-group">
                                <input type="date" name="pere_date_naissance" />
                                <label class="year-only-toggle">
                                    <input type="checkbox" data-year-only-for="pere_date_naissance">
                                    Année seulement
                                </label>
                                <input type="number" name="pere_date_naissance_year" class="year-only-input" min="1900" max="2100" placeholder="Année" disabled>
                            </div>
                        </div>
                        <div class="field">
                            <label>Pays naissance pere</label>
                            <input type="text" name="pere_pays_naissance" />
                        </div>
                        <div class="field">
                            <label>Stud-book pere</label>
                            <input type="text" name="pere_studbook" />
                        </div>
                        <div class="field">
                            <label>Nom mere</label>
                            <input type="text" name="mere_nom" />
                        </div>
                        <div class="field">
                            <label>SIRE mere</label>
                            <input type="text" name="mere_sire_numero" />
                        </div>
                        <div class="field">
                            <label>UELN mere</label>
                            <input type="text" name="mere_ueln_numero" />
                        </div>
                        <div class="field">
                            <label>Date naissance mere</label>
                            <div class="year-only-group">
                                <input type="date" name="mere_date_naissance" />
                                <label class="year-only-toggle">
                                    <input type="checkbox" data-year-only-for="mere_date_naissance">
                                    Année seulement
                                </label>
                                <input type="number" name="mere_date_naissance_year" class="year-only-input" min="1900" max="2100" placeholder="Année" disabled>
                            </div>
                        </div>
                        <div class="field">
                            <label>Pays naissance mere</label>
                            <input type="text" name="mere_pays_naissance" />
                        </div>
                        <div class="field">
                            <label>Stud-book mere</label>
                            <input type="text" name="mere_studbook" />
                        </div>
                    </div>
                </div>

                <div class="horse-form-section">
                    <h4>Signalement</h4>
                    <div class="horse-form-grid">
                        <div class="field">
                            <label>Tete</label>
                            <textarea name="signalement_tete" rows="2"></textarea>
                        </div>
                        <div class="field">
                            <label>Anterieur gauche</label>
                            <textarea name="signalement_anterieur_gauche" rows="2"></textarea>
                        </div>
                        <div class="field">
                            <label>Anterieur droite</label>
                            <textarea name="signalement_anterieur_droite" rows="2"></textarea>
                        </div>
                        <div class="field">
                            <label>Posterieur gauche</label>
                            <textarea name="signalement_posterieur_gauche" rows="2"></textarea>
                        </div>
                        <div class="field">
                            <label>Posterieur droite</label>
                            <textarea name="signalement_posterieur_droite" rows="2"></textarea>
                        </div>
                        <div class="field field-wide">
                            <label>Corps</label>
                            <textarea name="signalement_corps" rows="3"></textarea>
                        </div>
                        <div class="field field-wide">
                            <label>Marques particulieres</label>
                            <textarea name="signalement_marques_particulieres" rows="3"></textarea>
                        </div>
                    </div>
                </div>

                <div class="horse-form-section">
                    <h4>Naisseur</h4>
                    <div class="horse-form-grid">
                        <div class="field">
                            <label>Nom naisseur</label>
                            <input type="text" name="naisseur_nom" />
                        </div>
                        <div class="field">
                            <label>Telephone</label>
                            <input type="text" name="naisseur_telephone" />
                        </div>
                        <div class="field field-wide">
                            <label>Adresse</label>
                            <input type="text" name="naisseur_adresse" />
                        </div>
                    </div>
                </div>

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

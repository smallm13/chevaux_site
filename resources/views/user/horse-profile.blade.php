<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cheval->nom ?? 'Cheval' }} - Profil detaille | Ecuries Royales</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('user/css/horse-profile.css') }}">
</head>

<body>
    @php
        $dateCourte = fn($d) => $d ? \Carbon\Carbon::parse($d)->format('d/m/Y') : '-';
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
    </header>

    <div class="breadcrumb">
        <div class="container">
            <a href="{{ route('user.horses') }}">Accueil</a> &gt; <a href="{{ route('user.horses') }}">Mes chevaux</a>
            &gt; <span>{{ $cheval->nom ?? 'Cheval' }}</span>
        </div>
    </div>

    <main class="container">
        <section class="horse-profile">
            <div class="horse-header">
                <div class="horse-avatar">
                    <i class="fas fa-horse"></i>
                </div>
                <div class="horse-info">
                    <div class="horse-name">
                        <h2>{{ $cheval->nom ?? '-' }}</h2>
                        <button id="favorite-btn" class="favorite-btn" data-horse-id="{{ $cheval->id ?? '' }}"
                            data-horse-name="{{ $cheval->nom ?? 'Cheval' }}">
                            <i class="far fa-heart"></i>
                            <span>Ajouter aux favoris</span>
                        </button>
                    </div>
                    <div class="horse-details">
                        <div class="detail-item">
                            <i class="fas fa-dna"></i>
                            <span><strong>Race:</strong> {{ $cheval->race ?? '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-venus-mars"></i>
                            <span><strong>Sexe:</strong> {{ $cheval->sexe ?? '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-palette"></i>
                            <span><strong>Robe:</strong> {{ $cheval->robe ?? '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-birthday-cake"></i>
                            <span><strong>Annee de naissance:</strong> {{ $cheval->annee_naissance ?? '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-horse-head"></i>
                            <span><strong>Pere:</strong> {{ $pere->nom ?? '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-horse-head"></i>
                            <span><strong>Mere:</strong> {{ $mere->nom ?? '-' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="info-sections">
            <div class="info-card">
                <h3><i class="fas fa-id-card"></i> IDENTITE & STUD-BOOK</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Numero SIRE</span>
                        <span>{{ $cheval->sire_numero ?? '-' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Numero UELN</span>
                        <span>{{ $cheval->ueln_numero ?? '-' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date de naissance</span>
                        <span>{{ $dateCourte($cheval->date_naissance ?? null) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Lieu de naissance</span>
                        <span>{{ $cheval->lieu_naissance ?? '-' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Stud-book</span>
                        <span>{{ $cheval->studbook_naissance ?? '-' }}</span>
                    </div>
                </div>
            </div>

            <div class="info-card">
                <h3><i class="fas fa-microchip"></i> IDENTIFICATION ELECTRONIQUE</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Transpondeur electronique</span>
                        <span>{{ (int) ($cheval->transpondeur ?? 0) === 1 ? 'Oui' : 'Non' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Numero transpondeur</span>
                        <span>{{ $cheval->numero_transpondeur ?? '-' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date de pose</span>
                        <span>{{ $dateCourte($cheval->date_pose_transpondeur ?? null) }}</span>
                    </div>
                </div>
            </div>

            <div class="info-card">
                <h3><i class="fas fa-user-tie"></i> NAISSEUR</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Nom</span>
                        <span>{{ $naisseur->nom ?? '-' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Adresse</span>
                        <span>{{ $naisseur->adresse ?? '-' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Telephone</span>
                        <span>{{ $naisseur->telephone ?? '-' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <section class="pedigree-section">
            <h3><i class="fas fa-sitemap"></i> PEDIGREE</h3>
            <div class="pedigree-cards">
                <div class="pedigree-card">
                    <h4><i class="fas fa-mars"></i> Pere : {{ $pere->nom ?? '-' }}</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">SIRE</span>
                            <span>{{ $pere->sire_numero ?? '-' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">UELN</span>
                            <span>{{ $pere->ueln_numero ?? '-' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Date de naissance</span>
                            <span>{{ $dateCourte($pere->date_naissance ?? null) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Pays</span>
                            <span>{{ $pere->pays_naissance ?? '-' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Stud-book</span>
                            <span>{{ $pere->studbook ?? '-' }}</span>
                        </div>
                    </div>
                </div>

                <div class="pedigree-card">
                    <h4><i class="fas fa-venus"></i> Mere : {{ $mere->nom ?? '-' }}</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">SIRE</span>
                            <span>{{ $mere->sire_numero ?? '-' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">UELN</span>
                            <span>{{ $mere->ueln_numero ?? '-' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Date de naissance</span>
                            <span>{{ $dateCourte($mere->date_naissance ?? null) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Pays</span>
                            <span>{{ $mere->pays_naissance ?? '-' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Stud-book</span>
                            <span>{{ $mere->studbook ?? '-' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

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

    <script src="{{ asset('user/js/horse-profile.js') }}"></script>
</body>

</html>



document.addEventListener('DOMContentLoaded', () => {

    // ======== Variables =========
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const container = document.querySelector('.container');

    const usersBtn = document.getElementById('users-btn');
    const horsesBtn = document.getElementById('horses-btn');
    const statsBtn = document.getElementById('stats-btn');

    const userSection = document.getElementById('user-section');
    const horseSection = document.getElementById('horse-section');
    const statsSection = document.querySelector('.stats-cards');

    const userList = document.getElementById('user-list');
    const horseList = document.getElementById('horse-list');

    const userCountEl = document.getElementById('user-count');
    const horseCountEl = document.getElementById('horse-count');

    const logoutBtn = document.querySelector('.logout-btn');

    const addHorseBtn = document.getElementById('add-horse-btn');
    const modal = document.getElementById('add-horse-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addHorseForm = document.getElementById('add-horse-form');

    const userSearch = document.getElementById('user-search');
    const horseSearch = document.getElementById('horse-search');

    // ======== Fonctions ========
    async function updateStats() {
        try {
            const resUsers = await fetch('/utilisateurs/count');
            const usersData = await resUsers.json();
            userCountEl.textContent = usersData.count;

            const resHorses = await fetch('/admin/chevaux/count');
            const horsesData = await resHorses.json();
            horseCountEl.textContent = horsesData.count;
        } catch (err) {
            console.error("Erreur lors de la récupération des stats :", err);
        }
    }

    async function loadUsers() {
        try {
            const res = await fetch('/utilisateurs');
            const utilisateurs = await res.json();
            userList.innerHTML = '';

            if (utilisateurs.length === 0) {
                userList.innerHTML = `<tr><td colspan="6" style="text-align:center;">Aucun utilisateur trouvé.</td></tr>`;
                userCountEl.textContent = 0;
                return;
            }

            userCountEl.textContent = utilisateurs.length;

            utilisateurs.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.id}</td>
                    <td>${u.nom}</td>
                    <td>${u.prenom}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td>
                        <button class="edit-btn" onclick="editUser(${u.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteUser(${u.id})">Delete</button>
                    </td>
                `;
                userList.appendChild(tr);
            });
        } catch (err) {
            console.error('Erreur lors de la récupération des utilisateurs :', err);
        }
    }

    async function loadHorses() {
        try {
            const res = await fetch('/admin/chevaux/list');
            const chevaux = await res.json();
            horseList.innerHTML = '';

            if (chevaux.length === 0) {
                horseList.innerHTML = `<tr><td colspan="8" style="text-align:center;">Aucun cheval trouvé.</td></tr>`;
                horseCountEl.textContent = 0;
                return;
            }

            horseCountEl.textContent = chevaux.length;

            chevaux.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${c.id}</td>
                    <td>${c.nom}</td>
                    <td>${c.race ?? '-'}</td>
                    <td>${c.robe ?? '-'}</td>
                    <td>${c.age ?? '-'}</td>
                    <td>${c.taille ?? '-'}</td>
                    <td>${c.proprietaire ?? '-'}</td>
                    <td>
                        <button class="edit-btn" onclick="editHorse(${c.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteHorse(${c.id})">Delete</button>
                    </td>
                `;
                horseList.appendChild(tr);
            });
        } catch (err) {
            console.error('Erreur lors de la récupération des chevaux :', err);
        }
    }

    // ======== Événements Sections ========
    usersBtn.addEventListener('click', (e) => {
        e.preventDefault();
        userSection.style.display = 'block';
        horseSection.style.display = 'none';
        statsSection.style.display = 'none';
        loadUsers();
    });

    horsesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        horseSection.style.display = 'block';
        userSection.style.display = 'none';
        statsSection.style.display = 'none';
        loadHorses();
    });

    statsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        statsSection.style.display = 'flex';
        userSection.style.display = 'none';
        horseSection.style.display = 'none';
        updateStats();
    });

    // ======== Logout ========
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({})
                });

                if (response.ok) {
                    Swal.fire({
                        title: "Déconnexion réussie ✅",
                        text: "Vous allez être redirigé.",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => window.location.href = '/');
                } else {
                    Swal.fire("Erreur ❌", "Impossible de vous déconnecter.", "error");
                }
            } catch (err) {
                console.error("Erreur logout :", err);
                Swal.fire("Oups !", "Une erreur s'est produite.", "warning");
            }
        });
    }

    // ======== Recherche ========
    if (userSearch) {
        userSearch.addEventListener('input', () => {
            const filter = userSearch.value.toLowerCase();
            Array.from(userList.getElementsByTagName('tr')).forEach(row => {
                const cells = row.getElementsByTagName('td');
                let match = false;
                for (let i = 1; i <= 4; i++) {
                    if (cells[i] && cells[i].textContent.toLowerCase().includes(filter)) {
                        match = true; break;
                    }
                }
                row.style.display = match ? '' : 'none';
            });
        });
    }

    if (horseSearch) {
        horseSearch.addEventListener('input', () => {
            const filter = horseSearch.value.toLowerCase();
            Array.from(horseList.getElementsByTagName('tr')).forEach(row => {
                const cells = row.getElementsByTagName('td');
                let match = false;
                for (let i = 1; i <= 6; i++) {
                    if (cells[i] && cells[i].textContent.toLowerCase().includes(filter)) {
                        match = true; break;
                    }
                }
                row.style.display = match ? '' : 'none';
            });
        });
    }

    // ======== Modal Ajouter Cheval ========
    if (addHorseBtn && modal && closeModalBtn && addHorseForm) {

        addHorseBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        addHorseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addHorseForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                const response = await fetch('/horses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    Swal.fire('Succès', 'Cheval ajouté avec succès !', 'success');
                    modal.style.display = 'none';
                    addHorseForm.reset();
                    horsesBtn.click(); // recharge la liste
                } else {
                    const errorData = await response.json();
                    Swal.fire('Erreur', errorData.message || 'Erreur lors de l\'ajout', 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Erreur', 'Une erreur est survenue', 'error');
            }
        });
    }

});
// Fermer le modal en cliquant en dehors - Version complète
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('add-horse-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Variable pour suivre si le modal est en train de se fermer
    let isClosing = false;
    
    modal.addEventListener('click', function(event) {
        // Empêcher les fermetures multiples
        if (isClosing) return;
        
        // Vérifier si le clic est sur l'overlay (et non sur le contenu)
        const isClickOnOverlay = event.target === modal;
        const isClickOnCloseBtn = event.target.classList.contains('close-btn') || 
                                   event.target.closest('.close-btn') ||
                                   event.target.id === 'close-modal-btn';
        
        if (isClickOnOverlay || isClickOnCloseBtn) {
            closeModal();
        }
    });
    
    // Empêcher la fermeture quand on clique dans le formulaire
    modalContent.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    // Gestion de la touche Echap
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    function closeModal() {
        if (isClosing) return;
        
        isClosing = true;
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.2s ease';
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1';
            modal.style.transition = '';
            document.getElementById('add-horse-form').reset();
            isClosing = false;
        }, 200);
    }
    
    // Si vous avez un bouton pour ouvrir le modal, ajoutez cette fonction
    document.getElementById('add-horse-btn').addEventListener('click', function() {
        modal.style.display = 'flex';
        // Petit délai pour l'animation
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    });
});
window.deleteHorse = async function(id) {
    const confirmation = await Swal.fire({
        title: "Confirmer la suppression",
        text: "Voulez-vous vraiment supprimer ce cheval ? Cette action est irréversible.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler"
    });

    if (!confirmation.isConfirmed) return;

    try {
        const token = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute('content');

        const response = await fetch(`/admin/chevaux/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': token,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            Swal.fire("Supprimé", "Le cheval a été supprimé avec succès.", "success");

            setTimeout(() => {
                document.getElementById('horses-btn').click();
            }, 400);

        } else {
            const error = await response.json();
            Swal.fire("Erreur", error.message || "Impossible de supprimer le cheval.", "error");
        }

    } catch (err) {
        console.error(err);
        Swal.fire("Erreur", "Une erreur est survenue.", "error");
    }
}
window.editHorse = async function(id) {
    try {
        const res = await fetch(`/admin/chevaux/${id}`);
        const cheval = await res.json();

        const { value: formValues } = await Swal.fire({
            title: 'Modifier le cheval',
            html: `
                <form id="swal-user-form" class="horse-form-horizontal">
                    <div class="form-group">
                        <label for="swal-nom">Nom</label>
                        <input id="swal-nom" type="text" placeholder="Nom" value="${cheval.nom ?? ''}">
                    </div>
                    <div class="form-group">
                        <label for="swal-race">Race</label>
                        <input id="swal-race" type="text" placeholder="Race" value="${cheval.race ?? ''}">
                    </div>
                    <div class="form-group">
                        <label for="swal-robe">Robe</label>
                        <input id="swal-robe" type="text" placeholder="Couleur" value="${cheval.robe ?? ''}">
                    </div>
                    <div class="form-group">
                        <label for="swal-age">Âge</label>
                        <input id="swal-age" type="number" placeholder="Ans" value="${cheval.age ?? ''}">
                    </div>
                    <div class="form-group">
                        <label for="swal-taille">Taille</label>
                        <input id="swal-taille" type="number" placeholder="cm" value="${cheval.taille ?? ''}">
                    </div>
                    <div class="form-group">
                        <label for="swal-prop">Propriétaire</label>
                        <input id="swal-prop" type="text" placeholder="Nom" value="${cheval.proprietaire ?? ''}">
                    </div>
                </form>
            `,
            width: 450, // Légèrement élargi pour le confort
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Enregistrer",
            cancelButtonText: "Annuler",
            preConfirm: () => {
                return {
                    nom: document.getElementById('swal-nom').value,
                    race: document.getElementById('swal-race').value,
                    robe: document.getElementById('swal-robe').value,
                    age: document.getElementById('swal-age').value,
                    taille: document.getElementById('swal-taille').value,
                    proprietaire: document.getElementById('swal-prop').value
                }
            }
        });

        if (!formValues) return;

        const token = document.querySelector('meta[name="csrf-token"]').content;
        const update = await fetch(`/admin/chevaux/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify(formValues)
        });

        if (update.ok) {
            Swal.fire("Succès", "Cheval modifié avec succès", "success");
            setTimeout(() => { document.getElementById('horses-btn').click(); }, 400);
        } else {
            const err = await update.json();
            Swal.fire("Erreur", err.message || "Mise à jour impossible", "error");
        }
    } catch (e) {
        Swal.fire("Erreur", "Impossible de charger les informations", "error");
    }
}
function filterTable(inputId, tableId, columns) {
    const filter = document.getElementById(inputId).value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tr`);

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let match = false;

        columns.forEach(index => {
            if (cells[index] && cells[index].textContent.toLowerCase().includes(filter)) {
                match = true;
            }
        });

        row.style.display = match ? '' : 'none';
    });
}
document.getElementById('user-search-btn').addEventListener('click', () => {
    filterTable('user-search', 'user-list', [1, 2, 3, 4]);
});

document.getElementById('user-search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        filterTable('user-search', 'user-list', [1, 2, 3, 4]);
    }
});
document.getElementById('horse-search-btn').addEventListener('click', () => {
    filterTable('horse-search', 'horse-list', [1, 2, 3, 4, 5, 6]);
});

document.getElementById('horse-search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        filterTable('horse-search', 'horse-list', [1, 2, 3, 4, 5, 6]);
    }
});
window.editUser = async function (id) {
    try {
        // 1️⃣ Récupérer l'utilisateur
        const res = await fetch(`/admin/utilisateurs/${id}`);
        if (!res.ok) throw new Error();
        const user = await res.json();

        // 2️⃣ Popup SweetAlert avec mise en page horizontale
        const { value: formValues } = await Swal.fire({
            title: "Modifier l'utilisateur",
            html: `
                <form id="swal-user-form" class="horse-form-horizontal">
                    <div class="form-group">
                        <label for="swal-nom">Nom</label>
                        <input id="swal-nom" type="text" placeholder="Nom" value="${user.nom ?? ''}">
                    </div>

                    <div class="form-group">
                        <label for="swal-prenom">Prénom</label>
                        <input id="swal-prenom" type="text" placeholder="Prénom" value="${user.prenom ?? ''}">
                    </div>

                    <div class="form-group">
                        <label for="swal-email">Email</label>
                        <input id="swal-email" type="email" placeholder="Email" value="${user.email ?? ''}">
                    </div>

                    <div class="form-group">
                        <label for="swal-role">Rôle</label>
                        <select id="swal-role">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>Utilisateur</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrateur</option>
                        </select>
                    </div>
                </form>
            `,
            width: 450,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Enregistrer",
            cancelButtonText: "Annuler",
            preConfirm: () => ({
                nom: document.getElementById('swal-nom').value,
                prenom: document.getElementById('swal-prenom').value,
                email: document.getElementById('swal-email').value,
                role: document.getElementById('swal-role').value
            })
        });

        if (!formValues) return;

        // 3️⃣ Envoyer la mise à jour
        const token = document.querySelector('meta[name="csrf-token"]').content;
        const update = await fetch(`/admin/utilisateurs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify(formValues)
        });

        if (update.ok) {
            Swal.fire({
                title: "Succès",
                text: "Utilisateur mis à jour",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            document.getElementById('users-btn').click();
        } else {
            const err = await update.json();
            Swal.fire("Erreur", err.message || "Impossible de modifier", "error");
        }

    } catch (e) {
        Swal.fire("Erreur", "Impossible de charger l'utilisateur", "error");
    }
};
window.deleteUser = async function (id) {
    const confirm = await Swal.fire({
        title: "Confirmer la suppression",
        text: "Cet utilisateur sera supprimé définitivement",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler"
    });

    if (!confirm.isConfirmed) return;

    try {
        const token = document.querySelector('meta[name="csrf-token"]').content;

        const res = await fetch(`/admin/utilisateurs/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': token,
                'Accept': 'application/json'
            }
        });

        if (res.ok) {
            Swal.fire("Supprimé", "Utilisateur supprimé", "success");
            document.getElementById('users-btn').click();
        } else {
            const err = await res.json();
            Swal.fire("Erreur", err.message || "Suppression impossible", "error");
        }

    } catch (e) {
        Swal.fire("Erreur", "Une erreur est survenue", "error");
    }
};

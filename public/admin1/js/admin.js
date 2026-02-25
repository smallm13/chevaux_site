
document.addEventListener('DOMContentLoaded', () => {
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ======== Variables =========
    const chevauxBtn = document.getElementById('chevaux-btn');
    const utilisateursBtn = document.getElementById('utilisateurs-btn');
    const statisquesBtn = document.getElementById('statisques-btn');
    const navButtons = [chevauxBtn, utilisateursBtn, statisquesBtn].filter(Boolean);

    const userSection = document.getElementById('user-section');
    const horseSection = document.getElementById('horse-section');
    const statsSection = document.querySelector('.stats-cards');

    const userList = document.getElementById('user-list');
    const horseList = document.getElementById('horse-list');

    const userCountEl = document.getElementById('user-count');
    const horseCountEl = document.getElementById('horse-count');

    const logoutBtn = document.querySelector('.logout-btn');

    const addHorseBtn = document.getElementById('add-horse-btn');
    const bulkSelectHorsesBtn = document.getElementById('bulk-select-horses-btn');
    const bulkDeleteHorsesBtn = document.getElementById('bulk-delete-horses-btn');
    const modal = document.getElementById('add-horse-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addHorseForm = document.getElementById('add-horse-form');

    const userSearch = document.getElementById('user-search');
    const horseSearch = document.getElementById('horse-search');
    const horseSelectionHeader = document.querySelector('#horse-table thead .selection-col');

    let horseSelectionMode = false;
    let selectedHorseIds = new Set();

    function setActiveTab(tab) {
        navButtons.forEach((btn) => {
            btn.classList.toggle('active', btn === tab);
        });
    }

    function showHomeSection() {
        horseSection.style.display = 'block';
        userSection.style.display = 'none';
        statsSection.style.display = 'none';
        setActiveTab(chevauxBtn);
        loadHorses();
    }

    function showFavoritesSection() {
        userSection.style.display = 'block';
        horseSection.style.display = 'none';
        statsSection.style.display = 'none';
        setActiveTab(utilisateursBtn);
        loadUsers();
    }

    function showStatsSection() {
        statsSection.style.display = 'flex';
        userSection.style.display = 'none';
        horseSection.style.display = 'none';
        setActiveTab(statisquesBtn);
        updateStats();
    }

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
            console.error("Erreur lors de la recuperation des stats :", err);
        }
    }

    async function loadUsers() {
        try {
            const res = await fetch('/admin/utilisateurs');
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                window.location.href = '/';
                return;
            }
            const utilisateurs = await res.json();
            userList.innerHTML = '';

            if (utilisateurs.length === 0) {
                userList.innerHTML = `<tr><td colspan="6" style="text-align:center;">Aucun utilisateur trouve.</td></tr>`;
                userCountEl.textContent = 0;
                return;
            }

            userCountEl.textContent = utilisateurs.length;

            utilisateurs.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(u.id)}</td>
                    <td>${escapeHtml(u.nom)}</td>
                    <td>${escapeHtml(u.prenom)}</td>
                    <td>${escapeHtml(u.email)}</td>
                    <td>${escapeHtml(u.role)}</td>
                    <td>
                        <button class="edit-btn" onclick="editUser(${u.id})">Modifier</button>
                        <button class="delete-btn" onclick="deleteUser(${u.id})">Supprimer</button>
                    </td>
                `;
                userList.appendChild(tr);
            });
        } catch (err) {
            console.error('Erreur lors de la recuperation des utilisateurs :', err);
        }
    }

    async function loadHorses() {
        try {
            const res = await fetch('/admin/chevaux/list');
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok || !contentType.includes('application/json')) {
                window.location.href = '/';
                return;
            }
            const chevaux = await res.json();
            horseList.innerHTML = '';

            if (chevaux.length === 0) {
                horseList.innerHTML = `<tr><td colspan="8" style="text-align:center;">Aucun cheval trouve.</td></tr>`;
                horseCountEl.textContent = 0;
                return;
            }

            horseCountEl.textContent = chevaux.length;

            chevaux.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="selection-col" style="${horseSelectionMode ? '' : 'display:none;'}">
                        <input type="checkbox" class="horse-select-checkbox" data-id="${c.id}" ${selectedHorseIds.has(String(c.id)) ? 'checked' : ''}>
                    </td>
                    <td>${escapeHtml(c.id)}</td>
                    <td>${escapeHtml(c.nom)}</td>
                    <td>${escapeHtml(c.race ?? '-')}</td>
                    <td>${escapeHtml(c.robe ?? '-')}</td>
                    <td>${escapeHtml(c.annee_naissance ?? '-')}</td>
                    <td>${escapeHtml(c.taille ?? '-')}</td>
                    <td>
                        <button class="edit-btn" onclick="editHorse(${c.id})">Modifier</button>
                    </td>
                `;
                horseList.appendChild(tr);
            });

            horseList.querySelectorAll('.horse-select-checkbox').forEach((checkbox) => {
                checkbox.addEventListener('change', (e) => {
                    const horseId = e.target.dataset.id;
                    if (e.target.checked) {
                        selectedHorseIds.add(horseId);
                    } else {
                        selectedHorseIds.delete(horseId);
                    }
                    updateBulkDeleteButton();
                });
            });
        } catch (err) {
            console.error('Erreur lors de la recuperation des chevaux :', err);
        }
    }

    function updateBulkDeleteButton() {
        if (!bulkDeleteHorsesBtn) return;
        const count = selectedHorseIds.size;
        bulkDeleteHorsesBtn.textContent = `Supprimer la selection (${count})`;
        bulkDeleteHorsesBtn.disabled = count === 0;
    }

    function setHorseSelectionMode(enabled) {
        horseSelectionMode = enabled;

        if (!horseSelectionMode) {
            selectedHorseIds.clear();
        }

        if (horseSelectionHeader) {
            horseSelectionHeader.style.display = horseSelectionMode ? '' : 'none';
        }

        if (bulkDeleteHorsesBtn) {
            bulkDeleteHorsesBtn.style.display = horseSelectionMode ? '' : 'none';
        }

        if (bulkSelectHorsesBtn) {
            bulkSelectHorsesBtn.textContent = horseSelectionMode
                ? 'Annuler suppression'
                : 'Supprimer des chevaux';
        }

        updateBulkDeleteButton();
        loadHorses();
    }

    // ======== Evenements Sections ========
    if (chevauxBtn) {
        chevauxBtn.addEventListener('click', showHomeSection);
    }

    if (utilisateursBtn) {
        utilisateursBtn.addEventListener('click', showFavoritesSection);
    }

    if (statisquesBtn) {
        statisquesBtn.addEventListener('click', showStatsSection);
    }

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
                        title: "Deconnexion reussie ",
                        text: "Vous allez etre redirige.",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => window.location.href = '/');
                } else {
                    Swal.fire("Erreur ", "Impossible de vous deconnecter.", "error");
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
                for (let i = 2; i <= 6; i++) {
                    if (cells[i] && cells[i].textContent.toLowerCase().includes(filter)) {
                        match = true; break;
                    }
                }
                row.style.display = match ? '' : 'none';
            });
        });
    }

    // ======== Modal Ajouter / Modifier Cheval ========
    if (addHorseBtn && modal && closeModalBtn && addHorseForm) {
        const modalTitle = modal.querySelector('.modal-content h3');
        const submitBtn = addHorseForm.querySelector('.btn-submit');

        const transpondeurSelect = addHorseForm.querySelector('select[name="transpondeur"]');
        const numeroTranspondeurInput = addHorseForm.querySelector('input[name="numero_transpondeur"]');
        const datePoseInput = addHorseForm.querySelector('input[name="date_pose_transpondeur"]');
        const anneeNaissanceInput = addHorseForm.querySelector('input[name="annee_naissance"]');
        const dateNaissanceInput = addHorseForm.querySelector('input[name="date_naissance"]');

        function toggleTranspondeurFields() {
            if (!transpondeurSelect || !numeroTranspondeurInput || !datePoseInput) return;
            const enabled = transpondeurSelect.value === '1';
            numeroTranspondeurInput.disabled = !enabled;
            datePoseInput.disabled = !enabled;
            if (!enabled) {
                numeroTranspondeurInput.value = '';
                datePoseInput.value = '';
            }
        }

        function syncBirthYearFromDate() {
            if (!anneeNaissanceInput || !dateNaissanceInput || !dateNaissanceInput.value) return;
            anneeNaissanceInput.value = new Date(dateNaissanceInput.value).getFullYear();
        }

        function setFormModeCreate() {
            addHorseForm.dataset.mode = 'create';
            addHorseForm.dataset.horseId = '';
            modalTitle.textContent = 'Ajouter un cheval';
            submitBtn.textContent = 'Ajouter';
            addHorseForm.reset();
            toggleTranspondeurFields();
        }

        function setFormModeEdit(horseId, horseData) {
            addHorseForm.dataset.mode = 'edit';
            addHorseForm.dataset.horseId = String(horseId);
            modalTitle.textContent = 'Modifier le cheval';
            submitBtn.textContent = 'Enregistrer';

            const setValue = (name, value) => {
                const field = addHorseForm.querySelector(`[name="${name}"]`);
                if (!field) return;
                field.value = value ?? '';
            };

            [
                'nom', 'race', 'sexe', 'robe', 'annee_naissance', 'date_naissance', 'lieu_naissance',
                'sire_numero', 'ueln_numero', 'studbook_naissance', 'transpondeur',
                'numero_transpondeur', 'date_pose_transpondeur', 'taille',
                'pere_nom', 'pere_sire_numero', 'pere_ueln_numero', 'pere_date_naissance',
                'pere_pays_naissance', 'pere_studbook',
                'mere_nom', 'mere_sire_numero', 'mere_ueln_numero', 'mere_date_naissance',
                'mere_pays_naissance', 'mere_studbook',
                'naisseur_nom', 'naisseur_telephone', 'naisseur_adresse'
            ].forEach((key) => setValue(key, horseData[key]));

            toggleTranspondeurFields();
        }

        function openModal() {
            modal.style.display = 'flex';
        }

        function closeModal() {
            modal.style.display = 'none';
        }

        addHorseBtn.addEventListener('click', () => {
            setFormModeCreate();
            openModal();
        });

        closeModalBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });

        addHorseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addHorseForm);
            const data = Object.fromEntries(formData.entries());

            const mode = addHorseForm.dataset.mode || 'create';
            const horseId = addHorseForm.dataset.horseId;
            const isEdit = mode === 'edit' && horseId;
            const url = isEdit ? `/admin/chevaux/${horseId}` : '/horses';
            const method = isEdit ? 'PUT' : 'POST';

            try {
                const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token,
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    Swal.fire(
                        'Succes',
                        isEdit ? 'Cheval modifie avec succes !' : 'Cheval ajoute avec succes !',
                        'success'
                    );
                    closeModal();
                    setFormModeCreate();
                    loadHorses();
                } else {
                    let message = 'Erreur lors de l enregistrement';
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        const errorData = await response.json();
                        message = errorData.message || message;
                    } else {
                        const text = await response.text();
                        if (text && !text.startsWith('<!DOCTYPE')) {
                            message = text;
                        }
                    }
                    Swal.fire('Erreur', message, 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Erreur', 'Une erreur est survenue', 'error');
            }
        });

        if (transpondeurSelect) {
            transpondeurSelect.addEventListener('change', toggleTranspondeurFields);
            toggleTranspondeurFields();
        }
        if (dateNaissanceInput) {
            dateNaissanceInput.addEventListener('change', syncBirthYearFromDate);
        }

        window.editHorse = async function (id) {
            try {
                const res = await fetch(`/admin/chevaux/${id}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const horse = await res.json();
                setFormModeEdit(id, horse);
                openModal();
            } catch (e) {
                Swal.fire('Erreur', 'Impossible de charger les informations du cheval', 'error');
            }
        };
    }

    if (bulkSelectHorsesBtn) {
        bulkSelectHorsesBtn.addEventListener('click', () => {
            setHorseSelectionMode(!horseSelectionMode);
        });
    }

    if (bulkDeleteHorsesBtn) {
        bulkDeleteHorsesBtn.addEventListener('click', async () => {
            if (selectedHorseIds.size === 0) return;

            const confirmation = await Swal.fire({
                title: "Confirmer la suppression",
                text: `Voulez-vous supprimer ${selectedHorseIds.size} cheval(aux) ? Cette action est irreversible.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Oui, supprimer",
                cancelButtonText: "Annuler"
            });

            if (!confirmation.isConfirmed) return;

            try {
                const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                const ids = Array.from(selectedHorseIds);
                const results = await Promise.all(ids.map(async (horseId) => {
                    const response = await fetch(`/admin/chevaux/${horseId}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': token,
                            'Accept': 'application/json'
                        }
                    });
                    return { horseId, ok: response.ok };
                }));

                const failed = results.filter(r => !r.ok).length;
                if (failed === 0) {
                    Swal.fire("Supprime", "Les chevaux selectionnes ont ete supprimes.", "success");
                } else {
                    Swal.fire("Partiel", `${results.length - failed} supprime(s), ${failed} echec(s).`, "warning");
                }
                setHorseSelectionMode(false);
            } catch (err) {
                console.error(err);
                Swal.fire("Erreur", "Une erreur est survenue lors de la suppression groupee.", "error");
            }
        });
    }

    showHomeSection();

});
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
    filterTable('horse-search', 'horse-list', [2, 3, 4, 5, 6]);
});

document.getElementById('horse-search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        filterTable('horse-search', 'horse-list', [2, 3, 4, 5, 6]);
    }
});
window.editUser = async function (id) {
    try {
        // 1Recuperer l'utilisateur
        const res = await fetch(`/admin/utilisateurs/${id}`);
        if (!res.ok) throw new Error();
        const user = await res.json();

        // 2Popup SweetAlert avec mise en page horizontale
        const { value: formValues } = await Swal.fire({
            title: "Modifier l'utilisateur",
            html: `
                <form id="swal-user-form" class="horse-form-horizontal">
                    <div class="form-group">
                        <label for="swal-nom">Nom</label>
                        <input id="swal-nom" type="text" placeholder="Nom" value="${escapeHtml(user.nom ?? '')}">
                    </div>

                    <div class="form-group">
                        <label for="swal-prenom">Prenom</label>
                        <input id="swal-prenom" type="text" placeholder="Prenom" value="${escapeHtml(user.prenom ?? '')}">
                    </div>

                    <div class="form-group">
                        <label for="swal-email">Email</label>
                        <input id="swal-email" type="email" placeholder="Email" value="${escapeHtml(user.email ?? '')}">
                    </div>

                    <div class="form-group">
                        <label for="swal-role">Role</label>
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

        // 3Envoyer la mise a jour
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
                title: "Succes",
                text: "Utilisateur mis a jour",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            document.getElementById('utilisateurs-btn')?.click();
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
        text: "Cet utilisateur sera supprime definitivement",
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
            Swal.fire("Supprime", "Utilisateur supprime", "success");
            document.getElementById('utilisateurs-btn')?.click();
        } else {
            const err = await res.json();
            Swal.fire("Erreur", err.message || "Suppression impossible", "error");
        }

    } catch (e) {
        Swal.fire("Erreur", "Une erreur est survenue", "error");
    }
};







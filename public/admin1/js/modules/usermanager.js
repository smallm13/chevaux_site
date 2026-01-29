class UserManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentUserId = null;
        this.initEvents();
        this.loadUsers();
    }

    initEvents() {
        // Recherche
        document.getElementById('user-search').addEventListener('input', (e) => {
            this.currentPage = 1;
            this.loadUsers(e.target.value);
        });

        // Modal
        document.querySelector('.modal-close').addEventListener('click', this.closeModal.bind(this));
        document.querySelector('.modal-cancel').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('confirm-role-change').addEventListener('click', this.updateUserRole.bind(this));
    }

    async loadUsers(search = '') {
        try {
            const response = await fetch(`/api/admin/users?page=${this.currentPage}&limit=${this.itemsPerPage}&search=${search}`);
            const data = await response.json();
            this.renderUsers(data.users);
            this.renderPagination(data.totalPages);
        } catch (error) {
            console.error("Erreur chargement utilisateurs:", error);
            showToast('Erreur lors du chargement', 'error');
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = users.map(user => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <i class="fas fa-user text-indigo-600"></i>
                        </div>
                        <div class="ml-4">
                            <div class="font-medium">${user.name}</div>
                            <div class="text-gray-500">Inscrit le ${new Date(user.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'editor' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'}">
                        ${this.formatRole(user.role)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="edit-role-btn text-indigo-600 hover:text-indigo-900 mr-3" 
                            data-id="${user.id}" 
                            data-name="${user.name}" 
                            data-role="${user.role}">
                        <i class="fas fa-user-edit"></i> Modifier
                    </button>
                </td>
            </tr>
        `).join('');

        // Ajout des événements aux boutons
        document.querySelectorAll('.edit-role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showRoleModal(
                    e.target.dataset.id, 
                    e.target.dataset.name, 
                    e.target.dataset.role
                );
            });
        });
    }

    showRoleModal(userId, userName, currentRole) {
        this.currentUserId = userId;
        document.getElementById('modal-username').value = userName;
        document.getElementById('current-role').value = this.formatRole(currentRole);
        document.getElementById('new-role').value = currentRole;
        document.getElementById('role-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('role-modal').classList.add('hidden');
    }

    async updateUserRole() {
        const newRole = document.getElementById('new-role').value;
        
        try {
            const response = await fetch(`/api/admin/users/${this.currentUserId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                this.loadUsers();
                this.closeModal();
                showToast('Rôle mis à jour avec succès', 'success');
            } else {
                throw new Error('Échec de la mise à jour');
            }
        } catch (error) {
            console.error("Erreur mise à jour rôle:", error);
            showToast('Erreur lors de la mise à jour', 'error');
        }
    }

    formatRole(role) {
        return {
            'admin': 'Administrateur',
            'editor': 'Éditeur',
            'user': 'Utilisateur'
        }[role] || role;
    }

    renderPagination(totalPages) {
        const paginationDiv = document.querySelector('.pagination-controls');
        paginationDiv.innerHTML = '';

        // Bouton Précédent
        if (this.currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50';
            prevBtn.innerHTML = '<i class="fas fa-chevron-left mr-1"></i> Précédent';
            prevBtn.addEventListener('click', () => {
                this.currentPage--;
                this.loadUsers();
            });
            paginationDiv.appendChild(prevBtn);
        }

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `px-3 py-1 border rounded-md ${this.currentPage === i ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.loadUsers();
            });
            paginationDiv.appendChild(pageBtn);
        }

        // Bouton Suivant
        if (this.currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50';
            nextBtn.innerHTML = 'Suivant <i class="fas fa-chevron-right ml-1"></i>';
            nextBtn.addEventListener('click', () => {
                this.currentPage++;
                this.loadUsers();
            });
            paginationDiv.appendChild(nextBtn);
        }

        // Info pagination
        document.querySelector('.pagination-info').textContent = 
            `Page ${this.currentPage} sur ${totalPages}`;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('users-section')) {
        new UserManager();
    }
});
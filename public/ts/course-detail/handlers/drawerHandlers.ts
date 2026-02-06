/**
 * Drawer Handlers - user drawer interactions
 */

import { Auth } from '../../modules/auth.js';
import { AppUI } from '../../utils/ui.js';
import { icon } from '../utils/dom.js';

export function setupDrawerHandlers(): void {
    const userDrawer = document.getElementById('user-drawer');
    const openDrawerBtn = document.getElementById('open-drawer-btn');
    const menuDrawerBtn = document.getElementById('menu-drawer-btn');
    const drawerOverlay = document.querySelector('.drawer-overlay');
    const drawerProfileToggle = document.getElementById('drawer-profile-toggle');
    const drawerProfilePanel = document.getElementById('drawer-profile-panel');
    const drawerManagementSection = document.getElementById('drawer-management-section');
    const drawerLogoutBtn = document.getElementById('drawer-logout');
    const drawerEditProfileBtn = document.getElementById('drawer-edit-profile');
    const drawerDeleteAccountBtn = document.getElementById('drawer-delete-account');
    const drawerCancelEditBtn = document.getElementById('drawer-cancel-edit');
    const drawerCategoriesToggle = document.getElementById('drawer-categories-toggle');
    const drawerCategoriesPanel = document.getElementById('drawer-categories-panel');

    function openDrawer() {
        updateDrawerUserInfo();
        userDrawer?.classList.add('show');
        document.body.classList.add('drawer-open');
        openDrawerBtn?.classList.add('hidden');
        drawerOverlay?.classList.add('show');

        if (menuDrawerBtn) {
            const iconEl = menuDrawerBtn.querySelector('.material-symbols-outlined');
            if (iconEl) iconEl.textContent = 'close';
        }
    }

    function closeDrawer() {
        userDrawer?.classList.remove('show');
        document.body.classList.remove('drawer-open');
        drawerOverlay?.classList.remove('show');

        const user = localStorage.getItem('auth_user');
        if (user && openDrawerBtn) {
            openDrawerBtn.classList.remove('hidden');
        }

        if (menuDrawerBtn) {
            const iconEl = menuDrawerBtn.querySelector('.material-symbols-outlined');
            if (iconEl) iconEl.textContent = 'menu';
        }
    }

    // Open Drawer Button
    if (openDrawerBtn && userDrawer) {
        openDrawerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDrawer();
        });
    }

    // Menu Button inside drawer - closes the drawer
    if (menuDrawerBtn && userDrawer) {
        menuDrawerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDrawer();
        });
    }

    // Close drawer when clicking on overlay
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeDrawer);
    }

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
        if (
            userDrawer?.classList.contains('show') &&
            !userDrawer.contains(e.target as Node) &&
            !openDrawerBtn?.contains(e.target as Node)
        ) {
            closeDrawer();
        }
    });

    // Profile accordion toggle
    if (drawerProfileToggle && drawerProfilePanel) {
        drawerProfileToggle.addEventListener('click', () => {
            drawerProfileToggle.classList.toggle('expanded');
            drawerProfilePanel.classList.toggle('expanded');
        });
    }

    // Drawer logout button
    if (drawerLogoutBtn) {
        drawerLogoutBtn.addEventListener('click', async () => {
            await Auth.logout();
            closeDrawer();
        });
    }

    // Drawer edit profile button
    if (drawerEditProfileBtn) {
        drawerEditProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const viewMode = document.getElementById('drawer-profile-view');
            const editMode = document.getElementById('drawer-profile-edit');

            if (viewMode && editMode) {
                viewMode.classList.add('hidden');
                editMode.classList.remove('hidden');

                const userStr = localStorage.getItem('auth_user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        const nameInput = document.getElementById('edit-name') as HTMLInputElement;
                        const emailInput = document.getElementById('edit-email') as HTMLInputElement;

                        if (nameInput) nameInput.value = user.name || '';
                        if (emailInput) emailInput.value = user.email || '';
                    } catch (e) {
                        console.error('Error parsing user', e);
                    }
                }
            }
        });
    }

    // Cancel edit button
    if (drawerCancelEditBtn) {
        drawerCancelEditBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const viewMode = document.getElementById('drawer-profile-view');
            const editMode = document.getElementById('drawer-profile-edit');

            if (viewMode && editMode) {
                editMode.classList.add('hidden');
                viewMode.classList.remove('hidden');
            }
        });
    }

    // Drawer delete account button
    if (drawerDeleteAccountBtn) {
        drawerDeleteAccountBtn.addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) {
                await Auth.deleteUserAccount();
                userDrawer?.classList.remove('show');
            }
        });
    }

    // Profile edit form submission
    const profileEditForm = document.getElementById('profile-edit-form');
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('edit-name') as HTMLInputElement;
            const emailInput = document.getElementById('edit-email') as HTMLInputElement;
            const passwordInput = document.getElementById('edit-password') as HTMLInputElement;

            const updateData: any = {};
            if (nameInput.value.trim()) updateData.name = nameInput.value.trim();
            if (emailInput.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value.trim())) {
                    AppUI.showMessage('Formato de e-mail inválido', 'error');
                    emailInput.focus();
                    return;
                }
                updateData.email = emailInput.value.trim();
            } else {
                AppUI.showMessage('O campo email é obrigatório', 'error');
                emailInput.focus();
                return;
            }
            if (passwordInput.value.trim()) updateData.password = passwordInput.value.trim();

            try {
                await Auth.updateUserProfile(updateData);

                const viewMode = document.getElementById('drawer-profile-view');
                const editMode = document.getElementById('drawer-profile-edit');
                if (viewMode && editMode) {
                    editMode.classList.add('hidden');
                    viewMode.classList.remove('hidden');
                }

                updateDrawerUserInfo();
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        });
    }

    // Drawer manage categories accordion
    if (drawerCategoriesToggle && drawerCategoriesPanel) {
        drawerCategoriesToggle.addEventListener('click', () => {
            drawerCategoriesToggle.classList.toggle('expanded');
            drawerCategoriesPanel.classList.toggle('expanded');
        });
    }

    // Update drawer when auth changes
    window.addEventListener('auth-login', updateDrawerUserInfo);

    window.addEventListener('auth-logout', () => {
        userDrawer?.classList.remove('show');
        drawerProfileToggle?.classList.remove('expanded');
        drawerProfilePanel?.classList.remove('expanded');
    });
}

export function updateDrawerUserInfo(): void {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return;

    try {
        const user = JSON.parse(userStr);
        const drawerName = document.getElementById('drawer-user-name');
        const drawerEmail = document.getElementById('drawer-user-email');
        const drawerRole = document.getElementById('drawer-user-role');
        const drawerManagementSection = document.getElementById('drawer-management-section');

        const userRole = (user.role || '').toLowerCase();

        if (drawerName) drawerName.textContent = user.name || 'Usuário';
        if (drawerEmail) drawerEmail.textContent = user.email || '';
        if (drawerRole) drawerRole.textContent = userRole === 'instructor' ? 'Professor' : 'Aluno';

        // Show management section for instructors
        if (drawerManagementSection) {
            if (userRole === 'instructor' || userRole === 'admin') {
                drawerManagementSection.classList.remove('hidden');
            } else {
                drawerManagementSection.classList.add('hidden');
            }
        }
    } catch (e) {
        console.error('Error parsing user data for drawer:', e);
    }
}

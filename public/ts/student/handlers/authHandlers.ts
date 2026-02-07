/**
 * Auth Handlers - Authentication and profile management
 */

import { AppUI } from '../../utils/ui.js';
import { Auth } from '../../modules/auth.js';
import { setCurrentUser, getCurrentUser } from '../state/studentState.js';
import { updateSidebarUser } from '../components/sidebar.js';
import { updateNavbarUser } from '../components/navbar.js';
import type { User } from '../state/studentState.js';

export async function checkUserSession(): Promise<User | null> {
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
        console.warn('No user session found, redirecting to home.');
        return null;
    }

    console.log('Student session detected:', user.name);
    return user;
}

export function updateUserInfo(user: User): void {
    const welcomeTitle = document.getElementById('welcome-title');

    if (welcomeTitle) {
        const firstName = user.name ? user.name.split(' ')[0] : 'Aluno';
        welcomeTitle.innerHTML = `Bem-vindo de volta, <span class="text-primary">${firstName}</span>!`;
    }

    updateSidebarUser(user.name || 'Aluno');
    updateNavbarUser(user.name || 'Aluno');
}

export function setupAuthHandlers(): void {
    const userInfoBtn = document.getElementById('user-info-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    const authContainer = document.getElementById('auth-card-container');

    // User dropdown toggle
    if (userInfoBtn && dropdownMenu) {
        userInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
            userInfoBtn.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (
                dropdownMenu.classList.contains('show') &&
                !dropdownMenu.contains(e.target as Node) &&
                !userInfoBtn.contains(e.target as Node)
            ) {
                dropdownMenu.classList.remove('show');
                userInfoBtn.classList.remove('open');
            }
        });
    }

    // Dropdown Profile button
    const dropdownProfile = document.getElementById('dropdown-profile');
    if (dropdownProfile && authContainer) {
        dropdownProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu?.classList.remove('show');
            userInfoBtn?.classList.remove('open');
            authContainer.classList.add('show');
            Auth.showProfileView();
        });
    }

    // Dropdown Logout button
    const dropdownLogout = document.getElementById('dropdown-logout');
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', async (e) => {
            e.stopPropagation();
            dropdownMenu?.classList.remove('show');
            userInfoBtn?.classList.remove('open');

            const confirmed = await AppUI.promptModal('Sair da Conta', 'Tem certeza que deseja sair agora?');
            if (confirmed) {
                await Auth.logout();
                window.location.href = '/inicio';
            }
        });
    }

    // Auth Card buttons
    document.getElementById('btn-close-auth')?.addEventListener('click', () => {
        authContainer?.classList.remove('show');
    });

    document.getElementById('btn-my-learning')?.addEventListener('click', () => {
        authContainer?.classList.remove('show');
        window.location.href = '/estudante';
    });

    document.getElementById('btn-instructor-dash')?.addEventListener('click', () => {
        window.location.href = '/professor';
    });

    document.getElementById('btn-view-profile')?.addEventListener('click', () => {
        Auth.showProfileView();
    });

    document.getElementById('btn-back-from-profile')?.addEventListener('click', () => {
        Auth.updateAuthUI();
    });

    document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
        Auth.showProfileEdit();
    });

    document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
        Auth.showProfileView();
    });

    document.getElementById('profile-edit-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (document.getElementById('edit-name') as HTMLInputElement).value;
        const email = (document.getElementById('edit-email') as HTMLInputElement).value;
        const password = (document.getElementById('edit-password') as HTMLInputElement).value;

        await Auth.updateUserProfile({ name, email, password });
    });

    document.getElementById('btn-delete-account')?.addEventListener('click', async () => {
        const deleted = await Auth.deleteUserAccount();
        if (deleted) {
            window.location.href = '/inicio';
        }
    });

    // Sidebar avatar button (home)
    const sidebarAvatarBtn = document.getElementById('sidebar-avatar-btn');
    if (sidebarAvatarBtn) {
        sidebarAvatarBtn.addEventListener('click', () => {
            window.location.href = '/inicio';
        });
    }

    // Initialize Auth UI
    Auth.updateAuthUI();
}

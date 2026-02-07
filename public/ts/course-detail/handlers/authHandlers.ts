/**
 * Auth Handlers - authentication and user menu
 */

import { Auth } from '../../modules/auth.js';
import { AppUI } from '../../utils/ui.js';
import { setUser, getUserFromStorage } from '../state/courseDetailState.js';

export function setupAuthHandlers(): void {
    const dropdownProfile = document.getElementById('dropdown-profile');
    const dropdownLogout = document.getElementById('dropdown-logout');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    const userInfoBtn = document.getElementById('user-info-btn');

    // Profile button
    if (dropdownProfile) {
        dropdownProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (dropdownMenu) dropdownMenu.classList.remove('show');
            if (userInfoBtn) userInfoBtn.classList.remove('open');
            AppUI.showMessage('Para acessar seu perfil, vá para a página inicial.', 'info');
        });
    }

    // Logout button
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dropdownMenu) dropdownMenu.classList.remove('show');
            if (userInfoBtn) userInfoBtn.classList.remove('open');
            Auth.logout();
        });
    }

    // Update visibility
    updateUserMenuVisibility();

    // Listen for auth changes
    window.addEventListener('auth-login', () => {
        updateUserMenuVisibility();
        setUser(getUserFromStorage());
    });

    window.addEventListener('auth-logout', () => {
        updateUserMenuVisibility();
        setUser(null);
    });
}

export function updateUserMenuVisibility(): void {
    const user = localStorage.getItem('auth_user');
    const avatarBtn = document.getElementById('user-avatar-btn');
    const userInfoBtn = document.getElementById('user-info-btn');
    const openDrawerBtn = document.getElementById('open-drawer-btn');

    // Show login button only when NOT logged in
    if (avatarBtn) {
        avatarBtn.classList.toggle('hidden', !!user);
    }

    // Show user info button only when logged in
    if (userInfoBtn) {
        userInfoBtn.classList.toggle('hidden', !user);

        if (user) {
            try {
                const userData = JSON.parse(user);
                const displayName = document.getElementById('user-display-name');
                if (displayName) {
                    const roleMap: { [key: string]: string } = {
                        INSTRUCTOR: 'Instrutor',
                        STUDENT: 'Estudante',
                        ADMIN: 'Admin',
                        instructor: 'Instrutor',
                        student: 'Estudante',
                        admin: 'Admin',
                    };
                    const role = userData.role || 'STUDENT';
                    displayName.textContent = roleMap[role] || 'Usuário';
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }

    // Show drawer button only when logged in
    if (openDrawerBtn) {
        openDrawerBtn.classList.toggle('hidden', !user);
    }
}

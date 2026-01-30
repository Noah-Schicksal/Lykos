/**
 * Auth Module
 */
import { AppUI } from '../utils/ui.js';

export const Auth = {
    login: async (email: string, password: string) => {
        try {
            const response = await AppUI.apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.data) {
                const { user, isAdmin } = response.data;
                localStorage.setItem('auth_user', JSON.stringify(user));

                // Check if user is ADMIN and redirect to admin dashboard
                if (isAdmin) {
                    AppUI.showMessage('Bem-vindo, Administrador!', 'success');
                    setTimeout(() => {
                        window.location.href = '/admin.html';
                    }, 1000);
                    return;
                }

                Auth.updateAuthUI();
                AppUI.showMessage('Login realizado com sucesso!', 'success');

                const authContainer = document.getElementById('auth-card-container');
                if (authContainer) authContainer.classList.remove('show');
            } else {
                throw new Error('Resposta de login inválida');
            }

        } catch (error: any) {
            AppUI.showMessage(error.message || 'Falha no login', 'error');
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        Auth.updateAuthUI();
        AppUI.showMessage('Você saiu da conta.', 'info');

        const authContainer = document.getElementById('auth-card-container');
        if (authContainer) authContainer.classList.remove('show');
    },

    getUserProfile: async () => {
        const userStr = localStorage.getItem('auth_user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user profile:', error);
            return null;
        }
    },

    updateAuthUI: () => {
        const userStr = localStorage.getItem('auth_user');
        const user = userStr ? JSON.parse(userStr) : null;

        const cardInner = document.getElementById('auth-card');
        const loginFace = cardInner?.querySelector('.auth-face:not(.auth-face-back):not(#auth-logged-in)') as HTMLElement;
        const loggedInFace = document.getElementById('auth-logged-in');
        const registerFace = cardInner?.querySelector('.auth-face-back') as HTMLElement;
        const userAvatarBtn = document.getElementById('user-avatar-btn');

        if (user && loggedInFace && loginFace && registerFace) {
            // LOGGED IN STATE
            loginFace.classList.add('hidden');
            registerFace.classList.add('hidden');
            loggedInFace.classList.remove('hidden');

            cardInner?.classList.remove('flipped');

            const nameDisplay = document.getElementById('user-name-display');
            const emailDisplay = document.getElementById('user-email-display');
            const roleBadge = document.getElementById('user-role-badge');

            const userRole = user.role ? user.role.toLowerCase() : '';

            if (nameDisplay) nameDisplay.textContent = user.name;
            if (emailDisplay) emailDisplay.textContent = user.email;
            if (roleBadge) {
                roleBadge.textContent = userRole === 'instructor' ? 'Instructor' : 'Student';
                roleBadge.className = `badge-tag ${userRole === 'instructor' ? 'bg-tag-primary' : 'bg-tag-secondary'}`;
                roleBadge.style.display = 'inline-block';
                roleBadge.style.marginBottom = '2rem';
            }

            const btnInstructor = document.getElementById('btn-instructor-dash');
            const btnCreateCourse = document.getElementById('btn-create-course');

            if (userRole === 'instructor') {
                if (btnInstructor) btnInstructor.classList.remove('hidden');
                if (btnCreateCourse) btnCreateCourse.classList.remove('hidden');
            } else {
                if (btnInstructor) btnInstructor.classList.add('hidden');
                if (btnCreateCourse) btnCreateCourse.classList.add('hidden');
            }

            if (userAvatarBtn) userAvatarBtn.style.borderColor = 'var(--primary)';

        } else if (loggedInFace && loginFace) {
            // GUEST STATE
            loginFace.classList.remove('hidden');
            loggedInFace.classList.add('hidden');
            if (registerFace) registerFace.classList.remove('hidden');

            if (userAvatarBtn) userAvatarBtn.style.borderColor = 'rgba(0, 245, 212, 0.5)';
        }
    }
};

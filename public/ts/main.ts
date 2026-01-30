/**
 * Main Application Script - Modular Structure
 */
import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';

// Expose UI to window for debugging or legacy scripts if needed
(window as any).ui = AppUI;
(window as any).auth = Auth;

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth Status immediately
    Auth.updateAuthUI();

    console.log('ChemAcademy App Initialized');

    // 1. Initialize Cart Badge
    if (AppUI.renderCartCount) AppUI.renderCartCount();

    // 2. Setup "Enroll" Button
    const enrollBtn = document.getElementById('enroll-featured');
    if (enrollBtn) {
        enrollBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const courseId = enrollBtn.getAttribute('data-course-id');
            if (!courseId) return;
            AppUI.showMessage('Feature de matrícula em breve!', 'info');
        });
    }

    // 3. Setup "Wishlist" Button
    const wishBtn = document.getElementById('wishlist-featured');
    if (wishBtn) {
        wishBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AppUI.showMessage('Adicionado à lista de desejos (simulado)', 'success');
        });
    }

    // 4. Auth Card Logic
    const avatarBtn = document.getElementById('user-avatar-btn');
    const authContainer = document.getElementById('auth-card-container');
    const cardInner = document.getElementById('auth-card');
    const btnToRegister = document.getElementById('btn-to-register');
    const btnToLogin = document.getElementById('btn-to-login');

    // Toggle Auth Card
    if (avatarBtn && authContainer) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            authContainer.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (authContainer.classList.contains('show') &&
                !authContainer.contains(e.target as Node) &&
                !avatarBtn.contains(e.target as Node)) {
                authContainer.classList.remove('show');
            }
        });
    }

    // Flip Logic
    if (btnToRegister && cardInner) {
        btnToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            cardInner.classList.add('flipped');
        });
    }

    if (btnToLogin && cardInner) {
        btnToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            cardInner.classList.remove('flipped');
        });
    }

    // Handle Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Use specific IDs we added to index.html
            const emailInput = document.getElementById('login-email') as HTMLInputElement;
            const passInput = document.getElementById('login-password') as HTMLInputElement;

            if (emailInput && passInput) {
                // Basic client-side validation
                if (!emailInput.value || !passInput.value) {
                    AppUI.showMessage('Por favor, preencha todos os campos.', 'error');
                    return;
                }
                Auth.login(emailInput.value, passInput.value);
            } else {
                AppUI.showMessage('Erro interno: Campos de login não encontrados.', 'error');
                console.error('Login inputs not found');
            }
        });
    }

    // Handle Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }

    // Handle Register
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('register-name') as HTMLInputElement;
            const emailInput = document.getElementById('register-email') as HTMLInputElement;
            const passInput = document.getElementById('register-password') as HTMLInputElement;
            const confirmInput = document.getElementById('register-confirm') as HTMLInputElement;
            const roleSelect = document.getElementById('register-role') as HTMLSelectElement;

            const name = nameInput.value;
            const email = emailInput.value;
            const password = passInput.value;
            const confirmPass = confirmInput.value;
            const role = roleSelect.value; // 'student' or 'instructor'

            if (password !== confirmPass) {
                AppUI.showMessage('Senhas não conferem!', 'error');
                return;
            }

            try {
                // Determine endpoint based on role
                const endpoint = role === 'instructor' ? '/auth/register/instructor' : '/auth/register/student';

                await AppUI.apiFetch(endpoint, {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });

                AppUI.showMessage('Conta criada com sucesso! Faça login.', 'success');

                // Reset form
                (registerForm as HTMLFormElement).reset();

                // Flip back to login
                if (cardInner) cardInner.classList.remove('flipped');

            } catch (error: any) {
                AppUI.showMessage(error.message || 'Erro ao criar conta', 'error');
            }
        });
    }
});
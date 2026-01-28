/**
 * Main Application Script - Monolithic Structure
 */

// Define UI Helper Interface
interface UIHelper {
    renderCartCount: () => void;
    apiFetch: (url: string, options?: RequestInit) => Promise<any>;
    showMessage: (msg: string, type: 'success' | 'error' | 'info') => void;
    promptModal: (title: string, msg: string) => Promise<boolean>;
}

// Implement UI Helper locally since we are simpler now
const AppUI: UIHelper = {
    renderCartCount: () => {
        const badge = document.getElementById('cart-count-badge');
        if (!badge) return;

        // Simulating cart count check
        const count = 0; // Replace with actual logic if needed
        badge.textContent = count.toString();
        badge.style.display = count > 0 ? 'flex' : 'none';
    },

    apiFetch: async (url: string, options: RequestInit = {}) => {
        console.log(`[Mock Fetch] ${url}`, options);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 500));

        // Return mock success
        return { ok: true };
    },

    showMessage: (msg: string, type: 'success' | 'error' | 'info') => {
        // Simple alert/log for now as per instructions to keep IT simple
        console.log(`[${type.toUpperCase()}] ${msg}`);
        alert(msg);
    },

    promptModal: async (title: string, msg: string) => {
        return confirm(`${title}\n\n${msg}`);
    }
};

// Expose to window for inline scripts if necessary, though we try to contain logic here
(window as any).ui = AppUI;

// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('ChemAcademy App Initialized');

    // 1. Initialize Cart Badge
    if (AppUI.renderCartCount) AppUI.renderCartCount();

    // 2. Setup "Enroll" Button for Featured Course
    const enrollBtn = document.getElementById('enroll-featured');
    if (enrollBtn) {
        enrollBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const courseId = enrollBtn.getAttribute('data-course-id');
            if (!courseId) return;

            try {
                // Simulate Auth Check (Assume logged in for demo, or fail)
                const isAuthenticated = true; // Toggle this to test auth flow

                if (!isAuthenticated) {
                    AppUI.showMessage('Faça login para inscrever-se', 'info');
                    const shouldLogin = await AppUI.promptModal('Entrar', 'Deseja ir para a página de login?');
                    if (shouldLogin) {
                        window.location.href = '/login.html'; // Example redirect
                    }
                    return;
                }

                // Proceed with enrollment
                await AppUI.apiFetch(`/students/${encodeURIComponent(courseId)}/enroll`, { method: 'POST' });

                AppUI.showMessage('Inscrito com sucesso', 'success');
                // Update cart/state
                if (AppUI.renderCartCount) AppUI.renderCartCount();

            } catch (err: any) {
                console.error('Enroll error', err);
                AppUI.showMessage('Erro ao inscrever: ' + (err?.message || 'Erro desconhecido'), 'error');
            }
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

    // 4. Mobile Menu Toggle (missing in original script but useful)
    // Looking for a mobile menu button in HTML?
    // <button class="hidden md:flex...">Explore</button> in nav.
    // There isn't an explicit hamburger menu in the provided index.html example code 
    // for mobile, but there is a responsive layout.
    // 4. Auth Card Logic
    const avatarBtn = document.getElementById('user-avatar-btn');
    const authContainer = document.getElementById('auth-card-container');
    const cardInner = document.getElementById('auth-card');
    const btnToRegister = document.getElementById('btn-to-register');
    const btnToLogin = document.getElementById('btn-to-login');

    // Toggle Auth Card Visibility
    if (avatarBtn && authContainer) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent closing immediately
            authContainer.classList.toggle('show');
        });

        // Close when clicking outside
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

    // Handle Forms (Prevent default for demo)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            AppUI.showMessage('Login simulado com sucesso!', 'success');
            if (authContainer) authContainer.classList.remove('show');
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            AppUI.showMessage('Cadastro simulado com sucesso!', 'success');
            if (authContainer) authContainer.classList.remove('show');
        });
    }
});

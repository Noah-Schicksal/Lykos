/**
 * Main Application Script - Monolithic Structure
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Implement UI Helper locally
const AppUI = {
    renderCartCount: () => {
        const badge = document.getElementById('cart-count-badge');
        if (!badge)
            return;
        const count = 0;
        badge.textContent = count.toString();
        badge.style.display = count > 0 ? 'flex' : 'none';
    },
    apiFetch: (url_1, ...args_1) => __awaiter(this, [url_1, ...args_1], void 0, function* (url, options = {}) {
        console.log(`[API] ${url}`, options);
        const headers = Object.assign({ 'Content-Type': 'application/json' }, (options.headers || {}));
        try {
            const response = yield fetch(url, Object.assign(Object.assign({}, options), { headers }));
            const data = yield response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Erro na requisição');
            }
            return data;
        }
        catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }),
    showMessage: (msg, type) => {
        // 1. Get or Create Container
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        // 2. Create Toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        // Icon map
        const icons = {
            success: 'check_circle',
            error: 'error',
            info: 'info'
        };
        toast.innerHTML = `
            <span class="material-symbols-outlined toast-icon">${icons[type] || 'info'}</span>
            <span>${msg}</span>
        `;
        // 3. Append
        container.appendChild(toast);
        // 4. Auto Remove
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000); // 3 seconds
    },
    promptModal: (title, msg) => __awaiter(this, void 0, void 0, function* () {
        return confirm(`${title}\n\n${msg}`);
    })
};
window.ui = AppUI;
document.addEventListener('DOMContentLoaded', () => {
    console.log('ChemAcademy App Initialized');
    // 1. Initialize Cart Badge
    if (AppUI.renderCartCount)
        AppUI.renderCartCount();
    // 2. Setup "Enroll" Button
    const enrollBtn = document.getElementById('enroll-featured');
    if (enrollBtn) {
        enrollBtn.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const courseId = enrollBtn.getAttribute('data-course-id');
            if (!courseId)
                return;
            AppUI.showMessage('Feature de matrícula em breve!', 'info');
        }));
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
            // Check session state when opening
            const data = localStorage.getItem('userData');
            if (data) {
                updateAuthUI(JSON.parse(data));
            }
            else {
                updateAuthUI(null);
            }
        });
        document.addEventListener('click', (e) => {
            if (authContainer.classList.contains('show') &&
                !authContainer.contains(e.target) &&
                !avatarBtn.contains(e.target)) {
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
    // --- AUTH STATE MANAGEMENT ---
    const updateAuthUI = (user) => {
        const authCard = document.getElementById('auth-card');
        const authProfile = document.getElementById('auth-profile');
        if (!authCard || !authProfile)
            return;
        if (user) {
            // SHOW PROFILE
            authCard.style.display = 'none';
            authProfile.style.display = 'block';
            // Populate Data
            const nameEl = document.getElementById('profile-name');
            const emailEl = document.getElementById('profile-email');
            const roleEl = document.getElementById('profile-role-badge');
            if (nameEl)
                nameEl.textContent = user.name;
            if (emailEl)
                emailEl.textContent = user.email;
            if (roleEl) {
                roleEl.textContent = user.role;
                // Adjust badge color
                if (user.role === 'INSTRUCTOR') {
                    roleEl.className = 'badge-tag bg-tag-secondary';
                }
                else {
                    roleEl.className = 'badge-tag bg-tag-primary';
                }
            }
        }
        else {
            // SHOW LOGIN/REGISTER
            authCard.style.display = 'block';
            authProfile.style.display = 'none';
        }
    };
    // Check Session on Load
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            updateAuthUI(user);
        }
        catch (e) {
            localStorage.removeItem('userData');
        }
    }
    // Handle Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            e.preventDefault();
            // Simple selector for fields
            const emailInput = document.getElementById('login-email');
            const passInput = document.getElementById('login-password');
            const email = (_a = emailInput === null || emailInput === void 0 ? void 0 : emailInput.value) === null || _a === void 0 ? void 0 : _a.trim();
            const password = (_b = passInput === null || passInput === void 0 ? void 0 : passInput.value) === null || _b === void 0 ? void 0 : _b.trim();
            console.log('Attempting login with:', email, 'Checking password length:', password === null || password === void 0 ? void 0 : password.length);
            if (!email || !password) {
                AppUI.showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }
            try {
                const response = yield AppUI.apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                if (response.data && response.data.token) {
                    const { user, token } = response.data;
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userData', JSON.stringify(user));
                    AppUI.showMessage(`Welcome back, ${user.name}!`, 'success');
                    updateAuthUI(user);
                    loginForm.reset();
                    const authContainer = document.getElementById('auth-card-container');
                    if (authContainer)
                        authContainer.classList.remove('show');
                }
            }
            catch (error) {
                AppUI.showMessage(error.message || 'Login failed', 'error');
            }
        }));
    }
    // Handle Register
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const nameInput = document.getElementById('register-name');
            const emailInput = document.getElementById('register-email');
            const passInput = document.getElementById('register-password');
            const confirmInput = document.getElementById('register-confirm');
            const roleSelect = document.getElementById('register-role');
            const name = nameInput.value;
            const email = emailInput.value;
            const password = passInput.value;
            const confirmPass = confirmInput.value;
            const role = roleSelect.value;
            if (password !== confirmPass) {
                AppUI.showMessage('Senhas não conferem!', 'error');
                return;
            }
            try {
                const endpoint = role === 'instructor' ? '/auth/register/instructor' : '/auth/register/student';
                yield AppUI.apiFetch(endpoint, {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });
                AppUI.showMessage('Account created! Please log in.', 'success');
                registerForm.reset();
                if (cardInner)
                    cardInner.classList.remove('flipped');
            }
            catch (error) {
                AppUI.showMessage(error.message || 'Error creating account', 'error');
            }
        }));
    }
    // Handle Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            updateAuthUI(null);
            AppUI.showMessage('You have logged out.', 'info');
        });
    }
});

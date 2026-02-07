/**
 * Main entry point for course-detail page
 * Orchestrates components, handlers, state, and data loading
 */

import { Auth } from '../modules/auth.js';
import { Courses, Course } from '../modules/courses.js';
import { Modules, Module } from '../modules/modules.js';
import { Cart } from '../modules/cart.js';
import { AppUI } from '../utils/ui.js';
import { initThemeToggle } from '../theme-toggle.js';

// Components
import { renderNavbar, setupNavbarHandlers } from './components/navbar.js';
import { renderCourseHeader, populateCourseHeader } from './components/courseHeader.js';
import { renderLearningOutcomes, populateLearningOutcomes } from './components/learningOutcomes.js';
import { renderModulesAccordion, populateModulesAccordion } from './components/modulesAccordion.js';
import { renderReviewsSection } from './components/reviewsSection.js';
import { renderSidebar, populateSidebar } from './components/sidebar.js';
import { renderUserDrawer, renderDrawerOverlay } from './components/userDrawer.js';
import { renderCartSidebar } from './components/cartSidebar.js';
import { renderFooter } from './components/footer.js';

// Handlers
import { setupAuthHandlers, updateUserMenuVisibility } from './handlers/authHandlers.js';
import { setupDrawerHandlers } from './handlers/drawerHandlers.js';
import { setupCartHandlers } from './handlers/cartHandlers.js';
import { loadReviews, setupReviewForm } from './handlers/reviewHandlers.js';
import { setupActionButtons, setupShareButton, checkIfUserIsCreator } from './handlers/actionHandlers.js';
import { setupModuleHandlers } from './handlers/moduleHandlers.js';

// State
import { setCourse, setCourseId, setUser, getUserFromStorage } from './state/courseDetailState.js';

import { el, clearChildren } from './utils/dom.js';

/**
 * Get course ID from URL
 */
function getCourseIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Render the full page layout
 */
function renderLayout(): void {
    const root = document.getElementById('app-root');
    if (!root) {
        console.error('app-root element not found');
        return;
    }

    clearChildren(root);

    // Navbar
    root.appendChild(renderNavbar());

    // Main container (matches original structure)
    const mainContainer = el('main', { className: 'course-detail-container' },
        el('div', { className: 'course-detail-layout' },
            // Main content column
            el('div', { className: 'course-main-content' },
                renderCourseHeader(),
                renderLearningOutcomes(),
                renderModulesAccordion(),
                renderReviewsSection()
            ),
            // Sidebar
            renderSidebar()
        )
    );
    root.appendChild(mainContainer);

    // Footer
    root.appendChild(renderFooter());

    // Drawer overlay
    root.appendChild(renderDrawerOverlay());

    // User Drawer
    root.appendChild(renderUserDrawer());

    // Cart Sidebar
    root.appendChild(renderCartSidebar());

    // Auth Card Container (for login dropdown)
    root.appendChild(renderAuthCard());
}

/**
 * Render auth card container (minimal, Auth module handles most of it)
 */
function renderAuthCard(): HTMLElement {
    return el('div', { id: 'auth-card-container', className: 'auth-container' },
        el('div', { className: 'auth-card course-detail-auth-card' },
            el('div', { className: 'auth-tabs' },
                el('button', { className: 'auth-tab active', 'data-tab': 'login' }, 'Entrar'),
                el('button', { className: 'auth-tab', 'data-tab': 'register' }, 'Criar Conta')
            ),

            // Login Form
            el('form', { id: 'login-form', className: 'auth-form' },
                el('div', { className: 'form-group' },
                    el('label', { className: 'form-label' }, 'Email'),
                    (() => {
                        const input = document.createElement('input');
                        input.type = 'email';
                        input.id = 'login-email';
                        input.className = 'form-input';
                        input.required = true;
                        input.placeholder = 'seu@email.com';
                        return input;
                    })()
                ),
                el('div', { className: 'form-group' },
                    el('label', { className: 'form-label' }, 'Senha'),
                    (() => {
                        const input = document.createElement('input');
                        input.type = 'password';
                        input.id = 'login-password';
                        input.className = 'form-input';
                        input.required = true;
                        input.placeholder = '••••••••';
                        return input;
                    })()
                ),
                el('button', { type: 'submit', className: 'btn-primary full-width' }, 'Entrar')
            ),

            // Register Form
            el('form', { id: 'register-form', className: 'auth-form hidden' },
                el('div', { className: 'form-group' },
                    el('label', { className: 'form-label' }, 'Nome'),
                    (() => {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.id = 'register-name';
                        input.className = 'form-input';
                        input.required = true;
                        input.placeholder = 'Seu nome completo';
                        return input;
                    })()
                ),
                el('div', { className: 'form-group' },
                    el('label', { className: 'form-label' }, 'Email'),
                    (() => {
                        const input = document.createElement('input');
                        input.type = 'email';
                        input.id = 'register-email';
                        input.className = 'form-input';
                        input.required = true;
                        input.placeholder = 'seu@email.com';
                        return input;
                    })()
                ),
                el('div', { className: 'form-group' },
                    el('label', { className: 'form-label' }, 'Senha'),
                    (() => {
                        const input = document.createElement('input');
                        input.type = 'password';
                        input.id = 'register-password';
                        input.className = 'form-input';
                        input.required = true;
                        input.placeholder = '••••••••';
                        return input;
                    })()
                ),
                el('div', { className: 'form-group' },
                    el('label', { className: 'form-label' }, 'Você é'),
                    (() => {
                        const select = document.createElement('select');
                        select.id = 'register-role';
                        select.className = 'form-input';
                        select.innerHTML = `
              <option value="student">Estudante</option>
              <option value="instructor">Professor</option>
            `;
                        return select;
                    })()
                ),
                el('button', { type: 'submit', className: 'btn-primary full-width' }, 'Criar Conta')
            )
        )
    );
}

/**
 * Load course data and modules
 */
async function loadCourseData(courseId: string): Promise<Course | null> {
    try {
        const [course, modules] = await Promise.all([
            Courses.getById(courseId),
            Modules.getByCourse(courseId)
        ]);

        // Update state
        setCourse(course);
        setCourseId(courseId);

        // Populate components
        populateCourseHeader(course);
        populateLearningOutcomes(course.description || '');
        populateModulesAccordion(modules);
        populateSidebar(course);

        // Check user status for action buttons
        checkIfUserIsCreator(course);

        return course;
    } catch (error) {
        console.error('Error loading course data:', error);
        AppUI.showMessage('Erro ao carregar dados do curso.', 'error');
        return null;
    }
}

/**
 * Initialize page
 */
async function init(): Promise<void> {
    // Get course ID from URL
    const courseId = getCourseIdFromUrl();
    if (!courseId) {
        AppUI.showMessage('ID do curso não especificado.', 'error');
        setTimeout(() => {
            window.location.href = '/inicio';
        }, 2000);
        return;
    }

    // Set initial state
    setUser(getUserFromStorage());

    // Render layout
    renderLayout();

    // Initialize theme toggle
    initThemeToggle();

    // Initialize auth
    await Auth.init();

    // Update user menu visibility
    updateUserMenuVisibility();

    // Update cart badge
    Cart.updateBadge();

    // Setup handlers
    setupNavbarHandlers();
    setupAuthHandlers();
    setupDrawerHandlers();
    setupCartHandlers();
    setupModuleHandlers();

    // Load course data
    const course = await loadCourseData(courseId);
    if (!course) return;

    // Setup action buttons
    setupActionButtons(courseId);
    setupShareButton();

    // Load reviews
    await loadReviews(courseId);

    // Setup review form if enrolled
    setupReviewForm(courseId, course.isEnrolled ?? false);

    // Setup auth card tabs
    setupAuthCardTabs();
}

/**
 * Setup auth card tab switching
 */
function setupAuthCardTabs(): void {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = (tab as HTMLElement).dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tabName === 'login') {
                loginForm?.classList.remove('hidden');
                registerForm?.classList.add('hidden');
            } else {
                loginForm?.classList.add('hidden');
                registerForm?.classList.remove('hidden');
            }
        });
    });

    // Setup form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = (document.getElementById('login-email') as HTMLInputElement).value;
            const password = (document.getElementById('login-password') as HTMLInputElement).value;

            try {
                await Auth.login(email, password);
                document.getElementById('auth-card-container')?.classList.remove('show');
                // Location reload is handled by Auth.login for redirects
            } catch (error) {
                // Error is already shown by Auth.login
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = (document.getElementById('register-name') as HTMLInputElement).value;
            const email = (document.getElementById('register-email') as HTMLInputElement).value;
            const password = (document.getElementById('register-password') as HTMLInputElement).value;
            const role = (document.getElementById('register-role') as HTMLSelectElement).value;

            try {
                await AppUI.apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, role })
                });
                AppUI.showMessage('Conta criada com sucesso! Faça login.', 'success');
                // Switch to login tab
                const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                if (loginTab) (loginTab as HTMLElement).click();
            } catch (error: any) {
                AppUI.showMessage(error.message || 'Erro ao criar conta', 'error');
            }
        });
    }

    // Close on outside click
    const authContainer = document.getElementById('auth-card-container');
    if (authContainer) {
        authContainer.addEventListener('click', (e) => {
            if (e.target === authContainer) {
                authContainer.classList.remove('show');
            }
        });
    }
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);

/**
 * Student Dashboard - Main Entry Point
 * Orchestrates all components and handlers
 */

import { AppUI } from '../utils/ui.js';
import { Auth } from '../modules/auth.js';
import { Cart } from '../modules/cart.js';
import { initThemeToggle } from '../theme-toggle.js';
import { el } from './utils/dom.js';

import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';
import { renderCoursesView, updateCoursesList } from './components/coursesView.js';
import { renderCertificatesView } from './components/certificatesView.js';
import { renderCartSidebar } from './components/cartSidebar.js';
import { renderCertificateModal } from './components/certificateModal.js';
import { renderAuthCard } from './components/authCard.js';

import { setupAuthHandlers, checkUserSession, updateUserInfo } from './handlers/authHandlers.js';
import { setupViewHandlers, loadCategories } from './handlers/viewHandlers.js';
import { setupCartHandlers } from './handlers/cartHandlers.js';
import { setupCertificateHandlers } from './handlers/certificateHandlers.js';

import { setCurrentUser, setAllCourses } from './state/studentState.js';

async function init(): Promise<void> {
    try {
        // 1. Initialize Auth
        await Auth.init();

        // 2. Check User Session
        const user = await checkUserSession();
        if (!user) {
            window.location.href = '/inicio';
            return;
        }
        setCurrentUser(user);

        // 3. Render Dashboard Layout
        renderDashboardLayout();

        // 4. Initialize Theme Toggle
        initThemeToggle();

        // 5. Load Categories
        await loadCategories();

        // 6. Load Student Courses
        await loadStudentCourses();

        // 7. Setup All Handlers
        setupAuthHandlers();
        setupViewHandlers();
        setupCartHandlers();
        setupCertificateHandlers();
        setupSidebarToggle();

        // 8. Update User Info in UI
        updateUserInfo(user);

        // 9. Initialize Cart Badge
        Cart.updateBadge();

    } catch (error) {
        console.error('Initialization error:', error);
    }
}

function renderDashboardLayout(): void {
    const root = document.getElementById('app-root');
    if (!root) return;

    root.innerHTML = '';

    const dashboardContainer = el('div', { className: 'student-dashboard' },
        renderSidebar(),
        el('main', { className: 'main-content' },
            el('header', { className: 'top-header' },
                el('div', { className: 'breadcrumb-header' },
                    el('nav', { className: 'breadcrumb' },
                        el('a', { href: '/inicio', className: 'breadcrumb-link' }, 'Início'),
                        el('span', { className: 'breadcrumb-separator' }, '/'),
                        el('span', { id: 'breadcrumb-current', className: 'breadcrumb-current' }, 'Meus Cursos')
                    )
                ),
                renderNavbar()
            ),
            el('section', { className: 'page-heading' },
                el('h1', { id: 'welcome-title', className: 'page-title' }, 'Bem-vindo!'),
                el('p', { id: 'courses-status', className: 'page-subtitle' }, 'Carregando seus cursos...')
            ),
            renderCoursesView(),
            renderCertificatesView()
        )
    );

    root.appendChild(dashboardContainer);
    root.appendChild(renderAuthCard());
    root.appendChild(renderCartSidebar());
    root.appendChild(renderCertificateModal());
    root.appendChild(el('div', { className: 'drawer-overlay' }));
}

async function loadStudentCourses(): Promise<void> {
    const status = document.getElementById('courses-status');
    try {
        const response = await AppUI.apiFetch('/my-courses');
        const courses = response?.data || [];

        if (status) {
            status.innerHTML = `Você tem <span class="text-primary font-bold">${courses.length} cursos</span> ativos em andamento.`;
        }

        setAllCourses(courses);
        updateCoursesList(courses);
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        const grid = document.getElementById('courses-grid');
        if (grid) {
            grid.innerHTML = `
        <div class="col-span-full py-10 text-center">
          <p class="text-error mb-4">Erro ao carregar seus cursos.</p>
          <button onclick="window.location.reload()" class="btn-auth-submit" style="width: auto; padding: 0.5rem 1rem">Tentar Novamente</button>
        </div>
      `;
        }
    }
}

function setupSidebarToggle(): void {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContent = document.querySelector('.main-content');

    if (sidebar && toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            const isMobile = window.innerWidth < 1024;

            if (isMobile) {
                sidebar.classList.toggle('active');
            } else {
                sidebar.classList.toggle('collapsed');
                mainContent?.classList.toggle('sidebar-collapsed');
            }

            toggleBtn.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (sidebar.classList.contains('active') &&
                !sidebar.contains(target) &&
                !toggleBtn.contains(target)) {
                sidebar.classList.remove('active');
                toggleBtn.classList.remove('open');
            }
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

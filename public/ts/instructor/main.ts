import { AppUI } from '../utils/ui.js';
import { Auth } from '../modules/auth.js';
import { Courses } from '../modules/courses.js';
import { Modules } from '../modules/modules.js';
import { Classes } from '../modules/classes.js';
import { Categories } from '../modules/categories.js';
import { initThemeToggle } from '../theme-toggle.js';
import { el, clearChildren } from './utils/dom.js';

import { renderNavbar, setupNavbarHandlers } from './components/navbar.js';
import { renderAuthCard } from './components/authCard.js';
import { renderSidebar } from './components/sidebar.js';
import { renderModals } from './components/modals.js';
import { renderEmptyState } from './components/emptyState.js';

import { setupAuthHandlers } from './handlers/authHandlers.js';
import { setupCategoryHandlers, populateCategories } from './handlers/categoryHandlers.js';
import { setupCourseHandlers, loadCoursesInSidebar, selectCourse } from './handlers/courseHandlers.js';
import { setupContentHandlers, setupContentToggle } from './handlers/contentHandlers.js';

import {
  setAllCategories,
  setCurrentUser,
  getAllCategories,
} from './state/instructorState.js';

declare global {
  interface Window {
    AppUI: typeof AppUI;
    Auth: typeof Auth;
    Courses: typeof Courses;
    Modules: typeof Modules;
    Classes: typeof Classes;
    Categories: typeof Categories;
  }
}

window.AppUI = AppUI;
window.Auth = Auth;
window.Courses = Courses;
window.Modules = Modules;
window.Classes = Classes;
window.Categories = Categories;

async function init(): Promise<void> {
  try {
    await Auth.init();
    await checkAuth();

    renderDashboardLayout();

    initThemeToggle();

    await loadCategories();

    await loadCoursesInSidebar();

    setupNavbarHandlers();
    setupAuthHandlers();
    setupCategoryHandlers();
    setupCourseHandlers();
    setupContentHandlers();

    setupCategoryChangeListener();

    setupSidebarToggle();
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

async function checkAuth(): Promise<void> {
  try {
    const user = await Auth.getUserProfile();

    if (!user) {
      AppUI.showMessage(
        'Por favor, faça login para acessar o dashboard de instrutor',
        'error',
      );
      setTimeout(() => {
        window.location.href = '/inicio';
      }, 2000);
      return;
    }

    if (user.role !== 'INSTRUCTOR') {
      AppUI.showMessage('Acesso negado. É necessário ser instrutor.', 'error');
      setTimeout(() => {
        window.location.href = '/inicio';
      }, 2000);
      return;
    }

    setCurrentUser(user);
  } catch (error: any) {
    // Only show generic error if it wasn't a session expiration (which handles its own toast)
    if (error.message !== 'Sua sessão expirou. Faça login novamente.') {
      AppUI.showMessage(
        'Erro ao verificar autenticação. Redirecionando...',
        'error',
      );
    }
    setTimeout(() => {
      window.location.href = '/inicio';
    }, 2000);
  }
}

function renderDashboardLayout(): void {
  const appRoot = document.getElementById('app-root');
  if (!appRoot) return;

  clearChildren(appRoot);

  appRoot.appendChild(renderNavbar());

  appRoot.appendChild(renderAuthCard());

  const main = el('main', { className: 'dashboard-wrapper' },
    renderSidebar(),
    el('section', { id: 'dashboard-content', className: 'dashboard-main' },
      renderEmptyState()
    )
  );

  appRoot.appendChild(main);

  appRoot.appendChild(renderModals());
}

async function loadCategories(): Promise<void> {
  try {
    const categories = await Categories.getAll();
    setAllCategories(categories);
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

function setupCategoryChangeListener(): void {
  window.addEventListener('categories-changed', async () => {
    await loadCategories();

    document.querySelectorAll('#course-category').forEach((el) => {
      const select = el as HTMLSelectElement;
      const currentSelectedId =
        (select as any)._pendingSelectedId || select.value;
      populateCategories(select, currentSelectedId);
      delete (select as any)._pendingSelectedId;
    });
  });
}

function setupSidebarToggle(): void {
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const sidebar = document.getElementById('instructor-sidebar');

  if (btnToggleSidebar && sidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');

      const iconSpan = btnToggleSidebar.querySelector('.material-symbols-outlined');
      if (iconSpan) {
        if (isCollapsed) {
          // Sidebar is now collapsed -> Show icon to expand (arrow right)
          iconSpan.textContent = 'keyboard_double_arrow_right';
          btnToggleSidebar.classList.remove('active');
        } else {
          // Sidebar is now expanded -> Show icon to collapse (arrow left)
          iconSpan.textContent = 'keyboard_double_arrow_left';
          btnToggleSidebar.classList.add('active');
        }
      }
    });

    // Initialize icon based on current state
    if (sidebar.classList.contains('collapsed')) {
      const iconSpan = btnToggleSidebar.querySelector('.material-symbols-outlined');
      if (iconSpan) iconSpan.textContent = 'keyboard_double_arrow_right';
    } else {
      const iconSpan = btnToggleSidebar.querySelector('.material-symbols-outlined');
      if (iconSpan) iconSpan.textContent = 'keyboard_double_arrow_left';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

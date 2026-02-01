/**
 * Student Dashboard Script
 * Handles dynamic loading of student information and courses
 */
import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';
import { Categories } from './modules/categories.js';
import { initThemeToggle } from './theme-toggle.js';

let allCourses: any[] = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
        // Redirect to home page if not logged in
        console.warn('No user session found, redirecting to home.');
        window.location.href = 'index.html';
        return;
    }

    initThemeToggle();
    console.log('Student session detected:', user.name);

    // Update user info in the header
    updateUserInfo(user);

    // Setup sidebar navigation
    setupNavigation();

    // Setup Search and Categories
    loadCategories();
    setupSearch();

    // Load dynamic courses
    await loadStudentCourses();
});

/**
 * Updates the user information displayed in the header
 */
function updateUserInfo(user: any) {
    const headerName = document.getElementById('header-user-name');
    const roleText = document.getElementById('header-user-role');
    const welcomeTitle = document.getElementById('welcome-title');
    const coursesStatus = document.getElementById('courses-status');
    const sidebarUserName = document.getElementById('sidebar-user-name');

    if (headerName) {
        headerName.textContent = user.name || 'Aluno';
    }

    if (roleText) {
        const userRole = (user.role || 'STUDENT').toUpperCase();
        roleText.textContent = userRole === 'INSTRUCTOR' ? 'Instrutor' : 'Aluno';
    }

    if (welcomeTitle) {
        const firstName = user.name ? user.name.split(' ')[0] : 'Aluno';
        welcomeTitle.innerHTML = `Olá, <span class="text-primary">${firstName}</span>!`;
    }

    if (coursesStatus) {
        coursesStatus.innerHTML = `Carregando seus cursos...`;
    }

    // Update sidebar user card
    if (sidebarUserName) {
        sidebarUserName.textContent = user.name || 'Aluno';
    }
}

/**
 * Fetches courses from API
 */
async function loadStudentCourses() {
    const status = document.getElementById('courses-status');
    try {
        const response = await AppUI.apiFetch('/my-courses');
        allCourses = response?.data || [];

        if (status) {
            status.innerHTML = `Você tem <span class="text-primary font-bold">${allCourses.length} cursos</span> ativos em andamento.`;
        }

        renderCourses(allCourses);
        setupCourseCardListeners();
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

/**
 * Renders the featured course at the top
 */
/**
 * Renders course cards to the grid
 */
function renderCourses(courses: any[]) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    if (courses.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center bg-surface-dark border border-white/5 rounded-xl">
                <span class="material-symbols-outlined text-6xl text-slate-700 mb-4">school</span>
                <p class="text-slate-500 text-lg">Nenhum curso encontrado.</p>
                <a href="index.html" class="text-primary hover:underline mt-4 inline-block font-bold">Explorar Catálogo de Cursos</a>
            </div>
        `;
        return;
    }

    grid.innerHTML = courses.map((course: any) => {
        const progress = course.progress || 0;
        const icon = course.category && course.category.toLowerCase().includes('code') ? 'code' : 'school';
        const hasCoverImage = course.coverImageUrl && course.coverImageUrl.trim() !== '';

        return `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-cover ${!hasCoverImage ? 'no-image' : ''}">
                    ${hasCoverImage
                ? `<img src="${course.coverImageUrl}" alt="${course.title}" class="course-cover-img" />`
                : `<div class="course-cover-placeholder">
                             <span class="material-symbols-outlined">${icon}</span>
                           </div>`
            }
                    <span class="course-badge ${progress === 100 ? 'completed' : ''}">
                        ${progress === 100 ? 'Concluído' : 'Em Andamento'}
                    </span>
                </div>
                <div class="course-body">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-meta">${course.instructorName || 'Lykos Instructor'}</p>
                    <div class="course-progress">
                        <div class="progress-bar-small">
                            <div class="progress-fill-small ${progress === 100 ? 'completed' : ''}" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-info ${progress === 100 ? 'completed' : ''}">
                            <span>PROGRESSO</span>
                            <span class="progress-value">${progress}%</span>
                        </div>
                    </div>
                    <div class="course-footer">
                        <button class="btn-resume-course small" data-course-id="${course.id}">Continuar Estudando</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Setup event listeners for course cards
function setupCourseCardListeners() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    // Handle card clicks (excluding button clicks)
    const cards = grid.querySelectorAll('.course-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.btn-resume-course')) {
                const courseId = (card as HTMLElement).dataset.courseId;
                if (courseId) window.location.href = `player.html?courseId=${courseId}`;
            }
        });
    });

    // Handle button clicks
    const buttons = grid.querySelectorAll('.btn-resume-course');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const courseId = (button as HTMLElement).dataset.courseId;
            if (courseId) window.location.href = `player.html?courseId=${courseId}`;
        });
    });
}

/**
 * Sets up Search and Category filtering
 */
function setupSearch() {
    const searchInput = document.getElementById('course-search-input') as HTMLInputElement;
    const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;

    if (!searchInput || !categoryFilter) return;

    const filterFunction = () => {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        const filtered = allCourses.filter(course => {
            const matchesQuery = course.title.toLowerCase().includes(query) ||
                (course.description && course.description.toLowerCase().includes(query));
            const matchesCategory = !category || course.categoryId === category;

            return matchesQuery && matchesCategory;
        });
        renderCourses(filtered);
        setupCourseCardListeners();
    };

    searchInput.addEventListener('input', filterFunction);
    categoryFilter.addEventListener('change', filterFunction);
}

/**
 * Loads categories for the filter
 */
async function loadCategories() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    try {
        const response = await AppUI.apiFetch('/categories');
        const categories = response?.data || [];

        categoryFilter.innerHTML = '<option value="">Todas Categorias</option>';
        categories.forEach((cat: any) => {
            const option = document.createElement('option');
            option.value = cat.id.toString();
            option.textContent = cat.name;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

/**
 * Sets up sidebar navigation and UI toggles
 */
function setupNavigation() {
    // Sidebar Toggle
    const btnToggle = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Sidebar Avatar Button (Logout)
    const sidebarAvatarBtn = document.getElementById('sidebar-avatar-btn');
    if (sidebarAvatarBtn) {
        sidebarAvatarBtn.addEventListener('click', () => {
            Auth.logout();
            window.location.href = 'index.html';
        });
    }

    // --- Auth Card UI Listeners ---
    const avatarBtn = document.getElementById('user-avatar-btn');
    const authContainer = document.getElementById('auth-card-container');
    const cardInner = document.getElementById('auth-card');

    if (avatarBtn && authContainer) {
        console.log('Avatar button and auth container found');
        avatarBtn.addEventListener('click', (e) => {
            console.log('Avatar button clicked');
            e.stopPropagation();
            authContainer.classList.toggle('show');
            const isShown = authContainer.classList.contains('show');
            console.log('Auth container "show" class:', isShown);

            // Refresh content when showing
            if (isShown) {
                Auth.updateAuthUI();
            }
        });

        document.addEventListener('click', (e) => {
            if (
                authContainer.classList.contains('show') &&
                !authContainer.contains(e.target as Node) &&
                !avatarBtn.contains(e.target as Node)
            ) {
                authContainer.classList.remove('show');
            }
        });
    }

    // Auth Card Action Handlers
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        const confirmed = await AppUI.promptModal('Sair da Conta', 'Tem certeza que deseja sair agora?');
        if (confirmed) {
            await Auth.logout();
            window.location.href = 'index.html';
        }
    });

    document.getElementById('btn-my-learning')?.addEventListener('click', () => {
        authContainer?.classList.remove('show');
        // Redireciona para a página correta do dashboard do aluno
        window.location.href = 'student.html';
    });

    document.getElementById('btn-instructor-dash')?.addEventListener('click', () => {
        window.location.href = 'instructor.html';
    });

    document.getElementById('btn-create-course')?.addEventListener('click', () => {
        window.location.href = 'instructor.html';
    });

    document.getElementById('btn-manage-categories')?.addEventListener('click', (e) => {
        e.preventDefault();
        // Redirect to instructor dash for this for now as it needs complex templates
        window.location.href = 'instructor.html';
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
            window.location.href = 'index.html';
        }
    });

    // Mirroring instructor's initial update
    Auth.updateAuthUI();

    // Home link in breadcrumb or logo
    const homeLinks = document.querySelectorAll('a');
    homeLinks.forEach(link => {
        if (link.textContent?.trim() === 'Início') {
            link.href = 'index.html';
        }
    });

    // Logout handling
    const btnLogout = document.getElementById('btn-logout-sidebar');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            const confirmed = await AppUI.promptModal('Sair da Conta', 'Tem certeza que deseja sair agora?');
            if (confirmed) {
                await Auth.logout();
                window.location.href = 'index.html';
            }
        });
    }

    // Profile link or other navigation items
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const a = link as HTMLAnchorElement;
        if (a.textContent?.includes('Profile') || a.textContent?.includes('Perfil')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
    });
}

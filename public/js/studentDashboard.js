/**
 * Student Dashboard Script
 * Handles dynamic loading of student information and courses
 */
import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';
let allCourses = [];
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
function updateUserInfo(user) {
    const headerName = document.getElementById('header-user-name');
    const roleText = document.getElementById('header-user-role');
    const welcomeTitle = document.getElementById('welcome-title');
    const coursesStatus = document.getElementById('courses-status');
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
        // Feature the course with most progress that isn't finished, or the first one
        const featured = allCourses.slice().sort((a, b) => (b.progress || 0) - (a.progress || 0)).filter(c => c.progress < 100)[0] || allCourses[0];
        if (featured) {
            renderFeaturedCourse(featured);
        }
        renderCourses(allCourses);
    }
    catch (error) {
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
function renderFeaturedCourse(course) {
    const title = document.getElementById('featured-course-title');
    const module = document.getElementById('featured-module-name');
    const percent = document.getElementById('featured-progress-percent');
    const fill = document.getElementById('featured-progress-fill');
    const img = document.getElementById('featured-course-image');
    const btn = document.getElementById('btn-resume-featured');
    if (title)
        title.textContent = course.title;
    if (module)
        module.textContent = course.currentModule || 'Em andamento';
    if (percent)
        percent.textContent = `${course.progress || 0}%`;
    if (fill)
        fill.style.width = `${course.progress || 0}%`;
    if (img && course.coverImageUrl)
        img.src = course.coverImageUrl;
    if (btn) {
        btn.onclick = () => window.location.href = `player.html?courseId=${course.id}`;
    }
}
/**
 * Renders course cards to the grid
 */
function renderCourses(courses) {
    const grid = document.getElementById('courses-grid');
    if (!grid)
        return;
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
    grid.innerHTML = courses.map((course) => {
        const progress = course.progress || 0;
        const icon = course.category && course.category.toLowerCase().includes('code') ? 'code' : 'terminal';
        return `
            <div class="course-card" onclick="window.location.href='player.html?courseId=${course.id}'">
                <div class="course-header">
                    <div class="course-icon">
                        <span class="material-symbols-outlined">${icon}</span>
                    </div>
                    <span class="course-badge ${progress === 100 ? 'completed' : ''}">
                        ${progress === 100 ? 'Concluído' : 'Em Andamento'}
                    </span>
                </div>
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
            </div>
        `;
    }).join('');
}
/**
 * Sets up Search and Category filtering
 */
function setupSearch() {
    const searchInput = document.getElementById('course-search-input');
    const categoryFilter = document.getElementById('category-filter');
    if (!searchInput || !categoryFilter)
        return;
    const filterFunction = () => {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const filtered = allCourses.filter(course => {
            const matchesQuery = course.title.toLowerCase().includes(query) ||
                (course.description && course.description.toLowerCase().includes(query));
            const matchesCategory = !category || course.categoryId?.toString() === category;
            return matchesQuery && matchesCategory;
        });
        renderCourses(filtered);
    };
    searchInput.addEventListener('input', filterFunction);
    categoryFilter.addEventListener('change', filterFunction);
}
/**
 * Loads categories for the filter
 */
async function loadCategories() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter)
        return;
    try {
        const response = await AppUI.apiFetch('/categories');
        const categories = response?.data || [];
        categoryFilter.innerHTML = '<option value="">Todas Categorias</option>';
        categories.forEach((cat) => {
            const option = document.createElement('option');
            option.value = cat.id.toString();
            option.textContent = cat.name;
            categoryFilter.appendChild(option);
        });
    }
    catch (error) {
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
    // --- Auth Card UI Listeners ---
    const avatarBtn = document.getElementById('user-avatar-btn');
    const authContainer = document.getElementById('auth-card-container');
    const cardInner = document.getElementById('auth-card');
    if (avatarBtn && authContainer) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            authContainer.classList.toggle('show');
            // Refresh content when showing
            if (authContainer.classList.contains('show')) {
                Auth.updateAuthUI();
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
        const a = link;
        if (a.textContent?.includes('Profile') || a.textContent?.includes('Perfil')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
    });
}

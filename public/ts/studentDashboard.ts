/**
 * Student Dashboard Script
 * Handles dynamic loading of student information and courses
 */
import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';
import { Categories } from './modules/categories.js';

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

    console.log('Student session detected:', user.name);

    // Update user info in the header
    updateUserInfo(user);

    // Setup sidebar navigation
    setupNavigation();

    // Setup Search
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

        renderCourses(allCourses);
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
        return `
            <div class="bg-surface-dark border border-white/5 rounded-xl overflow-hidden group hover:border-primary/40 transition-all flex flex-col">
                <div class="relative h-48 overflow-hidden">
                    <div class="absolute inset-0 bg-center bg-cover transform group-hover:scale-105 transition-transform duration-700"
                        style="background-image: url('${course.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}')">
                    </div>
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1 bg-black/80 backdrop-blur-md text-primary text-xs font-bold rounded-full border border-primary/30">CURSO</span>
                    </div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                    <h3 class="text-xl font-bold mb-1 text-white group-hover:text-primary transition-colors">
                        ${course.title}</h3>
                    <p class="text-sm text-slate-500 mb-6 line-clamp-2">${course.description || 'Inicie seus estudos neste treinamento completo.'}</p>
                    <div class="mt-auto">
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-xs font-bold text-slate-500">PROGRESSO</span>
                            <span class="text-sm font-bold text-primary">${progress}%</span>
                        </div>
                        <div class="w-full h-1.5 bg-white/5 rounded-full mb-6 overflow-hidden">
                            <div class="h-full bg-primary shadow-primary-md transition-all duration-1000" style="width: ${progress}%"></div>
                        </div>
                        <button onclick="window.location.href='coursePlayer.html?id=${course.id}'" class="w-full bg-white/5 text-primary py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-black transition-all">
                            <span>${progress === 100 ? 'Revisar' : 'Continuar Estudando'}</span>
                            <span class="material-symbols-outlined text-sm">${progress === 100 ? 'verified' : 'play_circle'}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Sets up Search functionality
 */
function setupSearch() {
    const searchInput = document.getElementById('course-search-input') as HTMLInputElement;
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase();
        const filtered = allCourses.filter(course =>
            course.title.toLowerCase().includes(query) ||
            (course.description && course.description.toLowerCase().includes(query))
        );
        renderCourses(filtered);
    });
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
        // Already here, but just in case
        window.location.href = 'studentDashboard.html';
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
        const a = link as HTMLAnchorElement;
        if (a.textContent?.includes('Profile') || a.textContent?.includes('Perfil')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
    });
}

/**
 * Student Dashboard Script
 * Handles dynamic loading of student information and courses
 */
import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';
import { Categories } from './modules/categories.js';

let allCourses: any[] = [];
let currentView: 'courses' | 'certificates' = 'courses';

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

    // Setup Category Filter
    setupCategoryFilter();

    // Setup Create Course Toggle
    setupCreateCourse();
});

/**
 * Updates the user information displayed in the header
 */
function updateUserInfo(user: any) {
    const headerName = document.getElementById('header-user-name');
    const roleText = document.getElementById('header-user-role');
    const welcomeTitle = document.getElementById('welcome-title');
    const userDisplayName = document.getElementById('user-display-name');
    const coursesStatus = document.getElementById('courses-status');
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarUserRole = document.getElementById('sidebar-user-role');

    if (headerName) {
        headerName.textContent = user.name || 'Aluno';
    }

    if (userDisplayName) {
        userDisplayName.textContent = user.name ? user.name.split(' ')[0] : 'Antonio';
    }

    if (sidebarUserName) {
        sidebarUserName.textContent = user.name || 'Aluno';
    }

    if (sidebarUserRole) {
        const userRole = (user.role || 'STUDENT').toLowerCase();
        sidebarUserRole.textContent = userRole === 'instructor' ? 'Instrutor' : 'Estudante';
    }

    if (roleText) {
        const userRole = (user.role || 'STUDENT').toUpperCase();
        roleText.textContent = userRole === 'INSTRUCTOR' ? 'Instrutor' : 'Aluno';
    }

    if (welcomeTitle) {
        // Welcome title now has a span for the name
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

        if (allCourses.length > 0) {
            renderFeaturedCourse(allCourses[0]);
        } else {
            document.getElementById('featured-course-container')?.classList.add('hidden');
        }

        if (currentView === 'courses') {
            renderCourses(allCourses);
        } else {
            renderCertificates(allCourses);
        }
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
function renderFeaturedCourse(course: any) {
    const title = document.getElementById('featured-course-title');
    const module = document.getElementById('featured-module-name');
    const percent = document.getElementById('featured-progress-percent');
    const fill = document.getElementById('featured-progress-fill') as HTMLElement;
    const img = document.getElementById('featured-course-image') as HTMLImageElement;
    const btn = document.getElementById('btn-resume-featured');

    if (title) title.textContent = course.title;
    if (module) module.textContent = course.currentModule || 'Em andamento';
    if (percent) percent.textContent = `${course.progress || 0}%`;
    if (fill) fill.style.width = `${course.progress || 0}%`;
    if (img && course.coverImageUrl) img.src = course.coverImageUrl;
    if (btn) {
        btn.onclick = () => window.location.href = `player.html?courseId=${course.id}`;
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
 * Renders the featured course (Continue Learning)
 */
function renderFeaturedCourse(course: any) {
    const container = document.getElementById('featured-course-container');
    const title = document.getElementById('featured-title');
    const cover = document.getElementById('featured-course-image') as HTMLImageElement;
    const progressText = document.getElementById('featured-progress-text');
    const progressBar = document.getElementById('featured-progress-bar');
    const link = document.getElementById('featured-link') as HTMLAnchorElement;

    if (!container || !course) return;

    container.classList.remove('hidden');

    if (title) title.textContent = course.title;
    if (cover) cover.src = course.coverImageUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80';

    const progress = course.progress || 0;
    if (progressText) progressText.textContent = `${progress}%`;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (link) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `player.html?courseId=${course.id}`;
        });
    }
}

/**
 * Renders only courses with certificates
 */
function renderCertificates(courses: any[]) {
    const grid = document.getElementById('courses-grid');
    const status = document.getElementById('courses-status');
    if (!grid) return;

    const certificates = courses.filter(c => c.certificateHash || c.progress === 100);

    if (status) {
        status.innerHTML = `Você conquistou <span class="text-primary font-bold">${certificates.length} certificados</span> até agora.`;
    }

    if (certificates.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center bg-surface-dark border border-white/5 rounded-xl">
                <span class="material-symbols-outlined text-6xl text-slate-700 mb-4">workspace_premium</span>
                <p class="text-slate-500 text-lg">Nenhum certificado disponível.</p>
                <p class="text-sm text-slate-600">Conclua 100% de um curso para gerar seu certificado.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = certificates.map((course: any) => {
        return `
            <div class="bg-surface-dark border border-white/5 rounded-xl overflow-hidden group hover:border-primary/40 transition-all flex flex-col">
                <div class="relative h-48 overflow-hidden">
                    <div class="absolute inset-0 bg-center bg-cover transform group-hover:scale-105 transition-transform duration-700"
                        style="background-image: url('${course.coverImageUrl || 'https://images.unsplash.com/photo-1523240715632-d040850239f6?auto=format&fit=crop&q=80&w=800'}')">
                    </div>
                    <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                        <span class="material-symbols-outlined text-6xl text-primary opacity-50">workspace_premium</span>
                    </div>
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1 bg-black/80 backdrop-blur-md text-primary text-xs font-bold rounded-full border border-primary/30">CONCLUÍDO</span>
                    </div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                    <h3 class="text-xl font-bold mb-1 text-white group-hover:text-primary transition-colors">
                        ${course.title}</h3>
                    <p class="text-sm text-slate-500 mb-6">Certificado de conclusão disponível para download.</p>
                    <div class="mt-auto">
                        <a href="${course.certificateHash ? `certificate.html?hash=${course.certificateHash}` : `player.html?courseId=${course.id}`}" 
                           class="w-full bg-primary text-black py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 glow-hover transition-all" style="text-decoration: none;">
                            <span>${course.certificateHash ? 'Ver Certificado' : 'Gerar Certificado'}</span>
                            <span class="material-symbols-outlined text-sm">workspace_premium</span>
                        </a>
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
    const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;

    if (!searchInput || !categoryFilter) return;

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

    // Logout logic for sidebar
    const btnLogoutSidebar = document.getElementById('btn-logout-sidebar');
    if (btnLogoutSidebar) {
        btnLogoutSidebar.addEventListener('click', async (e) => {
            e.stopPropagation();
            const confirmed = await AppUI.promptModal('Sair da Conta', 'Tem certeza que deseja sair agora?');
            if (confirmed) {
                await Auth.logout();
                window.location.href = 'index.html';
            }
        });
    }

    const sidebarProfileCard = document.getElementById('sidebar-profile-card');
    if (sidebarProfileCard) {
        sidebarProfileCard.addEventListener('click', () => {
            authContainer?.classList.add('show');
            Auth.showProfileView();
        });
    }

    const headerAvatar = document.getElementById('header-avatar-btn');
    if (headerAvatar) {
        headerAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            authContainer?.classList.toggle('show');
            if (authContainer?.classList.contains('show')) {
                Auth.updateAuthUI();
            }
        });
    }

    // Profile link or other navigation items
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const a = link as HTMLAnchorElement;
        const text = a.textContent?.trim() || '';

        if (text.includes('Dashboard') || text.includes('Meus Cursos')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentView = 'courses';
                updateActiveLink(a);
                document.getElementById('welcome-title')!.innerHTML = `Meus <span class="text-primary">Cursos</span>`;
                renderCourses(allCourses);
            });
        } else if (text.includes('Certificados')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentView = 'certificates';
                updateActiveLink(a);
                document.getElementById('welcome-title')!.innerHTML = `Meus <span class="text-primary">Certificados</span>`;
                renderCertificates(allCourses);
            });
        } else if (text.includes('Perfil')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                // Open auth card and show profile
                authContainer?.classList.add('show');
                Auth.showProfileView();
            });
        }
    });
}

/**
 * Updates active class on sidebar links
 */
function updateActiveLink(activeLink: HTMLAnchorElement) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('sidebar-item-active', 'border-l-2', 'border-primary', 'text-primary');
        link.classList.add('nav-link-default');
        link.querySelector('.material-symbols-outlined')?.classList.remove('fill-1');
    });

    activeLink.classList.add('sidebar-item-active', 'border-l-2', 'border-primary', 'text-primary');
    activeLink.classList.remove('nav-link-default');
    activeLink.querySelector('.material-symbols-outlined')?.classList.add('fill-1');
}

/**
 * Sets up category filter logic
 */
async function setupCategoryFilter() {
    const filter = document.getElementById('category-filter') as HTMLSelectElement;
    if (!filter) return;

    try {
        const categories = await Categories.getAll();
        filter.innerHTML = `<option value="">Todas Categorias</option>` +
            categories.map((c: any) => `<option value="${c.id}">${c.name}</option>`).join('');

        filter.addEventListener('change', () => {
            const categoryId = filter.value;
            if (!categoryId) {
                renderCourses(allCourses);
            } else {
                const filtered = allCourses.filter(c => c.categoryId === categoryId);
                renderCourses(filtered);
            }
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Sets up create course form toggle and logic
 */
function setupCreateCourse() {
    const btnToggle = document.getElementById('create-course-toggle');
    const form = document.getElementById('create-course-form');

    if (btnToggle && form) {
        btnToggle.addEventListener('click', () => {
            form.classList.toggle('show');
            btnToggle.textContent = form.classList.contains('show') ? 'Cancelar' : 'Create Course';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('course-title') as HTMLInputElement;
            const descInput = document.getElementById('course-desc') as HTMLInputElement;

            if (!titleInput.value.trim()) {
                AppUI.showMessage('Por favor, informe o título do curso.', 'error');
                return;
            }

            try {
                await AppUI.apiFetch('/courses', {
                    method: 'POST',
                    body: JSON.stringify({
                        title: titleInput.value.trim(),
                        description: descInput.value.trim(),
                        categoryId: '', // Default or first category
                        price: 0
                    })
                });
                AppUI.showMessage('Curso criado com sucesso!', 'success');
                titleInput.value = '';
                descInput.value = '';
                form.classList.remove('show');
                btnToggle.textContent = 'Create Course';
                await loadStudentCourses(); // Refresh
            } catch (error) {
                console.error('Error creating course:', error);
            }
        });
    }
}

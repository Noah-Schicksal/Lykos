
import { AppUI } from './utils/ui.js';
// @ts-ignore
import { initThemeToggle } from './theme-toggle.js';
import { Auth } from './modules/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Init services
    Auth.init();
    initThemeToggle();

    // Elements
    const sidebarList = document.getElementById('course-list-container') as HTMLElement;
    const emptyState = document.getElementById('empty-state') as HTMLElement;
    const detailsView = document.getElementById('course-details') as HTMLElement;

    // Search & Pagination Elements
    const searchInput = document.getElementById('course-search') as HTMLInputElement;
    const loadMoreBtn = document.getElementById('btn-load-more') as HTMLButtonElement;

    // Detail Elements
    const detailTitle = document.getElementById('detail-title') as HTMLElement;
    const detailId = document.getElementById('detail-id') as HTMLElement;
    const detailDesc = document.getElementById('detail-description') as HTMLElement;
    const modulesList = document.getElementById('modules-list') as HTMLElement;

    // User Profile Elements
    const headerUserRole = document.getElementById('header-user-role');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const userAvatarBtn = document.getElementById('user-avatar-btn');
    // Buttons
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const btnLogout = document.getElementById('dropdown-logout');

    // Danger Zone Elements
    const toggleStatusBtn = document.getElementById('toggle-status') as HTMLButtonElement;
    const statusText = document.getElementById('status-text') as HTMLElement;
    const btnDelete = document.getElementById('btn-delete-course') as HTMLButtonElement;

    let currentCourseId: string | null = null;

    // State
    const LIMIT = 10;
    let currentPage = 1;
    let currentSearch = '';
    let isLoading = false;

    // --- Init ---
    // --- Init ---
    checkAdminAccess(); // Ensure only admin
    loadSidebarCourses(true);
    renderUserProfile();

    // Mobile Sidebar Initialization
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('admin-sidebar');
        if (sidebar) sidebar.classList.add('closed');
    }

    // --- Event Listeners ---
    if (btnToggleSidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            const sidebar = document.getElementById('admin-sidebar');
            if (sidebar) sidebar.classList.toggle('closed');
        });
    }

    if (searchInput) {
        let debounceTimer: any;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const val = (e.target as HTMLInputElement).value.trim();
            debounceTimer = setTimeout(() => {
                currentSearch = val;
                loadSidebarCourses(true); // Reset and search
            }, 500);
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadSidebarCourses(false); // Load next page
        });
    }

    if (userAvatarBtn && userDropdownMenu) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
            userAvatarBtn.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdownMenu.classList.remove('show');
            userAvatarBtn.classList.remove('open');
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await Auth.logout();
            window.location.href = '/';
        });
    }

    // Toggle Switch Logic
    if (toggleStatusBtn) {
        toggleStatusBtn.addEventListener('click', () => {
            const isActive = toggleStatusBtn.classList.contains('active');

            if (isActive) {
                // Switching to OFF (Ready to Delete/Danger)
                toggleStatusBtn.classList.remove('active');
                toggleStatusBtn.classList.add('inactive');

                statusText.textContent = 'PERIGO';
                statusText.classList.remove('active');
                statusText.classList.add('inactive'); // Red text

                // Enable Delete Button
                btnDelete.disabled = false;
                btnDelete.classList.remove('btn-delete-disabled');
                btnDelete.classList.add('btn-delete-active');
            } else {
                // Switching Back to ON (Safe)
                toggleStatusBtn.classList.add('active');
                toggleStatusBtn.classList.remove('inactive');

                statusText.textContent = 'SEGURO';
                statusText.classList.add('active');
                statusText.classList.remove('inactive');

                // Disable Delete Button
                btnDelete.disabled = true;
                btnDelete.classList.add('btn-delete-disabled');
                btnDelete.classList.remove('btn-delete-active');
            }
        });
    }

    // Delete Logic (Direct delete when enabled)
    if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
            if (currentCourseId && !btnDelete.disabled) {
                await deleteCourse(currentCourseId);
            }
        });
    }

    // --- Functions ---

    /**
     * Loads courses for the sidebar.
     * Consumes GET /admin/courses with pagination and search
     */
    async function loadSidebarCourses(reset = false) {
        if (isLoading) return;
        isLoading = true;

        if (reset) {
            currentPage = 1;
            sidebarList.innerHTML = '<p class="loading-text">Carregando...</p>';
            loadMoreBtn.classList.add('hidden');
        } else {
            loadMoreBtn.textContent = 'Carregando...';
            loadMoreBtn.disabled = true;
            currentPage++;
        }

        try {
            const query = `page=${currentPage}&limit=${LIMIT}&search=${encodeURIComponent(currentSearch)}`;
            const response = await AppUI.apiFetch(`/admin/courses?${query}`);

            // Handle different response structures gracefully
            const courses = response.data?.courses || response.courses || [];
            const total = response.data?.total || response.total || 0;

            if (reset) {
                sidebarList.innerHTML = '';
            }

            if (courses.length > 0) {
                renderSidebar(courses);

                // Check if we have more pages
                // If loaded count < total, show button
                const loadedCount = (currentPage - 1) * LIMIT + courses.length; // Approximate check or use total
                // Better: if courses.length < LIMIT, we reached end.
                // Or use total if available.

                const hasNext = (currentPage * LIMIT) < total;

                if (hasNext) {
                    loadMoreBtn.classList.remove('hidden');
                    loadMoreBtn.disabled = false;
                    loadMoreBtn.innerHTML = 'Carregar Mais <span class="material-symbols-outlined">expand_more</span>';
                } else {
                    loadMoreBtn.classList.add('hidden');
                }

            } else {
                if (reset) sidebarList.innerHTML = '<p class="loading-text">Nenhum curso encontrado.</p>';
                loadMoreBtn.classList.add('hidden');
            }

        } catch (error) {
            console.error(error);
            if (reset) sidebarList.innerHTML = '<p class="loading-text text-danger">Erro ao carregar cursos</p>';
        } finally {
            isLoading = false;
            if (!reset) {
                loadMoreBtn.disabled = false;
                // Text restore handled in if(hasNext) block
            }
        }
    }

    function renderSidebar(courses: any[]) {
        // Do not clear innerHTML here if appending (handled by caller logic)
        // But the previous implementation assumed renderSidebar CLEARED and RENDERED.
        // We should just APPEND here.

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card-nav';
            card.dataset.id = course.id;

            // Image or Icon
            const imgHtml = course.coverImageUrl
                ? `<img src="${course.coverImageUrl}" alt="cover">`
                : `<span class="material-symbols-outlined placeholder-icon">school</span>`;

            // Enrolled Count
            const studentCount = course.enrolledCount !== undefined ? course.enrolledCount : 0;
            const studentLabel = studentCount === 1 ? 'Aluno' : 'Alunos';

            card.innerHTML = `
                <div class="course-thumb-mini">
                    ${imgHtml}
                </div>
                <div class="course-info-mini">
                    <span class="course-title-mini">${course.title}</span>
                    <span class="course-meta-mini">${studentCount} ${studentLabel}</span>
                </div>
            `;

            card.addEventListener('click', () => loadCourseDetails(course.id));
            sidebarList.appendChild(card);
        });
    }

    async function loadCourseDetails(id: string) {
        // Active state in sidebar
        document.querySelectorAll('.course-card-nav').forEach(el => el.classList.remove('active'));
        const activeCard = document.querySelector(`.course-card-nav[data-id="${id}"]`);
        if (activeCard) activeCard.classList.add('active');

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('admin-sidebar');
            if (sidebar) sidebar.classList.add('closed');
        }

        // Show loading state potentially? For now just switch view
        emptyState.classList.add('hidden');
        detailsView.classList.remove('hidden');

        // Reset contents
        detailTitle.textContent = 'Carregando...';
        detailDesc.textContent = '';
        modulesList.innerHTML = '';
        currentCourseId = id;

        // Reset Danger Zone State
        resetDangerZone();

        try {
            const response = await AppUI.apiFetch(`/admin/courses/${id}`);
            // Fix: Unwrap data property if it exists
            const course = response.data || response;
            renderDetails(course);
        } catch (error) {
            console.error(error);
            AppUI.showMessage('Erro ao carregar detalhes do curso', 'error');
        }
    }

    function resetDangerZone() {
        if (toggleStatusBtn) {
            toggleStatusBtn.classList.add('active');
            toggleStatusBtn.classList.remove('inactive');
        }
        if (statusText) {
            statusText.textContent = 'SEGURO';
            statusText.classList.add('active');
            statusText.classList.remove('inactive');
        }
        if (btnDelete) {
            btnDelete.disabled = true;
            btnDelete.classList.add('btn-delete-disabled');
            btnDelete.classList.remove('btn-delete-active');
        }
    }

    function renderDetails(course: any) {
        detailTitle.textContent = course.title;
        if (detailId) detailId.textContent = `ID: ${course.id}`;
        detailDesc.textContent = course.description || 'Nenhuma descrição informada.';

        // Modules
        if (course.modules && course.modules.length > 0) {
            course.modules.forEach((mod: any) => {
                const modEl = createModuleElement(mod);
                modulesList.appendChild(modEl);
            });
        } else {
            // Using a distinct visual for empty modules, separate from description
            modulesList.innerHTML = '<div style="padding: 2rem; border: 1px dashed rgba(255,255,255,0.1); border-radius: 0.5rem; text-align: center; color: #64748b;">Nenhum módulo encontrado.</div>';
        }
    }

    function createModuleElement(module: any) {
        const container = document.createElement('div');
        container.className = 'module-item';

        const classesCount = module.classes ? module.classes.length : 0;

        container.innerHTML = `
            <div class="module-header">
                <div class="module-info">
                    <span class="module-title">${module.title}</span>
                    <span class="module-meta">${classesCount} Aulas • ${module.duration || '0m'}</span>
                </div>
                <div class="module-actions">
                    <span class="material-symbols-outlined chevron">expand_more</span>
                </div>
            </div>
            <div class="module-content">
                <ul class="lesson-list">
                    ${module.classes && module.classes.length > 0
                ? module.classes.map((lesson: any) => createLessonItem(lesson)).join('')
                : '<li style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.875rem;">Nenhuma aula cadastrada neste módulo</li>'}
                </ul>
            </div>
        `;

        // Toggle Accordion
        const header = container.querySelector('.module-header') as HTMLElement;
        const content = container.querySelector('.module-content') as HTMLElement;
        const chevron = container.querySelector('.chevron') as HTMLElement;

        header.addEventListener('click', () => {
            const isOpen = content.classList.contains('open');

            if (isOpen) {
                content.classList.remove('open');
                header.classList.remove('active');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('open');
                header.classList.add('active');
                if (chevron) chevron.style.transform = 'rotate(180deg)';
            }
        });

        return container;
    }

    function createLessonItem(lesson: any) {
        const isVideo = !!lesson.videoUrl;
        const icon = isVideo ? 'play_circle' : 'description';
        const typeLabel = isVideo ? 'Vídeo' : 'Material';
        const iconClass = isVideo ? '' : 'file';

        return `
            <li class="lesson-item">
                <div class="lesson-icon ${iconClass}">
                    <span class="material-symbols-outlined">${icon}</span>
                </div>
                <div class="lesson-info">
                    <div class="lesson-title">${lesson.title}</div>
                    <div class="lesson-type">${typeLabel} • ${lesson.duration || '--:--'}</div>
                </div>
            </li>
        `;
    }

    function showEmptyState() {
        emptyState.classList.remove('hidden');
        detailsView.classList.add('hidden');
        document.querySelectorAll('.course-card-nav').forEach(el => el.classList.remove('active'));
        currentCourseId = null;
    }

    async function deleteCourse(id: string) {
        try {
            await AppUI.apiFetch(`/admin/courses/${id}`, { method: 'DELETE' });
            AppUI.showMessage('Curso excluído com sucesso', 'success');

            // Reset view
            showEmptyState();

            // Reload sidebar
            loadSidebarCourses();

        } catch (error) {
            console.error(error);
            AppUI.showMessage('Erro ao excluir curso', 'error');
        }
    }

    function checkAdminAccess() {
        // @ts-ignore
        const userStr = localStorage.getItem('auth_user');
        if (!userStr) {
            window.location.href = '/student-login.html';
            return;
        }
        const user = JSON.parse(userStr);
        if (user.role !== 'ADMIN') {
            window.location.href = '/index.html';
        }
    }

    function renderUserProfile() {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (headerUserRole) {
                headerUserRole.textContent = user.role === 'ADMIN' ? 'Administrador' : user.role;
            }
        }
    }

});

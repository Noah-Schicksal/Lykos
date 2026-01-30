/**
 * Admin Dashboard Script
 */
import { AppUI } from './utils/ui.js';

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    coverImage: string | null;
    instructorName: string;
    categoryName: string;
    currentStudents: number;
    maxStudents: number;
}

// State
let allCourses: Course[] = [];
let filteredCourses: Course[] = [];

// Theme Toggle Setup (seguindo a lógica da home page)
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');

    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';

    if (currentTheme === 'light') {
        document.documentElement.classList.add('light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('light');

            // Save theme preference
            const theme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
            localStorage.setItem('theme', theme);

            // Add animation effect
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }
}

// Check if user is admin
function checkAdminAccess() {
    const authUser = localStorage.getItem('auth_user');
    if (!authUser) {
        AppUI.showMessage('Acesso negado! Faça login como administrador.', 'error');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);
        return false;
    }

    try {
        const user = JSON.parse(authUser);
        if (user.role !== 'ADMIN') {
            AppUI.showMessage('Acesso negado! Apenas administradores podem acessar esta página.', 'error');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error parsing auth user:', error);
        window.location.href = '/index.html';
        return false;
    }
}

// Load all courses
async function loadCourses() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const tableBody = document.getElementById('courses-table-body');

    if (loadingState) loadingState.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';
    if (tableBody) tableBody.innerHTML = '';

    try {
        const response = await AppUI.apiFetch('/admin/courses', {
            method: 'GET',
            credentials: 'include'
        });

        allCourses = response.data || [];
        filteredCourses = [...allCourses];

        if (loadingState) loadingState.style.display = 'none';

        if (allCourses.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
        } else {
            renderCourses();
        }

        updateStats();
    } catch (error: any) {
        if (loadingState) loadingState.style.display = 'none';
        AppUI.showMessage(error.message || 'Erro ao carregar cursos', 'error');
        console.error('Error loading courses:', error);
    }
}

// Render courses table
function renderCourses() {
    const tableBody = document.getElementById('courses-table-body');
    const emptyState = document.getElementById('empty-state');

    if (!tableBody) return;

    if (filteredCourses.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tableBody.innerHTML = filteredCourses.map(course => {
        const imageUrl = course.coverImage
            ? `/courses/${course.id}/cover`
            : 'https://placehold.co/300x200/5e17eb/ffffff?text=No+Image';

        const formattedPrice = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(course.price);

        return `
            <tr data-course-id="${course.id}">
                <td style="font-weight: 600; color: var(--text-muted);">#${course.id}</td>
                <td>
                    <img src="${imageUrl}" alt="${course.title}" class="course-thumbnail" />
                </td>
                <td class="course-title-cell">
                    <strong>${course.title}</strong>
                    <small>${course.description.substring(0, 60)}${course.description.length > 60 ? '...' : ''}</small>
                </td>
                <td class="instructor-cell">${course.instructorName}</td>
                <td>
                    <span class="badge category-badge bg-tag-secondary">${course.categoryName}</span>
                </td>
                <td class="price-cell">${formattedPrice}</td>
                <td>
                    <div class="students-count">
                        <span class="material-symbols-outlined">group</span>
                        <span>${course.currentStudents} / ${course.maxStudents}</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" data-course-id="${course.id}" title="Visualizar">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="btn-delete" data-course-id="${course.id}" title="Excluir">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Add event listeners
    tableBody.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const courseId = (e.currentTarget as HTMLElement).getAttribute('data-course-id');
            if (courseId) {
                window.open(`/index.html?course=${courseId}`, '_blank');
            }
        });
    });

    tableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const courseId = (e.currentTarget as HTMLElement).getAttribute('data-course-id');
            if (courseId) {
                showDeleteModal(parseInt(courseId));
            }
        });
    });
}

// Update statistics
function updateStats() {
    const totalCoursesEl = document.getElementById('total-courses');
    if (totalCoursesEl) {
        totalCoursesEl.textContent = allCourses.length.toString();
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('course-search') as HTMLInputElement;
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase().trim();

        if (!query) {
            filteredCourses = [...allCourses];
        } else {
            filteredCourses = allCourses.filter(course =>
                course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                course.instructorName.toLowerCase().includes(query) ||
                course.categoryName.toLowerCase().includes(query)
            );
        }

        renderCourses();
    });
}

// Delete Modal
function showDeleteModal(courseId: number) {
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    const modal = document.getElementById('delete-modal');
    const modalTitle = document.getElementById('modal-course-title');
    const modalId = document.getElementById('modal-course-id');

    if (!modal || !modalTitle || !modalId) return;

    modalTitle.textContent = course.title;
    modalId.textContent = courseId.toString();

    modal.style.display = 'flex';

    // Close modal handlers
    const closeModal = () => {
        modal.style.display = 'none';
    };

    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Confirm delete
    const confirmBtn = document.getElementById('modal-confirm-delete');
    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            closeModal();
            await deleteCourse(courseId);
        };
    }
}

// Delete course
async function deleteCourse(courseId: number) {
    try {
        await AppUI.apiFetch(`/admin/courses/${courseId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        AppUI.showMessage('Curso excluído com sucesso!', 'success');

        // Remove from local state
        allCourses = allCourses.filter(c => c.id !== courseId);
        filteredCourses = filteredCourses.filter(c => c.id !== courseId);

        renderCourses();
        updateStats();
    } catch (error: any) {
        AppUI.showMessage(error.message || 'Erro ao excluir curso', 'error');
        console.error('Error deleting course:', error);
    }
}

// Logout
function setupLogout() {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await AppUI.apiFetch('/auth/logout', {
                    method: 'DELETE',
                    credentials: 'include'
                });

                localStorage.removeItem('auth_user');
                AppUI.showMessage('Logout realizado com sucesso!', 'success');

                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1000);
            } catch (error: any) {
                AppUI.showMessage(error.message || 'Erro ao fazer logout', 'error');
            }
        });
    }
}

// Home button
function setupHomeButton() {
    const homeBtn = document.getElementById('btn-home');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }
}

// Refresh button
function setupRefreshButton() {
    const refreshBtn = document.getElementById('btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadCourses();
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Dashboard Initialized');

    // Check admin access first
    if (!checkAdminAccess()) return;

    // Setup theme toggle
    setupThemeToggle();

    // Setup event listeners
    setupSearch();
    setupLogout();
    setupHomeButton();
    setupRefreshButton();

    // Load courses
    loadCourses();
});

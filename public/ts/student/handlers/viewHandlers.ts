/**
 * View Handlers - Manage navigation between courses and certificates views
 */

import { AppUI } from '../../utils/ui.js';
import { Categories } from '../../modules/categories.js';
import {
    setCurrentView,
    getAllCourses,
    setFilteredCourses,
    getCurrentUser
} from '../state/studentState.js';
import { setActiveNavItem } from '../components/sidebar.js';
import { updateCoursesList } from '../components/coursesView.js';
import { updateCertificatesList } from '../components/certificatesView.js';

export function setupViewHandlers(): void {
    const navCourses = document.getElementById('nav-courses');
    const navCertificates = document.getElementById('nav-certificates');

    if (navCourses && navCertificates) {
        navCourses.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('courses');
        });

        navCertificates.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('certificates');
        });
    }

    setupSearchAndFilters();
}

export function switchView(view: 'courses' | 'certificates'): void {
    const coursesView = document.getElementById('courses-view');
    const certificatesView = document.getElementById('certificates-view');
    const welcomeTitle = document.getElementById('welcome-title');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');

    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Aluno' };
    const firstName = user.name ? user.name.split(' ')[0] : 'Aluno';

    if (view === 'courses') {
        coursesView?.classList.remove('hidden');
        certificatesView?.classList.add('hidden');
        setActiveNavItem('courses');

        if (welcomeTitle) {
            welcomeTitle.innerHTML = `Bem-vindo de volta, <span class="text-primary">${firstName}</span>!`;
        }
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Meus Cursos';

        const courses = getAllCourses();
        updateCoursesList(courses);
    } else {
        coursesView?.classList.add('hidden');
        certificatesView?.classList.remove('hidden');
        setActiveNavItem('certificates');

        if (welcomeTitle) {
            welcomeTitle.innerHTML = `Suas <span class="text-primary">Conquistas</span>`;
        }
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Certificados';

        const courses = getAllCourses();
        updateCertificatesList(courses);
    }

    setCurrentView(view);
}

export function setupSearchAndFilters(): void {
    const searchInput = document.getElementById('course-search-input') as HTMLInputElement;
    const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;

    if (!searchInput || !categoryFilter) return;

    const filterFunction = () => {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        const allCourses = getAllCourses();
        const filtered = allCourses.filter(course => {
            const matchesQuery = course.title.toLowerCase().includes(query) ||
                (course.description && course.description.toLowerCase().includes(query));
            const matchesCategory = !category || course.categoryId === category;

            return matchesQuery && matchesCategory;
        });

        setFilteredCourses(filtered);
        updateCoursesList(filtered);
        setupCourseCardListeners();
    };

    searchInput.addEventListener('input', filterFunction);
    categoryFilter.addEventListener('change', filterFunction);
}

export async function loadCategories(): Promise<void> {
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

function setupCourseCardListeners(): void {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    // Handle card clicks (excluding button clicks)
    const cards = grid.querySelectorAll('.course-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.btn-resume-course')) {
                const courseId = (card as HTMLElement).dataset.courseId;
                if (courseId) window.location.href = `/estudante/aula/${courseId}`;
            }
        });
    });

    // Handle button clicks
    const buttons = grid.querySelectorAll('.btn-resume-course');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const courseId = (button as HTMLElement).dataset.courseId;
            if (courseId) window.location.href = `/estudante/aula/${courseId}`;
        });
    });
}

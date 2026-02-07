/**
 * Sidebar Handlers - Course list, search, pagination
 */

import { AppUI } from '../../utils/ui.js';
import {
  LIMIT,
  getCurrentPage,
  getCurrentSearch,
  getIsLoading,
  setIsLoading,
  resetPagination,
  incrementPage,
  setCurrentSearch,
} from '../state/adminState.js';
import { loadCourseDetails } from './courseHandlers.js';

/**
 * Setup sidebar handlers (search, load more, toggle)
 */
export function setupSidebarHandlers(): void {
  const searchInput = document.getElementById(
    'course-search',
  ) as HTMLInputElement;
  const loadMoreBtn = document.getElementById(
    'btn-load-more',
  ) as HTMLButtonElement;
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');

  // Toggle sidebar
  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      const sidebar = document.getElementById('admin-sidebar');
      if (sidebar) sidebar.classList.toggle('closed');
    });
  }

  // Search with debounce
  if (searchInput) {
    let debounceTimer: ReturnType<typeof setTimeout>;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const val = (e.target as HTMLInputElement).value.trim();
      debounceTimer = setTimeout(() => {
        setCurrentSearch(val);
        loadSidebarCourses(true);
      }, 500);
    });
  }

  // Load more
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadSidebarCourses(false);
    });
  }

  // Mobile sidebar initialization
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) sidebar.classList.add('closed');
  }
}

/**
 * Load courses for the sidebar
 */
export async function loadSidebarCourses(reset = false): Promise<void> {
  if (getIsLoading()) return;
  setIsLoading(true);

  const sidebarList = document.getElementById(
    'course-list-container',
  ) as HTMLElement;
  const loadMoreBtn = document.getElementById(
    'btn-load-more',
  ) as HTMLButtonElement;

  if (reset) {
    resetPagination();
    sidebarList.innerHTML = '<p class="loading-text">Carregando...</p>';
    loadMoreBtn.classList.add('hidden');
  } else {
    loadMoreBtn.textContent = 'Carregando...';
    loadMoreBtn.disabled = true;
    incrementPage();
  }

  try {
    const currentPage = getCurrentPage();
    const currentSearch = getCurrentSearch();
    const query = `page=${currentPage}&limit=${LIMIT}&search=${encodeURIComponent(currentSearch)}`;
    const response = await AppUI.apiFetch(`/admin/courses?${query}`);

    const courses = response.data?.courses || response.courses || [];
    const total = response.data?.total || response.total || 0;

    if (reset) {
      sidebarList.innerHTML = '';
    }

    if (courses.length > 0) {
      renderSidebar(courses);

      const hasNext = currentPage * LIMIT < total;

      if (hasNext) {
        loadMoreBtn.classList.remove('hidden');
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML =
          'Carregar Mais <span class="material-symbols-outlined">expand_more</span>';
      } else {
        loadMoreBtn.classList.add('hidden');
      }
    } else {
      if (reset)
        sidebarList.innerHTML =
          '<p class="loading-text">Nenhum curso encontrado.</p>';
      loadMoreBtn.classList.add('hidden');
    }
  } catch (error) {
    console.error(error);
    if (reset)
      sidebarList.innerHTML =
        '<p class="loading-text text-danger">Erro ao carregar cursos</p>';
  } finally {
    setIsLoading(false);
    if (!reset) {
      loadMoreBtn.disabled = false;
    }
  }
}

/**
 * Render courses in sidebar
 */
function renderSidebar(courses: any[]): void {
  const sidebarList = document.getElementById(
    'course-list-container',
  ) as HTMLElement;

  courses.forEach((course) => {
    const card = document.createElement('div');
    card.className = 'course-card-nav';
    card.dataset.id = course.id;

    const imgHtml = course.coverImageUrl
      ? `<img src="${course.coverImageUrl}" alt="cover">`
      : `<span class="material-symbols-outlined placeholder-icon">school</span>`;

    const studentCount =
      course.enrolledCount !== undefined ? course.enrolledCount : 0;
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

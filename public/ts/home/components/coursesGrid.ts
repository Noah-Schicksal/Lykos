import { el } from '../utils/dom.js';
import { renderCourseCard } from './courseCard.js';
import { Course } from '../../modules/courses.js';

/**
 * Renders the courses section container
 */
export function renderCoursesSection(): HTMLElement {
  return el(
    'section',
    { id: 'courses-section', className: 'courses-section' },
    el(
      'div',
      { className: 'section-container' },
      el('div', { id: 'filters-placeholder' }),
      el('div', { id: 'pagination-top', className: 'pagination' }),
      el(
        'div',
        { id: 'courses-grid', className: 'courses-grid' },
        el('p', { className: 'loading-message' }, 'Carregando cursos...'),
      ),
      el('div', { id: 'pagination-bottom', className: 'pagination' }),
    ),
  );
}

/**
 * Updates the courses grid with new courses
 */
export function updateCoursesGrid(
  courses: Course[],
  onAddToCart: (courseId: string) => void,
): void {
  const gridContainer = document.getElementById('courses-grid');
  if (!gridContainer) return;

  if (courses.length === 0) {
    gridContainer.innerHTML = '';
    gridContainer.appendChild(
      el(
        'p',
        {
          style:
            'grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;',
        },
        'Nenhum curso encontrado.',
      ),
    );
    return;
  }

  gridContainer.innerHTML = '';

  courses.forEach((course) => {
    const card = renderCourseCard(course);

    // Add click listener to navigate to course detail
    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.btn-add-cart')) return;
      window.location.href = `/course-detail.html?id=${course.id}`;
    });

    gridContainer.appendChild(card);
  });

  // Add event listeners for cart buttons
  const cartBtns = gridContainer.querySelectorAll('.btn-add-cart');
  cartBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const courseId = btn.getAttribute('data-course-id');
      if (courseId) {
        onAddToCart(courseId);
      }
    });
  });
}

/**
 * Shows loading state in the grid
 */
export function showGridLoading(): void {
  const gridContainer = document.getElementById('courses-grid');
  if (gridContainer) {
    gridContainer.innerHTML = '';
    gridContainer.appendChild(
      el(
        'p',
        {
          style:
            'grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;',
        },
        'Carregando cursos...',
      ),
    );
  }
}

/**
 * Shows error state in the grid
 */
export function showGridError(): void {
  const gridContainer = document.getElementById('courses-grid');
  if (gridContainer) {
    gridContainer.innerHTML = '';
    gridContainer.appendChild(
      el(
        'p',
        {
          style:
            'grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 2rem;',
        },
        'Erro ao carregar cursos. Por favor, tente novamente mais tarde.',
      ),
    );
  }
}

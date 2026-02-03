import { el, icon, clearChildren } from '../utils/dom.js';
import type { Course } from '../state/instructorState.js';

export function renderSidebar(): HTMLElement {
  return el('aside', { id: 'instructor-sidebar', className: 'dashboard-sidebar' },
    el('div', { className: 'sidebar-header' },
      el('div', { className: 'sidebar-header-top' },
        el('h2', { className: 'sidebar-title' }, 'Meus Cursos'),
        el('button', { id: 'btn-toggle-sidebar', className: 'sidebar-toggle-btn' },
          icon('menu')
        )
      ),
      el('button', { id: 'btn-create-new-course', className: 'btn-primary-dash' },
        icon('add_circle'),
        el('span', { className: 'btn-text' }, 'Criar Novo Curso')
      )
    ),
    el('div', { id: 'courses-sidebar-list', className: 'sidebar-list' },
      el('div', { className: 'sidebar-loading' },
        el('span', { className: 'material-symbols-outlined spin' }, 'sync'),
        'Carregando...'
      )
    )
  );
}

export function updateSidebarCourses(courses: Course[]): void {
  const listContainer = document.getElementById('courses-sidebar-list');
  if (!listContainer) return;

  clearChildren(listContainer);

  if (courses.length === 0) {
    listContainer.appendChild(
      el('div', { className: 'sidebar-empty' },
        el('p', null, 'Nenhum curso criado ainda.')
      )
    );
    return;
  }

  courses.forEach((course) => {
    listContainer.appendChild(renderCourseItem(course));
  });
}

function renderCourseItem(course: Course): HTMLElement {
  return el('div', { className: 'sidebar-item', 'data-course-id': course.id },
    el('div', { className: 'sidebar-item-cover' },
      el('img', { src: course.coverImage || 'assets/default-course.png', alt: course.title })
    ),
    el('div', { className: 'sidebar-item-info' },
      el('h4', { className: 'sidebar-item-title' }, course.title),
      el('p', { className: 'sidebar-item-meta' }, course.categoryName || 'Sem categoria')
    )
  );
}

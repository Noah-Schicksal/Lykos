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
  const imageUrl = course.coverImageUrl || course.coverImage;

  return el('div', { className: 'course-list-item', 'data-course-id': course.id },
    el('div', { className: 'course-item-thumb' },
      imageUrl
        ? el('img', { src: imageUrl, alt: course.title })
        : el('span', { className: 'material-symbols-outlined' }, 'video_library')
    ),
    el('div', { className: 'course-item-info' },
      el('h4', { className: 'course-item-title' }, course.title),
      el('p', { className: 'course-item-meta' }, course.categoryName || course.category?.name || 'Sem categoria')
    )
  );
}

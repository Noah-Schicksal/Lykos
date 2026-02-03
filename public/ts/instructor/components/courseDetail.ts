import { el, icon } from '../utils/dom.js';
import type { Course } from '../state/instructorState.js';

function infoItem(label: string, value: string): HTMLElement {
  return el('div', { className: 'info-item' },
    el('span', { className: 'info-label' }, label),
    el('span', { className: 'info-value' }, value)
  );
}

function detailSection(id: string, title: string, ...children: (HTMLElement | null)[]): HTMLElement {
  return el('div', { className: 'detail-section', id },
    el('h3', null, title),
    ...children.filter(Boolean) as HTMLElement[]
  );
}

function actionButton(id: string, iconName: string, text: string, className: string): HTMLElement {
  return el('button', { id, className },
    icon(iconName),
    ` ${text}`
  );
}

export function renderCourseDetail(course: Course): HTMLElement {
  return el('div', null,
    
    renderHeader(course),
    
    course.coverImage ? renderCover(course) : null,
    
    renderBody(course)
  );
}

function renderHeader(course: Course): HTMLElement {
  return el('div', { className: 'detail-header' },
    el('div', { className: 'detail-title-wrapper' },
      el('h1', { id: 'detail-title', className: 'detail-title' }, course.title)
    ),
    el('div', { className: 'detail-actions' },
      actionButton('btn-edit-current', 'edit', 'Editar', 'btn-secondary-dash'),
      actionButton('btn-delete-current', 'delete', 'Excluir', 'btn-danger-outline')
    )
  );
}

function renderCover(course: Course): HTMLElement {
  return el('div', { className: 'detail-cover', id: 'detail-cover' },
    el('img', { src: course.coverImage!, alt: course.title })
  );
}

function renderBody(course: Course): HTMLElement {
  return el('div', { className: 'detail-body' },
    
    detailSection('course-description-section', 'Sobre o Curso',
      el('p', { id: 'detail-description' }, course.description)
    ),
   
    renderInfoSection(course),
    
    renderContentSection()
  );
}

function renderInfoSection(course: Course): HTMLElement {
  const infoItems: HTMLElement[] = [
    infoItem('Preço:', formatPrice(course.price)),
  ];

  if (course.maxStudents) {
    infoItems.push(infoItem('Máximo de Alunos:', course.maxStudents.toString()));
  }

  infoItems.push(infoItem('Categoria:', course.categoryName || 'Sem categoria'));

  return el('div', { className: 'detail-section', id: 'course-price-section' },
    el('h3', null, 'Informações do Curso'),
    el('div', { className: 'course-info-grid' }, ...infoItems)
  );
}

function renderContentSection(): HTMLElement {
  return el('div', { className: 'detail-section', id: 'course-content-section' },
    
    el('div', { className: 'section-header-inline' },
      el('h3', null, 'Conteúdo do Curso'),
      el('button', { id: 'btn-toggle-content', className: 'btn-secondary-dash btn-small' },
        icon('edit_note'),
        ' Editar Conteúdo'
      )
    ),
    
    el('div', { id: 'course-content-area', className: 'hidden' },
      el('div', { className: 'sidebar-loading' },
        el('span', { className: 'material-symbols-outlined spin' }, 'sync'),
        'Carregando...'
      )
    ),
   
    el('div', { id: 'course-content-summary' },
      el('span', { className: 'text-muted' },
        'Clique em "Editar Conteúdo" para gerenciar módulos e aulas.'
      )
    )
  );
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

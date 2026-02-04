import { el, icon } from '../utils/dom.js';
import type { Course } from '../state/instructorState.js';

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
  const coverImage = course.coverImageUrl || course.coverImage;
  
  return el('div', null,
    
    renderHeader(course),
    
    coverImage ? renderCover(coverImage, course.title) : null,
    
    renderBody(course)
  );
}

function renderHeader(course: Course): HTMLElement {
  const categoryName = course.category?.name || course.categoryName || null;
  
  return el('div', { className: 'detail-header' },
    el('div', { className: 'detail-title-wrapper' },
      el('h1', { id: 'detail-title', className: 'detail-title' }, course.title),
      categoryName ? el('div', { className: 'detail-meta' },
        el('span', { className: 'detail-category-badge' },
          icon('folder'),
          categoryName
        )
      ) : null
    ),
    el('div', { className: 'detail-actions' },
      actionButton('btn-edit-current', 'edit', 'Editar Curso', 'btn-secondary-dash'),
      actionButton('btn-delete-current', 'delete', 'Excluir', 'btn-danger-outline')
    )
  );
}

function renderCover(imageUrl: string, title: string): HTMLElement {
  return el('div', { className: 'detail-cover', id: 'detail-cover' },
    el('img', { src: imageUrl, alt: title })
  );
}

function renderBody(course: Course): HTMLElement {
  return el('div', { className: 'detail-body' },
    // Linha de overview com descrição + informações lado a lado
    el('div', { className: 'detail-overview-row' },
      // Coluna da descrição
      el('div', { className: 'detail-section detail-description-section', id: 'course-description-section' },
        el('div', { className: 'section-title-row' },
          el('div', { className: 'section-title-icon' }, icon('description')),
          el('h3', null, 'Sobre o Curso')
        ),
        el('p', { id: 'detail-description' }, course.description || 'Nenhuma descrição disponível.')
      ),
      // Coluna das informações
      renderInfoSection(course)
    ),
    // Seção de conteúdo (ocupa toda a largura)
    renderContentSection()
  );
}

function renderInfoSection(course: Course): HTMLElement {
  const categoryName = course.category?.name || course.categoryName || 'Sem categoria';
  
  return el('div', { className: 'detail-section detail-info-section', id: 'course-price-section' },
    el('div', { className: 'section-title-row' },
      el('div', { className: 'section-title-icon' }, icon('info')),
      el('h3', null, 'Informações')
    ),
    el('div', { className: 'info-cards-list' },
      // Preço
      el('div', { className: 'info-card' },
        el('div', { className: 'info-card-icon' }, icon('payments')),
        el('div', { className: 'info-card-content' },
          el('span', { className: 'info-card-label' }, 'Preço'),
          el('span', { className: 'info-card-value info-card-price' }, formatPrice(course.price))
        )
      ),
      // Categoria
      el('div', { className: 'info-card' },
        el('div', { className: 'info-card-icon' }, icon('category')),
        el('div', { className: 'info-card-content' },
          el('span', { className: 'info-card-label' }, 'Categoria'),
          el('span', { className: 'info-card-value' }, categoryName)
        )
      ),
      // Máximo de Alunos (se definido)
      course.maxStudents ? el('div', { className: 'info-card' },
        el('div', { className: 'info-card-icon' }, icon('group')),
        el('div', { className: 'info-card-content' },
          el('span', { className: 'info-card-label' }, 'Máx. Alunos'),
          el('span', { className: 'info-card-value' }, course.maxStudents.toString())
        )
      ) : null
    )
  );
}

function renderContentSection(): HTMLElement {
  return el('div', { className: 'detail-section detail-content-section', id: 'course-content-section' },
    
    el('div', { className: 'section-header-inline' },
      el('div', { className: 'section-title-row' },
        el('div', { className: 'section-title-icon' }, icon('school')),
        el('h3', null, 'Conteúdo do Curso')
      ),
      el('button', { id: 'btn-toggle-content', className: 'btn-content-toggle' },
        icon('edit_note'),
        el('span', null, 'Gerenciar Conteúdo')
      )
    ),
    
    el('div', { id: 'course-content-area', className: 'hidden' },
      el('div', { className: 'sidebar-loading' },
        el('span', { className: 'material-symbols-outlined spin' }, 'sync'),
        'Carregando...'
      )
    ),
   
    el('div', { id: 'course-content-summary', className: 'content-summary-hint' },
      el('div', { className: 'hint-icon' }, icon('video_library')),
      el('div', { className: 'hint-text' },
        el('p', null, 'Organize o conteúdo do seu curso'),
        el('span', null, 'Crie módulos e adicione aulas com vídeos e materiais de apoio.')
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

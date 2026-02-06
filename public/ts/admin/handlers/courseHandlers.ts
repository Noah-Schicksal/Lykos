/**
 * Course Handlers - Course details, modules, lessons
 */

import { AppUI } from '../../utils/ui.js';
import { setCurrentCourseId } from '../state/adminState.js';
import { resetDangerZone } from './dangerZoneHandlers.js';

/**
 * Load course details
 */
export async function loadCourseDetails(id: string): Promise<void> {
  const emptyState = document.getElementById('empty-state') as HTMLElement;
  const detailsView = document.getElementById('course-details') as HTMLElement;
  const detailTitle = document.getElementById('detail-title') as HTMLElement;
  const detailDesc = document.getElementById(
    'detail-description',
  ) as HTMLElement;
  const modulesList = document.getElementById('modules-list') as HTMLElement;

  // Active state in sidebar
  document
    .querySelectorAll('.course-card-nav')
    .forEach((el) => el.classList.remove('active'));
  const activeCard = document.querySelector(
    `.course-card-nav[data-id="${id}"]`,
  );
  if (activeCard) activeCard.classList.add('active');

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) sidebar.classList.add('closed');
  }

  // Show details view
  emptyState.classList.add('hidden');
  detailsView.classList.remove('hidden');

  // Reset contents
  detailTitle.textContent = 'Carregando...';
  detailDesc.textContent = '';
  modulesList.innerHTML = '';
  setCurrentCourseId(id);

  // Reset Danger Zone State
  resetDangerZone();

  try {
    const response = await AppUI.apiFetch(`/admin/courses/${id}`);
    const course = response.data || response;
    renderDetails(course);
  } catch (error) {
    console.error(error);
    AppUI.showMessage('Erro ao carregar detalhes do curso', 'error');
  }
}

/**
 * Render course details
 */
function renderDetails(course: any): void {
  const detailTitle = document.getElementById('detail-title') as HTMLElement;
  const detailId = document.getElementById('detail-id') as HTMLElement;
  const detailDesc = document.getElementById(
    'detail-description',
  ) as HTMLElement;
  const modulesList = document.getElementById('modules-list') as HTMLElement;

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
    modulesList.innerHTML =
      '<div style="padding: 2rem; border: 1px dashed rgba(255,255,255,0.1); border-radius: 0.5rem; text-align: center; color: #64748b;">Nenhum módulo encontrado.</div>';
  }
}

/**
 * Create module element
 */
function createModuleElement(module: any): HTMLElement {
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
        ${
          module.classes && module.classes.length > 0
            ? module.classes
                .map((lesson: any) => createLessonItem(lesson))
                .join('')
            : '<li style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.875rem;">Nenhuma aula cadastrada neste módulo</li>'
        }
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

/**
 * Create lesson item HTML
 */
function createLessonItem(lesson: any): string {
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

/**
 * Show empty state
 */
export function showEmptyState(): void {
  const emptyState = document.getElementById('empty-state') as HTMLElement;
  const detailsView = document.getElementById('course-details') as HTMLElement;

  emptyState.classList.remove('hidden');
  detailsView.classList.add('hidden');
  document
    .querySelectorAll('.course-card-nav')
    .forEach((el) => el.classList.remove('active'));
  setCurrentCourseId(null);
}

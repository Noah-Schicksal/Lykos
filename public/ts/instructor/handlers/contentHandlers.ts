import { Modules } from '../../modules/modules.js';
import { Classes } from '../../modules/classes.js';
import { AppUI } from '../../utils/ui.js';
import { getCurrentCourseId, setContentExpanded } from '../state/instructorState.js';
import { renderContentTree } from '../components/contentEditor.js';
import { customConfirm, el, icon, clearChildren } from '../utils/dom.js';

// Track if listeners have been set up for a specific container
const listenersSetup = new WeakSet<HTMLElement>();

export function setupContentHandlers(): void {
  // This function is called on init, but the content area doesn't exist yet.
  // We'll set up listeners when the content area is first expanded.
  // See toggleCourseContent and setupContentAreaListeners
}

function setupContentAreaListeners(contentArea: HTMLElement): void {
  // Prevent duplicate listeners
  if (listenersSetup.has(contentArea)) return;
  listenersSetup.add(contentArea);
  
  setupContentTreeListeners(contentArea);
}

function setupContentTreeListeners(contentArea: HTMLElement): void {
  contentArea.addEventListener('click', async (e) => {
    const target = (e.target as HTMLElement).closest('button');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const courseId = getCurrentCourseId();
    if (!courseId) return;

    switch (action) {
      case 'create-module':
        await handleCreateModule(courseId);
        break;
      case 'create-class':
        const moduleId = target.getAttribute('data-module-id');
        if (moduleId) await handleCreateClass(moduleId, courseId);
        break;
      case 'delete-module':
        const delModuleId = target.getAttribute('data-id');
        if (delModuleId) await handleDeleteModule(delModuleId, courseId);
        break;
      case 'delete-class':
        const delClassId = target.getAttribute('data-id');
        if (delClassId) await handleDeleteClass(delClassId, courseId);
        break;
      case 'remove-video':
        const videoClassId = target.getAttribute('data-class-id');
        if (videoClassId) await handleRemoveClassVideo(videoClassId, courseId);
        break;
      case 'remove-material':
        const materialClassId = target.getAttribute('data-class-id');
        if (materialClassId) await handleRemoveClassMaterial(materialClassId, courseId);
        break;
      case 'upload-video':
      case 'upload-material':
        const fileInput = target.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.click();
        break;
    }
  });

  contentArea.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    if (input.type !== 'file') return;

    const action = input.getAttribute('data-action');
    const classId = input.getAttribute('data-class-id');
    const file = input.files?.[0];

    if (!classId || !file) return;

    if (action === 'upload-video') {
      await handleUploadClassVideo(classId, file);
    } else if (action === 'upload-material') {
      await handleUploadClassMaterial(classId, file);
    }

    input.value = '';
  });

  // Use event delegation for blur events on editable titles
  contentArea.addEventListener('blur', async (e) => {
    const element = e.target as HTMLElement;
    
    // Handle editable titles
    if (element.classList.contains('editable-title')) {
      const moduleId = element.getAttribute('data-module-id');
      const classId = element.getAttribute('data-class-id');
      const newTitle = element.textContent?.trim() || '';

      if (!newTitle) {
        element.textContent = element.getAttribute('data-original') || 'Sem título';
        return;
      }

      if (moduleId) {
        await handleUpdateModuleTitle(moduleId, newTitle);
      } else if (classId) {
        await handleUpdateClassTitle(classId, newTitle);
      }
    }
    
    // Handle URL inputs
    if (element.classList.contains('tree-input') && element.hasAttribute('data-field')) {
      const inputEl = element as HTMLInputElement;
      if (inputEl.readOnly) return;

      const classId = inputEl.getAttribute('data-class-id');
      const field = inputEl.getAttribute('data-field');
      const value = inputEl.value.trim();

      if (classId && field) {
        await handleUpdateClassField(classId, field, value);
      }
    }
  }, true); // Use capture phase for blur events

  // Use event delegation for focus events on editable titles
  contentArea.addEventListener('focusin', (e) => {
    const element = e.target as HTMLElement;
    
    if (element.classList.contains('editable-title')) {
      // Store original value
      if (!element.hasAttribute('data-original')) {
        element.setAttribute('data-original', element.textContent || '');
      }
      
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(element);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  });
}

export function setupContentToggle(courseId: string): void {
  const btnToggle = document.getElementById('btn-toggle-content');
  if (btnToggle) {
    btnToggle.addEventListener('click', () =>
      toggleCourseContent(courseId),
    );
  }
}

async function toggleCourseContent(courseId: string): Promise<void> {
  const contentArea = document.getElementById('course-content-area');
  const summaryArea = document.getElementById('course-content-summary');
  const descriptionSection = document.getElementById(
    'course-description-section',
  );
  const detailBody = document.querySelector('.detail-body');
  const btnToggle = document.getElementById('btn-toggle-content');

  if (!contentArea || !summaryArea) return;

  const isExpanded = contentArea.classList.contains('hidden');
  setContentExpanded(isExpanded);

  if (isExpanded) {
    contentArea.classList.remove('hidden');
    summaryArea.classList.add('hidden');

    if (descriptionSection) descriptionSection.classList.add('hidden');
    if (detailBody) detailBody.classList.add('expanded-mode');

    if (btnToggle) {
      clearChildren(btnToggle);
      const closeIcon = icon('close');
      closeIcon.style.fontSize = '1rem';
      btnToggle.appendChild(closeIcon);
      btnToggle.appendChild(document.createTextNode(' Fechar Edição'));
    }

    // Setup listeners for the content area (only once)
    setupContentAreaListeners(contentArea);

    await renderContentTreeInArea(courseId);
  } else {
    contentArea.classList.add('hidden');
    summaryArea.classList.remove('hidden');

    if (descriptionSection) descriptionSection.classList.remove('hidden');
    if (detailBody) detailBody.classList.remove('expanded-mode');

    if (btnToggle) {
      clearChildren(btnToggle);
      const editIcon = icon('edit_note');
      editIcon.style.fontSize = '1rem';
      btnToggle.appendChild(editIcon);
      btnToggle.appendChild(document.createTextNode(' Editar Conteúdo'));
    }
  }
}

async function renderContentTreeInArea(courseId: string): Promise<void> {
  const container = document.getElementById('course-content-area');
  const scrollContainer = document.getElementById('dashboard-content');
  if (!container) return;

  let savedScrollTop = 0;
  if (scrollContainer) savedScrollTop = scrollContainer.scrollTop;

  if (!container.hasChildNodes()) {
    clearChildren(container);
    const loadingDiv = el('div', { className: 'sidebar-loading' },
      el('span', { className: 'material-symbols-outlined spin' }, 'sync'),
      ' Carregando árvore de conteúdo...'
    );
    container.appendChild(loadingDiv);
  }

  try {
    const modules = await Modules.getByCourse(courseId);

    const modulesWithClasses = await Promise.all(
      modules.map(async (m) => {
        const fullModule = await Modules.getById(m.id);
        return fullModule;
      }),
    );

    const contentTreeElement = renderContentTree(modulesWithClasses);
    clearChildren(container);
    container.appendChild(contentTreeElement);

    // Listeners are already set up via event delegation in setupContentHandlers
    // No need to call setupContentTreeListeners again

    if (scrollContainer) scrollContainer.scrollTop = savedScrollTop;
  } catch (error: any) {
    console.error('Error rendering content tree:', error);
    clearChildren(container);
    container.appendChild(
      el('p', { className: 'text-danger' }, 'Erro ao carregar conteúdo.')
    );
  }
}

async function handleCreateModule(courseId: string): Promise<void> {
  const input = document.getElementById('new-module-title') as HTMLInputElement;
  if (!input) return;

  const title = input.value.trim();
  if (!title) {
    AppUI.showMessage('Digite o nome do módulo', 'info');
    return;
  }

  try {
    await Modules.create(courseId, { title, orderIndex: 99 });
    await renderContentTreeInArea(courseId);
    AppUI.showMessage('Módulo criado', 'success');
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao criar módulo', 'error');
  }
}

async function handleUpdateModuleTitle(
  moduleId: string,
  newTitle: string,
): Promise<void> {
  try {
    await Modules.update(moduleId, { title: newTitle });
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao atualizar módulo', 'error');
  }
}

async function handleDeleteModule(
  moduleId: string,
  courseId: string,
): Promise<void> {
  const confirmed = await customConfirm(
    'Excluir Módulo?',
    'Tem certeza que deseja excluir este módulo e todas as suas aulas?',
  );

  if (!confirmed) return;

  try {
    await Modules.delete(moduleId);
    await renderContentTreeInArea(courseId);
    AppUI.showMessage('Módulo excluído', 'success');
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao excluir módulo', 'error');
  }
}

async function handleCreateClass(
  moduleId: string,
  courseId: string,
): Promise<void> {
  try {
    await Modules.createClass(moduleId, {
      title: 'Nova Aula (Clique para editar)',
      description: '',
      videoUrl: '',
    });
    await renderContentTreeInArea(courseId);
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao criar aula', 'error');
  }
}

async function handleUpdateClassTitle(
  classId: string,
  newTitle: string,
): Promise<void> {
  try {
    await Classes.update(classId, { title: newTitle });
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao atualizar aula', 'error');
  }
}

async function handleUpdateClassField(
  classId: string,
  field: string,
  value: string,
): Promise<void> {
  try {
    if (field === 'videoUrl' || field === 'materialUrl') {
      const data: any = { [field]: value };
      await Classes.update(classId, data);
    }
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao atualizar aula', 'error');
  }
}

async function handleUploadClassMaterial(
  classId: string,
  file: File,
): Promise<void> {
  const courseId = getCurrentCourseId();
  try {
    await Classes.uploadMaterial(classId, file);
    AppUI.showMessage('Arquivo enviado!', 'success');
    if (courseId) await renderContentTreeInArea(courseId);
  } catch (error: any) {
    // Erro já é tratado no módulo Classes
  }
}

async function handleUploadClassVideo(
  classId: string,
  file: File,
): Promise<void> {
  const courseId = getCurrentCourseId();
  try {
    if (file.type !== 'video/mp4') {
      AppUI.showMessage('Por favor, envie apenas arquivos MP4.', 'error');
      return;
    }
    AppUI.showMessage('Enviando vídeo...', 'info');
    await Classes.uploadVideo(classId, file);
    AppUI.showMessage('Vídeo enviado!', 'success');
    if (courseId) await renderContentTreeInArea(courseId);
  } catch (error: any) {
    // Erro já é tratado no módulo Classes
  }
}

async function handleDeleteClass(
  classId: string,
  courseId: string,
): Promise<void> {
  const confirmed = await customConfirm(
    'Excluir Aula?',
    'Tem certeza que deseja excluir esta aula?',
  );

  if (!confirmed) return;

  try {
    await Classes.delete(classId);
    await renderContentTreeInArea(courseId);
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao excluir aula', 'error');
  }
}

async function handleRemoveClassVideo(
  classId: string,
  courseId: string,
): Promise<void> {
  const confirmed = await customConfirm(
    'Remover Vídeo?',
    'Tem certeza que deseja remover o vídeo desta aula?',
  );

  if (!confirmed) return;

  try {
    await Classes.update(classId, { videoUrl: '' });
    await renderContentTreeInArea(courseId);
    AppUI.showMessage('Vídeo removido', 'success');
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao remover vídeo', 'error');
  }
}

async function handleRemoveClassMaterial(
  classId: string,
  courseId: string,
): Promise<void> {
  const confirmed = await customConfirm(
    'Remover Material?',
    'Tem certeza que deseja remover o material desta aula?',
  );

  if (!confirmed) return;

  try {
    await Classes.update(classId, { materialUrl: '' });
    await renderContentTreeInArea(courseId);
    AppUI.showMessage('Material removido', 'success');
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao remover material', 'error');
  }
}

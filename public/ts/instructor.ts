// Instructor Dashboard Main File

import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';
import { Courses } from './modules/courses.js';
import { Modules } from './modules/modules.js';
import { Classes } from './modules/classes.js';
import { Categories } from './modules/categories.js';

// Expose modules to window for debugging
declare global {
  interface Window {
    AppUI: typeof AppUI;
    Auth: typeof Auth;
    Courses: typeof Courses;
    Modules: typeof Modules;
    Classes: typeof Classes;
    Categories: typeof Categories;
  }
}

window.AppUI = AppUI;
window.Auth = Auth;
window.Courses = Courses;
window.Modules = Modules;
window.Classes = Classes;
window.Categories = Categories;

// State management
let currentCourseId: string | null = null;
let allCategories: any[] = [];

// Initialize app
async function init() {
  await checkAuth();
  await loadCategories();
  await loadCoursesSidebar();
  setupGlobalEventListeners();
}

// Check authentication and role
async function checkAuth() {
  try {
    const user = await Auth.getUserProfile();

    if (!user) {
      AppUI.showMessage(
        'Por favor, faça login para acessar o dashboard de instrutor',
        'error',
      );
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }

    if (user.role !== 'INSTRUCTOR') {
      AppUI.showMessage('Acesso negado. É necessário ser instrutor.', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }
  } catch (error) {
    AppUI.showMessage(
      'Erro ao verificar autenticação. Redirecionando...',
      'error',
    );
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  }
}

// Load categories globally
async function loadCategories() {
  try {
    allCategories = await Categories.getAll();
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

// Load courses into sidebar
async function loadCoursesSidebar() {
  const listContainer = document.getElementById('courses-sidebar-list');
  if (!listContainer) return;

  try {
    // Show loading
    listContainer.innerHTML = `
      <div class="sidebar-loading">
        <span class="material-symbols-outlined spin">sync</span> Carregando...
      </div>
    `;

    const courses = await Courses.getMyCourses();

    if (!courses || courses.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p>Nenhum curso.</p>
        </div>
      `;
      // If we are not in create mode, show empty state
      if (!currentCourseId) {
        showEmptyState();
      }
      return;
    }

    // Render list
    listContainer.innerHTML = courses.map((course: any) => `
      <div class="course-list-item ${currentCourseId === course.id ? 'active' : ''}" data-course-id="${course.id}">
        <div class="course-item-thumb">
           ${course.coverImageUrl
        ? `<img src="/courses/${course.id}/cover" alt="Cover" />`
        : '<span class="material-symbols-outlined">school</span>'}
        </div>
        <div class="course-item-info">
          <p class="course-item-title">${course.title}</p>
          <p class="course-item-meta">${course.category?.name || 'Sem categoria'}</p>
        </div>
      </div>
    `).join('');

    // Attach click listeners
    document.querySelectorAll('.course-list-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.courseId;
        if (id) selectCourse(id);
      });
    });

  } catch (error) {
    console.error('Falha ao carregar cursos:', error);
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 1rem; color: var(--danger);">
        Erro ao carregar.
      </div>
    `;
  }
}

// Setup Global Listeners
function setupGlobalEventListeners() {
  // Create New Course Button
  document.getElementById('btn-create-new-course')?.addEventListener('click', () => {
    showCreateCourseView();
  });
}

// Select a course from sidebar
async function selectCourse(courseId: string) {
  currentCourseId = courseId;

  // Update sidebar active state & Manage Badges
  document.querySelectorAll('.course-list-item').forEach(el => {
    el.classList.remove('active');
    // Remove existing badges if any
    const badge = el.querySelector('.editing-badge');
    if (badge) badge.remove();
  });

  const activeItem = document.querySelector(`.course-list-item[data-course-id="${courseId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');

    // Add "Em Edição" badge
    const badge = document.createElement('span');
    badge.className = 'editing-badge';
    badge.textContent = 'Em Edição';
    activeItem.appendChild(badge);
  }

  await renderCourseDetails(courseId);
}

// Show Empty State
function showEmptyState() {
  currentCourseId = null;
  const contentArea = document.getElementById('dashboard-content');
  if (!contentArea) return;

  contentArea.innerHTML = `
    <div class="empty-state-view">
       <span class="material-symbols-outlined" style="font-size: 4rem; color: var(--text-muted);">arrow_back</span>
       <h3>Selecione um curso</h3>
       <p>Escolha um curso na lista lateral para ver detalhes ou editar.</p>
    </div>
  `;
}

// Render Course Details View
async function renderCourseDetails(courseId: string) {
  const contentArea = document.getElementById('dashboard-content');
  const template = document.getElementById('template-course-detail') as HTMLTemplateElement;
  if (!contentArea || !template) return;

  // Show loading in main area
  contentArea.innerHTML = '<div class="sidebar-loading"><span class="material-symbols-outlined spin">sync</span> Carregando detalhes...</div>';

  try {
    const course = await Courses.getById(courseId);

    // Clone template
    const clone = template.content.cloneNode(true) as DocumentFragment;

    // Fill data
    setText(clone, 'detail-title', course.title);
    setText(clone, 'detail-category', course.category?.name || 'Sem Categoria');
    setText(clone, 'detail-students', `${course.enrolledCount || 0} alunos`);
    setText(clone, 'detail-description', course.description || 'Sem descrição.');

    // Cover
    const coverContainer = clone.getElementById('detail-cover');
    // Using querySelector since we are working with a fragment and getElementById might not work on some browsers/TS versions on non-document
    if (coverContainer) {
      if (course.coverImageUrl) {
        coverContainer.innerHTML = `<img src="/courses/${course.id}/cover" alt="${course.title}" />`;
      } else {
        coverContainer.innerHTML = '<span class="material-symbols-outlined" style="font-size: 4rem;">school</span>';
      }
    }

    // Buttons
    clone.getElementById('btn-edit-current')?.addEventListener('click', () => {
      showEditCourseView(course);
    });

    clone.getElementById('btn-delete-current')?.addEventListener('click', () => {
      deleteCourse(course.id);
    });

    contentArea.innerHTML = '';
    contentArea.appendChild(clone);

    // Setup Content Editor Listeners (Must be after appending to DOM)
    setupContentListeners(courseId);

  } catch (error) {
    contentArea.innerHTML = `<div class="empty-state-view">Erro ao carregar detalhes do curso.</div>`;
    console.error(error);
  }
}

// Show Create Course Form
function showCreateCourseView() {
  currentCourseId = null; // No course selected
  document.querySelectorAll('.course-list-item').forEach(el => el.classList.remove('active'));

  const contentArea = document.getElementById('dashboard-content');
  const template = document.getElementById('template-course-form') as HTMLTemplateElement;
  if (!contentArea || !template) return;

  contentArea.innerHTML = '';
  const clone = template.content.cloneNode(true) as DocumentFragment;

  // Setup Form for Create
  setText(clone, 'form-view-title', 'Criar Novo Curso');

  // Populate Categories
  const selectInfo = clone.getElementById('course-category') as HTMLSelectElement;
  populateCategories(selectInfo);

  // Currency Mask
  const priceInput = clone.getElementById('course-price') as HTMLInputElement;
  if (priceInput) setupCurrencyMask(priceInput);

  // Handle Submit
  const form = clone.getElementById('course-inline-form') as HTMLFormElement;
  form.addEventListener('submit', handleCourseSubmit);

  // Handle Cancel
  clone.getElementById('btn-cancel-form')?.addEventListener('click', () => {
    showEmptyState();
  });

  contentArea.appendChild(clone);
}

// Show Edit Course Form
function showEditCourseView(course: any) {
  const contentArea = document.getElementById('dashboard-content');
  const template = document.getElementById('template-course-form') as HTMLTemplateElement;
  if (!contentArea || !template) return;

  contentArea.innerHTML = '';
  const clone = template.content.cloneNode(true) as DocumentFragment;

  // Setup Form for Edit
  setText(clone, 'form-view-title', 'Editar Curso');
  (clone.getElementById('course-id') as HTMLInputElement).value = course.id;
  (clone.getElementById('course-title') as HTMLInputElement).value = course.title;
  (clone.getElementById('course-description') as HTMLTextAreaElement).value = course.description || '';

  // Price
  const priceInput = clone.getElementById('course-price') as HTMLInputElement;
  if (priceInput) {
    const priceInCents = Math.round((course.price || 0) * 100);
    priceInput.value = (priceInCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setupCurrencyMask(priceInput);
  }

  // Max Students
  if (course.maxStudents) {
    (clone.getElementById('course-max-students') as HTMLInputElement).value = course.maxStudents;
  }

  // Populate Categories & Set Value
  const selectInfo = clone.getElementById('course-category') as HTMLSelectElement;
  populateCategories(selectInfo, course.category?.id || course.categoryId);

  // Cover Preview
  const coverInput = clone.getElementById('course-cover');
  if (coverInput && course.coverImageUrl) {
    const previewContainer = clone.getElementById('cover-preview-container');
    if (previewContainer) {
      previewContainer.innerHTML = `<img src="/courses/${course.id}/cover" alt="Cover" />`;
    }
  }

  // Disable/Hide Image Upload in Edit Mode
  const uploadWrapper = clone.querySelector('.file-upload-wrapper');
  if (uploadWrapper) {
    (uploadWrapper as HTMLElement).style.display = 'none';
    // Append a note saying image cannot be edited
    const note = document.createElement('p');
    note.textContent = 'A imagem de capa não pode ser alterada na edição.';
    note.style.color = 'var(--text-muted)';
    note.style.fontSize = '0.8rem';
    note.style.fontStyle = 'italic';
    uploadWrapper.parentElement?.appendChild(note);
  }

  // Handle Submit
  const form = clone.getElementById('course-inline-form') as HTMLFormElement;
  form.addEventListener('submit', handleCourseSubmit);

  // Handle Cancel
  clone.getElementById('btn-cancel-form')?.addEventListener('click', () => {
    renderCourseDetails(course.id);
  });

  contentArea.appendChild(clone);
}

// Helper: Populate Categories
function populateCategories(selectElement: HTMLSelectElement, selectedId?: string) {
  selectElement.innerHTML = '<option value="">Selecione...</option>';
  allCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    if (selectedId && cat.id === selectedId) {
      option.selected = true;
    }
    selectElement.appendChild(option);
  });
}

// Helper: Set Text
function setText(fragment: DocumentFragment | HTMLElement, id: string, text: string) {
  const el = fragment.querySelector(`#${id}`);
  if (el) el.textContent = text;
}

// Handle Form Submit
async function handleCourseSubmit(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;

  // Get values
  const courseId = (document.getElementById('course-id') as HTMLInputElement).value;
  const title = (document.getElementById('course-title') as HTMLInputElement).value;
  const description = (document.getElementById('course-description') as HTMLTextAreaElement).value;
  const categoryId = (document.getElementById('course-category') as HTMLSelectElement).value;
  const priceStr = (document.getElementById('course-price') as HTMLInputElement).value;
  const maxStudentsStr = (document.getElementById('course-max-students') as HTMLInputElement).value;
  const coverInput = document.getElementById('course-cover') as HTMLInputElement;

  // Parse price (pt-BR format 1.234,56 -> float)
  // Remove thousand separators and replace decimal comma
  const rawValue = priceStr.replace(/\./g, '').replace(',', '.');
  const price = rawValue ? parseFloat(rawValue) : 0;

  const data: any = {
    title,
    description,
    price,
    categoryId,
    maxStudents: maxStudentsStr ? parseInt(maxStudentsStr) : undefined
  };

  try {
    let savedCourse;
    if (courseId) {
      // UPDATE
      savedCourse = await Courses.update(courseId, data);
      AppUI.showMessage('Curso atualizado!', 'success');
    } else {
      // CREATE
      const coverFile = coverInput.files ? coverInput.files[0] : undefined;
      savedCourse = await Courses.create(data, coverFile);
      AppUI.showMessage('Curso criado!', 'success');
    }

    // Refresh Sidebar
    await loadCoursesSidebar();

    // Show Details
    if (savedCourse && savedCourse.id) {
      selectCourse(savedCourse.id);
    }

  } catch (error: any) {
    console.error(error);
    AppUI.showMessage(error.message || 'Erro ao salvar', 'error');
  }
}


// --- Currency Mask Helper ---
function setupCurrencyMask(input: HTMLInputElement) {
  const format = () => {
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    if (!value) {
      input.value = '';
      return;
    }
    // Treat as integer cents
    const amount = parseInt(value, 10) / 100;
    // Format as BRL: 1.234,56
    input.value = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  input.addEventListener('input', format);
  // Also format initially if value exists (though usually handled by creation logic)
  // format(); 
}

// Custom Confirm Modal Logic
function customConfirm(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = document.getElementById('delete-confirm-modal');
    const titleEl = modal?.querySelector('.modal-title');
    const msgEl = document.getElementById('modal-msg');
    const btnCancel = document.getElementById('btn-modal-cancel');
    const btnConfirm = document.getElementById('btn-modal-confirm');

    if (!modal || !btnCancel || !btnConfirm) {
      resolve(window.confirm(message));
      return;
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    // Show
    modal.classList.add('active');

    const close = (result: boolean) => {
      modal.classList.remove('active');
      resolve(result);
      // Cleanup listeners
      btnCancel.onclick = null;
      btnConfirm.onclick = null;
    };

    btnCancel.onclick = () => close(false);
    btnConfirm.onclick = () => close(true);
  });
}

// Delete Course
async function deleteCourse(courseId: string) {
  const confirmed = await customConfirm(
    'Excluir Curso?',
    'Tem certeza que deseja excluir este curso? Todas as aulas serão perdidas.'
  );

  if (confirmed) {
    try {
      await Courses.delete(courseId);
      AppUI.showMessage('Curso excluído.', 'success');
      showEmptyState();
      await loadCoursesSidebar();
    } catch (error: any) {
      AppUI.showMessage('Erro ao excluir.', 'error');
    }
  }
}

// --- Inline Tree Content Editor Logic ---

// --- Inline Tree Content Editor Logic ---

let isContentExpanded = false;

// Initialize Content Listeners (called after rendering detail template)
function setupContentListeners(courseId: string) {
  const btnToggle = document.getElementById('btn-toggle-content');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => toggleCourseContent(courseId));
  }

  const contentArea = document.getElementById('course-content-area');
  if (contentArea) {
    // Event Delegation
    contentArea.addEventListener('click', async (e) => {
      const target = (e.target as HTMLElement).closest('button');
      if (!target) return;

      const action = target.dataset.action;
      if (!action) return;

      // Module Actions
      if (action === 'create-module') {
        await handleCreateModule(courseId);
      } else if (action === 'delete-module') {
        const moduleId = target.dataset.id;
        if (moduleId) await handleDeleteModule(moduleId, courseId);
      }
      // Class Actions
      else if (action === 'create-class') {
        const moduleId = target.dataset.moduleId;
        if (moduleId) await handleCreateClass(moduleId, courseId);
      } else if (action === 'delete-class') {
        const classId = target.dataset.id;
        if (classId) await handleDeleteClass(classId, courseId);
      }
    });

    contentArea.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;

      // Upload Material
      if (target.type === 'file' && target.dataset.action === 'upload-material') {
        const classId = target.dataset.classId;
        if (classId && target.files && target.files[0]) {
          await handleUploadClassMaterial(classId, target.files[0]);
        }
        return;
      }

      // Input Fields
      if (!target.classList.contains('tree-input')) return;
      const classId = target.dataset.classId;
      const field = target.dataset.field;

      if (classId && field) {
        await handleUpdateClassField(classId, field, target.value);
      }
    });

    contentArea.addEventListener('focusout', async (e) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('editable-title')) return;

      const newValue = target.innerText.trim();
      const moduleId = target.dataset.moduleId;
      const classId = target.dataset.classId;

      if (moduleId) {
        await handleUpdateModuleTitle(moduleId, newValue);
      } else if (classId) {
        await handleUpdateClassTitle(classId, newValue);
      }
    });
  }
}

async function toggleCourseContent(courseId: string) {
  const contentArea = document.getElementById('course-content-area');
  const summaryArea = document.getElementById('course-content-summary');
  const btnText = document.querySelector('#btn-toggle-content');
  const descriptionSection = document.getElementById('course-description-section');
  const detailBody = document.querySelector('.detail-body');

  if (!contentArea || !summaryArea) return;

  isContentExpanded = !isContentExpanded;

  if (isContentExpanded) {
    contentArea.classList.remove('hidden');
    summaryArea.classList.add('hidden');

    // Expand formatting
    if (descriptionSection) descriptionSection.classList.add('hidden');
    if (detailBody) detailBody.classList.add('expanded-mode');

    if (btnText) btnText.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1rem;">close</span> Fechar Edição';

    await renderContentTree(courseId);
  } else {
    contentArea.classList.add('hidden');
    summaryArea.classList.remove('hidden');

    // Revert formatting
    if (descriptionSection) descriptionSection.classList.remove('hidden');
    if (detailBody) detailBody.classList.remove('expanded-mode');

    if (btnText) btnText.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1rem;">edit_note</span> Editar Conteúdo';
  }
}

async function renderContentTree(courseId: string) {
  const container = document.getElementById('course-content-area');
  const scrollContainer = document.getElementById('dashboard-content');
  if (!container) return;

  // Capture scroll position
  let savedScrollTop = 0;
  if (scrollContainer) savedScrollTop = scrollContainer.scrollTop;

  // Only show loading if empty (initial load)
  if (!container.innerHTML.trim()) {
    container.innerHTML = `<div class="sidebar-loading"><span class="material-symbols-outlined spin">sync</span> Carregando árvore de conteúdo...</div>`;
  }

  try {
    const modules = await Modules.getByCourse(courseId);

    let html = '';

    if (modules.length === 0) {
      html += `<div style="text-align: center; padding: 2rem; border: 1px dashed var(--dash-border); border-radius: 0.5rem; margin-bottom: 1rem;">
                <p class="text-muted">Nenhum módulo criado.</p>
            </div>`;
    } else {
      for (const module of modules) {
        const moduleWithClasses = await Modules.getById(module.id);
        const classes = moduleWithClasses.classes || [];

        html += `
                 <div class="tree-module-node">
                    <div class="tree-module-header">
                        <div class="tree-module-title">
                            <span class="material-symbols-outlined">folder</span>
                            <span contenteditable="true" class="editable-title" data-module-id="${module.id}">${module.title}</span>
                        </div>
                        <button class="tree-btn-icon" data-action="delete-module" data-id="${module.id}" title="Excluir Módulo">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                    
                    <div class="tree-class-list">
                        ${classes.map((cls: any) => `
                        <div class="tree-class-item">
                            <div class="tree-class-header">
                                <div class="tree-class-title">
                                    <span class="material-symbols-outlined" style="font-size: 1rem;">article</span>
                                    <span contenteditable="true" class="editable-title" data-class-id="${cls.id}">${cls.title}</span>
                                </div>
                                <button class="tree-btn-icon" data-action="delete-class" data-id="${cls.id}" title="Excluir Aula">
                                    <span class="material-symbols-outlined" style="font-size: 1rem;">close</span>
                                </button>
                            </div>
                            
                            <div class="tree-input-group">
                                <input type="text" class="tree-input" placeholder="URL do Vídeo (Youtube/Vimeo)" 
                                    value="${cls.videoUrl || ''}" 
                                    data-class-id="${cls.id}" data-field="videoUrl">
                                    
                                <div style="display: flex; gap: 0.5rem; align-items: center; width: 100%;">
                                    <input type="text" class="tree-input" placeholder="URL Material" 
                                        value="${cls.materialUrl || ''}" 
                                        data-class-id="${cls.id}" data-field="materialUrl"
                                        id="material-url-${cls.id}"
                                        style="flex: 1;">
                                        
                                    <label class="btn-icon-small" title="Upload Arquivo" style="cursor: pointer; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px; display: flex; align-items: center; justify-content: center; background: var(--bg-card);">
                                        <span class="material-symbols-outlined" style="font-size: 1.2rem;">upload_file</span>
                                        <input type="file" style="display: none;" data-action="upload-material" data-class-id="${cls.id}">
                                    </label>
                                </div>
                            </div>
                        </div>
                        `).join('')}

                        <button class="btn-add-inline" data-action="create-class" data-module-id="${module.id}">
                            <span class="material-symbols-outlined" style="vertical-align: middle; font-size: 1rem;">add</span> Adicionar Aula
                        </button>
                    </div>
                 </div>
                 `;
      }
    }

    // Inline "New Module" Form
    html += `
        <div class="new-module-form" style="margin-top: 1rem; padding: 1rem; border: 1px dashed var(--dash-border); border-radius: 0.5rem;">
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="new-module-title" class="tree-input" placeholder="Nome do novo módulo..." style="margin-bottom: 0;">
                <button class="btn-primary" data-action="create-module" style="width: auto; padding: 0 1rem;">
                    <span class="material-symbols-outlined">add</span>
                </button>
            </div>
        </div>
        `;

    container.innerHTML = html;

    // Restore scroll position
    if (scrollContainer) scrollContainer.scrollTop = savedScrollTop;

  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="text-danger">Erro ao carregar conteúdo.</p>';
  }
}

// --- Handlers (Internal) ---

async function handleCreateModule(courseId: string) {
  const input = document.getElementById('new-module-title') as HTMLInputElement;
  if (!input) return; // Should not happen if rendered correctly

  const title = input.value.trim();
  if (!title) {
    AppUI.showMessage('Digite o nome do módulo', 'info');
    return;
  }

  try {
    await Modules.create(courseId, { title, orderIndex: 99 });
    await renderContentTree(courseId);
    AppUI.showMessage('Módulo criado', 'success');
  } catch (e: any) { AppUI.showMessage(e.message, 'error'); }
}

async function handleUpdateModuleTitle(moduleId: string, newTitle: string) {
  try {
    await Modules.update(moduleId, { title: newTitle });
  } catch (e: any) { AppUI.showMessage(e.message, 'error'); }
}

async function handleDeleteModule(moduleId: string, courseId: string) {
  const confirmed = await customConfirm(
    "Excluir Módulo?",
    "Tem certeza que deseja excluir este módulo e todas as suas aulas?"
  );
  if (!confirmed) return;

  try {
    await Modules.delete(moduleId);
    await renderContentTree(courseId);
    AppUI.showMessage('Módulo excluído', 'success');
  } catch (e: any) { AppUI.showMessage(e.message, 'error'); }
}

async function handleCreateClass(moduleId: string, courseId: string) {
  try {
    // Create with defaults (can be expanded to an inline form if needed, but this is efficient)
    await Modules.createClass(moduleId, {
      title: "Nova Aula (Clique para editar)",
      description: "",
      videoUrl: ""
    });
    await renderContentTree(courseId);
  } catch (e: any) { AppUI.showMessage(e.message, 'error'); }
}

async function handleUpdateClassTitle(classId: string, newTitle: string) {
  try {
    await Classes.update(classId, { title: newTitle });
  } catch (e: any) { AppUI.showMessage(e.message, 'error'); }
}

async function handleUpdateClassField(classId: string, field: string, value: string) {
  try {
    const data: any = {};
    if (field === 'videoUrl' || field === 'materialUrl') {
      data[field] = value;
      await Classes.update(classId, data);
      // No toast for every keystroke/blur, too noisy. Maybe subtle indicator or just error handling.
    }
  } catch (e: any) { AppUI.showMessage(e.message, 'error'); }
}

async function handleUploadClassMaterial(classId: string, file: File) {
  try {
    AppUI.showMessage('Enviando...', 'info');
    const res = await Classes.uploadMaterial(classId, file);
    const input = document.getElementById(`material-url-${classId}`) as HTMLInputElement;
    if (input) input.value = res.materialUrl;
    AppUI.showMessage('Arquivo enviado!', 'success');
  } catch (e: any) { AppUI.showMessage(e.message, 'error'); }
}

async function handleDeleteClass(classId: string, courseId: string) {
  const confirmed = await customConfirm(
    "Excluir Aula?",
    "Tem certeza que deseja excluir esta aula?"
  );
  if (!confirmed) return;

  try {
    await Classes.delete(classId);
    await renderContentTree(courseId);
  } catch (e: any) { AppUI.showMessage(e.message, 'error'); }
}

// Start
init();

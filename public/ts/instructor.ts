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
let currentEditingCourse: any = null;
let currentEditingModule: any = null;
let currentEditingClass: any = null;
let currentCourseForModules: any = null;

// Initialize app
async function init() {
  await checkAuth();
  await loadCourses();
  await loadCategories();
  setupEventListeners();
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

// Load courses
async function loadCourses() {
  const container = document.getElementById('courses-container');
  if (!container) return;

  try {
    const courses = await Courses.getMyCourses();

    if (!courses || courses.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <span class="material-symbols-outlined" style="font-size: 4rem; opacity: 0.5;">school</span>
          <p>Nenhum curso ainda. Crie seu primeiro curso para começar!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = courses
      .map(
        (course: any) => `
      <div class="course-card" data-course-id="${course.id}">
        <div class="course-cover">
          ${
            course.coverImageUrl
              ? `<img src="/courses/${course.id}/cover" alt="${course.title}" />`
              : '<span class="material-symbols-outlined">school</span>'
          }
        </div>
        <div class="course-info">
          <h3 class="course-title">${course.title}</h3>
          <p class="course-description">${course.description || 'Sem descrição'}</p>
          <div class="course-meta">
            <div class="meta-item">
              <span class="material-symbols-outlined">folder</span>
              <span>${course.category?.name || 'Sem categoria'}</span>
            </div>
            <div class="meta-item">
              <span class="material-symbols-outlined">people</span>
              <span>${course.currentStudents || 0} alunos</span>
            </div>
          </div>
          <div class="course-price">R$ ${parseFloat(course.price || 0)
            .toFixed(2)
            .replace('.', ',')}</div>
        </div>
        <div class="course-actions">
          <button class="btn-course-action btn-edit-course" data-course-id="${course.id}">
            <span class="material-symbols-outlined">edit</span> Editar
          </button>
          <button class="btn-course-action btn-manage-content" data-course-id="${course.id}">
            <span class="material-symbols-outlined">video_library</span> Conteúdo
          </button>
          <button class="btn-course-action btn-course-delete" data-course-id="${course.id}">
            <span class="material-symbols-outlined">delete</span> Excluir
          </button>
        </div>
      </div>
    `,
      )
      .join('');

    // Add event listeners to course action buttons
    attachCourseActionListeners();
  } catch (error) {
    console.error('Falha ao carregar cursos:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #f44336;">
        <p>Falha ao carregar cursos. Por favor, tente novamente mais tarde.</p>
      </div>
    `;
  }
}

// Load categories for dropdown
async function loadCategories() {
  const select = document.getElementById(
    'course-category',
  ) as HTMLSelectElement;
  if (!select) return;

  try {
    const categories = await Categories.getAll();

    select.innerHTML = '<option value="">Select a category</option>';
    categories.forEach((cat: any) => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

// Attach event listeners to course cards
function attachCourseActionListeners() {
  // Edit course
  document.querySelectorAll('.btn-edit-course').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const courseId = (e.currentTarget as HTMLElement).dataset.courseId;
      if (courseId) await openEditCourseModal(courseId);
    });
  });

  // Manage content (modules & classes)
  document.querySelectorAll('.btn-manage-content').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const courseId = (e.currentTarget as HTMLElement).dataset.courseId;
      if (courseId) await openModulesModal(courseId);
    });
  });

  // Delete course
  document.querySelectorAll('.btn-course-delete').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const courseId = (e.currentTarget as HTMLElement).dataset.courseId;
      if (courseId) await deleteCourse(courseId);
    });
  });
}

// Open create course modal
function openCreateCourseModal() {
  currentEditingCourse = null;

  const modal = document.getElementById('course-modal');
  const title = document.getElementById('course-modal-title');
  const form = document.getElementById('course-form') as HTMLFormElement;

  if (title) title.textContent = 'Criar Novo Curso';
  if (form) form.reset();

  // Clear file input
  const coverInput = document.getElementById(
    'course-cover',
  ) as HTMLInputElement;
  if (coverInput) coverInput.value = '';

  modal?.classList.remove('hidden');
}

// Open edit course modal
async function openEditCourseModal(courseId: string) {
  try {
    const course = await Courses.getById(courseId);
    currentEditingCourse = course;

    const modal = document.getElementById('course-modal');
    const title = document.getElementById('course-modal-title');

    if (title) title.textContent = 'Editar Curso';

    // Fill form
    (document.getElementById('course-id') as HTMLInputElement).value =
      course.id;
    (document.getElementById('course-title') as HTMLInputElement).value =
      course.title;
    (
      document.getElementById('course-description') as HTMLTextAreaElement
    ).value = course.description || '';

    // Preencher preço com máscara
    const priceInput = document.getElementById(
      'course-price',
    ) as HTMLInputElement;
    const priceInCents = Math.round((course.price || 0) * 100);
    priceInput.setAttribute('data-price-cents', priceInCents.toString());
    priceInput.value = `R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')}`;

    // Wait for categories to load before setting value
    setTimeout(() => {
      const categoryId = course.category?.id || course.categoryId || '';
      (document.getElementById('course-category') as HTMLSelectElement).value =
        categoryId;
      console.log('Setting category:', categoryId);
    }, 100);

    (document.getElementById('course-max-students') as HTMLInputElement).value =
      course.maxStudents ? String(course.maxStudents) : '';

    // Show cover preview if exists
    const coverInput = document.getElementById(
      'course-cover',
    ) as HTMLInputElement;
    if (coverInput && course.coverImageUrl) {
      // Add a preview element if doesn't exist
      let preview = document.getElementById('cover-preview');
      if (!preview) {
        preview = document.createElement('div');
        preview.id = 'cover-preview';
        preview.style.cssText = 'margin-top: 0.5rem; text-align: center;';
        coverInput.parentElement?.appendChild(preview);
      }
      preview.innerHTML = `<img src="/courses/${course.id}/cover" alt="Capa atual" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 2px solid var(--border);" />`;
    }

    modal?.classList.remove('hidden');
  } catch (error) {
    console.error('Falha ao carregar curso:', error);
    AppUI.showMessage('Falha ao carregar detalhes do curso', 'error');
  }
}

// Close course modal
function closeCourseModal() {
  const modal = document.getElementById('course-modal');
  const form = document.getElementById('course-form') as HTMLFormElement;

  // Remove cover preview if exists
  const preview = document.getElementById('cover-preview');
  if (preview) {
    preview.remove();
  }

  modal?.classList.add('hidden');
  form?.reset();
  currentEditingCourse = null;
}

// Handle course form submission
async function handleCourseSubmit(e: Event) {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const courseId = (document.getElementById('course-id') as HTMLInputElement)
    .value;

  const priceInput = document.getElementById(
    'course-price',
  ) as HTMLInputElement;

  const data = {
    title: (document.getElementById('course-title') as HTMLInputElement).value,
    description: (
      document.getElementById('course-description') as HTMLTextAreaElement
    ).value,
    price: AppUI.getPriceValue(priceInput),
    categoryId: (
      document.getElementById('course-category') as HTMLSelectElement
    ).value,
    maxStudents: (
      document.getElementById('course-max-students') as HTMLInputElement
    ).value
      ? parseInt(
          (document.getElementById('course-max-students') as HTMLInputElement)
            .value,
        )
      : undefined,
  };

  try {
    let savedCourse;
    if (courseId) {
      savedCourse = await Courses.update(courseId, data);
      AppUI.showMessage('Curso atualizado com sucesso!', 'success');
    } else {
      // Get cover image if provided
      const coverInput = document.getElementById(
        'course-cover',
      ) as HTMLInputElement;
      const coverFile =
        coverInput.files && coverInput.files[0]
          ? coverInput.files[0]
          : undefined;

      savedCourse = await Courses.create(data, coverFile);
      AppUI.showMessage('Curso criado com sucesso!', 'success');
    }

    closeCourseModal();
    await loadCourses();
  } catch (error: any) {
    console.error('Falha ao salvar curso:', error);
    AppUI.showMessage(error.message || 'Falha ao salvar curso', 'error');
  }
}

// Delete course
async function deleteCourse(courseId: string) {
  const confirmed = await AppUI.promptModal(
    'Excluir Curso',
    'Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.',
  );

  if (confirmed) {
    try {
      await Courses.delete(courseId);
      AppUI.showMessage('Curso excluído com sucesso', 'success');
      await loadCourses();
    } catch (error: any) {
      console.error('Falha ao excluir curso:', error);
      AppUI.showMessage(error.message || 'Falha ao excluir curso', 'error');
    }
  }
}

// Open modules modal
async function openModulesModal(courseId: string) {
  try {
    const course = await Courses.getById(courseId);
    currentCourseForModules = course;

    const modal = document.getElementById('modules-modal');
    const title = document.getElementById('modules-modal-title');
    (document.getElementById('current-course-id') as HTMLInputElement).value =
      courseId;

    if (title) title.textContent = `Gerenciar Conteúdo: ${course.title}`;

    modal?.classList.remove('hidden');

    await loadModulesList(courseId);
  } catch (error) {
    console.error('Falha ao abrir modal de módulos:', error);
    AppUI.showMessage('Falha ao carregar conteúdo do curso', 'error');
  }
}

// Close modules modal
function closeModulesModal() {
  const modal = document.getElementById('modules-modal');
  modal?.classList.add('hidden');
  currentCourseForModules = null;
  currentEditingModule = null;
  currentEditingClass = null;

  // Hide forms
  document.getElementById('module-form-container')?.classList.add('hidden');
  document.getElementById('class-form-container')?.classList.add('hidden');
  document.getElementById('classes-section')?.classList.add('hidden');
}

// Load modules list
async function loadModulesList(courseId: string) {
  const container = document.getElementById('modules-list');
  if (!container) return;

  try {
    const modules = await Modules.getByCourse(courseId);

    if (!modules || modules.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted)">Nenhum módulo ainda. Crie um para começar.</p>`;
      return;
    }

    container.innerHTML = modules
      .map(
        (module: any) => `
      <div class="module-block" data-module-id="${module.id}">
        <div class="module-header">
          <div class="module-info">
            <h5 class="module-title">
              <span class="material-symbols-outlined">folder</span>
              ${module.title}
            </h5>
            <p class="module-meta">Ordem: ${module.orderIndex}</p>
          </div>
          <div class="module-actions">
            <button class="btn-content-action btn-add-class-to-module" data-module-id="${module.id}" title="Adicionar Aula">
              <span class="material-symbols-outlined">add</span>
            </button>
            <button class="btn-content-action btn-edit-module" data-module-id="${module.id}" title="Editar Módulo">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="btn-content-action danger btn-delete-module" data-module-id="${module.id}" title="Excluir Módulo">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
        <div class="classes-container" id="classes-${module.id}">
          <p style="color: var(--text-muted); padding: 0.5rem; font-size: 0.875rem;">Carregando aulas...</p>
        </div>
      </div>
    `,
      )
      .join('');

    attachModuleActionListeners();

    // Load classes for each module
    for (const module of modules) {
      await loadClassesForModule(module.id);
    }
  } catch (error) {
    console.error('Falha ao carregar módulos:', error);
    container.innerHTML = `<p style="color: #f44336;">Falha ao carregar módulos.</p>`;
  }
}

// Attach module action listeners
function attachModuleActionListeners() {
  // Add class to module
  document.querySelectorAll('.btn-add-class-to-module').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const moduleId = (e.currentTarget as HTMLElement).dataset.moduleId;
      if (moduleId) showAddClassForm(moduleId);
    });
  });

  // Edit module
  document.querySelectorAll('.btn-edit-module').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const moduleId = (e.currentTarget as HTMLElement).dataset.moduleId;
      if (moduleId) await openEditModuleForm(moduleId);
    });
  });

  // Delete module
  document.querySelectorAll('.btn-delete-module').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const moduleId = (e.currentTarget as HTMLElement).dataset.moduleId;
      if (moduleId) await deleteModule(moduleId);
    });
  });
}

// Load classes for a specific module
async function loadClassesForModule(moduleId: string) {
  const container = document.getElementById(`classes-${moduleId}`);
  if (!container) return;

  try {
    const module = await Modules.getById(moduleId);
    const classes = module.classes || [];

    if (classes.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); padding: 0.5rem; font-size: 0.875rem;">Nenhuma aula ainda.</p>`;
      return;
    }

    container.innerHTML = classes
      .map(
        (cls: any) => `
      <div class="class-item" data-class-id="${cls.id}">
        <div class="class-info">
          <span class="material-symbols-outlined class-icon">play_circle</span>
          <div class="class-details">
            <h6 class="class-title">${cls.title}</h6>
            <p class="class-description">${cls.description || 'Sem descrição'}</p>
            <div class="class-links">
              ${cls.videoUrl ? `<a href="${cls.videoUrl}" target="_blank" class="class-link video-link" title="Assistir vídeo"><span class="material-symbols-outlined">play_circle</span> Vídeo da Aula</a>` : '<span class="class-link-empty">Sem vídeo</span>'}
              ${cls.materialUrl ? `<a href="/classes/${cls.id}/material" target="_blank" class="class-link material-link" title="Baixar material"><span class="material-symbols-outlined">download</span> Material</a>` : ''}
            </div>
          </div>
        </div>
        <div class="class-actions">
          <button class="btn-content-action btn-edit-class" data-class-id="${cls.id}" data-module-id="${moduleId}" title="Editar Aula">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="btn-content-action danger btn-delete-class" data-class-id="${cls.id}" data-module-id="${moduleId}" title="Excluir Aula">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `,
      )
      .join('');

    attachClassActionListeners(moduleId);
  } catch (error) {
    console.error('Falha ao carregar aulas:', error);
    container.innerHTML = `<p style="color: #f44336; padding: 0.5rem; font-size: 0.875rem;">Falha ao carregar aulas.</p>`;
  }
}

// Show add module form
function showAddModuleForm() {
  const container = document.getElementById('module-form-container');
  const title = document.getElementById('module-form-title');
  const form = document.getElementById('module-form') as HTMLFormElement;

  if (title) title.textContent = 'Novo Módulo';
  form?.reset();
  (document.getElementById('module-id') as HTMLInputElement).value = '';

  container?.classList.remove('hidden');
}

// Open edit module form
async function openEditModuleForm(moduleId: string) {
  try {
    const module = await Modules.getById(moduleId);
    currentEditingModule = module;

    const container = document.getElementById('module-form-container');
    const title = document.getElementById('module-form-title');

    if (title) title.textContent = 'Editar Módulo';

    (document.getElementById('module-id') as HTMLInputElement).value =
      module.id;
    (document.getElementById('module-title') as HTMLInputElement).value =
      module.title;
    (document.getElementById('module-order') as HTMLInputElement).value =
      module.orderIndex;

    container?.classList.remove('hidden');
  } catch (error) {
    console.error('Falha ao carregar módulo:', error);
    AppUI.showMessage('Falha ao carregar detalhes do módulo', 'error');
  }
}

// Cancel module form
function cancelModuleForm() {
  const container = document.getElementById('module-form-container');
  const form = document.getElementById('module-form') as HTMLFormElement;
  container?.classList.add('hidden');
  form?.reset();
  currentEditingModule = null;
}

// Handle module form submission
async function handleModuleSubmit(e: Event) {
  e.preventDefault();

  const moduleId = (document.getElementById('module-id') as HTMLInputElement)
    .value;
  const courseId = (
    document.getElementById('current-course-id') as HTMLInputElement
  ).value;

  const data = {
    title: (document.getElementById('module-title') as HTMLInputElement).value,
    orderIndex: parseInt(
      (document.getElementById('module-order') as HTMLInputElement).value,
    ),
  };

  try {
    if (moduleId) {
      await Modules.update(moduleId, data);
      AppUI.showMessage('Módulo atualizado com sucesso!', 'success');
    } else {
      await Modules.create(courseId, data);
      AppUI.showMessage('Módulo criado com sucesso!', 'success');
    }

    cancelModuleForm();
    await loadModulesList(courseId);
  } catch (error: any) {
    console.error('Falha ao salvar módulo:', error);
    AppUI.showMessage(error.message || 'Falha ao salvar módulo', 'error');
  }
}

// Delete module
async function deleteModule(moduleId: string) {
  const confirmed = await AppUI.promptModal(
    'Excluir Módulo',
    'Tem certeza que deseja excluir este módulo? Todas as aulas deste módulo também serão excluídas.',
  );

  if (confirmed) {
    try {
      await Modules.delete(moduleId);
      AppUI.showMessage('Módulo excluído com sucesso', 'success');

      const courseId = (
        document.getElementById('current-course-id') as HTMLInputElement
      ).value;
      await loadModulesList(courseId);
    } catch (error: any) {
      console.error('Falha ao excluir módulo:', error);
      AppUI.showMessage(error.message || 'Falha ao excluir módulo', 'error');
    }
  }
}

// Attach class action listeners
function attachClassActionListeners(moduleId: string) {
  // Edit class
  document.querySelectorAll('.btn-edit-class').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const classId = (e.currentTarget as HTMLElement).dataset.classId;
      const modId = (e.currentTarget as HTMLElement).dataset.moduleId;
      if (classId && modId) await openEditClassForm(classId, modId);
    });
  });

  // Delete class
  document.querySelectorAll('.btn-delete-class').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const classId = (e.currentTarget as HTMLElement).dataset.classId;
      const modId = (e.currentTarget as HTMLElement).dataset.moduleId;
      if (classId && modId) await deleteClass(classId, modId);
    });
  });
}

// Show add class form
function showAddClassForm(moduleId: string) {
  const container = document.getElementById('class-form-container');
  const title = document.getElementById('class-form-title');
  const form = document.getElementById('class-form') as HTMLFormElement;

  (document.getElementById('current-module-id') as HTMLInputElement).value =
    moduleId;

  if (title) title.textContent = 'Nova Aula';
  form?.reset();
  (document.getElementById('class-id') as HTMLInputElement).value = '';

  container?.classList.remove('hidden');
  container?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Open edit class form
async function openEditClassForm(classId: string, moduleId: string) {
  try {
    const cls = await Classes.getById(classId);
    currentEditingClass = cls;

    const container = document.getElementById('class-form-container');
    const title = document.getElementById('class-form-title');

    if (title) title.textContent = 'Editar Aula';

    (document.getElementById('current-module-id') as HTMLInputElement).value =
      moduleId;
    (document.getElementById('class-id') as HTMLInputElement).value = cls.id;
    (document.getElementById('class-title') as HTMLInputElement).value =
      cls.title;
    (
      document.getElementById('class-description') as HTMLTextAreaElement
    ).value = cls.description || '';
    (document.getElementById('class-video-url') as HTMLInputElement).value =
      cls.videoUrl;

    container?.classList.remove('hidden');
    container?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    console.error('Falha ao carregar aula:', error);
    AppUI.showMessage('Falha ao carregar detalhes da aula', 'error');
  }
}

// Cancel class form
function cancelClassForm() {
  const container = document.getElementById('class-form-container');
  const form = document.getElementById('class-form') as HTMLFormElement;
  container?.classList.add('hidden');
  form?.reset();
  currentEditingClass = null;
}

// Handle class form submission
async function handleClassSubmit(e: Event) {
  e.preventDefault();

  const classId = (document.getElementById('class-id') as HTMLInputElement)
    .value;
  const moduleId = (
    document.getElementById('current-module-id') as HTMLInputElement
  ).value;

  const data = {
    title: (document.getElementById('class-title') as HTMLInputElement).value,
    description: (
      document.getElementById('class-description') as HTMLTextAreaElement
    ).value,
    videoUrl: (document.getElementById('class-video-url') as HTMLInputElement)
      .value,
  };

  const materialInput = document.getElementById(
    'class-material',
  ) as HTMLInputElement;
  const materialFile = materialInput?.files?.[0];

  try {
    let savedClassId = classId;

    if (classId) {
      // Update existing class
      await Classes.update(classId, data);
      AppUI.showMessage('Aula atualizada com sucesso!', 'success');
    } else {
      // Create new class
      const newClass = await Modules.createClass(moduleId, data);
      savedClassId = newClass.id;
      AppUI.showMessage('Aula criada com sucesso!', 'success');
    }

    // Upload material if provided
    if (materialFile && savedClassId) {
      try {
        await Classes.uploadMaterial(savedClassId, materialFile);
        AppUI.showMessage('Material enviado com sucesso!', 'success');
      } catch (uploadError: any) {
        console.error('Falha ao enviar material:', uploadError);
        AppUI.showMessage(
          `Aula salva, mas falha ao enviar material: ${uploadError.message}`,
          'error',
        );
      }
    }

    cancelClassForm();
    await loadClassesForModule(moduleId);
  } catch (error: any) {
    console.error('Falha ao salvar aula:', error);
    AppUI.showMessage(error.message || 'Falha ao salvar aula', 'error');
  }
}

// Delete class
async function deleteClass(classId: string, moduleId: string) {
  const confirmed = await AppUI.promptModal(
    'Excluir Aula',
    'Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.',
  );

  if (confirmed) {
    try {
      await Classes.delete(classId);
      AppUI.showMessage('Aula excluída com sucesso', 'success');

      await loadClassesForModule(moduleId);
    } catch (error: any) {
      console.error('Falha ao excluir aula:', error);
      AppUI.showMessage(error.message || 'Falha ao excluir aula', 'error');
    }
  }
}

// Setup event listeners
function setupEventListeners() {
  // Auth Card Logic (replicado do main.ts)
  const avatarBtn = document.getElementById('user-avatar-btn');
  const authContainer = document.getElementById('auth-card-container');
  const cardInner = document.getElementById('auth-card');
  const btnToRegister = document.getElementById('btn-to-register');
  const btnToLogin = document.getElementById('btn-to-login');

  // Toggle Auth Card
  if (avatarBtn && authContainer) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      authContainer.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (
        !authContainer.contains(e.target as Node) &&
        e.target !== avatarBtn &&
        !avatarBtn.contains(e.target as Node)
      ) {
        authContainer.classList.remove('show');
      }
    });
  }

  // Flip Logic
  if (btnToRegister && cardInner) {
    btnToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      cardInner.classList.add('flipped');
    });
  }

  if (btnToLogin && cardInner) {
    btnToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      cardInner.classList.remove('flipped');
    });
  }

  // Handle Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement)
        .value;
      const password = (
        document.getElementById('login-password') as HTMLInputElement
      ).value;

      try {
        await Auth.login(email, password);
        const authContainer = document.getElementById('auth-card-container');
        if (authContainer) authContainer.classList.remove('show');

        // Recarregar cursos após login
        await loadCourses();
      } catch (error) {
        console.error('Login error:', error);
      }
    });
  }

  // Handle Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      await Auth.logout();
      window.location.href = 'index.html';
    });
  }

  // Handle View Profile
  const btnViewProfile = document.getElementById('btn-view-profile');
  if (btnViewProfile) {
    btnViewProfile.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.showProfileView();
    });
  }

  // Handle Back from Profile View
  const btnBackFromProfile = document.getElementById('btn-back-from-profile');
  if (btnBackFromProfile) {
    btnBackFromProfile.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.updateAuthUI();
    });
  }

  // Handle Edit Profile Button
  const btnEditProfile = document.getElementById('btn-edit-profile');
  if (btnEditProfile) {
    btnEditProfile.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.showProfileEdit();
    });
  }

  // Handle Cancel Edit
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.showProfileView();
    });
  }

  // Handle Profile Edit Form
  const profileEditForm = document.getElementById('profile-edit-form');
  if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (document.getElementById('edit-name') as HTMLInputElement)
        .value;
      const email = (document.getElementById('edit-email') as HTMLInputElement)
        .value;
      const password = (
        document.getElementById('edit-password') as HTMLInputElement
      ).value;

      try {
        await Auth.updateUserProfile({ name, email, password });
        Auth.showProfileView();
      } catch (error) {
        console.error('Update error:', error);
      }
    });
  }

  // Handle Delete Account
  const btnDeleteAccount = document.getElementById('btn-delete-account');
  if (btnDeleteAccount) {
    btnDeleteAccount.addEventListener('click', async (e) => {
      e.preventDefault();
      await Auth.deleteUserAccount();
    });
  }

  // Password Toggle Buttons
  const passwordToggleBtns = document.querySelectorAll('.btn-toggle-password');
  passwordToggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const button = e.currentTarget as HTMLElement;
      const targetId = button.dataset.target;
      if (!targetId) return;

      const input = document.getElementById(targetId) as HTMLInputElement;
      if (!input) return;

      const icon = button.querySelector('.material-symbols-outlined');
      if (!icon) return;

      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
      } else {
        input.type = 'password';
        icon.textContent = 'visibility';
      }
    });
  });

  // Create new course button
  document
    .getElementById('btn-create-new-course')
    ?.addEventListener('click', openCreateCourseModal);

  // Close course modal
  document
    .getElementById('btn-close-course-modal')
    ?.addEventListener('click', closeCourseModal);
  document
    .getElementById('btn-cancel-course')
    ?.addEventListener('click', closeCourseModal);

  // Course form submission
  document
    .getElementById('course-form')
    ?.addEventListener('submit', handleCourseSubmit);

  // Close modules modal
  document
    .getElementById('btn-close-modules-modal')
    ?.addEventListener('click', closeModulesModal);

  // Add module button
  document
    .getElementById('btn-add-module')
    ?.addEventListener('click', showAddModuleForm);

  // Cancel module form
  document
    .getElementById('btn-cancel-module')
    ?.addEventListener('click', cancelModuleForm);

  // Module form submission
  document
    .getElementById('module-form')
    ?.addEventListener('submit', handleModuleSubmit);

  // Cancel class form
  document
    .getElementById('btn-cancel-class')
    ?.addEventListener('click', cancelClassForm);

  // Class form submission
  document
    .getElementById('class-form')
    ?.addEventListener('submit', handleClassSubmit);

  // Aplicar máscara de preço no campo de preço
  const priceInput = document.getElementById(
    'course-price',
  ) as HTMLInputElement;
  if (priceInput) {
    AppUI.applyPriceMask(priceInput);
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

import { Courses } from '../../modules/courses.js';
import { Modules } from '../../modules/modules.js';
import { Classes } from '../../modules/classes.js';
import { AppUI } from '../../utils/ui.js';
import { getAllCategories, getCurrentCourseId, setCurrentCourseId } from '../state/instructorState.js';
import { parseBRLPrice, customConfirm, el, icon, clearChildren } from '../utils/dom.js';
import { renderCourseForm } from '../components/courseForm.js';
import { renderCourseDetail } from '../components/courseDetail.js';
import { updateSidebarCourses } from '../components/sidebar.js';
import { populateCategories } from './categoryHandlers.js';
import { showDeleteConfirm } from '../components/modals.js';
import { setupContentToggle } from './contentHandlers.js';
import { renderEmptyState } from '../components/emptyState.js';

export function setupCourseHandlers(): void {
  document
    .getElementById('btn-create-new-course')
    ?.addEventListener('click', showCreateCourseView);

  const coursesList = document.getElementById('courses-sidebar-list');
  if (coursesList) {
    coursesList.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.sidebar-item');
      if (item) {
        const courseId = item.getAttribute('data-course-id');
        if (courseId) {
          selectCourse(courseId);
        }
      }
    });
  }
}

function setupCategorySelectListener(
  selectElement: HTMLSelectElement,
  currentCategoryId?: string,
): void {
  let previousValue = currentCategoryId || selectElement.value;

  selectElement.addEventListener('focus', () => {
    previousValue = selectElement.value;
  });

  selectElement.addEventListener('change', async () => {
    if (selectElement.value === '__new_category__') {
      selectElement.value = previousValue;

      const { showCategoryModal } = await import('../components/modals.js');
      const categoryName = await showCategoryModal();

      if (categoryName) {
        try {
          const { Categories } = await import('../../modules/categories.js');
          const newCategory = await Categories.create(categoryName);
          if (newCategory && newCategory.id) {
            const { Categories: CatModule } = await import(
              '../../modules/categories.js'
            );
            const allCats = await CatModule.getAll();
            const { setAllCategories } = await import(
              '../state/instructorState.js'
            );
            setAllCategories(allCats);

            clearChildren(selectElement);
            selectElement.appendChild(el('option', { value: '' }, 'Selecione uma categoria...'));
            allCats.forEach((cat: any) => {
              const opt = el('option', { value: cat.id }, cat.name) as HTMLOptionElement;
              if (newCategory.id === cat.id) opt.selected = true;
              selectElement.appendChild(opt);
            });
            selectElement.appendChild(el('option', { value: '__new_category__' }, '+ Nova Categoria'));
            selectElement.value = newCategory.id;
            previousValue = newCategory.id;

            AppUI.showMessage('Categoria criada!', 'success');
          }
        } catch (error: any) {
          AppUI.showMessage(
            error.message || 'Erro ao criar categoria',
            'error',
          );
        }
      }
    } else {
      previousValue = selectElement.value;
    }
  });
}

function showCreateCourseView(): void {
  const contentArea = document.getElementById('dashboard-content');
  if (!contentArea) return;

  const categories = getAllCategories();
  const formElement = renderCourseForm(undefined, categories);

  clearChildren(contentArea);
  contentArea.appendChild(formElement);

  const categorySelect = document.getElementById(
    'course-category',
  ) as HTMLSelectElement;
  if (categorySelect) {
    setupCategorySelectListener(categorySelect);
  }

  const form = document.getElementById(
    'course-inline-form',
  ) as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', handleCourseSubmit);
  }

  document
    .getElementById('btn-cancel-form')
    ?.addEventListener('click', () => {
      showEmptyState();
    });

  const coverInput = document.getElementById(
    'course-cover',
  ) as HTMLInputElement;
  if (coverInput) {
    coverInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const previewContainer = document.getElementById(
            'cover-preview-container',
          );
          if (previewContainer) {
            clearChildren(previewContainer);
            const img = el('img', {
              src: event.target?.result as string,
              alt: 'Preview',
              className: 'cover-preview-img'
            }) as HTMLImageElement;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '150px';
            img.style.marginTop = '10px';
            img.style.marginBottom = '10px';
            img.style.borderRadius = '8px';
            img.style.objectFit = 'cover';
            previewContainer.appendChild(img);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  setCurrentCourseId(null);
}

export async function showEditCourseView(course: any): Promise<void> {
  const contentArea = document.getElementById('dashboard-content');
  if (!contentArea) return;

  const categories = getAllCategories();
  const formElement = renderCourseForm(course, categories);

  clearChildren(contentArea);
  contentArea.appendChild(formElement);

  const categorySelect = document.getElementById(
    'course-category',
  ) as HTMLSelectElement;
  if (categorySelect) {
    setupCategorySelectListener(categorySelect, course.categoryId);
  }

  const form = document.getElementById(
    'course-inline-form',
  ) as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', handleCourseSubmit);
  }

  document
    .getElementById('btn-cancel-form')
    ?.addEventListener('click', () => {
      selectCourse(course.id);
    });

  const coverInput = document.getElementById(
    'course-cover',
  ) as HTMLInputElement;
  if (coverInput) {
    coverInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const previewContainer = document.getElementById(
            'cover-preview-container',
          );
          if (previewContainer) {
            clearChildren(previewContainer);
            const img = el('img', {
              src: event.target?.result as string,
              alt: 'Preview',
              className: 'cover-preview-img'
            }) as HTMLImageElement;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '150px';
            img.style.marginTop = '10px';
            img.style.marginBottom = '10px';
            img.style.borderRadius = '8px';
            img.style.objectFit = 'cover';
            previewContainer.appendChild(img);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

async function handleCourseSubmit(e: Event): Promise<void> {
  e.preventDefault();

  const courseId = (document.getElementById('course-id') as HTMLInputElement)
    .value;
  const title = (document.getElementById('course-title') as HTMLInputElement)
    .value;
  const description = (
    document.getElementById('course-description') as HTMLTextAreaElement
  ).value;
  const categoryId = (
    document.getElementById('course-category') as HTMLSelectElement
  ).value;
  const priceStr = (document.getElementById('course-price') as HTMLInputElement)
    .value;
  const maxStudentsStr = (
    document.getElementById('course-max-students') as HTMLInputElement
  ).value;
  const coverInput = document.getElementById(
    'course-cover',
  ) as HTMLInputElement;

  const price = parseBRLPrice(priceStr);

  const data: any = {
    title,
    description,
    price,
    categoryId,
    maxStudents: maxStudentsStr ? parseInt(maxStudentsStr) : undefined,
  };

  try {
    let savedCourse;

    if (courseId) {
      savedCourse = await Courses.update(courseId, data);
      AppUI.showMessage('Curso atualizado!', 'success');
    } else {
      const coverFile = coverInput.files ? coverInput.files[0] : undefined;
      const videoInput = document.getElementById(
        'course-video-intro',
      ) as HTMLInputElement;
      const videoFile = videoInput && videoInput.files ? videoInput.files[0] : undefined;

      savedCourse = await Courses.create(data, coverFile);

      if (videoFile && !videoFile.type.startsWith('video/mp4')) {
        AppUI.showMessage(
          'O vídeo de introdução deve ser MP4. O curso foi criado, mas o vídeo não foi enviado.',
          'error',
        );
      } else if (videoFile && savedCourse && savedCourse.id) {
        try {
          AppUI.showMessage('Criando módulo introdutório...', 'info');

          const module = await Modules.create(savedCourse.id, {
            title: 'Módulo Introdutório',
            orderIndex: 0,
          });

          if (module && module.id) {
            const cls = await Modules.createClass(module.id, {
              title: 'Aula de Introdução',
              description: 'Bem-vindo ao curso!',
              videoUrl: '',
            });

            if (cls && cls.id) {
              AppUI.showMessage('Enviando vídeo de introdução...', 'info');
              await Classes.uploadVideo(cls.id, videoFile);
              AppUI.showMessage(
                'Vídeo de introdução enviado com sucesso!',
                'success',
              );
            }
          }
        } catch (vidError: any) {
          console.error('Falha ao processar vídeo de introdução:', vidError);
          AppUI.showMessage(
            'Curso criado, mas houve erro ao processar o vídeo de introdução: ' +
              vidError.message,
            'error',
          );
        }
      }

      AppUI.showMessage('Curso criado com sucesso!', 'success');
    }

    await loadCoursesInSidebar();

    if (savedCourse && savedCourse.id) {
      selectCourse(savedCourse.id);
    }
  } catch (error: any) {
    console.error(error);
    AppUI.showMessage(error.message || 'Erro ao salvar', 'error');
  }
}

export async function selectCourse(courseId: string): Promise<void> {
  setCurrentCourseId(courseId);

  const contentArea = document.getElementById('dashboard-content');
  if (!contentArea) return;

  try {
    const course = await Courses.getById(courseId);
    if (!course) {
      showEmptyState();
      return;
    }

    const courseDetail = renderCourseDetail(course);
    clearChildren(contentArea);
    contentArea.appendChild(courseDetail);

    document
      .getElementById('btn-edit-current')
      ?.addEventListener('click', async () => {
        await showEditCourseView(course);
      });

    document
      .getElementById('btn-delete-current')
      ?.addEventListener('click', async () => {
        await deleteCourse(courseId);
      });

    document.querySelectorAll('.sidebar-item').forEach((item) => {
      if (item.getAttribute('data-course-id') === courseId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    setupContentToggle(courseId);
  } catch (error: any) {
    console.error('Error loading course:', error);
    AppUI.showMessage('Erro ao carregar curso', 'error');
    showEmptyState();
  }
}

async function deleteCourse(courseId: string): Promise<void> {
  const confirmed = await showDeleteConfirm(
    'Excluir Curso?',
    'Tem certeza que deseja excluir este curso? Todas as aulas serão perdidas.',
  );

  if (confirmed) {
    try {
      await Courses.delete(courseId);
      AppUI.showMessage('Curso excluído.', 'success');
      showEmptyState();
      await loadCoursesInSidebar();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      AppUI.showMessage('Erro ao excluir.', 'error');
    }
  }
}

export async function loadCoursesInSidebar(): Promise<void> {
  const listContainer = document.getElementById('courses-sidebar-list');
  if (!listContainer) return;

  try {
    clearChildren(listContainer);
    listContainer.appendChild(
      el('div', { className: 'sidebar-loading' },
        el('span', { className: 'material-symbols-outlined spin' }, 'sync'),
        ' Carregando...'
      )
    );

    const courses = await Courses.getMyCourses();
    updateSidebarCourses(courses);
  } catch (error: any) {
    console.error('Error loading courses:', error);
    clearChildren(listContainer);
    listContainer.appendChild(
      el('div', { className: 'sidebar-empty' },
        el('p', null, 'Erro ao carregar cursos')
      )
    );
  }
}

function showEmptyState(): void {
  const contentArea = document.getElementById('dashboard-content');
  if (contentArea) {
    clearChildren(contentArea);
    contentArea.appendChild(renderEmptyState());
  }
  setCurrentCourseId(null);
}

/**
 * Progress Handlers - Course loading, class loading, completion tracking
 */

import { AppUI } from '../../utils/ui.js';
import {
  getCourseId,
  getCurrentClassId,
  getCourseData,
  setCourseData,
  setCurrentClassId,
  getOpenModules,
  addOpenModule,
  removeOpenModule,
  ClassItem,
  CourseFull,
} from '../state/playerState.js';
import { resetControls } from './videoHandlers.js';

/**
 * Load course data from API
 */
export async function loadCourseData(): Promise<void> {
  const courseId = getCourseId();

  try {
    // 1. Fetch Course Details
    const courseRes = await AppUI.apiFetch(`/courses/${courseId}`);
    const course = courseRes.data;

    const titleEl = document.getElementById('course-title');
    if (titleEl) titleEl.textContent = course.title;

    // Update breadcrumb
    const breadcrumbCourse = document.getElementById('breadcrumb-course');
    if (breadcrumbCourse) breadcrumbCourse.textContent = course.title;

    // Update Progress Bar
    const progressFill = document.getElementById('course-progress-fill');
    const progressText = document.getElementById('course-progress-text');
    if (progressFill && progressText) {
      const prog = course.progress || 0;
      progressFill.style.width = `${prog}%`;
      progressText.textContent = `${prog}%`;
    }

    // 2. Fetch Modules & Classes
    const modulesRes = await AppUI.apiFetch(`/courses/${courseId}/modules`);
    const modules = modulesRes.data || [];

    setCourseData({ ...course, modules });
    renderSidebar();
    updateLessonsCompleted();

    // Auto-load first class if exists
    if (modules.length > 0 && modules[0].classes.length > 0) {
      const firstClass = modules[0].classes[0];
      await loadClass(firstClass);
    }
  } catch (error) {
    AppUI.showMessage('Erro ao carregar dados do curso', 'error');
    console.error(error);
  }
}

/**
 * Render the sidebar with modules and classes
 */
export function renderSidebar(): void {
  const list = document.getElementById('modules-list');
  const courseData = getCourseData();
  const currentClassId = getCurrentClassId();
  const openModules = getOpenModules();

  if (!list || !courseData) return;

  list.innerHTML = '';

  courseData.modules.forEach((mod) => {
    const moduleEl = document.createElement('details');

    const containsActive = mod.classes.some((c) => c.id === currentClassId);
    if (containsActive) {
      addOpenModule(mod.id);
    }

    const isOpen = openModules.has(mod.id);
    if (isOpen) moduleEl.open = true;

    moduleEl.className = 'module-item';

    const header = document.createElement('summary');
    header.className = 'module-header';

    const infoWrapper = document.createElement('div');
    infoWrapper.className = 'module-info-wrapper';

    const moduleTitle = document.createElement('span');
    moduleTitle.className = 'module-title';
    moduleTitle.textContent = mod.title;

    const moduleMeta = document.createElement('span');
    moduleMeta.className = 'module-meta';
    moduleMeta.textContent = `${mod.classes.length} Aulas`;

    infoWrapper.appendChild(moduleTitle);
    infoWrapper.appendChild(moduleMeta);

    const arrowIcon = document.createElement('span');
    arrowIcon.className = 'material-symbols-outlined layer-icon';
    arrowIcon.style.color = 'var(--text-muted)';
    arrowIcon.style.transition = 'transform 0.2s';
    arrowIcon.textContent = 'expand_more';

    header.appendChild(infoWrapper);
    header.appendChild(arrowIcon);

    // Toggle Logic
    moduleEl.addEventListener('toggle', () => {
      if (moduleEl.open) {
        addOpenModule(mod.id);
      } else {
        removeOpenModule(mod.id);
      }
    });

    const classesContainer = document.createElement('div');
    classesContainer.className = 'classes-list';

    mod.classes.forEach((cls) => {
      const classEl = document.createElement('div');
      const isCompleted = cls.isCompleted;
      const isActive = cls.id === currentClassId;

      classEl.className = `class-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`;
      classEl.dataset.id = cls.id;

      const iconName = isCompleted ? 'check_circle' : 'radio_button_unchecked';

      const iconContainer = document.createElement('div');
      iconContainer.className = 'class-icon-container';
      Object.assign(iconContainer.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        flexShrink: '0',
      });

      const statusIcon = document.createElement('span');
      statusIcon.className = 'material-symbols-outlined class-status-icon';
      statusIcon.style.fontSize = '1.5rem';
      statusIcon.textContent = iconName;

      statusIcon.addEventListener('click', async (e) => {
        e.stopPropagation();
        await toggleCompletion(cls);
      });
      statusIcon.style.cursor = 'pointer';

      iconContainer.appendChild(statusIcon);

      const titleContainer = document.createElement('div');
      Object.assign(titleContainer.style, {
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
      });

      const classTitleMini = document.createElement('span');
      classTitleMini.className = 'class-title-mini';
      Object.assign(classTitleMini.style, {
        fontSize: '0.95rem',
        fontWeight: '600',
      });
      classTitleMini.textContent = cls.title;

      titleContainer.appendChild(classTitleMini);
      classEl.appendChild(iconContainer);
      classEl.appendChild(titleContainer);

      classEl.addEventListener('click', () => loadClass(cls));

      classesContainer.appendChild(classEl);
    });

    moduleEl.appendChild(header);
    moduleEl.appendChild(classesContainer);
    list.appendChild(moduleEl);

    // Green style for completed module
    const allCompleted = mod.classes.every((c) => c.isCompleted);
    if (allCompleted) {
      moduleEl.classList.add('completed-module');
    }
  });

  // Certificate Button
  renderCertificateButton();
}

/**
 * Render certificate button if course is 100% complete
 */
function renderCertificateButton(): void {
  const courseData = getCourseData();
  const courseId = getCourseId();
  const certContainer = document.getElementById('certificate-container');

  if (!certContainer || !courseData) return;

  if (courseData.progress === 100) {
    certContainer.innerHTML = '';
    certContainer.classList.remove('hidden');

    const btnCert = document.createElement('button');
    btnCert.className = 'sidebar-certificate-btn';

    const certIcon = document.createElement('span');
    certIcon.className = 'material-symbols-outlined';
    certIcon.textContent = 'workspace_premium';

    const certText = document.createElement('span');
    certText.textContent = 'Gerar Certificado';

    btnCert.appendChild(certIcon);
    btnCert.appendChild(certText);

    btnCert.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await AppUI.apiFetch(`/courses/${courseId}/certificate`, {
          method: 'POST',
        });
        if (res.data && res.data.hash) {
          window.location.href = `/certificado?hash=${res.data.hash}`;
        }
      } catch (err) {
        AppUI.showMessage('Erro ao gerar certificado.', 'error');
      }
    });
    certContainer.appendChild(btnCert);
  } else {
    certContainer.classList.add('hidden');
  }
}

/**
 * Update lessons completed count
 */
export function updateLessonsCompleted(): void {
  const courseData = getCourseData();
  if (!courseData) return;

  let totalClasses = 0;
  let completedClasses = 0;

  courseData.modules.forEach((mod) => {
    totalClasses += mod.classes.length;
    completedClasses += mod.classes.filter((c) => c.isCompleted).length;
  });

  const lessonsCompletedEl = document.getElementById(
    'course-lessons-completed',
  );
  if (lessonsCompletedEl) {
    lessonsCompletedEl.textContent = `${completedClasses}/${totalClasses} Aulas Concluídas`;
  }
}

/**
 * Load a specific class
 */
export async function loadClass(cls: ClassItem): Promise<void> {
  const courseData = getCourseData();
  const courseId = getCourseId();

  setCurrentClassId(cls.id);

  // Find module name for breadcrumb
  let moduleName = '';
  let activeModuleId = '';

  if (courseData) {
    for (const mod of courseData.modules) {
      if (mod.classes.some((c) => c.id === cls.id)) {
        moduleName = mod.title;
        activeModuleId = mod.id;
        break;
      }
    }

    if (activeModuleId) {
      addOpenModule(activeModuleId);

      courseData.modules.forEach((mod) => {
        if (mod.id !== activeModuleId) {
          const isModuleCompleted = mod.classes.every((c) => c.isCompleted);
          if (isModuleCompleted) {
            removeOpenModule(mod.id);
          }
        }
      });
    }
  }

  renderSidebar();

  // Update breadcrumb
  const breadcrumbModule = document.getElementById('breadcrumb-module');
  if (breadcrumbModule) breadcrumbModule.textContent = moduleName;

  // Update Info
  const classTitle = document.getElementById('class-title');
  const classDescription = document.getElementById('class-description');
  if (classTitle) classTitle.textContent = cls.title;
  if (classDescription) classDescription.textContent = cls.description;

  // Update Video
  loadVideo(cls);

  // Completion Button State
  updateCompletionButton(cls);

  // Download/Materials
  checkMaterials(cls);

  // Update Next Lesson button
  updateNextLessonButton();
}

/**
 * Load video for the class
 */
function loadVideo(cls: ClassItem): void {
  const videoWrapper = document.querySelector(
    '.video-container-wrapper',
  ) as HTMLElement;
  const html5Player = document.getElementById(
    'html5-player',
  ) as HTMLVideoElement;
  const videoFrame = document.getElementById(
    'video-frame',
  ) as HTMLIFrameElement;
  const videoPlaceholder = document.getElementById('video-placeholder');
  const videoControls = document.getElementById('video-controls');

  if (cls.videoUrl) {
    if (videoWrapper) videoWrapper.style.display = 'block';

    const isStoragePath = cls.videoUrl.startsWith('/storage');
    const isAPIPath =
      cls.videoUrl.startsWith('/classes/') && cls.videoUrl.endsWith('/video');
    const isBackendVideo = isStoragePath || isAPIPath;
    const isExternalUrl =
      cls.videoUrl.startsWith('http://') || cls.videoUrl.startsWith('https://');

    // Reset States
    if (videoFrame) videoFrame.classList.add('hidden');
    if (html5Player) html5Player.classList.add('hidden');
    if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
    if (videoControls) videoControls.classList.add('hidden');

    if (isBackendVideo) {
      const streamUrl = `/classes/${cls.id}/video`;
      html5Player.src = streamUrl;
      html5Player.load();
      html5Player.classList.remove('hidden');
      html5Player.classList.add('active');

      if (videoControls) videoControls.classList.remove('hidden');
      resetControls();

      if (videoFrame) videoFrame.src = '';
    } else if (isExternalUrl) {
      const isDirectVideo =
        cls.videoUrl.endsWith('.mp4') ||
        cls.videoUrl.endsWith('.webm') ||
        cls.videoUrl.endsWith('.ogg');

      if (isDirectVideo) {
        html5Player.src = cls.videoUrl;
        html5Player.load();
        html5Player.classList.remove('hidden');
        html5Player.classList.add('active');
        if (videoControls) videoControls.classList.remove('hidden');
        resetControls();

        if (videoFrame) videoFrame.src = '';
      } else {
        // YouTube/Vimeo Embeds
        if (videoFrame) {
          videoFrame.src = cls.videoUrl;
          videoFrame.classList.remove('hidden');
          videoFrame.classList.add('active');
        }
        if (html5Player) html5Player.src = '';
      }
    } else {
      if (videoPlaceholder) videoPlaceholder.classList.remove('hidden');
    }
  } else {
    if (cls.materialUrl) {
      if (videoWrapper) videoWrapper.style.display = 'none';
    } else {
      if (videoWrapper) videoWrapper.style.display = 'none';
    }

    if (html5Player) {
      html5Player.pause();
      html5Player.src = '';
    }
    if (videoFrame) {
      videoFrame.src = '';
    }
  }
}

/**
 * Update completion button state
 */
function updateCompletionButton(cls: ClassItem): void {
  const btnComplete = document.getElementById('btn-mark-completed');
  if (!btnComplete) return;

  btnComplete.innerHTML = '';

  const icon = document.createElement('span');
  icon.className = 'material-symbols-outlined';
  icon.textContent = 'check_circle';

  const text = document.createElement('span');
  text.className = 'btn-text';
  text.textContent = cls.isCompleted ? 'Concluída' : 'Marcar como Concluída';

  btnComplete.appendChild(icon);
  btnComplete.appendChild(text);

  if (cls.isCompleted) {
    btnComplete.classList.add('completed');
  } else {
    btnComplete.classList.remove('completed');
  }

  const newBtn = btnComplete.cloneNode(true);
  btnComplete.parentNode?.replaceChild(newBtn, btnComplete);

  newBtn.addEventListener('click', () => toggleCompletion(cls));
}

/**
 * Check and render materials
 */
async function checkMaterials(cls: ClassItem): Promise<void> {
  const matList = document.getElementById('materials-list');
  const matSection = document.getElementById('materials-section');

  if (!matList || !matSection) return;

  matList.innerHTML = '';

  if (!cls.materialUrl) {
    matSection.classList.add('hidden');
    return;
  }

  matSection.classList.remove('hidden');

  const materialUrl = cls.materialUrl;

  const item = document.createElement('div');
  item.className = 'material-item';
  item.style.cursor = 'pointer';

  const matIcon = document.createElement('span');
  matIcon.className = 'material-symbols-outlined material-icon';
  matIcon.textContent = 'download';

  const matInfo = document.createElement('div');
  matInfo.className = 'material-info';

  const matName = document.createElement('span');
  matName.className = 'material-name';
  matName.textContent = 'Baixar Material de Apoio';

  const matSize = document.createElement('span');
  matSize.className = 'material-size';
  matSize.textContent = 'Clique para baixar';

  matInfo.appendChild(matName);
  matInfo.appendChild(matSize);

  item.appendChild(matIcon);
  item.appendChild(matInfo);

  item.addEventListener('click', async () => {
    try {
      if (materialUrl.startsWith('http')) {
        window.open(materialUrl, '_blank');
        return;
      }

      AppUI.showMessage('Iniciando download...', 'info');

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(
        materialUrl.startsWith('/')
          ? materialUrl
          : `/classes/${cls.id}/material`,
        {
          method: 'GET',
          headers,
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;

        const disposition = response.headers.get('content-disposition');
        let filename = `material_${cls.id}.pdf`;
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) filename = match[1];
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
        AppUI.showMessage('Download concluído', 'success');
      } else {
        const errData = await response.json().catch(() => ({}));
        AppUI.showMessage(
          errData.message || 'Erro ao baixar material',
          'error',
        );
      }
    } catch (error) {
      console.error(error);
      AppUI.showMessage('Erro de conexão ao baixar', 'error');
    }
  });

  matList.appendChild(item);
}

/**
 * Toggle class completion status
 */
export async function toggleCompletion(cls: ClassItem): Promise<void> {
  const courseId = getCourseId();
  const courseData = getCourseData();

  try {
    const isNowCompleted = !cls.isCompleted;
    const method = isNowCompleted ? 'POST' : 'DELETE';

    await AppUI.apiFetch(`/classes/${cls.id}/progress`, { method });

    cls.isCompleted = isNowCompleted;

    // Fetch updated progress
    const courseRes = await AppUI.apiFetch(`/courses/${courseId}`);
    if (courseData) {
      courseData.progress = courseRes.data.progress;
      const progressFill = document.getElementById('course-progress-fill');
      const progressText = document.getElementById('course-progress-text');
      if (progressFill && progressText) {
        const prog = courseData.progress || 0;
        progressFill.style.width = `${prog}%`;
        progressText.textContent = `${prog}%`;
      }
    }

    await loadClass(cls);
    renderSidebar();
    updateLessonsCompleted();

    AppUI.showMessage(
      isNowCompleted ? 'Aula concluída!' : 'Conclusão removida.',
      'success',
    );
  } catch (error) {
    AppUI.showMessage('Erro ao atualizar progresso', 'error');
  }
}

/**
 * Load next lesson
 */
export function loadNextLesson(): void {
  const courseData = getCourseData();
  const currentClassId = getCurrentClassId();

  if (!courseData) return;

  let nextClass: ClassItem | null = null;
  let foundCurrent = false;

  for (const module of courseData.modules) {
    for (const cls of module.classes) {
      if (foundCurrent) {
        nextClass = cls;
        break;
      }
      if (cls.id === currentClassId) {
        foundCurrent = true;
      }
    }
    if (nextClass) break;
  }

  if (nextClass) {
    loadClass(nextClass);
  } else {
    AppUI.showMessage('Você completou todas as aulas!', 'success');
  }
}

/**
 * Update next lesson button visibility
 */
export function updateNextLessonButton(): void {
  const courseData = getCourseData();
  const currentClassId = getCurrentClassId();
  const btnNextLesson = document.getElementById('btn-next-lesson');

  if (!courseData || !btnNextLesson) return;

  let hasNext = false;
  let foundCurrent = false;

  for (const module of courseData.modules) {
    for (const cls of module.classes) {
      if (foundCurrent) {
        hasNext = true;
        break;
      }
      if (cls.id === currentClassId) {
        foundCurrent = true;
      }
    }
    if (hasNext) break;
  }

  if (hasNext) {
    btnNextLesson.classList.remove('hidden');
  } else {
    btnNextLesson.classList.add('hidden');
  }
}

/**
 * Setup next lesson button handler
 */
export function setupNextLessonHandler(): void {
  const btnNextLesson = document.getElementById('btn-next-lesson');
  if (!btnNextLesson) return;

  btnNextLesson.addEventListener('click', () => {
    loadNextLesson();
  });
}

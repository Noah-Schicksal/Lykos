/**
 * Player Logic
 */
import { AppUI } from './utils/ui.js';

interface ClassItem {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    moduleId: string;
    isCompleted?: boolean;
    materialUrl?: string; // or attachment path
}

interface Module {
    id: string;
    title: string;
    classes: ClassItem[];
}

interface CourseFull {
    id: string;
    title: string;
    description: string;
    modules: Module[];
    progress: number;
}

const Player = {
    courseId: '',
    currentClassId: '',
    courseData: null as CourseFull | null,

    init: async () => {
        // Get courseId from URL
        const params = new URLSearchParams(window.location.search);
        const id = params.get('courseId');

        if (!id) {
            AppUI.showMessage('Curso não especificado.', 'error');
            setTimeout(() => (window.location.href = 'index.html'), 2000);
            return;
        }

        Player.courseId = id;

        // Auth Check
        const user = localStorage.getItem('auth_user');
        if (!user) {
            window.location.href = 'index.html'; // Redirect if not logged in
            return;
        }
        Player.setupAuthUI(JSON.parse(user));

        await Player.loadCourseData();
    },

    setupAuthUI: (user: any) => {
        const avatarBtn = document.getElementById('user-avatar-btn');
        const authContainer = document.getElementById('auth-card-container');
        const authLogged = document.getElementById('auth-logged-in');
        const viewProfileBtn = document.getElementById('btn-view-profile');
        const profileView = document.getElementById('auth-profile-view');
        const backProfileBtn = document.getElementById('btn-back-from-profile');
        const logoutBtn = document.getElementById('btn-logout');

        // Update User Info
        const nameDisplay = document.getElementById('user-name-display');
        const emailDisplay = document.getElementById('user-email-display');
        const profileName = document.getElementById('profile-view-name');
        const profileEmail = document.getElementById('profile-view-email');
        const profileRole = document.getElementById('profile-view-role');

        if (nameDisplay) nameDisplay.textContent = user.name;
        if (emailDisplay) emailDisplay.textContent = user.email;
        if (profileName) profileName.textContent = user.name;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileRole) profileRole.textContent = user.role === 'INSTRUCTOR' ? 'Instrutor' : 'Estudante';


        if (avatarBtn && authContainer) {
            avatarBtn.addEventListener('click', () => {
                authContainer.classList.toggle('show');
            });

            // Close when clicking outside
            window.addEventListener('click', (e) => {
                if (
                    authContainer.classList.contains('show') &&
                    !authContainer.contains(e.target as Node) &&
                    !avatarBtn.contains(e.target as Node)
                ) {
                    authContainer.classList.remove('show');
                }
            });
        }

        if (viewProfileBtn && authLogged && profileView) {
            viewProfileBtn.addEventListener('click', () => {
                authLogged.classList.add('hidden');
                profileView.classList.remove('hidden');
            });
        }

        if (backProfileBtn && authLogged && profileView) {
            backProfileBtn.addEventListener('click', () => {
                profileView.classList.add('hidden');
                authLogged.classList.remove('hidden');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                window.location.href = 'index.html';
            });
        }
    },

    loadCourseData: async () => {
        try {
            // 1. Fetch Course Details (Header)
            const courseRes = await AppUI.apiFetch(`/courses/${Player.courseId}`);
            const course = courseRes.data;

            document.getElementById('course-title')!.textContent = course.title;

            // Update Progress Bar
            const progressFill = document.getElementById('course-progress-fill');
            const progressText = document.getElementById('course-progress-text');
            if (progressFill && progressText) {
                const prog = course.progress || 0;
                progressFill.style.width = `${prog}%`;
                progressText.textContent = `${prog}%`;
            }

            // 2. Fetch Modules & Classes
            const modulesRes = await AppUI.apiFetch(`/courses/${Player.courseId}/modules`);
            const modules = modulesRes.data || [];

            Player.courseData = { ...course, modules };
            Player.renderSidebar();

            // Auto-load first class if exists
            if (modules.length > 0 && modules[0].classes.length > 0) {
                const firstClass = modules[0].classes[0];
                Player.loadClass(firstClass);
            }

        } catch (error) {
            AppUI.showMessage('Erro ao carregar dados do curso', 'error');
            console.error(error);
        }
    },

    renderSidebar: () => {
        const list = document.getElementById('modules-list');
        if (!list || !Player.courseData) return;

        list.innerHTML = '';

        Player.courseData.modules.forEach((mod, index) => {
            const moduleEl = document.createElement('div');
            moduleEl.className = `module-item ${index === 0 ? 'open' : ''}`; // Open first by default

            const header = document.createElement('div');
            header.className = 'module-header';
            header.innerHTML = `
        <div>
           <div class="module-title">${mod.title}</div>
           <div class="module-meta">${mod.classes.length} aulas</div>
        </div>
        <span class="material-symbols-outlined layer-icon">expand_more</span>
      `;
            header.addEventListener('click', () => {
                moduleEl.classList.toggle('open');
            });

            const classesContainer = document.createElement('div');
            classesContainer.className = 'classes-list';

            mod.classes.forEach(cls => {
                const classEl = document.createElement('div');
                classEl.className = `class-item ${cls.isCompleted ? 'completed' : ''}`;
                classEl.dataset.id = cls.id;
                classEl.innerHTML = `
            <span class="material-symbols-outlined class-status-icon">
                ${cls.isCompleted ? 'check_circle' : 'play_circle'}
            </span>
            <div class="class-info-mini">
                <span class="class-title-mini">${cls.title}</span>
            </div>
         `;
                classEl.addEventListener('click', () => Player.loadClass(cls));
                classesContainer.appendChild(classEl);
            });

            moduleEl.appendChild(header);
            moduleEl.appendChild(classesContainer);
            list.appendChild(moduleEl);
        });
    },

    loadClass: (cls: ClassItem) => {
        Player.currentClassId = cls.id;

        // Update Sidebar Active State
        document.querySelectorAll('.class-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.querySelector(`.class-item[data-id="${cls.id}"]`);
        if (activeItem) activeItem.classList.add('active');

        // Update Info
        document.getElementById('class-title')!.textContent = cls.title;
        document.getElementById('class-description')!.textContent = cls.description;

        // Update Video
        const videoFrame = document.getElementById('video-frame') as HTMLIFrameElement;
        const videoPlaceholder = document.getElementById('video-placeholder');

        if (cls.videoUrl) {
            let embedUrl = cls.videoUrl;

            // YouTube Fix using origin
            if (cls.videoUrl.includes('youtube.com/watch?v=')) {
                embedUrl = cls.videoUrl.replace('watch?v=', 'embed/');
                embedUrl += `?origin=${window.location.origin}`;
            } else if (cls.videoUrl.includes('youtu.be/')) {
                embedUrl = cls.videoUrl.replace('youtu.be/', 'youtube.com/embed/');
                embedUrl += `?origin=${window.location.origin}`;
            }

            // Vimeo Fix (Basic)
            else if (cls.videoUrl.includes('vimeo.com')) {
                // Assuming URL is like https://vimeo.com/123456
                const parts = cls.videoUrl.split('/');
                const vimeoId = parts[parts.length - 1];
                embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
            }

            videoFrame.src = embedUrl;
            videoFrame.classList.add('active');
            if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
        } else {
            videoFrame.src = "";
            videoFrame.classList.remove('active');
            if (videoPlaceholder) videoPlaceholder.classList.remove('hidden');
        }

        // Completion Button State
        const btnComplete = document.getElementById('btn-mark-completed');
        if (btnComplete) {
            if (cls.isCompleted) {
                btnComplete.classList.add('completed');
                btnComplete.innerHTML = '<span class="material-symbols-outlined">check_circle</span> <span class="btn-text">Concluída</span>';
            } else {
                btnComplete.classList.remove('completed');
                btnComplete.innerHTML = '<span class="material-symbols-outlined">check_circle</span> <span class="btn-text">Marcar como Concluída</span>';
            }

            // Clone to remove old listeners (lazy way) or just handle logic carefully
            const newBtn = btnComplete.cloneNode(true);
            btnComplete.parentNode?.replaceChild(newBtn, btnComplete);

            newBtn.addEventListener('click', () => Player.toggleCompletion(cls));
        }

        // Download/Materials
        const matSection = document.getElementById('materials-section');
        const matList = document.getElementById('materials-list');

        // Logic: Fetch materials for this class
        // For now, we simulate check or call endpoint
        Player.checkMaterials(cls.id);
    },

    checkMaterials: async (classId: string) => {
        try {
            const matSection = document.getElementById('materials-section');
            const matList = document.getElementById('materials-list');

            if (matSection) matSection.classList.add('hidden'); // Hide by default

            // In a real scenario, we should check if material exists via API first or rely on class data.
            // But here we will show the button and handle the download errors.

            if (matList && matSection) {
                matList.innerHTML = ''; // Clear previous

                const item = document.createElement('div');
                item.className = 'material-item';
                item.style.cursor = 'pointer';
                item.innerHTML = `
                <span class="material-symbols-outlined material-icon">download</span>
                <div class="material-info">
                    <span class="material-name">Baixar Material de Apoio</span>
                    <span class="material-size">Clique para baixar</span>
                </div>
             `;

                item.addEventListener('click', async () => {
                    try {
                        AppUI.showMessage('Iniciando download...', 'info');

                        const token = localStorage.getItem('auth_token');
                        const headers: Record<string, string> = {};
                        if (token) headers['Authorization'] = `Bearer ${token}`;

                        const response = await fetch(`/classes/${classId}/material`, {
                            method: 'GET',
                            headers
                        });

                        if (response.ok) {
                            const blob = await response.blob();
                            const downloadUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = downloadUrl;

                            // Try to get filename from header
                            const disposition = response.headers.get('content-disposition');
                            let filename = `material_${classId}.pdf`; // fallback
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
                            AppUI.showMessage(errData.message || 'Erro ao baixar material', 'error');
                        }
                    } catch (error) {
                        console.error(error);
                        AppUI.showMessage('Erro de conexão ao baixar', 'error');
                    }
                });

                matList.appendChild(item);
                matSection.classList.remove('hidden');
            }

        } catch (e) {
            console.error('Error checking materials:', e);
        }
    },

    toggleCompletion: async (cls: ClassItem) => {
        try {
            const isNowCompleted = !cls.isCompleted;
            const method = isNowCompleted ? 'POST' : 'DELETE';

            await AppUI.apiFetch(`/classes/${cls.id}/progress`, { method });

            // Update Local Data
            cls.isCompleted = isNowCompleted;

            // Update Course Progress (Simulated locally or fetch again)
            // Ideally fetch again to get accurate %
            const courseRes = await AppUI.apiFetch(`/courses/${Player.courseId}`);
            if (Player.courseData) {
                Player.courseData.progress = courseRes.data.progress;
                // Update Progress Bar
                const progressFill = document.getElementById('course-progress-fill');
                const progressText = document.getElementById('course-progress-text');
                if (progressFill && progressText) {
                    const prog = Player.courseData.progress || 0;
                    progressFill.style.width = `${prog}%`;
                    progressText.textContent = `${prog}%`;
                }
            }

            // Refresh View
            Player.loadClass(cls);
            Player.renderSidebar(); // To update checkmark

            AppUI.showMessage(isNowCompleted ? 'Aula concluída!' : 'Conclusão removida.', 'success');

        } catch (error) {
            AppUI.showMessage('Erro ao atualizar progresso', 'error');
        }
    }
};

// Start
document.addEventListener('DOMContentLoaded', Player.init);

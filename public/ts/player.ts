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
    openModules: new Set<string>(),

    init: async () => {
        // Get courseId from URL
        // Get courseId from URL (Path or Query)
        let id = new URLSearchParams(window.location.search).get('courseId');

        if (!id) {
            // Try extracting from path /aula/:id
            const match = window.location.pathname.match(/\/aula\/([^\/]+)/);
            if (match && match[1]) {
                id = match[1];
            }
        }

        if (!id) {
            AppUI.showMessage('Curso não especificado.', 'error');
            setTimeout(() => (window.location.href = '/inicio'), 2000);
            return;
        }

        Player.courseId = id;

        // Auth Check
        const user = localStorage.getItem('auth_user');
        if (!user) {
            window.location.href = '/inicio'; // Redirect if not logged in
            return;
        }
        Player.setupAuthUI(JSON.parse(user));
        Player.setupSidebarToggle(); // Setup toggle logic

        await Player.loadCourseData();
    },

    setupSidebarToggle: () => {
        const layout = document.querySelector('.player-layout');
        const btnCollapse = document.getElementById('btn-collapse-sidebar');
        const btnRestore = document.getElementById('btn-toggle-sidebar-restore');

        if (!layout || !btnCollapse || !btnRestore) return;

        const toggleSidebar = (collapse: boolean) => {
            if (collapse) {
                layout.classList.add('sidebar-collapsed');
                btnRestore.classList.remove('hidden');
                // Persist preference
                localStorage.setItem('player_sidebar_collapsed', 'true');
            } else {
                layout.classList.remove('sidebar-collapsed');
                btnRestore.classList.add('hidden');
                localStorage.setItem('player_sidebar_collapsed', 'false');
            }
        };

        btnCollapse.addEventListener('click', () => toggleSidebar(true));
        btnRestore.addEventListener('click', () => toggleSidebar(false));

        // Restore state
        const savedState = localStorage.getItem('player_sidebar_collapsed') === 'true';
        if (savedState) toggleSidebar(true);
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
                window.location.href = '/inicio';
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

            // Check Certificate Availability
            if (course.progress === 100) {
                Player.showCertificateButton();
            }

        } catch (error) {
            AppUI.showMessage('Erro ao carregar dados do curso', 'error');
            console.error(error);
        }
    },

    renderSidebar: () => {
        const list = document.getElementById('modules-list');
        if (!list || !Player.courseData) return;

        if (!list || !Player.courseData) return;

        list.innerHTML = '';

        Player.courseData.modules.forEach((mod, index) => {
            const moduleEl = document.createElement('div');
            // Check persistence state or default to first
            const isOpen = Player.openModules.has(mod.id) || (Player.openModules.size === 0 && index === 0);
            if (isOpen) Player.openModules.add(mod.id); // Ensure initial is tracked

            moduleEl.className = `module-item ${isOpen ? 'open' : ''}`;

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
                const isNowOpen = moduleEl.classList.toggle('open');
                if (isNowOpen) {
                    Player.openModules.add(mod.id);
                } else {
                    Player.openModules.delete(mod.id);
                }
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
        const html5Player = document.getElementById('html5-player') as HTMLVideoElement;
        const videoPlaceholder = document.getElementById('video-placeholder');

        if (cls.videoUrl) {
            const embedUrl = Player.getVideoEmbedUrl(cls.videoUrl);
            const isNative = !embedUrl.includes('youtube.com') && !embedUrl.includes('vimeo.com') && !embedUrl.includes('youtu.be');

            if (isNative) {
                // Show HTML5 Player
                if (html5Player) {
                    html5Player.src = cls.videoUrl;
                    html5Player.classList.remove('hidden');
                    html5Player.classList.add('active');
                    // html5Player.play().catch(e => console.log('Auto-play blocked')); // Optional
                }
                if (videoFrame) {
                    videoFrame.src = "";
                    videoFrame.classList.add('hidden');
                    videoFrame.classList.remove('active');
                }
            } else {
                // Show Iframe
                if (videoFrame) {
                    videoFrame.src = embedUrl;
                    videoFrame.classList.remove('hidden');
                    videoFrame.classList.add('active');
                }
                if (html5Player) {
                    html5Player.pause();
                    html5Player.src = "";
                    html5Player.classList.add('hidden');
                }
            }

            if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
        } else {
            // No Video
            if (videoFrame) {
                videoFrame.src = "";
                videoFrame.classList.remove('active');
                videoFrame.classList.add('hidden');
            }
            if (html5Player) {
                html5Player.src = "";
                html5Player.classList.add('hidden');
            }
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
        // Logic: Render materials only if they exist
        Player.checkMaterials(cls);
    },

    getVideoEmbedUrl: (url: string): string => {
        if (!url) return '';

        // YouTube Logic
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            // Regex to capture video ID from various YouTube formats
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);

            if (match && match[2].length === 11) {
                videoId = match[2];
                // Return clean embed URL
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }

        // Vimeo Logic
        if (url.includes('vimeo.com')) {
            // Extract ID from end of URL
            const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
            const match = url.match(regExp);
            if (match && match[1]) {
                return `https://player.vimeo.com/video/${match[1]}`;
            }
        }

        // Return original if no specific handler matched
        return url;
    },

    checkMaterials: async (cls: ClassItem) => {
        try {
            const matSection = document.getElementById('materials-section');
            const matList = document.getElementById('materials-list');

            if (!matSection || !matList) return;

            // Default hidden
            matSection.classList.add('hidden');
            matList.innerHTML = '';

            // Only proceed if there is a materialUrl
            if (!cls.materialUrl) return;

            const materialUrl = cls.materialUrl; // Capture for closure safety

            // Render Item
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
                    // If it is a direct link (http), just open it
                    if (materialUrl.startsWith('http')) {
                        window.open(materialUrl, '_blank');
                        return;
                    }

                    // Otherwise try API download
                    AppUI.showMessage('Iniciando download...', 'info');

                    const token = localStorage.getItem('auth_token');
                    const headers: Record<string, string> = {};
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const response = await fetch(materialUrl.startsWith('/') ? materialUrl : `/classes/${cls.id}/material`, {
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
                        let filename = `material_${cls.id}.pdf`; // fallback
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
                        // Fallback: maybe it's a static file path we can just navigate to?
                        // For now just error
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

                // Check Certificate Availability
                if (Player.courseData.progress === 100) {
                    Player.showCertificateButton();
                }
            }

            // Refresh View
            Player.loadClass(cls);
            Player.renderSidebar(); // To update checkmark

            AppUI.showMessage(isNowCompleted ? 'Aula concluída!' : 'Conclusão removida.', 'success');

        } catch (error) {
            AppUI.showMessage('Erro ao atualizar progresso', 'error');
        }
    },

    showCertificateButton: () => {
        const actionsContainer = document.querySelector('.class-actions');
        if (!actionsContainer) return;

        // Check if button already exists
        if (document.getElementById('btn-generate-certificate')) return;

        const btnCert = document.createElement('button');
        btnCert.id = 'btn-generate-certificate';
        btnCert.className = 'btn-action completed'; // Use green style
        btnCert.innerHTML = '<span class="material-symbols-outlined">workspace_premium</span> <span class="btn-text">Gerar Certificado</span>';
        // Remove direct margin as we use flex gap

        btnCert.addEventListener('click', async () => {
            try {
                const res = await AppUI.apiFetch(`/courses/${Player.courseId}/certificate`, { method: 'POST' });
                if (res.data && res.data.hash) {
                    window.location.href = `certificate.html?hash=${res.data.hash}`;
                }
            } catch (e) {
                AppUI.showMessage('Erro ao gerar certificado.', 'error');
            }
        });

        actionsContainer.appendChild(btnCert);
    },

    checkCertificateStatus: async () => {
        if (Player.courseData && Player.courseData.progress === 100) {
            Player.showCertificateButton();
        }
    }
};

// Start
document.addEventListener('DOMContentLoaded', Player.init);

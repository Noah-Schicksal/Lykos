/**
 * Player Logic
 */
import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';

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
    coverImageUrl?: string;
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

        // Initialize Auth
        Auth.init();

        // Auth Check
        const user = localStorage.getItem('auth_user');
        if (!user) {
            window.location.href = '/inicio'; // Redirect if not logged in
            return;
        }
        Player.setupAuthUI(JSON.parse(user));
        Player.setupThemeToggle(); // Setup theme toggle
        Player.setupSidebarToggle(); // Setup toggle logic
        Player.setupTabs(); // Setup tabs navigation
        Player.setupNextLesson(); // Setup next lesson button
        Player.setupCustomControls(); // Setup custom video controls

        await Player.loadCourseData();
    },

    setupThemeToggle: () => {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const htmlElement = document.documentElement;

        // Load saved theme or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            htmlElement.classList.remove('dark');
            htmlElement.classList.add('light');
        } else {
            htmlElement.classList.remove('light');
            htmlElement.classList.add('dark');
        }

        // Toggle theme on button click
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                if (htmlElement.classList.contains('dark')) {
                    htmlElement.classList.remove('dark');
                    htmlElement.classList.add('light');
                    localStorage.setItem('theme', 'light');
                } else {
                    htmlElement.classList.remove('light');
                    htmlElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                }
            });
        }
    },

    setupSidebarToggle: () => {
        const layout = document.querySelector('.player-layout');
        const btnToggle = document.getElementById('btn-drawer-toggle');

        if (!layout || !btnToggle) return;

        const toggleSidebar = (forceState?: boolean) => {
            const isCollapsed = forceState !== undefined
                ? forceState
                : !layout.classList.contains('sidebar-collapsed');

            if (isCollapsed) {
                layout.classList.add('sidebar-collapsed');
                localStorage.setItem('player_sidebar_collapsed', 'true');
            } else {
                layout.classList.remove('sidebar-collapsed');
                localStorage.setItem('player_sidebar_collapsed', 'false');
            }

            // Icon rotation is handled by CSS based on parent class
        };

        btnToggle.addEventListener('click', () => toggleSidebar());

        // Restore state
        const savedState = localStorage.getItem('player_sidebar_collapsed') === 'true';
        if (savedState) toggleSidebar(true);
    },

    setupTabs: () => {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                // Remove active from all
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active to clicked
                btn.classList.add('active');
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) targetContent.classList.add('active');
            });
        });
    },

    setupNextLesson: () => {
        const btnNextLesson = document.getElementById('btn-next-lesson');
        if (!btnNextLesson) return;

        btnNextLesson.addEventListener('click', () => {
            Player.loadNextLesson();
        });
    },

    setupCustomControls: () => {
        const video = document.getElementById('html5-player') as HTMLVideoElement;
        const playBtn = document.getElementById('btn-play-pause');
        const progressContainer = document.querySelector('.progress-container-video') as HTMLElement;
        const seekSlider = document.getElementById('video-seek-slider') as HTMLInputElement;
        const progressBarFill = document.getElementById('video-progress-fill') as HTMLElement;
        const volumeBtn = document.getElementById('btn-volume');
        const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
        const fullScreenBtn = document.getElementById('btn-fullscreen');
        const currentTimeEl = document.getElementById('current-time');
        const durationEl = document.getElementById('duration');
        const controlsContainer = document.getElementById('video-controls');

        if (!video || !playBtn || !progressContainer || !seekSlider || !progressBarFill || !volumeBtn || !volumeSlider || !fullScreenBtn || !currentTimeEl || !durationEl || !controlsContainer) return;

        // Play/Pause
        const togglePlay = () => {
            if (video.paused || video.ended) {
                video.play();
            } else {
                video.pause();
            }
        };

        playBtn.addEventListener('click', togglePlay);
        video.addEventListener('click', togglePlay);

        // Update Icon on State Change
        const updatePlayIcon = () => {
            const icon = playBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = video.paused ? 'play_arrow' : 'pause';
            // Also show/hide overlay controls logic if desired, but CSS hover handles most
            if (video.paused) {
                controlsContainer.classList.add('visible');
            } else {
                controlsContainer.classList.remove('visible');
            }
        };

        video.addEventListener('play', updatePlayIcon);
        video.addEventListener('pause', updatePlayIcon);

        // Time Update & Progress
        video.addEventListener('timeupdate', () => {
            if (!video.duration) return;
            const pct = (video.currentTime / video.duration) * 100;
            progressBarFill.style.width = `${pct}%`;
            seekSlider.value = pct.toString();

            currentTimeEl.textContent = Player.formatTime(video.currentTime);
            durationEl.textContent = Player.formatTime(video.duration);
        });

        // Seek
        seekSlider.addEventListener('input', () => {
            if (!video.duration) return;
            const time = (parseFloat(seekSlider.value) / 100) * video.duration;
            video.currentTime = time;
            progressBarFill.style.width = `${seekSlider.value}%`;
        });

        // Volume
        const updateVolumeIcon = () => {
            const icon = volumeBtn.querySelector('.material-symbols-outlined');
            if (!icon) return;
            if (video.muted || video.volume === 0) {
                icon.textContent = 'volume_off';
            } else if (video.volume < 0.5) {
                icon.textContent = 'volume_down';
            } else {
                icon.textContent = 'volume_up';
            }
        };

        volumeSlider.addEventListener('input', () => {
            video.volume = parseFloat(volumeSlider.value);
            video.muted = false;
            updateVolumeIcon();
        });

        volumeBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            if (video.muted) {
                volumeSlider.value = '0';
            } else {
                volumeSlider.value = video.volume.toString();
            }
            updateVolumeIcon();
        });

        // Fullscreen
        fullScreenBtn.addEventListener('click', () => {
            const container = document.querySelector('.video-container-wrapper');
            if (!container) return;

            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });

        // Duration loaded
        video.addEventListener('loadedmetadata', () => {
            durationEl.textContent = Player.formatTime(video.duration);
        });

        // Video Ended (Mark Completed)
        video.addEventListener('ended', () => {
            if (!Player.courseData || !Player.currentClassId) return;

            // Find and update current class
            let found = false;
            Player.courseData.modules.forEach(mod => {
                mod.classes.forEach(cls => {
                    if (cls.id === Player.currentClassId) {
                        if (!cls.isCompleted) {
                            cls.isCompleted = true;
                            found = true;
                        }
                    }
                });
            });

            if (found) {
                Player.updateLessonsCompleted();
                Player.renderSidebar(); // Unlock next lesson
                AppUI.showMessage('Aula concluída! Próxima aula desbloqueada.', 'success');
            }
        });
    },

    resetControls: () => {
        const video = document.getElementById('html5-player') as HTMLVideoElement;
        const progressBarFill = document.getElementById('video-progress-fill') as HTMLElement;
        const seekSlider = document.getElementById('video-seek-slider') as HTMLInputElement;
        const currentTimeEl = document.getElementById('current-time');
        const durationEl = document.getElementById('duration');
        const playBtn = document.getElementById('btn-play-pause');

        if (progressBarFill) progressBarFill.style.width = '0%';
        if (seekSlider) seekSlider.value = '0';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        if (durationEl) durationEl.textContent = '0:00';

        // Reset icon
        if (playBtn) {
            const icon = playBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = 'play_arrow';
        }
    },

    formatTime: (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    },

    loadNextLesson: () => {
        if (!Player.courseData) return;

        // Find current class and get next
        let nextClass: ClassItem | null = null;
        let foundCurrent = false;

        for (const module of Player.courseData.modules) {
            for (const cls of module.classes) {
                if (foundCurrent) {
                    nextClass = cls;
                    break;
                }
                if (cls.id === Player.currentClassId) {
                    foundCurrent = true;
                }
            }
            if (nextClass) break;
        }

        if (nextClass) {
            Player.loadClass(nextClass);
        } else {
            AppUI.showMessage('Você completou todas as aulas!', 'success');
        }
    },

    updateNextLessonButton: () => {
        if (!Player.courseData) return;

        const btnNextLesson = document.getElementById('btn-next-lesson');
        if (!btnNextLesson) return;

        // Check if there is a next lesson
        let hasNext = false;
        let foundCurrent = false;

        for (const module of Player.courseData.modules) {
            for (const cls of module.classes) {
                if (foundCurrent) {
                    hasNext = true;
                    break;
                }
                if (cls.id === Player.currentClassId) {
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
            const modulesRes = await AppUI.apiFetch(`/courses/${Player.courseId}/modules`);
            const modules = modulesRes.data || [];

            Player.courseData = { ...course, modules };
            Player.renderSidebar();
            Player.updateLessonsCompleted(); // Update lessons completed count

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

        list.innerHTML = '';

        let globalLocked = false; // logic to lock future lessons

        Player.courseData.modules.forEach((mod, index) => {
            const moduleEl = document.createElement('details');

            // Logic to determine if this module is the one active (contains current class)
            // If so, it should be open by default on load/render.
            // Also respect manual persistence if desired, but user request implies smart behavior.
            const containsActive = mod.classes.some(c => c.id === Player.currentClassId);

            // If this module contains the active class, force it open.
            // OR if it's the first one and nothing is active yet.
            if (containsActive) {
                Player.openModules.add(mod.id);
            }

            const isOpen = Player.openModules.has(mod.id);
            if (isOpen) moduleEl.open = true;

            moduleEl.className = 'module-item';

            const header = document.createElement('summary');
            header.className = 'module-header';

            // New Structure: Info Wrapper (Title + Meta) on left, Chevron on right
            header.innerHTML = `
                <div class="module-info-wrapper">
                    <span class="module-title">${mod.title}</span>
                    <span class="module-meta">${mod.classes.length} Aulas</span> 
                </div>
                <span class="material-symbols-outlined layer-icon" style="color: var(--text-muted); transition: transform 0.2s;">expand_more</span>
            `;

            // Toggle Logic to track state
            moduleEl.addEventListener('toggle', () => {
                if (moduleEl.open) {
                    Player.openModules.add(mod.id);
                } else {
                    Player.openModules.delete(mod.id);
                }
            });

            const classesContainer = document.createElement('div');
            classesContainer.className = 'classes-list';

            mod.classes.forEach(cls => {
                const classEl = document.createElement('div');
                const isCompleted = cls.isCompleted;
                const isActive = cls.id === Player.currentClassId;

                // Determine Lock State
                const isLocked = globalLocked;

                // Update globalLocked for the NEXT iteration
                if (!isCompleted) {
                    globalLocked = true;
                }

                classEl.className = `class-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
                classEl.dataset.id = cls.id;

                let iconName = 'play_circle';
                if (isLocked) iconName = 'lock';
                else if (isCompleted) iconName = 'check_circle';

                const playingBadge = isActive ? '<span class="badge-playing">PLAYING</span>' : '';

                classEl.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: rgba(94, 23, 235, 0.1); border-radius: 8px; flex-shrink: 0;">
                        <span class="material-symbols-outlined class-status-icon" style="font-size: 1.5rem; color: var(--primary);">
                            ${iconName}
                        </span>
                    </div>
                    <div style="display: flex; flex-direction: column; flex: 1;">
                        <span class="class-title-mini" style="font-size: 0.95rem; font-weight: 600; ${isLocked ? 'color: var(--text-muted);' : ''}">${cls.title}</span>
                    </div>
                    ${playingBadge}
                `;

                if (!isLocked) {
                    classEl.addEventListener('click', () => Player.loadClass(cls));
                } else {
                    classEl.style.cursor = 'not-allowed';
                    classEl.style.opacity = '0.6';
                }

                classesContainer.appendChild(classEl);
            });

            moduleEl.appendChild(header);
            moduleEl.appendChild(classesContainer);
            list.appendChild(moduleEl);
        });
    },

    updateLessonsCompleted: () => {
        if (!Player.courseData) return;

        let totalClasses = 0;
        let completedClasses = 0;

        Player.courseData.modules.forEach(mod => {
            totalClasses += mod.classes.length;
            completedClasses += mod.classes.filter(c => c.isCompleted).length;
        });

        const lessonsCompletedEl = document.getElementById('course-lessons-completed');
        if (lessonsCompletedEl) {
            lessonsCompletedEl.textContent = `${completedClasses}/${totalClasses} Lessons Completed`;
        }
    },

    loadClass: async (cls: ClassItem) => {
        Player.currentClassId = cls.id;

        // Find module name for breadcrumb and handle Auto-Disclosure Logic
        let moduleName = '';
        let activeModuleId = '';

        if (Player.courseData) {
            for (const mod of Player.courseData.modules) {
                if (mod.classes.some(c => c.id === cls.id)) {
                    moduleName = mod.title;
                    activeModuleId = mod.id;
                    break;
                }
            }

            // Logic: Open current module, close others if they are completed
            if (activeModuleId) {
                Player.openModules.add(activeModuleId);

                Player.courseData.modules.forEach(mod => {
                    if (mod.id !== activeModuleId) {
                        const isModuleCompleted = mod.classes.every(c => c.isCompleted);
                        if (isModuleCompleted) {
                            Player.openModules.delete(mod.id);
                        }
                    }
                });
            }
        }

        // Re-render sidebar to update Locks, Active State, and Open/Close states
        Player.renderSidebar();

        // Update breadcrumb
        const breadcrumbModule = document.getElementById('breadcrumb-module');
        if (breadcrumbModule) breadcrumbModule.textContent = moduleName;

        // Update Info
        document.getElementById('class-title')!.textContent = cls.title;
        document.getElementById('class-description')!.textContent = cls.description;

        // Update Video
        // Update Video Logic with Download-Only Check
        const videoWrapper = document.querySelector('.video-container-wrapper') as HTMLElement;
        const videoFrame = document.getElementById('video-frame') as HTMLIFrameElement;
        const html5Player = document.getElementById('html5-player') as HTMLVideoElement;
        const videoPlaceholder = document.getElementById('video-placeholder');
        const videoControls = document.getElementById('video-controls');

        if (cls.videoUrl) {
            // Show Video Container
            if (videoWrapper) videoWrapper.style.display = 'block';

            // Handle BOTH formats:
            // 1. Raw storage path: /storage/courses/...
            // 2. API-transformed path: /classes/:id/video
            const isStoragePath = cls.videoUrl.startsWith('/storage');
            const isAPIPath = cls.videoUrl.startsWith('/classes/') && cls.videoUrl.endsWith('/video');
            const isBackendVideo = isStoragePath || isAPIPath;
            const isExternalUrl = cls.videoUrl.startsWith('http://') || cls.videoUrl.startsWith('https://');

            console.log('[Player Debug] Video URL from API:', cls.videoUrl);

            // Reset States
            if (videoFrame) videoFrame.classList.add('hidden');
            if (html5Player) html5Player.classList.add('hidden');
            if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
            if (videoControls) videoControls.classList.add('hidden');

            if (isBackendVideo) {
                // For backend videos, ALWAYS use the streaming route /classes/:id/video
                const streamUrl = `/classes/${cls.id}/video`;
                console.log('[Player Debug] Loading backend video from:', streamUrl);

                html5Player.src = streamUrl;
                html5Player.load();
                html5Player.classList.remove('hidden');
                html5Player.classList.add('active');

                if (videoControls) videoControls.classList.remove('hidden');
                Player.resetControls();

                if (videoFrame) videoFrame.src = "";

            } else if (isExternalUrl) {
                const isDirectVideo = cls.videoUrl.endsWith('.mp4') || cls.videoUrl.endsWith('.webm') || cls.videoUrl.endsWith('.ogg');

                if (isDirectVideo) {
                    console.log('[Player Debug] Loading external MP4 from:', cls.videoUrl);
                    html5Player.src = cls.videoUrl;
                    html5Player.load();
                    html5Player.classList.remove('hidden');
                    html5Player.classList.add('active');
                    if (videoControls) videoControls.classList.remove('hidden');
                    Player.resetControls();

                    if (videoFrame) videoFrame.src = "";
                } else {
                    // YouTube/Vimeo Embeds
                    videoFrame.src = cls.videoUrl;
                    videoFrame.classList.remove('hidden');
                    videoFrame.classList.add('active');

                    if (html5Player) html5Player.src = "";
                }
            } else {
                // Fallback
                if (videoPlaceholder) videoPlaceholder.classList.remove('hidden');
            }
        } else {
            // No Video URL
            console.log('[Player Debug] No video URL found for this class.');

            // If there is material but no video, HIDE the player wrapper entirely
            // implying a "Download Only" lesson or just text/material
            if (cls.materialUrl) {
                if (videoWrapper) videoWrapper.style.display = 'none';
            } else {
                // If neither (or just to be safe), show placeholder or hide wrapper? 
                // Let's hide wrapper to be cleaner if it's empty, 
                // BUT if it's the "start state" we might want placeholder.
                // Since this is loadClass (user clicked something), if there's nothing, just hide player.
                if (videoWrapper) videoWrapper.style.display = 'none';
            }

            // Stop any playing video
            if (html5Player) {
                html5Player.pause();
                html5Player.src = "";
            }
            if (videoFrame) {
                videoFrame.src = "";
            }
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

        // Update Next Lesson button visibility
        Player.updateNextLessonButton();
    },

    loadAuthenticatedVideo: async (classId: string, videoElement: HTMLVideoElement) => {
        // This function is now deprecated in favor of direct src assignment
        // which triggers the browser's native Range-based streaming.
        videoElement.src = `/classes/${classId}/video`;
        videoElement.load();
    },

    checkMaterials: async (cls: ClassItem) => {
        try {
            const matList = document.getElementById('materials-list');
            const matSection = document.getElementById('materials-section');

            if (!matList || !matSection) return;

            // Clear materials list
            matList.innerHTML = '';

            // Only proceed if there is a materialUrl
            if (!cls.materialUrl) {
                // HIDE section if no materials
                matSection.classList.add('hidden');
                return;
            }

            // SHOW section if materials exist
            matSection.classList.remove('hidden');


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
            Player.updateLessonsCompleted(); // Update lessons count

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

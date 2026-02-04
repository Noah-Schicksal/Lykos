/**
 * Student Dashboard Script
 * Handles dynamic loading of student information and courses
 */
import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';
import { Categories } from './modules/categories.js';
import { Cart } from './modules/cart.js';
import { initThemeToggle } from './theme-toggle.js';

let allCourses: any[] = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
        // Redirect to home page if not logged in
        console.warn('No user session found, redirecting to home.');
        window.location.href = '/inicio';
        return;
    }

    initThemeToggle();
    console.log('Student session detected:', user.name);

    // Update user info in the header
    updateUserInfo(user);

    // Setup sidebar navigation
    setupNavigation();

    // Setup Search and Categories
    if (document.getElementById('category-filter')) {
        loadCategories();
    }

    if (document.getElementById('course-search-input')) {
        setupSearch();
    }

    // Load dynamic courses
    await loadStudentCourses();

    // Initialize Cart
    Cart.updateBadge();
    setupCartListeners();
});

/**
 * Updates the user information displayed in the header
 */
function updateUserInfo(user: any) {
    const headerName = document.getElementById('header-user-name');
    const roleText = document.getElementById('header-user-role');
    const welcomeTitle = document.getElementById('welcome-title');
    const coursesStatus = document.getElementById('courses-status');
    const sidebarUserName = document.getElementById('sidebar-user-name');

    if (headerName) {
        headerName.textContent = user.name || 'Aluno';
    }

    if (roleText) {
        const userRole = (user.role || 'STUDENT').toUpperCase();
        roleText.textContent = userRole === 'INSTRUCTOR' ? 'Instrutor' : 'Aluno';
    }

    if (welcomeTitle) {
        const firstName = user.name ? user.name.split(' ')[0] : 'Aluno';
        welcomeTitle.innerHTML = `Olá, <span class="text-primary">${firstName}</span>!`;
    }

    if (coursesStatus) {
        coursesStatus.innerHTML = `Carregando seus cursos...`;
    }

    // Update sidebar user card
    if (sidebarUserName) {
        sidebarUserName.textContent = user.name || 'Aluno';
    }
}

/**
 * Fetches courses from API
 */
async function loadStudentCourses() {
    const status = document.getElementById('courses-status');
    try {
        const response = await AppUI.apiFetch('/my-courses');
        allCourses = response?.data || [];

        if (status) {
            status.innerHTML = `Você tem <span class="text-primary font-bold">${allCourses.length} cursos</span> ativos em andamento.`;
        }

        renderCourses(allCourses);
        setupCourseCardListeners();
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        const grid = document.getElementById('courses-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full py-10 text-center">
                    <p class="text-error mb-4">Erro ao carregar seus cursos.</p>
                    <button onclick="window.location.reload()" class="btn-auth-submit" style="width: auto; padding: 0.5rem 1rem">Tentar Novamente</button>
                </div>
            `;
        }
    }
}

/**
 * Renders the featured course at the top
 */
/**
 * Renders course cards to the grid
 */
function renderCourses(courses: any[]) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    if (courses.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center bg-surface-dark border border-white/5 rounded-xl">
                <span class="material-symbols-outlined text-6xl text-slate-700 mb-4">school</span>
                <p class="text-slate-500 text-lg">Nenhum curso encontrado.</p>
                <a href="/inicio" class="text-primary hover:underline mt-4 inline-block font-bold">Explorar Catálogo de Cursos</a>
            </div>
        `;
        return;
    }

    grid.innerHTML = courses.map((course: any) => {
        const progress = course.progress || 0;
        const icon = course.category && course.category.toLowerCase().includes('code') ? 'code' : 'school';
        const hasCoverImage = course.coverImageUrl && course.coverImageUrl.trim() !== '';

        return `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-cover ${!hasCoverImage ? 'no-image' : ''}">
                    ${hasCoverImage
                ? `<img src="${course.coverImageUrl}" alt="${course.title}" class="course-cover-img" />`
                : `<div class="course-cover-placeholder">
                             <span class="material-symbols-outlined">${icon}</span>
                           </div>`
            }
                    <span class="course-badge ${progress === 100 ? 'completed' : ''}">
                        ${progress === 100 ? 'Concluído' : 'Em Andamento'}
                    </span>
                </div>
                <div class="course-body">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-meta">${course.instructorName || 'Lykos Instructor'}</p>
                    <div class="course-progress">
                        <div class="progress-bar-small">
                            <div class="progress-fill-small ${progress === 100 ? 'completed' : ''}" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-info ${progress === 100 ? 'completed' : ''}">
                            <span>PROGRESSO</span>
                            <span class="progress-value">${progress}%</span>
                        </div>
                    </div>
                    <div class="course-footer">
                        <button class="btn-resume-course small" data-course-id="${course.id}">Continuar Estudando</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Setup event listeners for course cards
function setupCourseCardListeners() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    // Handle card clicks (excluding button clicks)
    const cards = grid.querySelectorAll('.course-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.btn-resume-course')) {
                const courseId = (card as HTMLElement).dataset.courseId;
                if (courseId) window.location.href = `/aula/${courseId}`;
            }
        });
    });

    // Handle button clicks
    const buttons = grid.querySelectorAll('.btn-resume-course');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const courseId = (button as HTMLElement).dataset.courseId;
            if (courseId) window.location.href = `player.html?courseId=${courseId}`;
        });
    });
}

/**
 * Sets up Search and Category filtering
 */
function setupSearch() {
    const searchInput = document.getElementById('course-search-input') as HTMLInputElement;
    const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;

    if (!searchInput || !categoryFilter) return;

    const filterFunction = () => {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        const filtered = allCourses.filter(course => {
            const matchesQuery = course.title.toLowerCase().includes(query) ||
                (course.description && course.description.toLowerCase().includes(query));
            const matchesCategory = !category || course.categoryId === category;

            return matchesQuery && matchesCategory;
        });
        renderCourses(filtered);
        setupCourseCardListeners();
    };

    searchInput.addEventListener('input', filterFunction);
    categoryFilter.addEventListener('change', filterFunction);
}

/**
 * Loads categories for the filter
 */
async function loadCategories() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    try {
        const response = await AppUI.apiFetch('/categories');
        const categories = response?.data || [];

        categoryFilter.innerHTML = '<option value="">Todas Categorias</option>';
        categories.forEach((cat: any) => {
            const option = document.createElement('option');
            option.value = cat.id.toString();
            option.textContent = cat.name;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

/**
 * Sets up sidebar navigation and UI toggles
 */
function setupNavigation() {
    // Sidebar Toggle (inside sidebar)
    const btnToggle = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');

    // Mobile Menu Toggle (in header)
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');

    if (sidebar) {
        // Toggle from sidebar button
        if (btnToggle) {
            btnToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('active');
            });
        }

        // Toggle from mobile menu button in header
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('active');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (sidebar.classList.contains('active') &&
                !sidebar.contains(target) &&
                (!btnToggle || !btnToggle.contains(target)) &&
                (!mobileMenuBtn || !mobileMenuBtn.contains(target))) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Sidebar Avatar Button (Redirect to Home)
    const sidebarAvatarBtn = document.getElementById('sidebar-avatar-btn');
    if (sidebarAvatarBtn) {
        sidebarAvatarBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // --- Dashboard Navigation ---
    const navCourses = document.getElementById('nav-courses');
    const navCertificates = document.getElementById('nav-certificates');

    if (navCourses && navCertificates) {
        navCourses.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('courses');
        });

        navCertificates.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('certificates');
        });
    } else {
        console.log('Navigation items not found (normal if using studentDashboard.html)');
    }

    // --- Auth Card UI Listeners ---
    const avatarBtn = document.getElementById('user-avatar-btn');
    const authContainer = document.getElementById('auth-card-container');
    const cardInner = document.getElementById('auth-card');

    if (avatarBtn && authContainer) {
        console.log('Avatar button and auth container found');
        avatarBtn.addEventListener('click', (e) => {
            console.log('Avatar button clicked');
            e.stopPropagation();
            authContainer.classList.toggle('show');
            const isShown = authContainer.classList.contains('show');
            console.log('Auth container "show" class:', isShown);

            // Refresh content when showing
            if (isShown) {
                Auth.updateAuthUI();
            }
        });

        document.addEventListener('click', (e) => {
            if (
                authContainer.classList.contains('show') &&
                !authContainer.contains(e.target as Node) &&
                !avatarBtn.contains(e.target as Node)
            ) {
                authContainer.classList.remove('show');
            }
        });
    }

    // Auth Card Action Handlers
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        const confirmed = await AppUI.promptModal('Sair da Conta', 'Tem certeza que deseja sair agora?');
        if (confirmed) {
            await Auth.logout();
            window.location.href = '/inicio';
        }
    });

    document.getElementById('btn-my-learning')?.addEventListener('click', () => {
        authContainer?.classList.remove('show');
        // Redireciona para a página correta do dashboard do aluno
        window.location.href = 'student.html';
    });

    document.getElementById('btn-instructor-dash')?.addEventListener('click', () => {
        window.location.href = 'instructor.html';
    });

    document.getElementById('btn-create-course')?.addEventListener('click', () => {
        window.location.href = 'instructor.html';
    });

    document.getElementById('btn-manage-categories')?.addEventListener('click', (e) => {
        e.preventDefault();
        // Redirect to instructor dash for this for now as it needs complex templates
        window.location.href = 'instructor.html';
    });

    document.getElementById('btn-view-profile')?.addEventListener('click', () => {
        Auth.showProfileView();
    });

    document.getElementById('btn-back-from-profile')?.addEventListener('click', () => {
        Auth.updateAuthUI();
    });

    document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
        Auth.showProfileEdit();
    });

    document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
        Auth.showProfileView();
    });

    document.getElementById('profile-edit-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (document.getElementById('edit-name') as HTMLInputElement).value;
        const email = (document.getElementById('edit-email') as HTMLInputElement).value;
        const password = (document.getElementById('edit-password') as HTMLInputElement).value;

        await Auth.updateUserProfile({ name, email, password });
    });

    document.getElementById('btn-delete-account')?.addEventListener('click', async () => {
        const deleted = await Auth.deleteUserAccount();
        if (deleted) {
            window.location.href = '/inicio';
        }
    });

    // Mirroring instructor's initial update
    Auth.updateAuthUI();

    // Home link in breadcrumb or logo
    const homeLinks = document.querySelectorAll('a');
    homeLinks.forEach(link => {
        if (link.textContent?.trim() === 'Início') {
            link.href = '/inicio';
        }
    });

    // Home navigation handling
    const btnLogout = document.getElementById('btn-logout-sidebar');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Profile link or other navigation items
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const a = link as HTMLAnchorElement;
        if (a.textContent?.includes('Profile') || a.textContent?.includes('Perfil')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/inicio';
            });
        }
    });

    // --- Certificate Modal Listeners ---
    setupCertificateModalListeners();
}

/**
 * Switches between dashboard views
 */
function switchView(view: 'courses' | 'certificates') {
    const coursesView = document.getElementById('courses-view');
    const certificatesView = document.getElementById('certificates-view');
    const navCourses = document.getElementById('nav-courses');
    const navCertificates = document.getElementById('nav-certificates');
    const welcomeTitle = document.getElementById('welcome-title');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');

    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Aluno' };
    const firstName = user.name ? user.name.split(' ')[0] : 'Aluno';

    if (view === 'courses') {
        coursesView?.classList.remove('hidden');
        certificatesView?.classList.add('hidden');
        navCourses?.classList.add('active');
        navCertificates?.classList.remove('active');

        if (welcomeTitle) {
            welcomeTitle.innerHTML = `Bem-vindo de volta, <span class="text-primary">${firstName}</span>!`;
        }
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Meus Cursos';

        loadStudentCourses();
    } else {
        coursesView?.classList.add('hidden');
        certificatesView?.classList.remove('hidden');
        navCourses?.classList.remove('active');
        navCertificates?.classList.add('active');

        if (welcomeTitle) {
            welcomeTitle.innerHTML = `Suas <span class="text-primary">Conquistas</span>`;
        }
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Certificados';

        renderCertificates(allCourses);
    }
}

/**
 * Renders certificates in the grid
 */
function renderCertificates(courses: any[]) {
    const grid = document.getElementById('certificates-grid');
    if (!grid) return;

    const completedWithCert = courses.filter(c => c.progress === 100 && c.certificateHash);

    if (completedWithCert.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center bg-surface-dark border border-white/5 rounded-xl">
                <span class="material-symbols-outlined text-6xl text-slate-700 mb-4">workspace_premium</span>
                <p class="text-slate-500 text-lg">Você ainda não possui certificados disponíveis.</p>
                <p class="text-slate-600 text-sm">Conclua 100% de um curso para desbloquear seu certificado.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = completedWithCert.map((course: any) => {
        const date = new Date(course.enrolledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

        return `
            <div class="certificate-card" data-hash="${course.certificateHash}" data-title="${course.title}" data-date="${date}">
                <div class="cert-card-header">
                    <div class="cert-card-icon">
                        <span class="material-symbols-outlined">workspace_premium</span>
                    </div>
                </div>
                <div class="cert-card-info">
                    <h3 class="cert-card-title">${course.title}</h3>
                    <span class="cert-card-date">Emitido em ${date}</span>
                </div>
                <div class="cert-card-footer">
                    <span class="cert-card-hash">${course.certificateHash.substring(0, 8)}...</span>
                    <span class="btn-view-cert">
                        download
                    </span>
                </div>
            </div>
        `;
    }).join('');

    setupCertificateCardListeners();
}

/**
 * Listeners for certificate card clicks
 */
function setupCertificateCardListeners() {
    const cards = document.querySelectorAll('.certificate-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const hash = (card as HTMLElement).dataset.hash;
            const title = (card as HTMLElement).dataset.title;
            const date = (card as HTMLElement).dataset.date;

            if (hash && title && date) {
                openCertificateModal(hash, title, date);
            }
        });
    });
}

/**
 * Opens the certificate modal with data
 */
function openCertificateModal(hash: string, title: string, date: string) {
    const modal = document.getElementById('certificate-modal');
    const iframe = document.getElementById('certificate-iframe') as HTMLIFrameElement;

    if (iframe) {
        iframe.src = `certificate.html?hash=${hash}&embed=true`;
    }

    modal?.classList.remove('hidden');
}

/**
 * --- Shopping Cart UI Logic ---
 */

/**
 * Sets up cart event listeners
 */
function setupCartListeners() {
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');

    if (cartToggleBtn && cartModal) {
        cartToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cartModal.classList.toggle('show');
            if (cartModal.classList.contains('show')) {
                renderCartItems();
            }
        });

        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => {
                cartModal.classList.remove('show');
            });
        }

        document.addEventListener('click', (e) => {
            if (
                cartModal.classList.contains('show') &&
                !cartModal.contains(e.target as Node) &&
                !cartToggleBtn.contains(e.target as Node)
            ) {
                cartModal.classList.remove('show');
            }
        });
    }

    // Handle Checkout Button
    const checkoutBtn = document.getElementById('btn-cart-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const confirm = await AppUI.promptModal(
                'Finalizar Compra',
                'Deseja confirmar a compra dos itens no carrinho?'
            );
            if (confirm) {
                const success = await Cart.checkout();
                if (success) {
                    cartModal?.classList.remove('show');
                    // Refresh courses to reflect new ownership if needed
                    loadStudentCourses();
                }
            }
        });
    }

    // Listen for cart-updated events
    window.addEventListener('cart-updated', () => {
        Cart.updateBadge();
        if (cartModal?.classList.contains('show')) {
            renderCartItems();
        }
    });
}

/**
 * Renderiza os itens do carrinho no modal
 */
async function renderCartItems() {
    const listContainer = document.getElementById('cart-items-list');
    const totalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('btn-cart-checkout') as HTMLButtonElement;

    if (!listContainer || !totalPriceEl) return;

    listContainer.innerHTML = '<div class="cart-empty-msg">Carregando itens...</div>';

    try {
        const items = await Cart.getCart();

        if (items.length === 0) {
            listContainer.innerHTML = '<div class="cart-empty-msg">Seu carrinho está vazio.</div>';
            totalPriceEl.textContent = 'R$ 0,00';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        listContainer.innerHTML = items.map(item => {
            total += item.price;
            const price = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(item.price);

            const hasImage = item.coverImageUrl && item.coverImageUrl.trim() !== '';
            const imageHTML = hasImage
                ? `<img src="${item.coverImageUrl}" class="cart-item-img" alt="${item.title}" onerror="this.onerror=null;this.style.display='none';this.parentElement.insertAdjacentHTML('afterbegin','<div class=\\'cart-item-img-placeholder\\'><span class=\\'material-symbols-outlined\\'>image</span></div>');">`
                : `<div class="cart-item-img-placeholder"><span class="material-symbols-outlined">image</span></div>`;

            return `
                <div class="cart-item">
                    ${imageHTML}
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <div class="cart-item-price">${price}</div>
                    </div>
                    <button class="btn-remove-cart" data-id="${item.courseId}" title="Remover">
                        <span class="material-symbols-outlined" style="font-size: 1.25rem">delete</span>
                    </button>
                </div>
            `;
        }).join('');

        totalPriceEl.textContent = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(total);
        if (checkoutBtn) checkoutBtn.disabled = false;

        // Add remove listeners
        const removeBtns = listContainer.querySelectorAll('.btn-remove-cart');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const courseId = (btn as HTMLElement).dataset.id!;
                const success = await Cart.remove(courseId);
                if (success) {
                    renderCartItems(); // Refresh
                }
            });
        });
    } catch (error) {
        listContainer.innerHTML = '<div class="cart-empty-msg" style="color: #ef4444">Erro ao carregar carrinho.</div>';
    }
}

/**
 * Modal action listeners
 */
function setupCertificateModalListeners() {
    const modal = document.getElementById('certificate-modal');
    const closeBtn = document.getElementById('close-cert-modal');
    const printBtn = document.getElementById('btn-modal-print');

    closeBtn?.addEventListener('click', () => {
        modal?.classList.add('hidden');
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal?.classList.add('hidden');
        }
    });

    printBtn?.addEventListener('click', () => {
        const iframe = document.getElementById('certificate-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
    });
}

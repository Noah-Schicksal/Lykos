/**
 * Home Module - Handles Home Page Logic
 */
import { AppUI } from './utils/ui.js';
import { Courses, Course } from './modules/courses.js';
import { Categories } from './modules/categories.js';
import { Modules } from './modules/modules.js';
import { Cart } from './modules/cart.js';

export const Home = {
  allCourses: [] as Course[], // Store all courses locally
  filteredCourses: [] as Course[], // Store filtered courses
  selectedCategory: '',
  currentPage: 1,
  itemsPerPage: 12,
  cartItems: [] as string[], // Track simulated cart items

  /**
   * Inicializa a página Home
   */
  init: () => {
    const gridContainer = document.getElementById('courses-grid');
    if (!gridContainer) return;

    // Attach pagination listeners to containers
    ['pagination-top', 'pagination-bottom'].forEach((id) => {
      const container = document.getElementById(id);
      if (container) {
        container.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const btn = target.closest('button');
          if (
            btn &&
            !btn.classList.contains('disabled') &&
            !btn.hasAttribute('disabled')
          ) {
            const page = parseInt(btn.getAttribute('data-page') || '1');
            console.log(`Pagination click: going to page ${page}`);
            Home.renderPage(page, true);
          }
        });
      }
    });

    Home.loadCourses();
    Home.loadCategories();

    // Attach search listener (Now using the top search bar)
    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => Home.applyFilters());
    }

    // Attach category listener
    const categorySelect = document.getElementById('category-filter');
    if (categorySelect) {
      categorySelect.addEventListener('change', () => Home.applyFilters());
    }

    // Modal Close listeners
    const closeModalBtn = document.getElementById('close-modal');
    const modal = document.getElementById('course-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => Home.closeCourseModal());
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        // Close if clicking on the modal itself (overlay) or the overlay div
        const target = e.target as HTMLElement;
        if (
          target.id === 'course-modal' ||
          target.classList.contains('course-modal-overlay')
        ) {
          Home.closeCourseModal();
        }
      });
    }

    // Modal Cart listener
    const modalCartBtn = document.getElementById('modal-add-cart-btn');
    if (modalCartBtn) {
      modalCartBtn.addEventListener('click', () => {
        // Check if button is disabled (owner case)
        if (modalCartBtn.hasAttribute('disabled')) {
          return;
        }

        const courseId = modalCartBtn.getAttribute('data-course-id');
        console.log(`[Home] Modal cart button clicked for course ${courseId}`);
        if (courseId) {
          if (Home.cartItems.includes(courseId)) {
            console.log(
              `[Home] Course ${courseId} is already in cart. Opening sidebar...`,
            );
            const cartToggle = document.getElementById('cart-toggle-btn');
            if (cartToggle) {
              Home.closeCourseModal();
              setTimeout(() => {
                console.log('[Home] Triggering cart toggle click');
                cartToggle.click();
              }, 100);
            } else {
              console.error('[Home] cart-toggle-btn not found');
            }
            return;
          }
          Home.addToCart(courseId);
        }
      });
    }

    Home.syncCart();

    // Listen for cart updates to keep local state in sync
    window.addEventListener('cart-updated', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === 'remove' && detail?.courseId) {
        // Remove from local state
        Home.cartItems = Home.cartItems.filter(id => id !== detail.courseId);
        console.log(`[Home] Cart updated - removed ${detail.courseId}. Current items:`, Home.cartItems);
      }
    });

    // Listen for auth changes to reload courses with correct user context
    window.addEventListener('auth-login', () => {
      console.log('[Home] Auth login detected - reloading courses and cart');
      Home.loadCourses();
      Home.syncCart();
    });

    window.addEventListener('auth-logout', () => {
      console.log('[Home] Auth logout detected - reloading courses and clearing cart state');
      Home.cartItems = [];
      Home.loadCourses();
    });
  },

  /**
   * Sincroniza os itens do carrinho com o servidor
   */
  syncCart: async () => {
    try {
      const items = await Cart.getCart();
      Home.cartItems = items.map((item) => item.courseId);

      // Update badge
      const badge = document.getElementById('cart-count-badge');
      if (badge) {
        badge.textContent = Home.cartItems.length.toString();
        badge.style.display = Home.cartItems.length > 0 ? 'flex' : 'none';
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  },

  /**
   * Carrega TODOS os cursos e inicia a paginação local
   */
  loadCourses: async () => {
    try {
      const gridContainer = document.getElementById('courses-grid');
      if (gridContainer) {
        gridContainer.innerHTML = `
          <p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
            Carregando cursos...
          </p>`;
      }

      // Fetch ALL courses (limit 1000)
      const response = await Courses.getAll(1, 1000);
      Home.allCourses = response.data || [];
      Home.filteredCourses = Home.allCourses;
      Home.currentPage = 1;

      console.log(
        `Loaded ${Home.allCourses.length} courses. Rendering page 1.`,
      );
      Home.renderPage(1, false);

      // Ocultar a legenda de carregamento após sucesso
      const subtitle = document.getElementById('courses-subtitle');
      if (subtitle) {
        subtitle.style.display = 'none';
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      const gridContainer = document.getElementById('courses-grid');
      if (gridContainer) {
        gridContainer.innerHTML = `
          <p style="grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 2rem;">
            Erro ao carregar cursos. Por favor, tente novamente mais tarde.
          </p>`;
      }
    }
  },

  /**
   * Renderiza a página específica fatiando o array local
   */
  renderPage: (page: number, shouldScroll: boolean = true) => {
    console.log(`Rendering Page ${page}`);
    Home.currentPage = page;
    const start = (page - 1) * Home.itemsPerPage;
    const end = start + Home.itemsPerPage;
    const paginatedCourses = Home.filteredCourses.slice(start, end);

    Home.renderGrid(paginatedCourses);
    Home.renderPagination();

    // Smooth scroll to top of the course section
    if (shouldScroll) {
      const section = document.getElementById('courses-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  },

  /**
   * Renderiza a grade de cursos
   */
  renderGrid: (courses: Course[]) => {
    const gridContainer = document.getElementById('courses-grid');
    if (!gridContainer) return;

    if (courses.length === 0) {
      gridContainer.innerHTML = `
        <p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
          Nenhum curso encontrado.
        </p>`;
      return;
    }

    gridContainer.innerHTML = '';

    courses.forEach((course) => {
      const card = document.createElement('div');
      card.className = 'card-base group cursor-pointer';
      card.setAttribute('data-course-id', course.id);

      // Add click listener to card (but not if clicking the cart button)
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.btn-add-cart')) return;
        Home.openCourseModal(course.id);
      });

      // Handle Image URL
      let imageUrl = course.coverImageUrl;
      let hasImage = false;
      if (
        imageUrl &&
        !imageUrl.startsWith('http') &&
        !imageUrl.startsWith('/')
      ) {
        imageUrl = '/' + imageUrl;
        hasImage = true;
      } else if (imageUrl) {
        hasImage = true;
      }

      // Format price
      const priceFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(course.price);

      const categoryName = course.category?.name || 'Sem Categoria';

      // Check enrollment status (requires matching backend support)
      // Assuming course object now has isEnrolled and progress from updated backend
      const isEnrolled = (course as any).isEnrolled === true;
      const progress = (course as any).progress || 0;

      // Check if logged user is the course owner
      const userStr = localStorage.getItem('auth_user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const isOwner = currentUser && currentUser.id && (course.instructorId === currentUser.id || course.instructor?.id === currentUser.id);

      // Debug log
      console.log(`[Card Debug] Course: ${course.title}, instructorId: ${course.instructorId}, instructor.id: ${course.instructor?.id}, currentUser.id: ${currentUser?.id}, isOwner: ${isOwner}, isEnrolled: ${isEnrolled}`);

      let actionButtonHTML = '';
      if (isOwner) {
        // Owner cannot add their own course to cart - show CRIADOR badge
        actionButtonHTML = `
            <div 
              class="owner-badge"
              style="
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                border-radius: 0.5rem; 
                height: 2rem; 
                padding: 0 0.6rem;
                display: flex; 
                align-items: center; 
                justify-content: center;
                gap: 0.3rem;
                margin-left: auto;
                font-weight: 600;
                font-size: 0.7rem;
                box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
                cursor: default;
              "
              title="Você é o criador deste curso"
            >
              <span class="material-symbols-outlined" style="font-size: 0.9rem;">verified</span>
              <span>CRIADOR</span>
            </div>
          `;
      } else if (isEnrolled) {
        actionButtonHTML = `
            <a 
              class="btn-icon btn-play-course" 
              href="/aula/${course.id}"
              style="
                background: #10b981; 
                color: white;
                border-radius: 0.5rem; 
                width: auto; 
                height: 2rem; 
                padding: 0 1rem;
                display: flex; 
                align-items: center; 
                justify-content: center;
                gap: 0.5rem;
                margin-left: auto;
                font-weight: bold;
                font-size: 0.8rem;
                text-decoration: none;
              "
              title="Você já possui este curso - Clique para assistir"
              onclick="event.stopPropagation();"
            >
              <span class="material-symbols-outlined" style="font-size: 1.25rem;">check_circle</span>
              <span>Obtido</span>
            </a>
          `;
      } else {
        actionButtonHTML = `
            <button 
              class="btn-icon btn-add-cart" 
              data-course-id="${course.id}"
              style="
                background: var(--primary); 
                color: var(--bg-dark); 
                border-radius: 0.5rem; 
                width: 2rem; 
                height: 2rem; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                margin-left: auto;
              "
              title="Adicionar ao Carrinho"
            >
              <span class="material-symbols-outlined" style="font-size: 1.25rem;">shopping_cart</span>
            </button>
          `;
      }



      card.innerHTML = `
        <div class="card-img-container">
          ${hasImage
          ? `
            <img
              alt="${course.title}"
              class="card-img"
              src="${imageUrl}"
              onerror="this.onerror=null;this.style.display='none';this.parentElement.innerHTML='<div class=\'card-img-placeholder\'><span class=\'material-symbols-outlined\'>image</span><span style=\'font-size: 0.75rem; opacity: 0.7;\'>Sem imagem</span></div>' + this.parentElement.querySelector('.badge-tag').outerHTML + (this.parentElement.querySelector('[style*=\'MATRICULADO\']') ? this.parentElement.querySelector('[style*=\'MATRICULADO\']').outerHTML : '');"
            />
          `
          : `
            <div class="card-img-placeholder">
              <span class="material-symbols-outlined">image</span>
              <span style="font-size: 0.75rem; opacity: 0.7;">Sem imagem</span>
            </div>
          `
        }
          <div class="badge-tag bg-tag-primary">${categoryName}</div>
          ${isEnrolled && !isOwner ? '<div style="position: absolute; top: 10px; right: 10px; background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">MATRICULADO</div>' : ''}
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${course.title}">
            ${course.title}
          </h3>
          
          <div class="card-instructor">
            <span>Criado por: ${course.instructor?.name || 'Instrutor Desconhecido'}</span>
          </div>

          ${!isEnrolled ? `
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">
             <span class="material-symbols-outlined" style="font-size: 0.9rem; vertical-align: middle;">group</span> ${course.maxStudents === undefined || course.maxStudents === null ? '<span style="font-size: 1.2rem; vertical-align: middle; line-height: 1;">∞</span> Vagas ilimitadas' : `Vagas: ${course.maxStudents} / ${course.enrolledCount || 0}`}
          </div>
          ` : ''}
          
          <div class="card-footer">
             ${!isEnrolled ? `<span class="card-price">${priceFormatted}</span>` : '<div></div>'}
             ${actionButtonHTML}
          </div>
        </div>
      `;

      gridContainer.appendChild(card);
    });

    // Add event listeners for cart buttons
    const cartBtns = gridContainer.querySelectorAll('.btn-add-cart');
    cartBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const courseId = btn.getAttribute('data-course-id');
        Home.addToCart(courseId!);
      });
    });
  },

  /**
   * Renderiza controles de paginação (Topo e Rodapé)
   */
  renderPagination: () => {
    const totalItems = Home.filteredCourses.length;
    const totalPages = Math.ceil(totalItems / Home.itemsPerPage);

    const generateControls = () => {
      // Ensure at least 1 page for display
      const effectiveTotalPages = totalPages < 1 ? 1 : totalPages;

      // Prev Button
      const prevDisabled = Home.currentPage === 1;
      const prevStyle = `border: 1px solid var(--border-med); border-radius: 0.5rem; ${prevDisabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}`;

      // Next Button
      const nextDisabled = Home.currentPage >= effectiveTotalPages;
      const nextStyle = `border: 1px solid var(--border-med); border-radius: 0.5rem; ${nextDisabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}`;

      return `
          <button 
            type="button"
            class="btn-icon ${prevDisabled ? 'disabled' : ''}" 
            data-page="${Home.currentPage - 1}"
            style="${prevStyle}"
            ${prevDisabled ? 'disabled' : ''}
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          
          <span style="color: var(--text-muted); font-size: 0.875rem;">
            Página ${Home.currentPage} de ${effectiveTotalPages}
          </span>
          
          <button 
            type="button"
            class="btn-icon ${nextDisabled ? 'disabled' : ''}" 
            data-page="${Home.currentPage + 1}"
            style="${nextStyle}"
            ${nextDisabled ? 'disabled' : ''}
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        `;
    };

    const controlsHTML = generateControls();

    const topContainer = document.getElementById('pagination-top');
    const bottomContainer = document.getElementById('pagination-bottom');

    if (topContainer) topContainer.innerHTML = controlsHTML;
    if (bottomContainer) bottomContainer.innerHTML = controlsHTML;
  },

  /**
   * Adiciona ao carrinho
   */
  addToCart: async (courseId: string) => {
    // Check if logged in
    if (!localStorage.getItem('auth_user')) {
      AppUI.showMessage(
        'Por favor, faça login para adicionar cursos ao carrinho.',
        'info',
      );
      const authContainer = document.getElementById('auth-card-container');
      if (authContainer) authContainer.classList.add('show');
      return;
    }

    const success = await Cart.add(courseId);
    if (success) {
      // Update local state
      if (!Home.cartItems.includes(courseId)) {
        Home.cartItems.push(courseId);
      }

      // Update modal button if open
      const modalCartBtn = document.getElementById('modal-add-cart-btn');
      if (
        modalCartBtn &&
        modalCartBtn.getAttribute('data-course-id') === courseId
      ) {
        modalCartBtn.innerHTML = `
          <span class="material-symbols-outlined">shopping_cart_checkout</span>
          Ir para Carrinho
        `;
      }
    }
  },

  /**
   * Carrega e renderiza as categorias no select
   */
  loadCategories: async () => {
    try {
      const categories = await Categories.getAll();
      const select = document.getElementById(
        'category-filter',
      ) as HTMLSelectElement;

      if (select) {
        select.innerHTML = '<option value="">Todas Categorias</option>';
        categories.forEach((cat) => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.name;
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  },

  /**
   * Aplica filtros (Busca + Categoria)
   */
  applyFilters: () => {
    const searchInput = document.getElementById(
      'main-search-input',
    ) as HTMLInputElement;
    const categorySelect = document.getElementById(
      'category-filter',
    ) as HTMLSelectElement;

    const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const categoryId = categorySelect ? categorySelect.value : '';

    Home.filteredCourses = Home.allCourses.filter((course) => {
      const matchesTerm =
        !term ||
        course.title.toLowerCase().includes(term) ||
        (course.category?.name &&
          course.category.name.toLowerCase().includes(term));

      // Check if course has a category object and if its ID matches
      // Some backends might return category as an ID or object, assuming object based on previous code
      const matchesCategory =
        !categoryId || (course.category && course.category.id === categoryId);

      return matchesTerm && matchesCategory;
    });

    console.log(
      `Filter: term="${term}", cat="${categoryId}" found ${Home.filteredCourses.length}`,
    );
    Home.renderPage(1, false);
  },

  /**
   * Abre o modal de detalhes do curso
   */
  openCourseModal: async (courseId: string) => {
    try {
      const modal = document.getElementById('course-modal');
      if (!modal) return;

      // Show modal immediately with loading state
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevent scroll

      // Reset modal content to loading or empty
      const modulesList = document.getElementById('modal-modules-list');
      if (modulesList)
        modulesList.innerHTML =
          '<p class="loading-msg">Carregando módulos...</p>';

      // Fetch data in parallel
      const [course, modules] = await Promise.all([
        Courses.getById(courseId),
        Modules.getByCourse(courseId),
      ]);

      // Populate Modal
      const title = document.getElementById('modal-course-title');
      const desc = document.getElementById('modal-course-desc');
      const instructor = document.getElementById('modal-course-instructor');
      const date = document.getElementById('modal-course-date');
      const price = document.getElementById('modal-course-price');
      const img = document.getElementById(
        'modal-course-img',
      ) as HTMLImageElement;
      const category = document.getElementById('modal-course-category');
      const slots = document.getElementById('modal-course-slots');
      const cartBtn = document.getElementById('modal-add-cart-btn');

      if (title) title.textContent = course.title;
      if (desc)
        desc.textContent = course.description || 'Sem descrição disponível.';
      if (instructor)
        instructor.textContent =
          course.instructor?.name || 'Instrutor Desconhecido';

      // Format Date
      if (date) {
        const d = new Date(course.createdAt);
        date.textContent = d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }

      // Format Price
      if (price) {
        price.textContent = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(course.price);
      }

      if (img) {
        let imageUrl = course.coverImageUrl;
        let hasImage = false;

        // First, clean up any existing placeholder from previous modal opens
        const container = img.parentElement;
        if (container) {
          const existingPlaceholder = container.querySelector(
            '.card-img-placeholder',
          );
          if (existingPlaceholder) {
            existingPlaceholder.remove();
          }
        }

        if (
          imageUrl &&
          !imageUrl.startsWith('http') &&
          !imageUrl.startsWith('/')
        ) {
          imageUrl = '/' + imageUrl;
          hasImage = true;
        } else if (imageUrl) {
          hasImage = true;
        }

        // Use the same fallback approach as in course cards
        if (hasImage && imageUrl) {
          img.src = imageUrl;
          img.style.display = 'block';
          // Handle error by using the same placeholder as cards
          img.onerror = function (this: HTMLImageElement) {
            this.onerror = null;
            this.style.display = 'none';
            const container = this.parentElement;
            if (container) {
              const placeholder = document.createElement('div');
              placeholder.className = 'card-img-placeholder';
              placeholder.style.cssText =
                'width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(94, 23, 235, 0.05); border-radius: 0.5rem;';
              placeholder.innerHTML = `
                <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--text-muted);">image</span>
                <span style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.5rem;">Sem imagem</span>
              `;
              container.insertBefore(placeholder, this);
            }
          };
        } else {
          // No image URL - hide img and show placeholder
          img.style.display = 'none';
          if (container) {
            // Check if placeholder already exists
            let placeholder = container.querySelector(
              '.card-img-placeholder',
            ) as HTMLElement | null;
            if (!placeholder) {
              placeholder = document.createElement('div');
              placeholder.className = 'card-img-placeholder';
              placeholder.style.cssText =
                'width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(94, 23, 235, 0.05); border-radius: 0.5rem;';
              placeholder.innerHTML = `
                <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--text-muted);">image</span>
                <span style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.5rem;">Sem imagem</span>
              `;
              container.insertBefore(placeholder, img);
            }
          }
        }
      }

      if (category)
        category.textContent = course.category?.name || 'Sem Categoria';

      if (slots) {
        const enrolledCount = course.enrolledCount || 0;
        if (course.maxStudents === undefined || course.maxStudents === null) {
          slots.textContent = `${enrolledCount} matriculados / ∞ vagas ilimitadas`;
        } else {
          slots.textContent = `${enrolledCount} matriculados / ${course.maxStudents} vagas`;
        }
      }

      if (cartBtn) {
        cartBtn.setAttribute('data-course-id', course.id);

        // Check if logged user is the course owner
        const userStr = localStorage.getItem('auth_user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const isOwner = currentUser && (course.instructorId === currentUser.id || course.instructor?.id === currentUser.id);
        const isEnrolled = (course as any).isEnrolled;

        if (isOwner) {
          // Owner cannot add their own course to cart
          cartBtn.innerHTML = `
            <span class="material-symbols-outlined">verified</span>
            Criador
          `;
          cartBtn.setAttribute('disabled', 'true');
          (cartBtn as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
          (cartBtn as HTMLElement).style.cursor = 'not-allowed';
          (cartBtn as HTMLElement).style.opacity = '0.9';
        } else if (isEnrolled) {
          // User already has this course
          cartBtn.innerHTML = `
            <span class="material-symbols-outlined">check_circle</span>
            Obtido
          `;
          cartBtn.setAttribute('disabled', 'true');
          (cartBtn as HTMLElement).style.background = '#10b981';
          (cartBtn as HTMLElement).style.cursor = 'not-allowed';
          (cartBtn as HTMLElement).style.opacity = '0.9';
        } else if (Home.cartItems.includes(courseId)) {
          cartBtn.innerHTML = `
            <span class="material-symbols-outlined">shopping_cart_checkout</span>
            Ir para Carrinho
          `;
          cartBtn.removeAttribute('disabled');
          (cartBtn as HTMLElement).style.background = '';
          (cartBtn as HTMLElement).style.cursor = '';
          (cartBtn as HTMLElement).style.opacity = '';
        } else {
          cartBtn.innerHTML = `
            <span class="material-symbols-outlined">shopping_cart</span>
            Adicionar ao Carrinho
          `;
          cartBtn.removeAttribute('disabled');
          (cartBtn as HTMLElement).style.background = '';
          (cartBtn as HTMLElement).style.cursor = '';
          (cartBtn as HTMLElement).style.opacity = '';
        }
      }

      // Render Modules
      if (modulesList) {
        if (modules.length === 0) {
          modulesList.innerHTML =
            '<p class="loading-msg">Nenhum módulo cadastrado ainda.</p>';
        } else {
          modulesList.innerHTML = '';
          modules.forEach((mod, index) => {
            const item = document.createElement('div');
            item.className = 'module-item';
            item.innerHTML = `
              <span class="module-index">${(index + 1).toString().padStart(2, '0')}</span>
              <span class="module-name">${mod.title}</span>
            `;
            modulesList.appendChild(item);
          });
        }
      }
    } catch (error) {
      console.error('Error opening course modal:', error);
      AppUI.showMessage('Erro ao carregar detalhes do curso.', 'error');
      Home.closeCourseModal();
    }
  },

  /**
   * Fecha o modal de detalhes do curso
   */
  closeCourseModal: () => {
    const modal = document.getElementById('course-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = ''; // Restore scroll
    }
  },
};

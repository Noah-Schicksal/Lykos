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

      // Add click listener to card to redirect to course detail page
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.btn-add-cart')) return;
        window.location.href = `/course-detail.html?id=${course.id}`;
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

          <div class="card-rating" style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; margin-bottom: 0.5rem;">
            <span class="material-symbols-outlined" style="font-size: 1rem; color: #fbbf24; font-variation-settings: 'FILL' 1;">star</span>
            <span style="font-weight: 600; color: var(--text-primary);">${((course as any).averageRating || 0).toFixed(1)}</span>
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

    const generateValidateButton = () => {
      return `
        <div style="width: 100%; display: flex; justify-content: center; margin-top: 1rem;">
          <a href="certificate-validator.html" class="btn-validate-home" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1.2rem;
            background: rgba(94, 23, 235, 0.1);
            border: 1px solid var(--primary);
            border-radius: 0.5rem;
            color: var(--text-primary);
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.3s ease;
          ">
            <span class="material-symbols-outlined" style="font-size: 1.2rem; color: var(--primary);">verified</span>
            Validar Certificado
          </a>
        </div>
      `;
    };

    const controlsHTML = generateControls();
    const validateButtonHTML = generateValidateButton();

    const topContainer = document.getElementById('pagination-top');
    const bottomContainer = document.getElementById('pagination-bottom');

    if (topContainer) topContainer.innerHTML = controlsHTML;
    if (bottomContainer) {
      bottomContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            ${controlsHTML}
          </div>
          ${validateButtonHTML}
        </div>
      `;
    }
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

};

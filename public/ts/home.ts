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
    ['pagination-top', 'pagination-bottom'].forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const btn = target.closest('button');
          if (btn && !btn.classList.contains('disabled') && !btn.hasAttribute('disabled')) {
            const page = parseInt(btn.getAttribute('data-page') || '1');
            console.log(`Pagination click: going to page ${page}`);
            Home.renderPage(page, true);
          }
        });
      }
    });

    Home.loadCourses();
    Home.loadCategories();

    // Attach search listener
    const searchInput = document.getElementById('course-search');
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
    const modalOverlay = document.getElementById('course-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => Home.closeCourseModal());
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) Home.closeCourseModal();
      });
    }

    // Modal Cart listener
    const modalCartBtn = document.getElementById('modal-add-cart-btn');
    if (modalCartBtn) {
      modalCartBtn.addEventListener('click', () => {
        const courseId = modalCartBtn.getAttribute('data-course-id');
        console.log(`[Home] Modal cart button clicked for course ${courseId}`);
        if (courseId) {
          if (Home.cartItems.includes(courseId)) {
            console.log(`[Home] Course ${courseId} is already in cart. Opening sidebar...`);
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
  },

  /**
   * Sincroniza os itens do carrinho com o servidor
   */
  syncCart: async () => {
    try {
      const items = await Cart.getCart();
      Home.cartItems = items.map(item => item.courseId);

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

      console.log(`Loaded ${Home.allCourses.length} courses. Rendering page 1.`);
      Home.renderPage(1, false);

    } catch (error) {
      console.error('Error loading courses:', error);
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

    courses.forEach(course => {
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
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      }
      // If no image provided, fallback
      if (!imageUrl) {
        imageUrl = 'https://placehold.co/600x400/1e293b/cbd5e1?text=Curso';
      }

      // Format price
      const priceFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(course.price);

      const categoryName = course.category?.name || 'Sem Categoria';

      card.innerHTML = `
        <div class="card-img-container">
          <img
            alt="${course.title}"
            class="card-img"
            src="${imageUrl}"
            onerror="this.onerror=null;this.src='https://placehold.co/600x400/1e293b/cbd5e1?text=Erro+Imagem';"
          />
          <div class="badge-tag bg-tag-primary">${categoryName}</div>
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${course.title}">
            ${course.title}
          </h3>
          
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
            <span class="material-symbols-outlined" style="font-size: 0.9rem; vertical-align: middle;">person</span>
            ${course.instructor?.name || 'Instrutor Desconhecido'}
          </div>

          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">
            <span class="material-symbols-outlined" style="font-size: 0.9rem; vertical-align: middle;">group</span>
            ${(course.maxStudents === undefined || course.maxStudents === null)
          ? '<span style="font-size: 1.2rem; vertical-align: middle; line-height: 1;">∞</span> Vagas ilimitadas'
          : `Vagas: ${course.maxStudents} / ${course.enrolledCount || 0}`
        }
          </div>
          
          <div class="price-row" style="margin-top: auto; padding-top: 0.5rem;">
            <span class="price-main" style="font-size: 1rem;">${priceFormatted}</span>
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
          </div>
        </div>
      `;

      gridContainer.appendChild(card);
    });

    // Add event listeners for cart buttons
    const cartBtns = gridContainer.querySelectorAll('.btn-add-cart');
    cartBtns.forEach(btn => {
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
      AppUI.showMessage('Por favor, faça login para adicionar cursos ao carrinho.', 'info');
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
      if (modalCartBtn && modalCartBtn.getAttribute('data-course-id') === courseId) {
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
      const select = document.getElementById('category-filter') as HTMLSelectElement;

      if (select) {
        select.innerHTML = '<option value="">Todas Categorias</option>';
        categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.name;
          // Apply dark mode styles explicitly to options
          option.style.backgroundColor = '#0d1117';
          option.style.color = 'white';
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  },

  /**
   * Aplica filtros (Busca + Categoria)
   */
  applyFilters: () => {
    const searchInput = document.getElementById('course-search') as HTMLInputElement;
    const categorySelect = document.getElementById('category-filter') as HTMLSelectElement;

    const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const categoryId = categorySelect ? categorySelect.value : '';

    Home.filteredCourses = Home.allCourses.filter(course => {
      const matchesTerm = !term || (
        course.title.toLowerCase().includes(term) ||
        (course.category?.name && course.category.name.toLowerCase().includes(term))
      );

      // Check if course has a category object and if its ID matches
      // Some backends might return category as an ID or object, assuming object based on previous code
      const matchesCategory = !categoryId || (course.category && course.category.id === categoryId);

      return matchesTerm && matchesCategory;
    });

    console.log(`Filter: term="${term}", cat="${categoryId}" found ${Home.filteredCourses.length}`);
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
      if (modulesList) modulesList.innerHTML = '<p class="loading-msg">Carregando módulos...</p>';

      // Fetch data in parallel
      const [course, modules] = await Promise.all([
        Courses.getById(courseId),
        Modules.getByCourse(courseId)
      ]);

      // Populate Modal
      const title = document.getElementById('modal-course-title');
      const desc = document.getElementById('modal-course-desc');
      const instructor = document.getElementById('modal-course-instructor');
      const date = document.getElementById('modal-course-date');
      const price = document.getElementById('modal-course-price');
      const img = document.getElementById('modal-course-img') as HTMLImageElement;
      const category = document.getElementById('modal-course-category');
      const slots = document.getElementById('modal-course-slots');
      const cartBtn = document.getElementById('modal-add-cart-btn');

      if (title) title.textContent = course.title;
      if (desc) desc.textContent = course.description || 'Sem descrição disponível.';
      if (instructor) instructor.textContent = course.instructor?.name || 'Instrutor Desconhecido';

      // Format Date
      if (date) {
        const d = new Date(course.createdAt);
        date.textContent = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      }

      // Format Price
      if (price) {
        price.textContent = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(course.price);
      }

      if (img) {
        let imageUrl = course.coverImageUrl;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
          imageUrl = '/' + imageUrl;
        }
        img.src = imageUrl || 'https://placehold.co/600x400/1e293b/cbd5e1?text=Curso';
      }

      if (category) category.textContent = course.category?.name || 'Sem Categoria';

      if (slots) {
        slots.textContent = (course.maxStudents === undefined || course.maxStudents === null)
          ? '∞ ilimitadas'
          : `${course.maxStudents} total`;
      }

      if (cartBtn) {
        cartBtn.setAttribute('data-course-id', course.id);

        if (Home.cartItems.includes(courseId)) {
          cartBtn.innerHTML = `
            <span class="material-symbols-outlined">shopping_cart_checkout</span>
            Ir para Carrinho
          `;
        } else {
          cartBtn.innerHTML = `
            <span class="material-symbols-outlined">shopping_cart</span>
            Adicionar ao Carrinho
          `;
        }
      }

      // Render Modules
      if (modulesList) {
        if (modules.length === 0) {
          modulesList.innerHTML = '<p class="loading-msg">Nenhum módulo cadastrado ainda.</p>';
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
  }
};

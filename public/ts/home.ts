/**
 * Home Module - Handles Home Page Logic
 */
import { AppUI } from './utils/ui.js';
import { Courses, Course } from './modules/courses.js';

export const Home = {
  currentPage: 1,
  itemsPerPage: 12,
  totalItems: 0,

  /**
   * Inicializa a página Home
   */
  init: () => {
    // Verificar se estamos na home
    const gridContainer = document.getElementById('courses-grid');
    if (!gridContainer) return;

    Home.loadCourses(Home.currentPage);
  },

  /**
   * Carrega cursos da API
   */
  loadCourses: async (page: number) => {
    try {
      const gridContainer = document.getElementById('courses-grid');
      if (gridContainer) {
        gridContainer.innerHTML = `
          <p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
            Loading courses...
          </p>`;
      }

      const response = await Courses.getAll(page, Home.itemsPerPage);
      const courses: Course[] = response.data || [];
      const total = response.meta?.total || 0;

      Home.totalItems = total;
      Home.currentPage = page;

      Home.renderGrid(courses);
      Home.renderPagination();

    } catch (error) {
      console.error('Error loading courses:', error);
      const gridContainer = document.getElementById('courses-grid');
      if (gridContainer) {
        gridContainer.innerHTML = `
          <p style="grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 2rem;">
            Error loading courses. Please try again later.
          </p>`;
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
          No courses found.
        </p>`;
      return;
    }

    gridContainer.innerHTML = '';

    courses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'card-base group';

      // Handle Image URL
      let imageUrl = course.coverImageUrl;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      }
      // If no image provided, fallback
      if (!imageUrl) {
        imageUrl = 'https://placehold.co/600x400/1e293b/cbd5e1?text=Course';
      }

      // Format price
      const priceFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(course.price);

      const categoryName = course.category?.name || 'Uncategorized';

      card.innerHTML = `
        <div class="card-img-container">
          <img
            alt="${course.title}"
            class="card-img"
            src="${imageUrl}"
            onerror="this.onerror=null;this.src='https://placehold.co/600x400/1e293b/cbd5e1?text=Image+Error';"
          />
          <div class="badge-tag bg-tag-primary">${categoryName}</div>
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${course.title}">
            ${course.title}
          </h3>
          
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
              title="Add to Cart"
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
   * Renderiza controles de paginação
   */
  renderPagination: () => {
    const container = document.getElementById('pagination-controls');
    if (!container) return;

    const totalPages = Math.ceil(Home.totalItems / Home.itemsPerPage);

    // Hide if single page
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '';

    // Prev Button
    html += `
      <button 
        class="btn-icon ${Home.currentPage === 1 ? 'disabled' : ''}" 
        onclick="window.HomeModule.loadCourses(${Home.currentPage - 1})"
        style="border: 1px solid var(--border-med); border-radius: 0.5rem; ${Home.currentPage === 1 ? 'opacity: 0.5; pointer-events: none;' : ''}"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
    `;

    // Page Info
    html += `
      <span style="color: var(--text-muted); font-size: 0.875rem;">
        Page ${Home.currentPage} of ${totalPages}
      </span>
    `;

    // Next Button
    html += `
      <button 
        class="btn-icon ${Home.currentPage === totalPages ? 'disabled' : ''}" 
        onclick="window.HomeModule.loadCourses(${Home.currentPage + 1})"
        style="border: 1px solid var(--border-med); border-radius: 0.5rem; ${Home.currentPage === totalPages ? 'opacity: 0.5; pointer-events: none;' : ''}"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    `;

    container.innerHTML = html;
  },

  /**
   * Adiciona ao carrinho (Simulado por enquanto)
   */
  addToCart: (courseId: string) => {
    // TODO: Integrate with real Cart module
    console.log(`Adding course ${courseId} to cart`);
    AppUI.showMessage('Course added to cart!', 'success');

    // Update badge (simulated)
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
      const current = parseInt(badge.textContent || '0');
      badge.textContent = (current + 1).toString();
      badge.style.display = 'flex';
    }
  }
};

// Expose for pagination onclick handlers
(window as any).HomeModule = Home;

/**
 * Course Detail Page Logic
 */
import { AppUI } from './utils/ui.js';
import { Courses, Course } from './modules/courses.js';
import { Modules, Module } from './modules/modules.js';
import { Cart } from './modules/cart.js';
import { Auth } from './modules/auth.js';
import { initThemeToggle } from './theme-toggle.js';

// Expose to window for debugging
(window as any).ui = AppUI;
(window as any).auth = Auth;
(window as any).cart = Cart;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize theme toggle
  initThemeToggle();

  // Initialize auth
  await Auth.init();
  Auth.updateAuthUI();

  // Update cart badge
  Cart.updateBadge();

  // Get course ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  if (!courseId) {
    AppUI.showMessage('Curso não encontrado', 'error');
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    return;
  }

  // Load course data
  await loadCourseData(courseId);

  // Setup cart toggle
  setupCartToggle();

  // Setup action buttons
  setupActionButtons(courseId);

  // Setup share button
  setupShareButton();
});

/**
 * Load and display course data
 */
async function loadCourseData(courseId: string) {
  try {
    // Fetch course and modules in parallel
    const [course, modules] = await Promise.all([
      Courses.getById(courseId),
      Modules.getByCourse(courseId),
    ]);

    // Populate course details
    populateCourseDetails(course);
    populateModules(modules);
  } catch (error) {
    console.error('Error loading course:', error);
    AppUI.showMessage('Erro ao carregar detalhes do curso', 'error');
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
}

/**
 * Populate course details in the page
 */
function populateCourseDetails(course: Course) {
  // Breadcrumb
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = course.category?.name || 'Categoria';
  }

  // Title
  const titleEl = document.getElementById('course-title');
  if (titleEl) titleEl.textContent = course.title;

  // Instructor
  const instructorEl = document.getElementById('course-instructor');
  if (instructorEl) {
    instructorEl.textContent = course.instructor?.name || 'Instrutor Desconhecido';
  }

  // Created date
  const dateEl = document.getElementById('course-created-date');
  if (dateEl) {
    const date = new Date(course.createdAt);
    dateEl.textContent = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  // Description
  const descEl = document.getElementById('course-description');
  if (descEl) {
    const description = course.description || '';
    if (description.trim() === '') {
      descEl.textContent = 'O instrutor não especificou os objetivos de aprendizagem para este curso.';
      // Hide the learning list if description is empty
      const learningList = document.getElementById('learning-list');
      if (learningList) {
        learningList.style.display = 'none';
      }
    } else {
      descEl.textContent = description;
      // Parse description for learning outcomes
      populateLearningOutcomes(description);
    }
  }

  // Price
  const priceEl = document.getElementById('course-price');
  if (priceEl) {
    priceEl.textContent = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(course.price);
  }

  // Remove original price element entirely since it's mocked
  const originalPriceEl = document.getElementById('original-price');
  if (originalPriceEl) {
    originalPriceEl.style.display = 'none';
  }

  // Sidebar image
  const sidebarImg = document.getElementById('course-sidebar-img') as HTMLImageElement;
  if (sidebarImg) {
    let imageUrl = course.coverImageUrl;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      imageUrl = '/' + imageUrl;
    }

    if (imageUrl) {
      sidebarImg.src = imageUrl;
      sidebarImg.onerror = function () {
        sidebarImg.style.display = 'none';
        const container = sidebarImg.parentElement;
        if (container) {
          container.style.background = 'linear-gradient(135deg, rgba(94, 23, 235, 0.1), rgba(0, 73, 83, 0.1))';
        }
      };
    } else {
      sidebarImg.style.display = 'none';
      const container = sidebarImg.parentElement;
      if (container) {
        container.style.background = 'linear-gradient(135deg, rgba(94, 23, 235, 0.1), rgba(0, 73, 83, 0.1))';
      }
    }
  }

  // Update page title
  document.title = `${course.title} | Lykos`;
}

/**
 * Parse course description and populate learning outcomes
 * Looks for bullet points or numbered lists in the description
 */
function populateLearningOutcomes(description: string) {
  const learningList = document.getElementById('learning-list');
  if (!learningList) return;

  // Clear existing content
  learningList.innerHTML = '';
  learningList.style.display = 'grid'; // Ensure it's visible

  // Try to extract learning items from description
  // Look for lines starting with -, *, •, or numbers
  const lines = description.split('\n');
  const learningItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match lines starting with -, *, •, or numbers followed by . or )
    if (trimmed.match(/^[-*•]\s+(.+)/) || trimmed.match(/^\d+[.)]\s+(.+)/)) {
      const match = trimmed.match(/^[-*•]\s+(.+)/) || trimmed.match(/^\d+[.)]\s+(.+)/);
      if (match && match[1]) {
        learningItems.push(match[1].trim());
      }
    }
  }

  // If we found learning items, use them
  if (learningItems.length > 0) {
    learningItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'learning-item';
      div.innerHTML = `
        <span class="material-symbols-outlined check-icon">check_circle</span>
        <span>${item}</span>
      `;
      learningList.appendChild(div);
    });
  }
  // If no bullet points found, just don't show the grid (description text will be shown instead)
}

/**
 * Populate modules accordion
 */
function populateModules(modules: any[]) {
  const accordion = document.getElementById('modules-accordion');
  if (!accordion) return;

  if (modules.length === 0) {
    accordion.innerHTML = '<p class="loading-text">Nenhum módulo disponível.</p>';
    return;
  }

  // Update content meta
  const moduleCountEl = document.getElementById('module-count');
  const classCountEl = document.getElementById('class-count');
  const totalDurationEl = document.getElementById('total-duration');

  let totalClasses = 0;
  modules.forEach((module) => {
    totalClasses += module.classes?.length || 0;
  });

  if (moduleCountEl) {
    moduleCountEl.textContent = `${modules.length} ${modules.length === 1 ? 'módulo' : 'módulos'}`;
  }
  if (classCountEl) {
    classCountEl.textContent = `${totalClasses} ${totalClasses === 1 ? 'aula' : 'aulas'}`;
  }
  if (totalDurationEl) {
    // Mocked duration
    const estimatedMinutes = totalClasses * 15;
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    totalDurationEl.textContent = `${hours}h ${minutes}min total`;
  }

  // Render accordion
  accordion.innerHTML = modules
    .map((module, index) => {
      const classes = module.classes || [];
      const classesHTML = classes
        .map((cls: any) => {
          return `
          <div class="class-item">
            <div class="class-title-row">
              <span class="material-symbols-outlined class-play-icon">play_circle</span>
              <span>${cls.title}</span>
            </div>
            <span style="color: var(--text-muted); font-size: 0.8rem;">10:45</span>
          </div>
        `;
        })
        .join('');

      return `
        <div class="module-card" data-module-index="${index}">
          <div class="module-header">
            <div class="module-title-wrapper">
              <div class="module-num">${String(index + 1).padStart(2, '0')}</div>
              <h3 class="module-title-text">${module.title}</h3>
            </div>
            <span class="material-symbols-outlined module-chevron">expand_more</span>
          </div>
          <div class="module-classes">
            ${classesHTML || '<p style="padding: 1rem; color: var(--text-muted); font-size: 0.85rem;">Nenhuma aula disponível.</p>'}
          </div>
        </div>
      `;
    })
    .join('');

  // Add click listeners to module headers
  const moduleCards = accordion.querySelectorAll('.module-card');
  moduleCards.forEach((card) => {
    const header = card.querySelector('.module-header');
    if (header) {
      header.addEventListener('click', () => {
        card.classList.toggle('active');
      });
    }
  });
}

/**
 * Setup cart toggle functionality
 */
function setupCartToggle() {
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartModal = document.getElementById('cart-modal');
  const closeCartBtn = document.getElementById('close-cart-btn');

  if (cartToggleBtn && cartModal) {
    cartToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (!localStorage.getItem('auth_user')) {
        AppUI.showMessage('Por favor, faça login para ver seu carrinho.', 'info');
        return;
      }

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
}

/**
 * Render cart items
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
    listContainer.innerHTML = items
      .map((item) => {
        total += item.price;
        const price = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(item.price);

        const hasImage = item.coverImageUrl && item.coverImageUrl.trim() !== '';
        const imageHTML = hasImage
          ? `<img src="${item.coverImageUrl}" class="cart-item-img" alt="${item.title}" onerror="this.onerror=null;this.style.display='none';this.parentElement.insertAdjacentHTML('afterbegin','<div class=\\'cart-item-img-placeholder\\'><span class=\\'material-symbols-outlined\\'>image</span></div>');"/>`
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
      })
      .join('');

    totalPriceEl.textContent = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(total);
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Add remove listeners
    const removeBtns = listContainer.querySelectorAll('.btn-remove-cart');
    removeBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const courseId = (btn as HTMLElement).dataset.id!;
        const success = await Cart.remove(courseId);
        if (success) {
          renderCartItems();
          Cart.updateBadge();
        }
      });
    });
  } catch (error) {
    listContainer.innerHTML = '<div class="cart-empty-msg" style="color: #ef4444">Erro ao carregar carrinho.</div>';
  }
}

/**
 * Setup action buttons (Buy Now and Add to Cart)
 */
function setupActionButtons(courseId: string) {
  const btnBuyNow = document.getElementById('btn-buy-now');
  const btnAddToCart = document.getElementById('btn-add-to-cart');

  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', async () => {
      if (!localStorage.getItem('auth_user')) {
        AppUI.showMessage('Por favor, faça login para adicionar ao carrinho.', 'info');
        return;
      }

      const success = await Cart.add(courseId);
      if (success) {
        AppUI.showMessage('Curso adicionado ao carrinho!', 'success');
        Cart.updateBadge();
      }
    });
  }

  if (btnBuyNow) {
    btnBuyNow.addEventListener('click', async () => {
      if (!localStorage.getItem('auth_user')) {
        AppUI.showMessage('Por favor, faça login para comprar.', 'info');
        return;
      }

      // Add to cart and checkout immediately
      const success = await Cart.add(courseId);
      if (success) {
        const confirm = await AppUI.promptModal(
          'Finalizar Compra',
          'Deseja confirmar a compra deste curso?'
        );
        if (confirm) {
          await Cart.checkout();
        }
      }
    });
  }
}

/**
 * Setup share button to copy course link
 */
function setupShareButton() {
  const btnShare = document.getElementById('btn-share-course');

  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      const courseUrl = window.location.href;

      try {
        await navigator.clipboard.writeText(courseUrl);
        AppUI.showMessage('Link copiado para a área de transferência!', 'success');
      } catch (error) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = courseUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          AppUI.showMessage('Link copiado para a área de transferência!', 'success');
        } catch (err) {
          AppUI.showMessage('Erro ao copiar link', 'error');
        }

        document.body.removeChild(textArea);
      }
    });
  }
}

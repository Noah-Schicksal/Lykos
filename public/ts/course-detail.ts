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
  // Helper to remove loading state
  const removeLoading = (el: HTMLElement | null) => {
    if (el) el.classList.remove('loading-text-inline', 'loading-text', 'loading-compact', 'loading-price');
  };

  // Breadcrumb
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = course.category?.name || 'Sem categoria';
    removeLoading(breadcrumbCategory);
  }

  // Title
  const titleEl = document.getElementById('course-title');
  if (titleEl) {
    titleEl.textContent = course.title;
    removeLoading(titleEl);
  }

  // Instructor
  const instructorEl = document.getElementById('course-instructor');
  if (instructorEl) {
    instructorEl.textContent = course.instructor?.name || 'Instrutor';
    removeLoading(instructorEl);
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
    removeLoading(dateEl);
  }

  // Rating
  const ratingEl = document.getElementById('course-rating');
  if (ratingEl) {
    const rating = course.averageRating ?? 0;
    ratingEl.textContent = rating.toFixed(1);
  }

  // Description
  const descEl = document.getElementById('course-description');
  if (descEl) {
    const description = course.description || '';
    removeLoading(descEl);
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
    removeLoading(priceEl);
  }

  // Slots/Vagas info
  const slotsInfoEl = document.getElementById('slots-info');
  if (slotsInfoEl) {
    const maxStudents = course.maxStudents ?? 0;
    const enrolledCount = course.enrolledCount ?? 0;
    const availableSlots = maxStudents - enrolledCount;
    
    if (maxStudents > 0) {
      slotsInfoEl.textContent = `${availableSlots} vagas disponíveis de ${maxStudents}`;
    } else {
      slotsInfoEl.textContent = 'Vagas ilimitadas';
    }
    removeLoading(slotsInfoEl);
  }

  // Remove original price element entirely since it's mocked
  const originalPriceEl = document.getElementById('original-price');
  if (originalPriceEl) {
    originalPriceEl.style.display = 'none';
  }

  // Sidebar image
  const sidebarImg = document.getElementById('course-sidebar-img') as HTMLImageElement;
  const imgPlaceholder = document.querySelector('.sidebar-img-placeholder') as HTMLElement;
  
  if (sidebarImg) {
    let imageUrl = course.coverImageUrl;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      imageUrl = '/' + imageUrl;
    }

    if (imageUrl) {
      // Show image when loaded
      sidebarImg.onload = function() {
        sidebarImg.style.display = 'block';
        if (imgPlaceholder) imgPlaceholder.style.display = 'none';
      };
      sidebarImg.onerror = function () {
        sidebarImg.style.display = 'none';
        if (imgPlaceholder) imgPlaceholder.style.display = 'flex';
      };
      sidebarImg.src = imageUrl;
    } else {
      sidebarImg.style.display = 'none';
      if (imgPlaceholder) imgPlaceholder.style.display = 'flex';
    }
  }

  // Update page title
  document.title = `${course.title} | Lykos`;

  // Check if current user is the course creator
  checkIfUserIsCreator(course);
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
  const checkoutBtn = document.getElementById('btn-cart-checkout') as HTMLButtonElement;

  // Setup checkout button listener once
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      const success = await Cart.checkout();
      if (success) {
        // Close cart drawer
        if (cartModal) {
          cartModal.classList.remove('show');
          document.body.style.overflow = '';
        }
        // Reload page to show updated enrollment status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    });
  }

  if (cartToggleBtn && cartModal) {
    cartToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (!localStorage.getItem('auth_user')) {
        AppUI.showMessage('Por favor, faça login para ver seu carrinho.', 'info');
        return;
      }

      const isOpening = !cartModal.classList.contains('show');
      cartModal.classList.toggle('show');
      
      // Disable/enable body scroll when cart is open/closed
      if (isOpening) {
        document.body.style.overflow = 'hidden';
        renderCartItems();
      } else {
        document.body.style.overflow = '';
      }
    });

    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
        document.body.style.overflow = '';
      });
    }

    document.addEventListener('click', (e) => {
      if (
        cartModal.classList.contains('show') &&
        !cartModal.contains(e.target as Node) &&
        !cartToggleBtn.contains(e.target as Node)
      ) {
        cartModal.classList.remove('show');
        document.body.style.overflow = '';
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
 * Check if current user is the course creator and update UI accordingly
 */
function checkIfUserIsCreator(course: Course) {
  const authUser = localStorage.getItem('auth_user');
  const actionButtons = document.querySelector('.action-buttons') as HTMLElement;
  
  // First, check if user is enrolled
  if (course.isEnrolled) {
    if (actionButtons) {
      actionButtons.style.display = 'flex';
      actionButtons.innerHTML = `
        <div class="status-card status-enrolled">
          <span class="material-symbols-outlined status-icon">check_circle</span>
          <span class="status-text">Você já possui este curso</span>
          <a href="/student.html" class="status-link">Acessar conteúdo <span class="material-symbols-outlined" style="font-size: 1rem; vertical-align: middle;">arrow_forward</span></a>
        </div>
      `;
    }
    return;
  }
  
  if (!authUser) {
    // Show buttons for non-logged users
    if (actionButtons) {
      actionButtons.style.display = 'flex';
    }
    return;
  }

  try {
    const user = JSON.parse(authUser);
    const isCreator = course.instructor?.id === user.id;

    if (isCreator) {
      // Hide purchase buttons
      const btnBuyNow = document.getElementById('btn-buy-now');
      const btnAddToCart = document.getElementById('btn-add-to-cart');

      if (btnBuyNow) btnBuyNow.style.display = 'none';
      if (btnAddToCart) btnAddToCart.style.display = 'none';

      // Show message in sidebar
      if (actionButtons) {
        actionButtons.style.display = 'flex';
        actionButtons.innerHTML = `
          <div class="status-card status-creator">
            <span class="material-symbols-outlined status-icon">verified</span>
            <span class="status-text">Você é o criador deste curso</span>
          </div>
        `;
      }
    } else {
      // Show buttons for students
      if (actionButtons) {
        actionButtons.style.display = 'flex';
      }
    }
  } catch (error) {
    console.error('Error checking creator status:', error);
    // Show buttons on error as fallback
    if (actionButtons) {
      actionButtons.style.display = 'flex';
    }
  }
}

/**
 * Setup action buttons (Buy Now and Add to Cart)
 */
let actionButtonsInitialized = false;

function setupActionButtons(courseId: string) {
  // Prevent multiple initializations
  if (actionButtonsInitialized) {
    return;
  }

  const btnBuyNow = document.getElementById('btn-buy-now');
  const btnAddToCart = document.getElementById('btn-add-to-cart');

  if (btnAddToCart) {
    // Remove any existing listeners by cloning the button
    const newBtnAddToCart = btnAddToCart.cloneNode(true) as HTMLElement;
    btnAddToCart.parentNode?.replaceChild(newBtnAddToCart, btnAddToCart);

    newBtnAddToCart.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Disable button temporarily to prevent double clicks
      const btn = e.currentTarget as HTMLButtonElement;
      if (btn.disabled) return;
      btn.disabled = true;

      try {
        if (!localStorage.getItem('auth_user')) {
          AppUI.showMessage('Por favor, faça login para adicionar ao carrinho.', 'info');
          return;
        }

        await Cart.add(courseId);
      } finally {
        // Re-enable button after a short delay
        setTimeout(() => {
          btn.disabled = false;
        }, 1000);
      }
    });
  }

  if (btnBuyNow) {
    // Remove any existing listeners by cloning the button
    const newBtnBuyNow = btnBuyNow.cloneNode(true) as HTMLElement;
    btnBuyNow.parentNode?.replaceChild(newBtnBuyNow, btnBuyNow);

    newBtnBuyNow.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Disable button temporarily to prevent double clicks
      const btn = e.currentTarget as HTMLButtonElement;
      if (btn.disabled) return;
      btn.disabled = true;

      try {
        if (!localStorage.getItem('auth_user')) {
          AppUI.showMessage('Por favor, faça login para comprar.', 'info');
          return;
        }

        // Add to cart silently (no toast)
        const success = await Cart.add(courseId, false);
        if (success) {
          AppUI.showMessage('Curso adicionado! Finalize sua compra no carrinho.', 'success');

          // Open cart modal to show the item
          const cartModal = document.getElementById('cart-modal');
          if (cartModal) {
            cartModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            renderCartItems();
          }
        }
      } finally {
        // Re-enable button after a short delay
        setTimeout(() => {
          btn.disabled = false;
        }, 1000);
      }
    });
  }

  actionButtonsInitialized = true;
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

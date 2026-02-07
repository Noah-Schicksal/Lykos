/**
 * Home Module - Main Entry Point
 * Modular implementation that works with existing HTML structure
 */

import { initThemeToggle } from '../theme-toggle.js';
import { Auth } from '../modules/auth.js';
import { Cart } from '../modules/cart.js';

// Handlers
import { setupAuthHandlers, checkAuthState } from './handlers/authHandlers.js';
import {
  setupCourseHandlers,
  loadCourses,
  loadCategories,
} from './handlers/courseHandlers.js';
import { setupCartHandlers, syncCart } from './handlers/cartHandlers.js';
import { setupDrawerHandlers } from './handlers/drawerHandlers.js';

// Component setup functions (for handlers only, not rendering)
import { setupNavbarHandlers } from './components/navbar.js';
import { setupCourseModalHandlers } from './components/courseModal.js';
import { setupPolicyModalHandlers } from './components/policyModals.js';
import { setupCartSidebarHandlers } from './components/cartSidebar.js';

/**
 * Initializes the home page
 * Works with existing HTML structure - no programmatic rendering
 */
export async function initHome(): Promise<void> {
  console.log('[Home] Initializing...');

  try {
    // Initialize theme toggle
    initThemeToggle();

    // Initialize Auth module
    Auth.init();

    // Setup all handlers (work with existing HTML elements)
    setupNavbarHandlers();
    setupAuthHandlers();
    setupCourseHandlers();
    setupCartHandlers();
    setupDrawerHandlers();
    setupCourseModalHandlers();
    setupPolicyModalHandlers();
    setupCartSidebarHandlers(() => handleCheckout());

    // Setup auth event listeners
    setupAuthEventListeners();

    // Check auth state and update UI
    await checkAuthState();

    // Update cart badge
    await Cart.updateBadge();

    // Load initial data
    await Promise.all([loadCourses(), loadCategories(), syncCart()]);

    console.log('[Home] Initialization complete');
  } catch (error) {
    console.error('[Home] Initialization error:', error);
  }
}

/**
 * Sets up auth event listeners
 */
function setupAuthEventListeners(): void {
  window.addEventListener('auth-login', async () => {
    console.log('[Home] Auth login detected - reloading courses and cart');
    await loadCourses();
    await syncCart();
    await Cart.updateBadge();
  });

  window.addEventListener('auth-logout', async () => {
    console.log('[Home] Auth logout detected - reloading courses');
    await loadCourses();
    await Cart.updateBadge();
  });
}

/**
 * Handles checkout from cart
 */
async function handleCheckout(): Promise<void> {
  const success = await Cart.checkout();
  if (success) {
    const cartModal = document.getElementById('cart-modal');
    cartModal?.classList.remove('show');
    await loadCourses();
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initHome());
} else {
  initHome();
}

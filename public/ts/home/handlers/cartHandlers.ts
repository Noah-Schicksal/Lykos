import { Cart } from '../../modules/cart.js';
import { AppUI } from '../../utils/ui.js';
import {
  setCartItems,
  addCartItem,
  removeCartItem,
  getCartItems,
} from '../state/homeState.js';
import {
  updateCartSidebar,
  updateCartBadge,
  setupCartSidebarHandlers,
  CartItemData,
} from '../components/cartSidebar.js';

/**
 * Sets up cart handlers
 */
export function setupCartHandlers(): void {
  setupCartSidebarHandlers(handleCheckout);

  // Listen for cart updates from other parts of the app
  window.addEventListener('cart-updated', (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.action === 'remove' && detail?.courseId) {
      removeCartItem(detail.courseId);
      console.log(`[Home] Cart updated - removed ${detail.courseId}`);
    }
  });
}

/**
 * Syncs cart with the server
 */
export async function syncCart(): Promise<void> {
  try {
    const items = await Cart.getCart();
    const courseIds = items.map((item: any) => item.courseId);
    setCartItems(courseIds);
    updateCartBadge(courseIds.length);

    // Fetch full item details for sidebar
    await refreshCartSidebar();
  } catch (error) {
    console.error('[Home] Error syncing cart:', error);
  }
}

/**
 * Refreshes the cart sidebar with current items
 */
async function refreshCartSidebar(): Promise<void> {
  try {
    const items = await Cart.getCart();
    const cartData: CartItemData[] = items.map((item: any) => ({
      courseId: item.courseId,
      title: item.course?.title || 'Curso',
      price: item.course?.price || 0,
      coverImageUrl: item.course?.coverImageUrl,
    }));

    updateCartSidebar(cartData, handleRemoveFromCart);
    updateCartBadge(items.length);
  } catch (error) {
    console.error('[Home] Error refreshing cart sidebar:', error);
  }
}

/**
 * Adds a course to the cart
 */
export async function addToCart(courseId: string): Promise<void> {
  // Check if logged in
  if (!localStorage.getItem('auth_user')) {
    AppUI.showMessage(
      'Por favor, faça login para adicionar cursos ao carrinho.',
      'info',
    );
    const authContainer = document.getElementById('auth-card-container');
    authContainer?.classList.add('show');
    return;
  }

  try {
    const success = await Cart.add(courseId);
    if (success) {
      addCartItem(courseId);
      updateCartBadge(getCartItems().length);
      await refreshCartSidebar();
      AppUI.showMessage('Curso adicionado ao carrinho!', 'success');
    }
  } catch (error: any) {
    AppUI.showMessage(
      error.message || 'Erro ao adicionar ao carrinho',
      'error',
    );
  }
}

/**
 * Removes a course from the cart
 */
async function handleRemoveFromCart(courseId: string): Promise<void> {
  try {
    await Cart.remove(courseId);
    removeCartItem(courseId);
    updateCartBadge(getCartItems().length);
    await refreshCartSidebar();
    AppUI.showMessage('Curso removido do carrinho', 'info');

    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent('cart-updated', {
        detail: { action: 'remove', courseId },
      }),
    );
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao remover do carrinho', 'error');
  }
}

/**
 * Handles checkout
 */
async function handleCheckout(): Promise<void> {
  try {
    const items = getCartItems();
    if (items.length === 0) {
      AppUI.showMessage('Seu carrinho está vazio', 'info');
      return;
    }

    const result = await Cart.checkout();
    if (result) {
      setCartItems([]);
      updateCartBadge(0);
      await refreshCartSidebar();

      // Close cart sidebar
      document.getElementById('cart-modal')?.classList.remove('open');

      AppUI.showMessage(
        'Compra realizada com sucesso! Seus cursos estão disponíveis.',
        'success',
      );

      // Dispatch event to reload courses with updated enrollment status
      window.dispatchEvent(new Event('auth-login'));
    }
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao finalizar compra', 'error');
  }
}

/**
 * Cart Handlers - shopping cart interactions
 */

import { Cart } from '../../modules/cart.js';
import { AppUI } from '../../utils/ui.js';
import { renderCartItems, showCartLoading, showCartError } from '../components/cartSidebar.js';

export function setupCartHandlers(): void {
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const checkoutBtn = document.getElementById('btn-cart-checkout') as HTMLButtonElement;

    // Setup checkout button listener
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const success = await Cart.checkout();
            if (success) {
                if (cartModal) {
                    cartModal.classList.remove('show');
                    document.body.style.overflow = '';
                }
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

            if (isOpening) {
                document.body.style.overflow = 'hidden';
                loadCartItems();
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

export async function loadCartItems(): Promise<void> {
    showCartLoading();

    try {
        const items = await Cart.getCart();

        renderCartItems(items, async (courseId) => {
            const success = await Cart.remove(courseId);
            if (success) {
                loadCartItems();
                Cart.updateBadge();
            }
        });
    } catch (error) {
        showCartError();
    }
}

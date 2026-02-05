/**
 * Cart Module - Handles API interactions for the shopping cart
 */
import { AppUI } from '../utils/ui.js';

export interface CartItem {
    id: string;
    courseId: string;
    title: string;
    price: number;
    coverImageUrl: string;
    instructorName: string;
    addedAt: string;
}

export const Cart = {
    /**
     * Fetch current cart items
     */
    getCart: async (): Promise<CartItem[]> => {
        try {
            const response = await AppUI.apiFetch('/cart');
            return response.data || [];
        } catch (error) {
            console.error('Error fetching cart:', error);
            return [];
        }
    },

    /**
     * Add course to cart
     */
    add: async (courseId: string, showToast: boolean = true): Promise<boolean> => {
        try {
            await AppUI.apiFetch('/cart', {
                method: 'POST',
                body: JSON.stringify({ courseId })
            });
            if (showToast) {
                AppUI.showMessage('Curso adicionado ao carrinho!', 'success');
            }
            await Cart.updateBadge();
            return true;
        } catch (error: any) {
            if (showToast) {
                AppUI.showMessage(error.message || 'Erro ao adicionar ao carrinho', 'error');
            }
            return false;
        }
    },

    /**
     * Remove item from cart
     */
    remove: async (courseId: string): Promise<boolean> => {
        try {
            await AppUI.apiFetch(`/cart/${courseId}`, {
                method: 'DELETE'
            });
            await Cart.updateBadge();
            // Dispatch event to notify components that cart was updated
            window.dispatchEvent(new CustomEvent('cart-updated', { detail: { action: 'remove', courseId } }));
            return true;
        } catch (error: any) {
            AppUI.showMessage(error.message || 'Erro ao remover do carrinho', 'error');
            return false;
        }
    },

    /**
     * Checkout - Finalize purchase
     */
    checkout: async (): Promise<boolean> => {
        try {
            const response = await AppUI.apiFetch('/checkout', {
                method: 'POST'
            });
            AppUI.showMessage(response.message || 'Compra finalizada com sucesso!', 'success');
            await Cart.updateBadge();
            return true;
        } catch (error: any) {
            AppUI.showMessage(error.message || 'Erro ao finalizar compra', 'error');
            return false;
        }
    },

    /**
     * Update the cart badge count in the UI
     */
    updateBadge: async () => {
        const badge = document.getElementById('cart-count-badge');
        if (!badge) return;

        try {
            // Check if user is logged in first to avoid 401 on homepage
            const userStr = localStorage.getItem('auth_user');
            if (!userStr) {
                badge.style.display = 'none';
                return;
            }

            const items = await Cart.getCart();
            const count = items.length;
            badge.textContent = count.toString();
            badge.style.display = count > 0 ? 'flex' : 'none';
        } catch (e) {
            badge.style.display = 'none';
        }
    }
};

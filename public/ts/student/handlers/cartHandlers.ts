/**
 * Cart Handlers - Shopping cart management
 */

import { Cart } from '../../modules/cart.js';
import { AppUI } from '../../utils/ui.js';
import { icon } from '../utils/dom.js';

export function setupCartHandlers(): void {
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');

    if (cartToggleBtn && cartModal) {
        cartToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
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

    // Handle Checkout Button
    const checkoutBtn = document.getElementById('btn-cart-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const confirm = await AppUI.promptModal(
                'Finalizar Compra',
                'Deseja confirmar a compra dos itens no carrinho?'
            );
            if (confirm) {
                const success = await Cart.checkout();
                if (success) {
                    cartModal?.classList.remove('show');
                    // Could reload courses here if needed
                }
            }
        });
    }

    // Listen for cart-updated events
    window.addEventListener('cart-updated', () => {
        Cart.updateBadge();
        if (cartModal?.classList.contains('show')) {
            renderCartItems();
        }
    });
}

export async function renderCartItems(): Promise<void> {
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
        listContainer.innerHTML = items.map(item => {
            total += item.price;
            const price = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(item.price);

            const hasImage = item.coverImageUrl && item.coverImageUrl.trim() !== '';
            const imageHTML = hasImage
                ? `<img src="${item.coverImageUrl}" class="cart-item-img" alt="${item.title}" onerror="this.onerror=null;this.style.display='none';this.parentElement.insertAdjacentHTML('afterbegin','<div class=\\'cart-item-img-placeholder\\'><span class=\\'material-symbols-outlined\\'>image</span></div>');">`
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
        }).join('');

        totalPriceEl.textContent = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(total);
        if (checkoutBtn) checkoutBtn.disabled = false;

        // Add remove listeners
        const removeBtns = listContainer.querySelectorAll('.btn-remove-cart');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const courseId = (btn as HTMLElement).dataset.id!;
                const success = await Cart.remove(courseId);
                if (success) {
                    renderCartItems(); // Refresh
                }
            });
        });
    } catch (error) {
        listContainer.innerHTML = '<div class="cart-empty-msg" style="color: #ef4444">Erro ao carregar carrinho.</div>';
    }
}

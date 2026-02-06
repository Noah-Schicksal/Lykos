/**
 * Cart Sidebar component - shopping cart drawer
 */

import { el, icon, clearChildren } from '../utils/dom.js';

export function renderCartSidebar(): HTMLElement {
    const cart = el('div', { id: 'cart-modal', className: 'cart-sidebar' },
        // Header
        el('div', { className: 'cart-sidebar-header' },
            el('h3', { className: 'cart-sidebar-title' },
                icon('shopping_cart'),
                'Seu Carrinho'
            ),
            el('button', { id: 'close-cart-btn', className: 'btn-icon' },
                icon('close')
            )
        ),

        // Content
        el('div', { id: 'cart-items-list', className: 'cart-sidebar-content' },
            el('div', { className: 'cart-empty-msg' }, 'Seu carrinho está vazio.')
        ),

        // Footer
        el('div', { className: 'cart-sidebar-footer' },
            el('div', { className: 'cart-total-row' },
                el('span', null, 'Total:'),
                el('span', { id: 'cart-total-price', className: 'cart-total-price' }, 'R$ 0,00')
            ),
            (() => {
                const btn = document.createElement('button');
                btn.id = 'btn-cart-checkout';
                btn.className = 'btn-checkout';
                btn.disabled = true;
                btn.textContent = 'Finalizar Compra';
                return btn;
            })()
        )
    );

    return cart;
}

export function renderCartItems(items: any[], onRemove: (courseId: string) => void): void {
    const listContainer = document.getElementById('cart-items-list');
    const totalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('btn-cart-checkout') as HTMLButtonElement;

    if (!listContainer || !totalPriceEl) return;

    if (items.length === 0) {
        listContainer.innerHTML = '<div class="cart-empty-msg">Seu carrinho está vazio.</div>';
        totalPriceEl.textContent = 'R$ 0,00';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    clearChildren(listContainer);
    let total = 0;

    items.forEach(item => {
        total += item.price;

        const price = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(item.price);

        const hasImage = item.coverImageUrl && item.coverImageUrl.trim() !== '';

        const cartItem = el('div', { className: 'cart-item' },
            // Image or placeholder
            hasImage
                ? (() => {
                    const img = document.createElement('img');
                    img.src = item.coverImageUrl;
                    img.className = 'cart-item-img';
                    img.alt = item.title;
                    img.onerror = () => {
                        img.style.display = 'none';
                        const placeholder = el('div', { className: 'cart-item-img-placeholder' }, icon('image'));
                        img.parentElement?.insertBefore(placeholder, img);
                    };
                    return img;
                })()
                : el('div', { className: 'cart-item-img-placeholder' }, icon('image')),

            // Info
            el('div', { className: 'cart-item-info' },
                el('h4', { className: 'cart-item-title' }, item.title),
                el('div', { className: 'cart-item-price' }, price)
            ),

            // Remove button
            (() => {
                const btn = el('button', {
                    className: 'btn-remove-cart',
                    title: 'Remover'
                }, icon('delete')) as HTMLButtonElement;
                const iconEl = btn.querySelector('.material-symbols-outlined') as HTMLElement;
                if (iconEl) iconEl.style.fontSize = '1.25rem';
                btn.addEventListener('click', () => onRemove(item.courseId));
                return btn;
            })()
        );

        listContainer.appendChild(cartItem);
    });

    totalPriceEl.textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(total);

    if (checkoutBtn) checkoutBtn.disabled = false;
}

export function showCartLoading(): void {
    const listContainer = document.getElementById('cart-items-list');
    if (listContainer) {
        listContainer.innerHTML = '<div class="cart-empty-msg">Carregando itens...</div>';
    }
}

export function showCartError(): void {
    const listContainer = document.getElementById('cart-items-list');
    if (listContainer) {
        listContainer.innerHTML = '<div class="cart-empty-msg" style="color: #ef4444">Erro ao carregar carrinho.</div>';
    }
}

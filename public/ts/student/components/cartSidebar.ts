/**
 * Cart Sidebar Component - Shopping cart overlay
 */

import { el, icon } from '../utils/dom.js';

export function renderCartSidebar(): HTMLElement {
    return el('aside', { id: 'cart-modal', className: 'cart-sidebar' },
        el('div', { className: 'cart-header' },
            el('h3', { className: 'cart-title' }, 'Carrinho de Compras'),
            el('button', { id: 'close-cart-btn', className: 'btn-close-cart', 'aria-label': 'Fechar carrinho' },
                icon('close')
            )
        ),
        el('div', { id: 'cart-items-list', className: 'cart-items' },
            el('div', { className: 'cart-empty-msg' }, 'Seu carrinho está vazio.')
        ),
        el('div', { className: 'cart-footer' },
            el('div', { className: 'cart-total' },
                el('span', null, 'Total:'),
                el('span', { id: 'cart-total-price', className: 'cart-total-price' }, 'R$ 0,00')
            ),
            el('button', { id: 'btn-cart-checkout', className: 'btn-checkout', disabled: true }, 'Finalizar Compra')
        )
    );
}

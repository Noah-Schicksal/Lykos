/**
 * Navbar Component - Top header with actions
 */

import { el, icon } from '../utils/dom.js';

export function renderNavbar(): HTMLElement {
    return el('div', { className: 'header-actions' },
        // Shopping Cart
        el('button', { id: 'cart-toggle-btn', className: 'btn-icon', 'aria-label': 'Carrinho de compras' },
            icon('shopping_cart'),
            el('span', { id: 'cart-count-badge', className: 'cart-badge', style: 'display:none' }, '0')
        ),

        // Theme Toggle
        el('button', { className: 'btn-icon', id: 'theme-toggle', 'aria-label': 'Alternar tema' },
            el('span', { className: 'material-symbols-outlined theme-icon dark-icon' }, 'dark_mode'),
            el('span', { className: 'material-symbols-outlined theme-icon light-icon' }, 'light_mode')
        ),

        // User Profile Dropdown
        el('div', { className: 'user-menu-container' },
            el('button', { id: 'user-info-btn', className: 'user-menu-btn' },
                el('span', { id: 'user-display-name', className: 'menu-text' }, 'Estudante'),
                el('span', { className: 'material-symbols-outlined menu-arrow' }, 'expand_more')
            ),
            el('div', { id: 'user-dropdown-menu', className: 'user-dropdown' },
                el('button', { id: 'dropdown-profile', className: 'dropdown-item' },
                    icon('person'),
                    el('span', null, 'Perfil')
                ),
                el('button', { id: 'dropdown-logout', className: 'dropdown-item dropdown-item-danger' },
                    icon('logout'),
                    el('span', null, 'Sair')
                )
            )
        )
    );
}

export function updateNavbarUser(userName: string): void {
    const nameElement = document.getElementById('user-display-name');
    if (nameElement) {
        nameElement.textContent = userName;
    }
}

/**
 * Navbar component for course-detail page
 */

import { el, icon } from '../utils/dom.js';

export function renderNavbar(): HTMLElement {
    const nav = el('nav', { className: 'navbar' },
        el('div', { className: 'nav-container' },
            // Open Drawer Button (only visible when logged in)
            el('button', {
                id: 'open-drawer-btn',
                className: 'btn-icon menu-btn hidden',
                style: 'display: flex; align-items: center; justify-content: center'
            },
                icon('menu')
            ),

            // Logo
            el('a', { href: '/', className: 'logo' },
                (() => {
                    const img = document.createElement('img');
                    img.src = 'assets/logo.svg';
                    img.alt = 'Lykos Logo';
                    img.className = 'logo-img';
                    return img;
                })()
            ),

            // Right Actions
            el('div', { className: 'nav-actions' },
                // Cart
                el('div', { className: 'cart-wrapper' },
                    el('button', { id: 'cart-toggle-btn', className: 'btn-icon' },
                        icon('shopping_cart'),
                        el('span', { id: 'cart-count-badge', className: 'badge-count' }, '0')
                    )
                ),

                // Theme Toggle
                el('button', { className: 'btn-icon', id: 'theme-toggle', 'aria-label': 'Alternar tema' },
                    icon('dark_mode', 'theme-icon dark-icon'),
                    icon('light_mode', 'theme-icon light-icon')
                ),

                // Login Button (visible when not logged in)
                el('button', { id: 'user-avatar-btn', className: 'user-menu-btn hidden' },
                    icon('login'),
                    el('span', { className: 'menu-text' }, 'Login')
                ),

                // User Info Button (visible when logged in)
                el('div', { className: 'user-menu-container' },
                    el('button', { id: 'user-info-btn', className: 'user-menu-btn hidden' },
                        el('span', { id: 'user-display-name', className: 'menu-text' }, 'Usuário'),
                        icon('expand_more', 'menu-arrow')
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
            )
        )
    );

    return nav;
}

export function setupNavbarHandlers(): void {
    const avatarBtn = document.getElementById('user-avatar-btn');
    const userInfoBtn = document.getElementById('user-info-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    const authContainer = document.getElementById('auth-card-container');

    // Avatar button opens auth card for login
    if (avatarBtn) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (authContainer) {
                authContainer.classList.toggle('show');
            }
        });
    }

    // User info button toggles dropdown
    if (userInfoBtn && dropdownMenu) {
        userInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
            userInfoBtn.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (
                dropdownMenu.classList.contains('show') &&
                !dropdownMenu.contains(e.target as Node) &&
                !userInfoBtn.contains(e.target as Node)
            ) {
                dropdownMenu.classList.remove('show');
                userInfoBtn.classList.remove('open');
            }
        });
    }
}

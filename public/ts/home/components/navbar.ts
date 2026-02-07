import { el, icon } from '../utils/dom.js';

/**
 * Renders the navbar component
 */
export function renderNavbar(): HTMLElement {
  return el(
    'nav',
    { className: 'navbar' },
    el(
      'div',
      { className: 'nav-container' },
      // Open Drawer Button (only visible when logged in)
      el(
        'button',
        {
          id: 'open-drawer-btn',
          className: 'btn-icon menu-btn hidden',
          style: 'display: flex; align-items: center; justify-content: center',
        },
        icon('menu'),
      ),

      // Logo
      el(
        'a',
        { href: '/', className: 'logo' },
        el('img', {
          src: 'assets/logo.svg',
          alt: 'Lykos Logo',
          className: 'logo-img',
        }),
      ),

      // Right Actions
      el(
        'div',
        { className: 'nav-actions' },
        // Cart
        el(
          'div',
          { className: 'cart-wrapper' },
          el(
            'button',
            { id: 'cart-toggle-btn', className: 'btn-icon' },
            icon('shopping_cart'),
            el(
              'span',
              { id: 'cart-count-badge', className: 'badge-count' },
              '0',
            ),
          ),
        ),

        // Theme Toggle
        el(
          'button',
          {
            className: 'btn-icon',
            id: 'theme-toggle',
            'aria-label': 'Alternar tema',
          },
          el(
            'span',
            { className: 'material-symbols-outlined theme-icon dark-icon' },
            'dark_mode',
          ),
          el(
            'span',
            { className: 'material-symbols-outlined theme-icon light-icon' },
            'light_mode',
          ),
        ),

        // Login Button (visible when not logged in)
        el(
          'button',
          { id: 'user-avatar-btn', className: 'user-menu-btn hidden' },
          icon('login'),
          el('span', { className: 'menu-text' }, 'Login'),
        ),

        // User Menu Container (visible when logged in)
        el(
          'div',
          { className: 'user-menu-container' },
          el(
            'button',
            { id: 'user-info-btn', className: 'user-menu-btn hidden' },
            el(
              'span',
              { id: 'user-display-name', className: 'menu-text' },
              'Usuário',
            ),
            icon('expand_more', 'menu-arrow'),
          ),
          el(
            'div',
            { id: 'user-dropdown-menu', className: 'user-dropdown' },
            el(
              'button',
              { id: 'dropdown-profile', className: 'dropdown-item' },
              icon('person'),
              el('span', null, 'Perfil'),
            ),
            el(
              'button',
              {
                id: 'dropdown-logout',
                className: 'dropdown-item dropdown-item-danger',
              },
              icon('logout'),
              el('span', null, 'Sair'),
            ),
          ),
        ),
      ),
    ),
  );
}

/**
 * Sets up navbar event handlers
 */
export function setupNavbarHandlers(): void {
  const userInfoBtn = document.getElementById('user-info-btn');
  const dropdownMenu = document.getElementById('user-dropdown-menu');

  if (userInfoBtn && dropdownMenu) {
    userInfoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (
        dropdownMenu.classList.contains('show') &&
        !dropdownMenu.contains(e.target as Node) &&
        !userInfoBtn.contains(e.target as Node)
      ) {
        dropdownMenu.classList.remove('show');
      }
    });
  }
}

/**
 * Updates navbar UI based on user login state
 */
export function updateNavbarForUser(user: { name: string } | null): void {
  const avatarBtn = document.getElementById('user-avatar-btn');
  const userInfoBtn = document.getElementById('user-info-btn');
  const displayName = document.getElementById('user-display-name');
  const openDrawerBtn = document.getElementById('open-drawer-btn');

  if (user) {
    avatarBtn?.classList.add('hidden');
    userInfoBtn?.classList.remove('hidden');
    openDrawerBtn?.classList.remove('hidden');
    if (displayName) {
      displayName.textContent = user.name.split(' ')[0];
    }
  } else {
    avatarBtn?.classList.remove('hidden');
    userInfoBtn?.classList.add('hidden');
    openDrawerBtn?.classList.add('hidden');
  }
}

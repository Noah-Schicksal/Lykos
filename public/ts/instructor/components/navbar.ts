import { el, icon } from '../utils/dom.js';

export function renderNavbar(): HTMLElement {
  return el('nav', { className: 'navbar' },
    el('div', { className: 'nav-container' },
      // Left section
      el('div', { className: 'nav-left' },
        el('a', { href: '/', className: 'btn-back' },
          icon('arrow_back'),
          'Voltar'
        ),
        el('div', { className: 'logo' },
          el('img', { src: 'assets/logo.svg', alt: 'Lykos Logo', className: 'logo-img' })
        )
      ),
      // Right actions
      el('div', { className: 'nav-actions' },
        el('button', { className: 'btn-icon', id: 'theme-toggle', 'aria-label': 'Alternar tema' },
          el('span', { className: 'material-symbols-outlined theme-icon dark-icon' }, 'dark_mode'),
          el('span', { className: 'material-symbols-outlined theme-icon light-icon' }, 'light_mode')
        ),
        el('div', { id: 'user-avatar-btn', className: 'user-menu-btn' },
          el('span', { className: 'menu-text' }, 'Menu'),
          icon('expand_more')
        )
      )
    )
  );
}

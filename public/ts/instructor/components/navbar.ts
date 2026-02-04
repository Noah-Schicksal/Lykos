import { el, icon } from '../utils/dom.js';

export function setupNavbarHandlers(): void {
  const avatarBtn = document.getElementById('user-avatar-btn');
  const dropdownMenu = document.getElementById('user-dropdown-menu');

  if (avatarBtn && dropdownMenu) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
      avatarBtn.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (
        dropdownMenu.classList.contains('show') &&
        !dropdownMenu.contains(e.target as Node) &&
        !avatarBtn.contains(e.target as Node)
      ) {
        dropdownMenu.classList.remove('show');
        avatarBtn.classList.remove('open');
      }
    });
  }
}

export function updateNavbarForUser(isLoggedIn: boolean): void {
  const loggedInOptions = document.getElementById('dropdown-logged-in');
  const loggedOutOptions = document.getElementById('dropdown-logged-out');
  
  if (loggedInOptions && loggedOutOptions) {
    if (isLoggedIn) {
      loggedInOptions.style.display = '';
      loggedOutOptions.style.display = 'none';
    } else {
      loggedInOptions.style.display = 'none';
      loggedOutOptions.style.display = '';
    }
  }
}

export function renderNavbar(): HTMLElement {
  return el('nav', { className: 'navbar' },
    el('div', { className: 'nav-container' },
      // Left section
      el('div', { className: 'nav-left' },
        el('a', { href: '/', className: 'btn-back', title: 'Voltar para Home' },
          icon('arrow_back')
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
          el('span', { className: 'menu-label' }, 'Menu'),
          el('span', { className: 'material-symbols-outlined menu-arrow' }, 'expand_more')
        ),
        el('div', { id: 'user-dropdown-menu', className: 'user-dropdown' },
          // Opções para usuário logado
          el('div', { id: 'dropdown-logged-in' },
            el('button', { id: 'btn-edit-user-profile', className: 'dropdown-item' },
              icon('edit'),
              el('span', null, 'Editar Perfil')
            ),
            el('button', { id: 'btn-logout-menu', className: 'dropdown-item dropdown-item-danger' },
              icon('logout'),
              el('span', null, 'Sair')
            )
          ),
          // Opções para usuário não logado
          el('div', { id: 'dropdown-logged-out', style: 'display: none;' },
            el('button', { id: 'btn-dropdown-login', className: 'dropdown-item' },
              icon('login'),
              el('span', null, 'Entrar')
            ),
            el('button', { id: 'btn-dropdown-register', className: 'dropdown-item' },
              icon('person_add'),
              el('span', null, 'Criar Conta')
            )
          )
        )
      )
    )
  );
}

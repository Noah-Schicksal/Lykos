import { el, icon } from '../utils/dom.js';

/**
 * Renders the user drawer sidebar
 */
export function renderUserDrawer(): HTMLElement {
  return el(
    'div',
    { id: 'user-drawer', className: 'user-drawer' },
    // Header
    el(
      'div',
      { className: 'user-drawer-header' },
      el(
        'button',
        { id: 'menu-drawer-btn', className: 'btn-icon menu-toggle-btn' },
        icon('menu'),
      ),
    ),

    // Content
    el(
      'div',
      { className: 'user-drawer-content' },
      // Profile Section
      renderProfileSection(),

      // Management Section (Instructors only)
      renderManagementSection(),

      // My Learning Section
      renderLearningSection(),
    ),

    // Footer
    el(
      'div',
      { className: 'user-drawer-footer' },
      el(
        'button',
        { id: 'drawer-logout', className: 'drawer-btn logout' },
        icon('logout'),
        ' Sair',
      ),
    ),
  );
}

function renderProfileSection(): HTMLElement {
  return el(
    'div',
    { className: 'drawer-section' },
    el(
      'button',
      { id: 'drawer-profile-toggle', className: 'drawer-section-header' },
      el(
        'span',
        { className: 'drawer-section-title' },
        icon('person'),
        ' Perfil',
      ),
      icon('expand_more', 'drawer-chevron'),
    ),
    el(
      'div',
      { id: 'drawer-profile-panel', className: 'drawer-accordion-panel' },
      // View Mode
      el(
        'div',
        { id: 'drawer-profile-view' },
        el(
          'div',
          { className: 'drawer-profile-info' },
          el('div', { className: 'drawer-avatar' }, icon('account_circle')),
          el(
            'div',
            { className: 'drawer-info-row' },
            el(
              'p',
              { id: 'drawer-user-name', className: 'drawer-user-name' },
              'Nome do Usuário',
            ),
          ),
          el(
            'div',
            { className: 'drawer-info-row' },
            el('span', { className: 'drawer-info-label' }, 'EMAIL'),
            el(
              'p',
              { id: 'drawer-user-email', className: 'drawer-user-email' },
              'email@exemplo.com',
            ),
          ),
          el(
            'div',
            { className: 'drawer-info-row' },
            el('span', { className: 'drawer-info-label' }, 'FUNÇÃO'),
            el(
              'span',
              { id: 'drawer-user-role', className: 'drawer-role-badge' },
              'Aluno',
            ),
          ),
        ),
        el(
          'div',
          { className: 'drawer-profile-actions' },
          el(
            'button',
            { id: 'drawer-edit-profile', className: 'drawer-btn primary' },
            icon('edit'),
            ' Editar Perfil',
          ),
          el(
            'button',
            { id: 'drawer-delete-account', className: 'drawer-btn danger' },
            icon('delete'),
            ' Excluir Conta',
          ),
        ),
      ),
      // Edit Mode
      renderDrawerEditMode(),
    ),
  );
}

function renderDrawerEditMode(): HTMLElement {
  return el(
    'div',
    {
      id: 'drawer-profile-edit',
      className: 'hidden',
      style: 'padding: 0 0.5rem',
    },
    el(
      'div',
      {
        style:
          'display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;',
      },
      el(
        'h4',
        { style: 'margin: 0; color: var(--text-primary)' },
        'Editar Perfil',
      ),
      el(
        'button',
        { id: 'drawer-cancel-edit', className: 'btn-icon', type: 'button' },
        icon('close'),
      ),
    ),
    el(
      'form',
      { id: 'drawer-profile-edit-form', novalidate: true },
      el(
        'div',
        { className: 'form-group' },
        el(
          'label',
          { className: 'form-label', style: 'font-size: 0.7rem' },
          'Nome',
        ),
        el('input', {
          id: 'drawer-edit-name',
          type: 'text',
          className: 'form-input',
          placeholder: 'Seu nome',
          style: 'font-size: 0.85rem',
        }),
      ),
      el(
        'div',
        { className: 'form-group' },
        el(
          'label',
          { className: 'form-label', style: 'font-size: 0.7rem' },
          'Email',
        ),
        el('input', {
          id: 'drawer-edit-email',
          type: 'email',
          className: 'form-input',
          placeholder: 'seu@email.com',
          style: 'font-size: 0.85rem',
        }),
      ),
      el(
        'div',
        { className: 'form-group' },
        el(
          'label',
          { className: 'form-label', style: 'font-size: 0.7rem' },
          'Nova Senha',
        ),
        el(
          'div',
          { className: 'password-wrapper' },
          el('input', {
            id: 'drawer-edit-password',
            type: 'password',
            className: 'form-input',
            placeholder: 'Opcional',
            style: 'font-size: 0.85rem',
          }),
          el(
            'button',
            {
              type: 'button',
              className: 'btn-toggle-password',
              'data-target': 'drawer-edit-password',
            },
            icon('visibility'),
          ),
        ),
      ),
      el(
        'button',
        {
          type: 'submit',
          className: 'drawer-btn primary',
          style: 'width: 100%; justify-content: center; margin-top: 1rem',
        },
        'Salvar',
      ),
    ),
  );
}

function renderManagementSection(): HTMLElement {
  return el(
    'div',
    { id: 'drawer-management-section', className: 'drawer-section hidden' },
    el('div', { className: 'drawer-section-label' }, 'Gerenciamento'),
    el(
      'a',
      { href: '/professor', className: 'drawer-item' },
      icon('dashboard'),
      ' Painel do Professor',
    ),
    el(
      'button',
      { id: 'drawer-categories-toggle', className: 'drawer-section-header' },
      el(
        'span',
        { className: 'drawer-section-title' },
        icon('category'),
        ' Categorias',
      ),
      icon('expand_more', 'drawer-chevron'),
    ),
    el(
      'div',
      { id: 'drawer-categories-panel', className: 'drawer-accordion-panel' },
      el(
        'form',
        { id: 'category-create-form', className: 'category-form' },
        el(
          'div',
          { className: 'form-group' },
          el('label', { className: 'form-label' }, 'Nome da Nova Categoria'),
          el(
            'div',
            { className: 'category-input-group' },
            el('input', {
              id: 'new-category-name',
              type: 'text',
              className: 'form-input',
              placeholder: 'ex: Dev Web',
              required: true,
            }),
            el('button', { type: 'submit', className: 'btn-add' }, icon('add')),
          ),
        ),
      ),
      el(
        'div',
        { className: 'drawer-categories-wrapper' },
        el('label', { className: 'form-label' }, 'Categorias Existentes'),
        el(
          'div',
          { id: 'categories-list', className: 'categories-list' },
          el('p', { className: 'loading-text' }, 'Carregando...'),
        ),
      ),
    ),
  );
}

function renderLearningSection(): HTMLElement {
  return el(
    'div',
    { className: 'drawer-section' },
    el('div', { className: 'drawer-section-label' }, 'Meu Aprendizado'),
    el(
      'a',
      { href: '/estudante', className: 'drawer-item' },
      icon('school'),
      ' Meus Cursos',
    ),
  );
}

/**
 * Sets up drawer handlers
 */
export function setupDrawerHandlers(): void {
  const openDrawerBtn = document.getElementById('open-drawer-btn');
  const menuDrawerBtn = document.getElementById('menu-drawer-btn');
  const drawer = document.getElementById('user-drawer');
  const overlay = document.querySelector('.drawer-overlay');

  const toggleDrawer = () => {
    drawer?.classList.toggle('open');
    overlay?.classList.toggle('active');
  };

  openDrawerBtn?.addEventListener('click', toggleDrawer);
  menuDrawerBtn?.addEventListener('click', toggleDrawer);
  overlay?.addEventListener('click', toggleDrawer);

  // Accordion toggles
  setupAccordionToggle('drawer-profile-toggle', 'drawer-profile-panel');
  setupAccordionToggle('drawer-categories-toggle', 'drawer-categories-panel');
}

function setupAccordionToggle(toggleId: string, panelId: string): void {
  const toggle = document.getElementById(toggleId);
  const panel = document.getElementById(panelId);

  toggle?.addEventListener('click', () => {
    panel?.classList.toggle('open');
    toggle.classList.toggle('open');
  });
}

/**
 * Updates drawer with user info
 */
export function updateDrawerUser(
  user: { name: string; email: string; role: string } | null,
): void {
  const nameEl = document.getElementById('drawer-user-name');
  const emailEl = document.getElementById('drawer-user-email');
  const roleEl = document.getElementById('drawer-user-role');
  const managementSection = document.getElementById(
    'drawer-management-section',
  );

  if (user) {
    const roleName = user.role === 'INSTRUCTOR' ? 'Instrutor' : 'Aluno';

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (roleEl) roleEl.textContent = roleName;

    // Show management section for instructors
    if (user.role === 'INSTRUCTOR') {
      managementSection?.classList.remove('hidden');
    } else {
      managementSection?.classList.add('hidden');
    }
  }
}

/**
 * Renders the drawer overlay
 */
export function renderDrawerOverlay(): HTMLElement {
  return el('div', { className: 'drawer-overlay' });
}

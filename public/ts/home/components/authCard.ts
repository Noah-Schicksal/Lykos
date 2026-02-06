import { el, icon } from '../utils/dom.js';

// Helper functions
function formGroup(labelText: string, input: HTMLElement): HTMLElement {
  return el(
    'div',
    { className: 'form-group' },
    el('label', { className: 'form-label' }, labelText),
    input,
  );
}

function passwordField(id: string, placeholder: string): HTMLElement {
  return el(
    'div',
    { className: 'password-wrapper' },
    el('input', {
      type: 'password',
      id,
      className: 'form-input',
      placeholder,
    }),
    el(
      'button',
      {
        type: 'button',
        className: 'btn-toggle-password',
        'data-target': id,
      },
      icon('visibility'),
    ),
  );
}

function viewHeader(title: string, backBtnId: string): HTMLElement {
  return el(
    'div',
    { className: 'view-header' },
    el('h3', { className: 'auth-title' }, title),
    el('button', { id: backBtnId, className: 'btn-icon' }, icon('arrow_back')),
  );
}

function dashboardButton(
  id: string,
  iconName: string,
  text: string,
  extraClass?: string,
): HTMLElement {
  return el(
    'button',
    {
      id,
      className: extraClass ? `btn-dashboard ${extraClass}` : 'btn-dashboard',
    },
    icon(iconName),
    ` ${text}`,
  );
}

// Auth faces
function renderLoginFace(): HTMLElement {
  return el(
    'div',
    { className: 'auth-face auth-login' },
    el('h3', { className: 'auth-title' }, 'Bem-vindo de Volta'),
    el(
      'form',
      { id: 'login-form', novalidate: true },
      formGroup(
        'Email',
        el('input', {
          id: 'login-email',
          type: 'text',
          className: 'form-input',
          placeholder: 'usuario@empresa.com',
        }),
      ),
      formGroup('Senha', passwordField('login-password', '••••••••')),
      el('button', { type: 'submit', className: 'btn-submit' }, 'Entrar'),
    ),
    el(
      'div',
      { className: 'auth-footer' },
      el('p', { className: 'footer-text' }, 'Novo por aqui?'),
      el(
        'button',
        { id: 'btn-to-register', className: 'btn-link' },
        'Criar Conta',
      ),
    ),
  );
}

function renderRegisterFace(): HTMLElement {
  return el(
    'div',
    { className: 'auth-face auth-register auth-face-back' },
    el('h3', { className: 'auth-title' }, 'Junte-se ao Lab'),
    el(
      'form',
      { id: 'register-form', novalidate: true },
      formGroup(
        'Eu sou um...',
        el(
          'select',
          { id: 'register-role', className: 'form-input' },
          el('option', { value: 'student' }, 'Estudante'),
          el('option', { value: 'instructor' }, 'Instrutor'),
        ),
      ),
      formGroup(
        'Nome Completo',
        el('input', {
          type: 'text',
          id: 'register-name',
          className: 'form-input',
          placeholder: 'Maria Silva',
          required: true,
        }),
      ),
      formGroup(
        'Email',
        el('input', {
          type: 'email',
          id: 'register-email',
          className: 'form-input',
          placeholder: 'maria@email.com',
          required: true,
        }),
      ),
      el(
        'div',
        { className: 'form-grid' },
        formGroup('Senha', passwordField('register-password', '••••')),
        formGroup('Confirmar', passwordField('register-confirm', '••••')),
      ),
      el('button', { type: 'submit', className: 'btn-submit' }, 'Registrar'),
    ),
    el(
      'div',
      { className: 'auth-footer' },
      el('p', { className: 'footer-text' }, 'Já tem acesso?'),
      el(
        'button',
        { id: 'btn-to-login', className: 'btn-link' },
        'Voltar ao Login',
      ),
    ),
  );
}

function renderLoggedInFace(): HTMLElement {
  return el(
    'div',
    { id: 'auth-logged-in', className: 'auth-face auth-logged-in hidden' },
    el('div', { className: 'user-avatar-large' }, icon('account_circle')),
    el(
      'h3',
      { id: 'user-name-display', className: 'user-name' },
      'Nome do Usuário',
    ),
    el(
      'p',
      { id: 'user-email-display', className: 'user-email' },
      'usuario@exemplo.com',
    ),
    el('div', { id: 'user-role-badge', className: 'role-badge' }, 'Estudante'),
    el(
      'div',
      { className: 'dashboard-actions' },
      dashboardButton('btn-my-learning', 'school', 'Meu Aprendizado'),
      dashboardButton('btn-view-profile', 'person', 'Ver Perfil'),
      dashboardButton('btn-logout', 'logout', 'Sair', 'btn-logout'),
    ),
  );
}

function renderProfileView(): HTMLElement {
  return el(
    'div',
    { id: 'auth-profile-view', className: 'auth-face hidden' },
    viewHeader('Meu Perfil', 'btn-back-from-profile'),
    el('div', { className: 'user-avatar-large' }, icon('account_circle')),
    el(
      'div',
      { className: 'profile-info' },
      el(
        'div',
        { className: 'info-item' },
        el('label', { className: 'form-label' }, 'Nome'),
        el(
          'p',
          { id: 'profile-view-name', className: 'info-value' },
          'Nome do Usuário',
        ),
      ),
      el(
        'div',
        { className: 'info-item' },
        el('label', { className: 'form-label' }, 'Email'),
        el(
          'p',
          { id: 'profile-view-email', className: 'info-value' },
          'usuario@exemplo.com',
        ),
      ),
      el(
        'div',
        { className: 'info-item' },
        el('label', { className: 'form-label' }, 'Função'),
        el(
          'p',
          { id: 'profile-view-role', className: 'info-value' },
          'Estudante',
        ),
      ),
    ),
    el(
      'div',
      { className: 'profile-actions' },
      el(
        'button',
        { id: 'btn-edit-profile', className: 'btn-submit' },
        icon('edit'),
        ' Editar Perfil',
      ),
      el(
        'button',
        { id: 'btn-delete-account', className: 'btn-delete' },
        icon('delete'),
        ' Excluir Conta',
      ),
    ),
  );
}

function renderProfileEdit(): HTMLElement {
  return el(
    'div',
    { id: 'auth-profile-edit', className: 'auth-face hidden' },
    viewHeader('Editar Perfil', 'btn-back-from-edit'),
    el(
      'form',
      { id: 'profile-edit-form', novalidate: true },
      formGroup(
        'Nome',
        el('input', {
          type: 'text',
          id: 'edit-name',
          className: 'form-input',
          placeholder: 'Seu nome',
        }),
      ),
      formGroup(
        'Email',
        el('input', {
          type: 'email',
          id: 'edit-email',
          className: 'form-input',
          placeholder: 'seu@email.com',
        }),
      ),
      formGroup(
        'Nova Senha (opcional)',
        passwordField('edit-password', '••••••••'),
      ),
      el(
        'div',
        { className: 'profile-actions' },
        el(
          'button',
          { type: 'submit', className: 'btn-submit' },
          icon('save'),
          ' Salvar Alterações',
        ),
        el(
          'button',
          {
            type: 'button',
            id: 'btn-cancel-edit',
            className: 'btn-dashboard outline',
          },
          'Cancelar',
        ),
      ),
    ),
  );
}

/**
 * Renders the complete auth card with all faces
 */
export function renderAuthCard(): HTMLElement {
  const authCard = el(
    'div',
    { id: 'auth-card', className: 'auth-card' },
    renderLoginFace(),
    renderRegisterFace(),
    renderLoggedInFace(),
    renderProfileView(),
    renderProfileEdit(),
  );

  return el(
    'div',
    { id: 'auth-card-container', className: 'auth-container' },
    authCard,
  );
}

/**
 * Shows a specific auth face
 */
export function showAuthFace(faceId: string): void {
  const faces = document.querySelectorAll('.auth-face');
  faces.forEach((face) => {
    if (face.id === faceId || face.classList.contains(faceId)) {
      face.classList.remove('hidden');
    } else {
      face.classList.add('hidden');
    }
  });
}

/**
 * Updates logged in user info in auth card
 */
export function updateAuthCardUser(
  user: { name: string; email: string; role: string } | null,
): void {
  const nameEl = document.getElementById('user-name-display');
  const emailEl = document.getElementById('user-email-display');
  const roleEl = document.getElementById('user-role-badge');
  const profileName = document.getElementById('profile-view-name');
  const profileEmail = document.getElementById('profile-view-email');
  const profileRole = document.getElementById('profile-view-role');

  if (user) {
    const roleName = user.role === 'INSTRUCTOR' ? 'Instrutor' : 'Estudante';

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (roleEl) roleEl.textContent = roleName;
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
    if (profileRole) profileRole.textContent = roleName;
  }
}

/**
 * Flips auth card between login and register
 */
export function flipAuthCard(toRegister: boolean): void {
  const authCard = document.getElementById('auth-card');
  if (authCard) {
    if (toRegister) {
      authCard.classList.add('flipped');
    } else {
      authCard.classList.remove('flipped');
    }
  }
}

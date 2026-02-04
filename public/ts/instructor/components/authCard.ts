import { el, icon } from '../utils/dom.js';

function formGroup(labelText: string, input: HTMLElement): HTMLElement {
  return el('div', { className: 'form-group' },
    el('label', { className: 'form-label' }, labelText),
    input
  );
}

function passwordField(id: string, placeholder: string): HTMLElement {
  return el('div', { className: 'password-wrapper' },
    el('input', {
      type: 'password',
      id,
      className: 'form-input',
      placeholder,
      required: true,
    }),
    el('button', {
      type: 'button',
      className: 'btn-toggle-password',
      'data-target': id,
    }, icon('visibility'))
  );
}

function dashboardButton(id: string, iconName: string, text: string, extraClass?: string): HTMLElement {
  return el('button', {
    id,
    className: extraClass ? `btn-dashboard ${extraClass}` : 'btn-dashboard',
  }, icon(iconName), ` ${text}`);
}

function viewHeader(title: string, backBtnId: string, iconName = 'arrow_back'): HTMLElement {
  return el('div', { className: 'view-header' },
    el('h3', { className: 'auth-title' }, title),
    el('button', { id: backBtnId, className: 'btn-icon' }, icon(iconName))
  );
}

function renderLoginFace(): HTMLElement {
  return el('div', { className: 'auth-face auth-login' },
    el('h3', { className: 'auth-title' }, 'Bem-vindo de Volta'),
    el('form', { id: 'login-form' },
      formGroup('Email / Usuário',
        el('input', {
          id: 'login-email',
          type: 'text',
          className: 'form-input',
          placeholder: 'user@company.com',
        })
      ),
      formGroup('Senha', passwordField('login-password', '••••••••')),
      el('button', { type: 'submit', className: 'btn-submit' }, 'Entrar')
    ),
    el('div', { className: 'auth-footer' },
      el('p', { className: 'footer-text' }, 'Novo Desenvolvedor?'),
      el('button', { id: 'btn-to-register', className: 'btn-link' }, 'Criar Conta')
    )
  );
}

function renderRegisterFace(): HTMLElement {
  return el('div', { className: 'auth-face auth-register' },
    el('h3', { className: 'auth-title' }, 'Junte-se à Plataforma'),
    el('form', { id: 'register-form' },
      formGroup('Eu sou...',
        el('select', { id: 'register-role', className: 'form-input' },
          el('option', { value: 'student' }, 'Aluno'),
          el('option', { value: 'instructor' }, 'Instrutor')
        )
      ),
      formGroup('Nome Completo',
        el('input', {
          type: 'text',
          id: 'register-name',
          className: 'form-input',
          placeholder: 'John Doe',
          required: true,
        })
      ),
      formGroup('Email',
        el('input', {
          type: 'email',
          id: 'register-email',
          className: 'form-input',
          placeholder: 'john@tech.com',
          required: true,
        })
      ),
      el('div', { className: 'form-grid' },
        formGroup('Senha', passwordField('register-password', '••••')),
        formGroup('Confirmar', passwordField('register-confirm', '••••'))
      ),
      el('button', { type: 'submit', className: 'btn-submit' }, 'Registrar')
    ),
    el('div', { className: 'auth-footer' },
      el('p', { className: 'footer-text' }, 'Já tem acesso?'),
      el('button', { id: 'btn-to-login', className: 'btn-link' }, 'Voltar ao Login')
    )
  );
}

function renderLoggedInFace(): HTMLElement {
  return el('div', { id: 'auth-logged-in', className: 'auth-face auth-logged-in' },
    el('div', { className: 'user-avatar-large' }, icon('account_circle')),
    el('h3', { id: 'user-name-display', className: 'user-name' }, 'User Name'),
    el('p', { id: 'user-email-display', className: 'user-email' }, 'user@example.com'),
    el('div', { id: 'user-role-badge', className: 'role-badge' }, 'Aluno'),
    el('div', { className: 'dashboard-actions' },
      dashboardButton('btn-my-learning', 'school', 'Meu Aprendizado'),
      dashboardButton('btn-instructor-dash', 'dashboard', 'Dashboard do Instrutor'),
      dashboardButton('btn-create-course', 'add_circle', 'Criar Curso'),
      dashboardButton('btn-manage-categories', 'category', 'Gerenciar Categorias'),
      dashboardButton('btn-view-profile', 'person', 'Ver Perfil'),
      dashboardButton('btn-logout', 'logout', 'Sair', 'btn-logout')
    )
  );
}

function renderCategoriesView(): HTMLElement {
  return el('div', { id: 'auth-categories-view', className: 'auth-face' },
    viewHeader('Gerenciar Categorias', 'btn-back-from-categories'),
    el('form', { id: 'category-create-form', className: 'category-form' },
      formGroup('Nome da Nova Categoria',
        el('input', {
          id: 'category-name-input',
          type: 'text',
          className: 'form-input',
          placeholder: 'ex: Desenvolvimento Web',
        })
      ),
      el('button', { type: 'submit', className: 'btn-submit' }, 'Adicionar Categoria')
    ),
    el('div', { id: 'categories-list-container' },
      el('p', { className: 'loading-text' }, 'Carregando categorias...')
    )
  );
}

function renderProfileView(): HTMLElement {
  const infoItem = (label: string, valueId: string, defaultValue: string) =>
    el('div', { className: 'info-item' },
      el('label', { className: 'form-label' }, label),
      el('p', { id: valueId, className: 'info-value' }, defaultValue)
    );

  return el('div', { id: 'auth-profile-view', className: 'auth-face' },
    viewHeader('Perfil', 'btn-back-from-profile', 'close'),
    el('div', { className: 'user-avatar-large' }, icon('account_circle')),
    el('div', { className: 'profile-info' },
      infoItem('Nome', 'profile-name-display', 'Nome do Usuário'),
      infoItem('Email', 'profile-email-display', 'user@example.com'),
      infoItem('Função', 'profile-role-display', 'Aluno')
    ),
    el('div', { className: 'profile-actions' },
      el('button', { id: 'btn-edit-profile', className: 'btn-submit' },
        icon('edit'), ' Editar Perfil'
      ),
      el('button', { id: 'btn-delete-account', className: 'btn-delete' },
        icon('delete'), ' Excluir Conta'
      )
    )
  );
}

function renderProfileEditView(): HTMLElement {
  return el('div', { id: 'auth-profile-edit', className: 'auth-face' },
    viewHeader('Editar Perfil', 'btn-cancel-edit', 'close'),
    el('form', { id: 'profile-edit-form' },
      formGroup('Nome',
        el('input', {
          id: 'edit-name',
          type: 'text',
          className: 'form-input',
          placeholder: 'Seu nome',
        })
      ),
      formGroup('Email',
        el('input', {
          id: 'edit-email',
          type: 'email',
          className: 'form-input',
          placeholder: 'your.email@example.com',
        })
      ),
      formGroup('Nova Senha (deixe em branco para manter a atual)',
        passwordField('edit-password', '••••••••')
      ),
      el('button', { type: 'submit', className: 'btn-submit' }, 'Salvar Alterações')
    )
  );
}

export function renderAuthCard(): HTMLElement {
  const authCard = el('div', { id: 'auth-card', className: 'auth-card' },
    renderLoginFace(),
    renderRegisterFace(),
    renderLoggedInFace(),
    renderCategoriesView(),
    renderProfileView(),
    renderProfileEditView()
  );

  return el('div', { id: 'auth-card-container', className: 'auth-container' }, authCard);
}

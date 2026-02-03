import { Auth } from '../../modules/auth.js';
import { AppUI } from '../../utils/ui.js';

export function setupAuthHandlers(): void {
  const avatarBtn = document.getElementById('user-avatar-btn');
  const authContainer = document.getElementById('auth-card-container');

  if (avatarBtn && authContainer) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      authContainer.classList.toggle('show');
      avatarBtn.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (
        authContainer.classList.contains('show') &&
        !authContainer.contains(e.target as Node) &&
        !avatarBtn.contains(e.target as Node)
      ) {
        authContainer.classList.remove('show');
        avatarBtn.classList.remove('open');
      }
    });
  }

  const cardInner = document.getElementById('auth-card');
  const btnToRegister = document.getElementById('btn-to-register');
  const btnToLogin = document.getElementById('btn-to-login');

  if (btnToRegister && cardInner) {
    btnToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      cardInner.classList.add('flipped');
    });
  }

  if (btnToLogin && cardInner) {
    btnToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      cardInner.classList.remove('flipped');
    });
  }

  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  const registerForm = document.getElementById(
    'register-form',
  ) as HTMLFormElement;
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const role = (document.getElementById('register-role') as HTMLSelectElement)
        .value;
      const name = (document.getElementById('register-name') as HTMLInputElement)
        .value;
      const email = (document.getElementById('register-email') as HTMLInputElement)
        .value;
      const password = (document.getElementById('register-password') as HTMLInputElement)
        .value;
      const confirm = (document.getElementById('register-confirm') as HTMLInputElement)
        .value;

      if (!name || !email || !password || !confirm) {
        AppUI.showMessage('Por favor, preencha todos os campos.', 'error');
        return;
      }

      if (password !== confirm) {
        AppUI.showMessage('As senhas não correspondem.', 'error');
        return;
      }

      try {
        const response = await AppUI.apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            password,
            role: role === 'instructor' ? 'INSTRUCTOR' : 'STUDENT',
          }),
        });

        AppUI.showMessage('Conta criada com sucesso! Faça login.', 'success');
        registerForm.reset();

        const cardInner = document.getElementById('auth-card');
        if (cardInner) {
          cardInner.classList.remove('flipped');
        }
      } catch (error: any) {
        AppUI.showMessage(error.message || 'Erro ao registrar', 'error');
      }
    });
  }

  document.querySelectorAll('.btn-toggle-password').forEach((btn) => {
    btn.addEventListener('click', handlePasswordToggle);
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    Auth.logout();
  });

  document.getElementById('btn-view-profile')?.addEventListener('click', () => {
    Auth.showProfileView();
  });

  document
    .getElementById('btn-back-from-profile')
    ?.addEventListener('click', () => {
      Auth.updateAuthUI();
    });

  const profileEditForm = document.getElementById(
    'profile-edit-form',
  ) as HTMLFormElement;
  if (profileEditForm) {
    profileEditForm.addEventListener('submit', handleProfileEditSubmit);
  }

  document
    .getElementById('btn-edit-profile')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      const profileViewFace = document.getElementById('auth-profile-view');
      const profileEditFace = document.getElementById('auth-profile-edit');
      if (profileViewFace && profileEditFace) {
        profileViewFace.classList.add('hidden');
        profileEditFace.classList.remove('hidden');

        const userStr = localStorage.getItem('auth_user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        if (currentUser) {
          (document.getElementById('edit-name') as HTMLInputElement).value =
            currentUser.name || '';
          (document.getElementById('edit-email') as HTMLInputElement).value =
            currentUser.email || '';
        }
      }
    });

  document
    .getElementById('btn-cancel-edit')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.updateAuthUI();
    });

  document
    .getElementById('btn-delete-account')
    ?.addEventListener('click', handleDeleteAccount);
}

async function handleLoginSubmit(e: Event): Promise<void> {
  e.preventDefault();
  const form = e.target as HTMLFormElement;

  const email = (document.getElementById('login-email') as HTMLInputElement)
    .value;
  const password = (document.getElementById('login-password') as HTMLInputElement)
    .value;

  if (!email || !password) {
    AppUI.showMessage('Por favor, preench todos os campos.', 'error');
    return;
  }

  try {
    await Auth.login(email, password);
    form.reset();
  } catch (error: any) {
    AppUI.showMessage(error.message || 'Erro ao fazer login', 'error');
  }
}

function handlePasswordToggle(e: Event): void {
  e.preventDefault();
  const btn = e.target as HTMLElement;
  const targetId = btn.getAttribute('data-target');
  if (!targetId) return;

  const input = document.getElementById(targetId) as HTMLInputElement;
  if (input) {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.classList.toggle('toggled');
  }
}

async function handleProfileEditSubmit(e: Event): Promise<void> {
  e.preventDefault();

  const name = (document.getElementById('edit-name') as HTMLInputElement).value;
  const email = (document.getElementById('edit-email') as HTMLInputElement)
    .value;
  const password = (document.getElementById('edit-password') as HTMLInputElement)
    .value;

  if (!name || !email) {
    AppUI.showMessage(
      'Nome e email são obrigatórios.',
      'error',
    );
    return;
  }

  try {
    await Auth.updateUserProfile({
      name,
      email,
      password: password || undefined,
    });
    AppUI.showMessage('Perfil atualizado com sucesso!', 'success');
    Auth.updateAuthUI();
  } catch (error: any) {
    AppUI.showMessage(
      error.message || 'Erro ao atualizar perfil',
      'error',
    );
  }
}

async function handleDeleteAccount(e: Event): Promise<void> {
  e.preventDefault();

  const confirmed = window.confirm(
    'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.',
  );

  if (!confirmed) return;

  try {
    await Auth.deleteUserAccount();
    AppUI.showMessage('Conta deletada com sucesso.', 'success');
    setTimeout(() => {
      window.location.href = '/inicio';
    }, 2000);
  } catch (error: any) {
    AppUI.showMessage(
      error.message || 'Erro ao deletar conta',
      'error',
    );
  }
}

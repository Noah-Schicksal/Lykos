import { Auth } from '../../modules/auth.js';
import { AppUI } from '../../utils/ui.js';

/**
 * Sets up all authentication handlers
 * Works with existing HTML elements in index.html
 */
export function setupAuthHandlers(): void {
  setupLoginForm();
  setupRegisterForm();
  setupLogoutButtons();
  setupProfileButtons();
  setupCardFlip();
  setupPasswordToggles();
  setupAuthCardTrigger();
  setupMenuButtonVisibility();
}

function setupLoginForm(): void {
  const form = document.getElementById('login-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (document.getElementById('login-email') as HTMLInputElement)
      ?.value;
    const password = (
      document.getElementById('login-password') as HTMLInputElement
    )?.value;

    if (!email || !password) {
      AppUI.showMessage('Preencha todos os campos', 'error');
      return;
    }

    // Auth.login handles everything internally and dispatches auth-login event
    await Auth.login(email, password);
  });
}

function setupRegisterForm(): void {
  const form = document.getElementById('register-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = (document.getElementById('register-name') as HTMLInputElement)
      ?.value;
    const email = (
      document.getElementById('register-email') as HTMLInputElement
    )?.value;
    const password = (
      document.getElementById('register-password') as HTMLInputElement
    )?.value;
    const confirm = (
      document.getElementById('register-confirm') as HTMLInputElement
    )?.value;
    const roleSelect = document.getElementById(
      'register-role',
    ) as HTMLSelectElement;
    const role = roleSelect?.value === 'instructor' ? 'INSTRUCTOR' : 'STUDENT';

    if (!name || !email || !password) {
      AppUI.showMessage('Preencha todos os campos', 'error');
      return;
    }

    if (password !== confirm) {
      AppUI.showMessage('As senhas não coincidem', 'error');
      return;
    }

    try {
      const response = await AppUI.apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      if (response) {
        AppUI.showMessage('Conta criada com sucesso! Faça login.', 'success');

        // Flip back to login
        const cardInner = document.getElementById('auth-card');
        cardInner?.classList.remove('flipped');

        // Clear form
        (document.getElementById('register-name') as HTMLInputElement).value =
          '';
        (document.getElementById('register-email') as HTMLInputElement).value =
          '';
        (
          document.getElementById('register-password') as HTMLInputElement
        ).value = '';
        (
          document.getElementById('register-confirm') as HTMLInputElement
        ).value = '';
      }
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao criar conta', 'error');
    }
  });
}

function setupLogoutButtons(): void {
  const logoutButtons = ['btn-logout', 'dropdown-logout', 'drawer-logout'];

  logoutButtons.forEach((id) => {
    document.getElementById(id)?.addEventListener('click', async () => {
      await Auth.logout();
    });
  });
}

function setupProfileButtons(): void {
  // View profile
  document.getElementById('btn-view-profile')?.addEventListener('click', () => {
    Auth.showProfileView();
  });

  document.getElementById('dropdown-profile')?.addEventListener('click', () => {
    const authContainer = document.getElementById('auth-card-container');
    authContainer?.classList.add('show');
    Auth.showProfileView();
  });

  // Back from profile
  document
    .getElementById('btn-back-from-profile')
    ?.addEventListener('click', () => {
      Auth.updateAuthUI();
    });

  // Edit profile
  document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
    Auth.showProfileEdit();
  });

  // Back from edit
  document
    .getElementById('btn-back-from-edit')
    ?.addEventListener('click', () => {
      Auth.showProfileView();
    });

  document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
    Auth.showProfileView();
  });

  // Profile edit form
  setupProfileEditForm();

  // Delete account
  document
    .getElementById('btn-delete-account')
    ?.addEventListener('click', async () => {
      await Auth.deleteUserAccount();
    });

  // My learning
  document.getElementById('btn-my-learning')?.addEventListener('click', () => {
    window.location.href = '/estudante';
  });
}

function setupProfileEditForm(): void {
  const form = document.getElementById('profile-edit-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = (document.getElementById('edit-name') as HTMLInputElement)
      ?.value;
    const email = (document.getElementById('edit-email') as HTMLInputElement)
      ?.value;
    const password = (
      document.getElementById('edit-password') as HTMLInputElement
    )?.value;

    const updateData: { name?: string; email?: string; password?: string } = {};
    if (name?.trim()) updateData.name = name.trim();
    if (email?.trim()) updateData.email = email.trim();
    if (password?.trim()) updateData.password = password.trim();

    try {
      await Auth.updateUserProfile(updateData);
      Auth.showProfileView();
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao atualizar perfil', 'error');
    }
  });
}

function setupCardFlip(): void {
  document.getElementById('btn-to-register')?.addEventListener('click', () => {
    const cardInner = document.getElementById('auth-card');
    cardInner?.classList.add('flipped');
  });

  document.getElementById('btn-to-login')?.addEventListener('click', () => {
    const cardInner = document.getElementById('auth-card');
    cardInner?.classList.remove('flipped');
  });
}

function setupPasswordToggles(): void {
  document.querySelectorAll('.btn-toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (targetId) {
        const input = document.getElementById(targetId) as HTMLInputElement;
        const iconEl = btn.querySelector('.material-symbols-outlined');
        if (input && iconEl) {
          if (input.type === 'password') {
            input.type = 'text';
            iconEl.textContent = 'visibility_off';
          } else {
            input.type = 'password';
            iconEl.textContent = 'visibility';
          }
        }
      }
    });
  });
}

function setupAuthCardTrigger(): void {
  const avatarBtn = document.getElementById('user-avatar-btn');
  const authContainer = document.getElementById('auth-card-container');

  avatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    authContainer?.classList.toggle('show');
  });

  // Close auth card on overlay click
  authContainer?.addEventListener('click', (e) => {
    if (e.target === authContainer) {
      authContainer.classList.remove('show');
    }
  });
}

/**
 * Sets up visibility listeners for menu buttons
 */
function setupMenuButtonVisibility(): void {
  updateMenuButtonVisibility();

  window.addEventListener('auth-login', updateMenuButtonVisibility);
  window.addEventListener('auth-logout', updateMenuButtonVisibility);
}

function updateMenuButtonVisibility(): void {
  const user = localStorage.getItem('auth_user');
  const openDrawerBtn = document.getElementById('open-drawer-btn');
  const avatarBtn = document.getElementById('user-avatar-btn');
  const userInfoBtn = document.getElementById('user-info-btn');

  // Show drawer button only when logged in
  if (openDrawerBtn) {
    if (user) {
      openDrawerBtn.classList.remove('hidden');
    } else {
      openDrawerBtn.classList.add('hidden');
    }
  }

  // Show login button only when NOT logged in
  if (avatarBtn) {
    if (user) {
      avatarBtn.classList.add('hidden');
    } else {
      avatarBtn.classList.remove('hidden');
    }
  }

  // Show user info button only when logged in
  if (userInfoBtn) {
    if (user) {
      userInfoBtn.classList.remove('hidden');
      // Update role display
      try {
        const userData = JSON.parse(user);
        const displayName = document.getElementById('user-display-name');
        if (displayName) {
          const roleMap: { [key: string]: string } = {
            INSTRUCTOR: 'Instrutor',
            STUDENT: 'Estudante',
            ADMIN: 'Admin',
            instructor: 'Instrutor',
            student: 'Estudante',
            admin: 'Admin',
          };
          const role = userData.role || 'STUDENT';
          displayName.textContent = roleMap[role] || 'Usuário';
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      userInfoBtn.classList.add('hidden');
    }
  }
}

/**
 * Checks and initializes user state on page load
 */
export async function checkAuthState(): Promise<void> {
  try {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      // User is already logged in, update UI
      Auth.updateAuthUI();
      updateMenuButtonVisibility();
    }
  } catch (error) {
    console.error('Error checking auth state:', error);
  }
}

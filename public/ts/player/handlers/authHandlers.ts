/**
 * Auth Handlers for Player - Navigation, drawer, login/logout
 */

import { Auth } from '../../modules/auth.js';
import { Cart } from '../../modules/cart.js';
import { Categories } from '../../modules/categories.js';
import { AppUI } from '../../utils/ui.js';

/**
 * Setup all navigation and auth handlers
 */
export function setupAuthHandlers(): void {
  setupPasswordToggles();
  setupAuthCardAndDrawer();
  setupAuthForms();
  setupProfileButtons();
  setupDrawerAccordions();
}

/**
 * Password toggle buttons
 */
function setupPasswordToggles(): void {
  document.querySelectorAll('.btn-toggle-password').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;

      const input = document.getElementById(targetId) as HTMLInputElement;
      const icon = btn.querySelector('.material-symbols-outlined');

      if (!input || !icon) return;

      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
      } else {
        input.type = 'password';
        icon.textContent = 'visibility';
      }
    });
  });
}

/**
 * Auth card and drawer logic
 */
function setupAuthCardAndDrawer(): void {
  const avatarBtn = document.getElementById('user-avatar-btn');
  const userInfoBtn = document.getElementById('user-info-btn');
  const authContainer = document.getElementById('auth-card-container');
  const cardInner = document.getElementById('auth-card');
  const btnToRegister = document.getElementById('btn-to-register');
  const btnToLogin = document.getElementById('btn-to-login');

  // Drawer Elements
  const userDrawer = document.getElementById('user-drawer');
  const openDrawerBtn = document.getElementById('open-drawer-btn');
  const menuDrawerBtn = document.getElementById('menu-drawer-btn');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const drawerLogoutBtn = document.getElementById('drawer-logout');

  const openDrawer = () => {
    updateDrawerUserInfo();
    userDrawer?.classList.add('show');
    document.body.classList.add('drawer-open');
    openDrawerBtn?.classList.add('hidden');
    drawerOverlay?.classList.add('show');
    if (menuDrawerBtn) {
      const icon = menuDrawerBtn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = 'close';
    }
  };

  const closeDrawer = () => {
    userDrawer?.classList.remove('show');
    document.body.classList.remove('drawer-open');
    drawerOverlay?.classList.remove('show');
    const user = localStorage.getItem('auth_user');
    if (user && openDrawerBtn) {
      openDrawerBtn.classList.remove('hidden');
    }
    if (menuDrawerBtn) {
      const icon = menuDrawerBtn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = 'menu';
    }
  };

  // Event Listeners
  if (avatarBtn && authContainer) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      authContainer.classList.toggle('show');
      closeDrawer();
    });
  }

  if (openDrawerBtn && userDrawer) {
    openDrawerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDrawer();
      authContainer?.classList.remove('show');
    });
  }

  if (menuDrawerBtn && userDrawer) {
    menuDrawerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', () => closeDrawer());
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (
      authContainer?.classList.contains('show') &&
      !authContainer.contains(e.target as Node) &&
      !avatarBtn?.contains(e.target as Node)
    ) {
      authContainer.classList.remove('show');
    }

    if (
      userDrawer?.classList.contains('show') &&
      !userDrawer.contains(e.target as Node) &&
      !openDrawerBtn?.contains(e.target as Node)
    ) {
      closeDrawer();
    }
  });

  // Visibility update
  const updateMenuButtonVisibility = () => {
    const user = localStorage.getItem('auth_user');

    if (openDrawerBtn) {
      if (user && !userDrawer?.classList.contains('show'))
        openDrawerBtn.classList.remove('hidden');
      else openDrawerBtn.classList.add('hidden');
    }

    if (avatarBtn) {
      if (user) avatarBtn.classList.add('hidden');
      else avatarBtn.classList.remove('hidden');
    }

    if (userInfoBtn) {
      if (user) {
        userInfoBtn.classList.remove('hidden');
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
        } catch (e) {}
      } else {
        userInfoBtn.classList.add('hidden');
      }
    }
  };

  updateMenuButtonVisibility();
  window.addEventListener('auth-login', updateMenuButtonVisibility);
  window.addEventListener('auth-logout', () => {
    updateMenuButtonVisibility();
    closeDrawer();
  });

  // Drawer logout
  if (drawerLogoutBtn) {
    drawerLogoutBtn.addEventListener('click', async () => {
      await Auth.logout();
      closeDrawer();
    });
  }

  // Auth Flip
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
}

/**
 * Setup auth forms
 */
function setupAuthForms(): void {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const cardInner = document.getElementById('auth-card');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement)
        .value;
      const pass = (
        document.getElementById('login-password') as HTMLInputElement
      ).value;
      await Auth.login(email, pass);
      Cart.updateBadge();
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (
        document.getElementById('register-name') as HTMLInputElement
      ).value;
      const email = (
        document.getElementById('register-email') as HTMLInputElement
      ).value;
      const pass = (
        document.getElementById('register-password') as HTMLInputElement
      ).value;
      const confirm = (
        document.getElementById('register-confirm') as HTMLInputElement
      ).value;
      const role = (
        document.getElementById('register-role') as HTMLSelectElement
      ).value;

      if (pass !== confirm) {
        AppUI.showMessage('Senhas não conferem', 'error');
        return;
      }
      try {
        const endpoint =
          role === 'instructor'
            ? '/auth/register/instructor'
            : '/auth/register/student';
        await AppUI.apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ name, email, password: pass }),
        });
        AppUI.showMessage('Conta criada! Faça Login.', 'success');
        (regForm as HTMLFormElement).reset();
        cardInner?.classList.remove('flipped');
      } catch (err: any) {
        AppUI.showMessage(err.message || 'Erro', 'error');
      }
    });
  }
}

/**
 * Setup profile buttons
 */
function setupProfileButtons(): void {
  const btnViewProfile = document.getElementById('btn-view-profile');
  const btnLogout = document.getElementById('btn-logout');
  const btnMyLearning = document.getElementById('btn-my-learning');
  const drawerEditProfileBtn = document.getElementById('drawer-edit-profile');
  const drawerCancelEdit = document.getElementById('drawer-cancel-edit');
  const drawerDeleteAccountBtn = document.getElementById(
    'drawer-delete-account',
  );

  if (btnViewProfile)
    btnViewProfile.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.showProfileView();
    });
  if (btnLogout)
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
      Cart.updateBadge();
    });
  if (btnMyLearning)
    btnMyLearning.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/estudante';
    });

  // Edit Profile Toggle in Drawer
  if (drawerEditProfileBtn) {
    drawerEditProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const viewMode = document.getElementById('drawer-profile-view');
      const editMode = document.getElementById('drawer-profile-edit');
      if (viewMode && editMode) {
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
        // Pre-fill
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const n = document.getElementById('edit-name') as HTMLInputElement;
          const em = document.getElementById('edit-email') as HTMLInputElement;
          if (n) n.value = user.name || '';
          if (em) em.value = user.email || '';
        }
      }
    });
  }

  if (drawerCancelEdit) {
    drawerCancelEdit.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      document
        .getElementById('drawer-profile-view')
        ?.classList.remove('hidden');
      document.getElementById('drawer-profile-edit')?.classList.add('hidden');
    });
  }

  if (drawerDeleteAccountBtn) {
    drawerDeleteAccountBtn.addEventListener('click', async () => {
      await Auth.deleteUserAccount();
    });
  }
}

/**
 * Setup drawer accordions
 */
function setupDrawerAccordions(): void {
  const drawerProfileToggle = document.getElementById('drawer-profile-toggle');
  const drawerProfilePanel = document.getElementById('drawer-profile-panel');
  const drawerCategoriesToggle = document.getElementById(
    'drawer-categories-toggle',
  );
  const drawerCategoriesPanel = document.getElementById(
    'drawer-categories-panel',
  );

  if (drawerProfileToggle && drawerProfilePanel) {
    drawerProfileToggle.addEventListener('click', () => {
      drawerProfileToggle.classList.toggle('expanded');
      drawerProfilePanel.classList.toggle('expanded');
    });
  }

  if (drawerCategoriesToggle && drawerCategoriesPanel) {
    drawerCategoriesToggle.addEventListener('click', () => {
      drawerCategoriesToggle.classList.toggle('expanded');
      drawerCategoriesPanel.classList.toggle('expanded');
      if (drawerCategoriesPanel.classList.contains('expanded')) {
        Categories.renderCategoriesList('categories-list');
      }
    });
  }
}

/**
 * Update drawer user info
 */
export function updateDrawerUserInfo(): void {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return;
  try {
    const user = JSON.parse(userStr);
    const dName = document.getElementById('drawer-user-name');
    const dEmail = document.getElementById('drawer-user-email');
    const dRole = document.getElementById('drawer-user-role');
    const drawerManagementSection = document.getElementById(
      'drawer-management-section',
    );

    if (dName) dName.textContent = user.name || 'Usuário';
    if (dEmail) dEmail.textContent = user.email || '';
    const role = (user.role || '').toLowerCase();
    if (dRole)
      dRole.textContent = role === 'instructor' ? 'Professor' : 'Aluno';

    if (drawerManagementSection) {
      if (role === 'instructor' || role === 'admin')
        drawerManagementSection.classList.remove('hidden');
      else drawerManagementSection.classList.add('hidden');
    }
  } catch (e) {}
}

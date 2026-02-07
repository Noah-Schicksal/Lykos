import { Categories } from '../../modules/categories.js';
import { Auth } from '../../modules/auth.js';
import { AppUI } from '../../utils/ui.js';

/**
 * Sets up all drawer handlers
 * Works with existing HTML elements in index.html
 */
export function setupDrawerHandlers(): void {
  setupDrawerToggle();
  setupDrawerAccordions();
  setupDrawerProfileEdit();
  setupDrawerDeleteAccount();
  setupCategoryForm();

  // Load categories when drawer is opened
  window.addEventListener('auth-login', () => {
    updateDrawerUserInfo();
  });

  window.addEventListener('auth-logout', () => {
    closeDrawer();
  });
}

function setupDrawerToggle(): void {
  const openDrawerBtn = document.getElementById('open-drawer-btn');
  const menuDrawerBtn = document.getElementById('menu-drawer-btn');
  const userDrawer = document.getElementById('user-drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');

  openDrawerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openDrawer();
  });

  menuDrawerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDrawer();
  });

  drawerOverlay?.addEventListener('click', () => {
    closeDrawer();
  });

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (
      userDrawer?.classList.contains('show') &&
      !userDrawer.contains(e.target as Node) &&
      !openDrawerBtn?.contains(e.target as Node)
    ) {
      closeDrawer();
    }
  });
}

function openDrawer(): void {
  const userDrawer = document.getElementById('user-drawer');
  const openDrawerBtn = document.getElementById('open-drawer-btn');
  const menuDrawerBtn = document.getElementById('menu-drawer-btn');
  const drawerOverlay = document.querySelector('.drawer-overlay');

  updateDrawerUserInfo();
  userDrawer?.classList.add('show');
  document.body.classList.add('drawer-open');
  openDrawerBtn?.classList.add('hidden');
  drawerOverlay?.classList.add('show');

  // Animate Icon to Close
  if (menuDrawerBtn) {
    const icon = menuDrawerBtn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'close';
  }
}

function closeDrawer(): void {
  const userDrawer = document.getElementById('user-drawer');
  const openDrawerBtn = document.getElementById('open-drawer-btn');
  const menuDrawerBtn = document.getElementById('menu-drawer-btn');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const drawerProfileToggle = document.getElementById('drawer-profile-toggle');
  const drawerProfilePanel = document.getElementById('drawer-profile-panel');

  userDrawer?.classList.remove('show');
  document.body.classList.remove('drawer-open');
  drawerOverlay?.classList.remove('show');

  // Show open button if logged in
  const user = localStorage.getItem('auth_user');
  if (user && openDrawerBtn) {
    openDrawerBtn.classList.remove('hidden');
  }

  // Revert Icon to Menu
  if (menuDrawerBtn) {
    const icon = menuDrawerBtn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'menu';
  }

  // Reset accordions
  drawerProfileToggle?.classList.remove('expanded');
  drawerProfilePanel?.classList.remove('expanded');
}

function setupDrawerAccordions(): void {
  const drawerProfileToggle = document.getElementById('drawer-profile-toggle');
  const drawerProfilePanel = document.getElementById('drawer-profile-panel');
  const drawerCategoriesToggle = document.getElementById(
    'drawer-categories-toggle',
  );
  const drawerCategoriesPanel = document.getElementById(
    'drawer-categories-panel',
  );

  drawerProfileToggle?.addEventListener('click', () => {
    drawerProfileToggle.classList.toggle('expanded');
    drawerProfilePanel?.classList.toggle('expanded');
  });

  drawerCategoriesToggle?.addEventListener('click', () => {
    drawerCategoriesToggle.classList.toggle('expanded');
    drawerCategoriesPanel?.classList.toggle('expanded');

    if (drawerCategoriesPanel?.classList.contains('expanded')) {
      Categories.renderCategoriesList('categories-list');
    }
  });
}

function setupDrawerProfileEdit(): void {
  const editBtn = document.getElementById('drawer-edit-profile');
  const cancelBtn = document.getElementById('drawer-cancel-edit');
  const logoutBtn = document.getElementById('drawer-logout');
  const profileView = document.getElementById('drawer-profile-view');
  const profileEdit = document.getElementById('drawer-profile-edit');
  const form = document.getElementById(
    'drawer-profile-edit-form',
  ) as HTMLFormElement;

  editBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Pre-fill form
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const nameInput = document.getElementById(
          'edit-name',
        ) as HTMLInputElement;
        const emailInput = document.getElementById(
          'edit-email',
        ) as HTMLInputElement;

        if (nameInput) nameInput.value = user.name || '';
        if (emailInput) emailInput.value = user.email || '';
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }

    profileView?.classList.add('hidden');
    profileEdit?.classList.remove('hidden');
  });

  cancelBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    profileEdit?.classList.add('hidden');
    profileView?.classList.remove('hidden');
  });

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
      profileEdit?.classList.add('hidden');
      profileView?.classList.remove('hidden');
      updateDrawerUserInfo();
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao atualizar perfil', 'error');
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    await Auth.logout();
    closeDrawer();
  });
}

function setupDrawerDeleteAccount(): void {
  document
    .getElementById('drawer-delete-account')
    ?.addEventListener('click', async () => {
      const success = await Auth.deleteUserAccount();
      if (success) {
        closeDrawer();
      }
    });
}

function setupCategoryForm(): void {
  const form = document.getElementById(
    'category-create-form',
  ) as HTMLFormElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = document.getElementById(
      'new-category-name',
    ) as HTMLInputElement;
    const name = input?.value.trim();

    if (!name) {
      AppUI.showMessage('Digite o nome da categoria', 'error');
      return;
    }

    try {
      await Categories.create(name);
      input.value = '';
      Categories.renderCategoriesList('categories-list');
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao criar categoria', 'error');
    }
  });
}

function updateDrawerUserInfo(): void {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return;

  try {
    const user = JSON.parse(userStr);
    const drawerName = document.getElementById('drawer-user-name');
    const drawerEmail = document.getElementById('drawer-user-email');
    const drawerRole = document.getElementById('drawer-user-role');
    const drawerManagementSection = document.getElementById(
      'drawer-management-section',
    );

    const userRole = (user.role || '').toLowerCase();

    if (drawerName) drawerName.textContent = user.name || 'Usuário';
    if (drawerEmail) drawerEmail.textContent = user.email || '';
    if (drawerRole)
      drawerRole.textContent =
        userRole === 'instructor' ? 'Professor' : 'Aluno';

    // Show management section for instructors
    if (drawerManagementSection) {
      if (userRole === 'instructor' || userRole === 'admin') {
        drawerManagementSection.classList.remove('hidden');
      } else {
        drawerManagementSection.classList.add('hidden');
      }
    }
  } catch (e) {
    console.error('Error parsing user data for drawer:', e);
  }
}

/**
 * Auth Handlers for Admin - Dropdown, logout, access check
 */

import { Auth } from '../../modules/auth.js';

/**
 * Setup auth handlers
 */
export function setupAuthHandlers(): void {
  const userDropdownMenu = document.getElementById('user-dropdown-menu');
  const userAvatarBtn = document.getElementById('user-avatar-btn');
  const btnLogout = document.getElementById('dropdown-logout');

  // Dropdown toggle
  if (userAvatarBtn && userDropdownMenu) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdownMenu.classList.toggle('show');
      userAvatarBtn.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      userDropdownMenu.classList.remove('show');
      userAvatarBtn.classList.remove('open');
    });
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await Auth.logout();
      window.location.href = '/';
    });
  }
}

/**
 * Check admin access - redirect if not admin
 */
export function checkAdminAccess(): void {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) {
    window.location.href = '/student-login.html';
    return;
  }
  const user = JSON.parse(userStr);
  if (user.role !== 'ADMIN') {
    window.location.href = '/index.html';
  }
}

/**
 * Render user profile in header
 */
export function renderUserProfile(): void {
  const headerUserRole = document.getElementById('header-user-role');
  const userStr = localStorage.getItem('auth_user');
  if (userStr && headerUserRole) {
    const user = JSON.parse(userStr);
    headerUserRole.textContent =
      user.role === 'ADMIN' ? 'Administrador' : user.role;
  }
}

/**
 * Auth Module
 */
import { AppUI } from '../utils/ui.js';

// Flag to prevent duplicate session expiration notifications
let sessionExpiredHandled = false;
let sessionTimeoutId: number | null = null;

// Helper to decode JWT locally
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const pad = base64.length % 4;
    const padding = pad ? new Array(5 - pad).join('=') : '';

    const jsonPayload = decodeURIComponent(
      window
        .atob(base64 + padding)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

export const Auth = {
  init: () => {
    window.addEventListener('session-expired', () => {
      // Prevent duplicate toast notifications
      if (sessionExpiredHandled) {
        console.log(
          '[Auth] Session expired already handled, ignoring duplicate event',
        );
        return;
      }

      sessionExpiredHandled = true;
      console.log('[Auth] Session expired event received');

      // Clear data but don't call backend logout (token is already invalid)
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_expiration');

      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        sessionTimeoutId = null;
      }

      Auth.updateAuthUI();

      // Trigger global logout event to update other UI components (like navbar)
      window.dispatchEvent(new CustomEvent('auth-logout'));

      // Show auth card and show message
      const authContainer = document.getElementById('auth-card-container');
      if (authContainer) {
        authContainer.classList.add('show');
        // Reset to login face
        const cardInner = document.getElementById('auth-card');
        if (cardInner) {
          cardInner.classList.remove('flipped');
        }
      }

      AppUI.showMessage('Sua sessão expirou. Faça login novamente.', 'info');

      // Immediate redirection to home if on admin page or other restricted areas
      const isRestricted = window.location.pathname.includes('admin.html') ||
        window.location.pathname.includes('student.html');

      if (isRestricted) {
        setTimeout(() => {
          window.location.href = '/';
        }, 1500); // Small delay to allow toast to be visible
      }

      // Reset flag after 2 seconds to allow re-login
      setTimeout(() => {
        sessionExpiredHandled = false;
      }, 2000);
    });

    // Check for existing session expiration
    const expiryStr = localStorage.getItem('auth_expiration');
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      const now = Date.now();

      if (now >= expiry) {
        console.log('[Auth] Found expired session on init');
        // Trigger immediately
        window.dispatchEvent(new CustomEvent('session-expired'));
      } else {
        console.log(`[Auth] Scheduling session expiry in ${(expiry - now) / 1000}s`);
        Auth.scheduleSessionExpiration(expiry);
      }
    }
  },

  scheduleSessionExpiration: (expiryTimestamp: number) => {
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }

    const now = Date.now();
    const delay = expiryTimestamp - now;

    console.log(
      `[Auth] Scheduling expiration. Now: ${now}, Expiry: ${expiryTimestamp}, DelayMs: ${delay}`,
    );

    if (delay <= 0) {
      window.dispatchEvent(new CustomEvent('session-expired'));
      return;
    }

    // Set timeout to trigger event
    sessionTimeoutId = window.setTimeout(() => {
      console.log('[Auth] Auto-expiring session via timer');
      window.dispatchEvent(new CustomEvent('session-expired'));
    }, delay);
  },

  login: async (email: string, password: string) => {
    try {
      const response = await AppUI.apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('auth_user', JSON.stringify(user));

        // Parse token to get expiration
        if (token) {
          const decoded = parseJwt(token);
          if (decoded && decoded.exp) {
            const expMs = decoded.exp * 1000;
            localStorage.setItem('auth_expiration', expMs.toString());
            Auth.scheduleSessionExpiration(expMs);
          }
        }

        if (user.role === 'ADMIN') {
          window.location.href = '/admin.html';
          return;
        }

        Auth.updateAuthUI();
        AppUI.showMessage('Login realizado com sucesso!', 'success');
        window.dispatchEvent(new CustomEvent('auth-login'));

        setTimeout(() => {
          const authContainer = document.getElementById('auth-card-container');
          if (authContainer) authContainer.classList.remove('show');
        }, 800);
      } else {
        throw new Error('Resposta de login inválida');
      }
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Falha no login', 'error');
    }
  },

  logout: async () => {
    try {
      await AppUI.apiFetch('/auth/logout', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_expiration');

      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        sessionTimeoutId = null;
      }

      Auth.updateAuthUI();
      AppUI.showMessage('Você saiu da conta.', 'info');
      window.dispatchEvent(new CustomEvent('auth-logout'));

      const authContainer = document.getElementById('auth-card-container');
      if (authContainer) authContainer.classList.remove('show');
    }
  },

  getUserProfile: async () => {
    try {
      const response = await AppUI.apiFetch('/users/me', {
        method: 'GET',
      });

      if (response) {
        const userData = response.id ? response : response.data || response;
        localStorage.setItem('auth_user', JSON.stringify(userData));
        Auth.updateAuthUI();
        return userData;
      }
      return null;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao buscar perfil', 'error');
      throw error;
    }
  },

  updateUserProfile: async (data: {
    name?: string;
    email?: string;
    password?: string;
  }) => {
    try {
      const updateData: any = {};
      if (data.name?.trim()) updateData.name = data.name.trim();
      if (data.email?.trim()) updateData.email = data.email.trim();
      if (data.password?.trim()) updateData.password = data.password.trim();

      const response = await AppUI.apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response && response.data) {
        localStorage.setItem('auth_user', JSON.stringify(response.data));
        Auth.updateAuthUI();
        AppUI.showMessage(
          response.message || 'Perfil atualizado com sucesso!',
          'success',
        );
        return response.data;
      }
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao atualizar perfil', 'error');
      throw error;
    }
  },

  deleteUserAccount: async () => {
    const confirmed = await AppUI.promptModal(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
    );

    if (!confirmed) return false;

    try {
      await AppUI.apiFetch('/users/me', {
        method: 'DELETE',
      });

      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_expiration');

      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        sessionTimeoutId = null;
      }

      const authContainer = document.getElementById('auth-card-container');
      if (authContainer) authContainer.classList.remove('show');

      Auth.updateAuthUI();
      AppUI.showMessage('Conta excluída com sucesso.', 'success');
      return true;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao excluir conta', 'error');
      return false;
    }
  },

  updateAuthUI: () => {
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;

    const cardInner = document.getElementById('auth-card');
    const loginFace = cardInner?.querySelector(
      '.auth-face:not(.auth-face-back):not(#auth-logged-in):not(#auth-profile-view):not(#auth-profile-edit):not(#auth-categories-view)',
    ) as HTMLElement;
    const loggedInFace = document.getElementById('auth-logged-in');
    const profileViewFace = document.getElementById('auth-profile-view');
    const profileEditFace = document.getElementById('auth-profile-edit');
    const categoriesViewFace = document.getElementById('auth-categories-view');
    const registerFace = cardInner?.querySelector('.auth-face-back') as HTMLElement;
    const userAvatarBtn = document.getElementById('user-avatar-btn');

    if (user && loggedInFace) {
      if (loginFace) loginFace.classList.add('hidden');
      if (registerFace) registerFace.classList.add('hidden');
      loggedInFace.classList.remove('hidden');
      if (profileViewFace) profileViewFace.classList.add('hidden');
      if (profileEditFace) profileEditFace.classList.add('hidden');
      if (categoriesViewFace) categoriesViewFace.classList.add('hidden');

      cardInner?.classList.remove('flipped');

      const nameDisplay = document.getElementById('user-name-display');
      const emailDisplay = document.getElementById('user-email-display');
      const roleBadge = document.getElementById('user-role-badge');
      const userRole = user.role ? user.role.toLowerCase() : '';

      if (nameDisplay) nameDisplay.textContent = user.name;
      if (emailDisplay) emailDisplay.textContent = user.email;
      if (roleBadge) {
        roleBadge.textContent = userRole === 'instructor' ? 'Instrutor' : 'Aluno';
        roleBadge.className = `badge-tag ${userRole === 'instructor' ? 'bg-tag-primary' : 'bg-tag-secondary'
          }`;
        roleBadge.style.display = 'inline-block';
        roleBadge.style.marginBottom = '2rem';
      }

      const btnInstructor = document.getElementById('btn-instructor-dash');
      const btnCreateCourse = document.getElementById('btn-create-course');
      const btnManageCategories = document.getElementById('btn-manage-categories');

      if (userRole === 'instructor') {
        if (btnInstructor) btnInstructor.classList.remove('hidden');
        if (btnCreateCourse) btnCreateCourse.classList.remove('hidden');
        if (btnManageCategories) btnManageCategories.classList.remove('hidden');
      } else {
        if (btnInstructor) btnInstructor.classList.add('hidden');
        if (btnCreateCourse) btnCreateCourse.classList.add('hidden');
        if (btnManageCategories) btnManageCategories.classList.add('hidden');
      }
    } else if (loggedInFace) {
      if (loginFace) loginFace.classList.remove('hidden');
      loggedInFace.classList.add('hidden');
      if (profileViewFace) profileViewFace.classList.add('hidden');
      if (profileEditFace) profileEditFace.classList.add('hidden');
      if (categoriesViewFace) categoriesViewFace.classList.add('hidden');
      if (registerFace) registerFace.classList.remove('hidden');
    }
  },

  showProfileView: () => {
    const loggedInFace = document.getElementById('auth-logged-in');
    const profileViewFace = document.getElementById('auth-profile-view');
    const profileEditFace = document.getElementById('auth-profile-edit');

    if (loggedInFace) loggedInFace.classList.add('hidden');
    if (profileEditFace) profileEditFace.classList.add('hidden');
    if (profileViewFace) profileViewFace.classList.remove('hidden');

    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (user) {
      const nameEl = document.getElementById('profile-name-display');
      const emailEl = document.getElementById('profile-email-display');
      const roleEl = document.getElementById('profile-role-display');

      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      if (roleEl) roleEl.textContent = user.role === 'INSTRUCTOR' ? 'Instrutor' : 'Aluno';
    }
  },

  showProfileEdit: () => {
    const loggedInFace = document.getElementById('auth-logged-in');
    const profileViewFace = document.getElementById('auth-profile-view');
    const profileEditFace = document.getElementById('auth-profile-edit');

    if (loggedInFace) loggedInFace.classList.add('hidden');
    if (profileViewFace) profileViewFace.classList.add('hidden');
    if (profileEditFace) profileEditFace.classList.remove('hidden');

    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (user) {
      const nameInput = document.getElementById('edit-name') as HTMLInputElement;
      const emailInput = document.getElementById('edit-email') as HTMLInputElement;
      const passwordInput = document.getElementById('edit-password') as HTMLInputElement;

      if (nameInput) nameInput.value = user.name || '';
      if (emailInput) emailInput.value = user.email || '';
      if (passwordInput) passwordInput.value = '';
    }
  },

  showCategoriesView: () => {
    const loggedInFace = document.getElementById('auth-logged-in');
    const profileViewFace = document.getElementById('auth-profile-view');
    const profileEditFace = document.getElementById('auth-profile-edit');
    const categoriesViewFace = document.getElementById('auth-categories-view');

    if (loggedInFace) loggedInFace.classList.add('hidden');
    if (profileViewFace) profileViewFace.classList.add('hidden');
    if (profileEditFace) profileEditFace.classList.add('hidden');
    if (categoriesViewFace) categoriesViewFace.classList.remove('hidden');

    window.dispatchEvent(new CustomEvent('load-categories'));
  },
};

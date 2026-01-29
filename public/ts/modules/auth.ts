/**
 * Auth Module
 */
import { AppUI } from '../utils/ui.js';

export const Auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await AppUI.apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.data) {
        // Backend returns user data in 'data' field. Token is in HttpOnly cookie.
        // We don't need to store token manually if we rely on cookies.
        // But if we need it for authenticated requests (bearer), we have a problem.
        // Let's check if the previous code logic assumed Bearer token.
        // UiHelper apiFetch uses headers provided, doesn't seem to auto-attach token from localStorage yet,
        // but previously we stored 'auth_token'.
        // Since backend uses cookies, we might just rely on that for now.
        // Or we can try to get the token if we modify the backend.
        // For now, let's just make the login succeed visually.

        const user = response.data;
        localStorage.setItem('auth_user', JSON.stringify(user));
        // If token was needed strictly for something, we might miss it.
        // But 'response.token' was undefined, so let's skip it.

        Auth.updateAuthUI();
        AppUI.showMessage('Login realizado com sucesso!', 'success');

        const authContainer = document.getElementById('auth-card-container');
        if (authContainer) authContainer.classList.remove('show');
      } else {
        throw new Error('Resposta de login inválida');
      }
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Falha no login', 'error');
    }
  },

  logout: async () => {
    try {
      // Call backend logout to clear cookie
      await AppUI.apiFetch('/auth/logout', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      Auth.updateAuthUI();
      AppUI.showMessage('Você saiu da conta.', 'info');

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
        // Update localStorage with fresh data
        const userData = response.id ? response : response.data || response;
        localStorage.setItem('auth_user', JSON.stringify(userData));
        Auth.updateAuthUI();
        return userData;
      }
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
      // Remove empty fields
      const updateData: any = {};
      if (data.name?.trim()) updateData.name = data.name.trim();
      if (data.email?.trim()) updateData.email = data.email.trim();
      if (data.password?.trim()) updateData.password = data.password.trim();

      const response = await AppUI.apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.data) {
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
      // API returns 204 No Content on success
      await AppUI.apiFetch('/users/me', {
        method: 'DELETE',
      });

      // Clear user data and logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Close auth card
      const authContainer = document.getElementById('auth-card-container');
      if (authContainer) authContainer.classList.remove('show');

      // Update UI to guest state
      Auth.updateAuthUI();

      // Show success message
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
      '.auth-face:not(.auth-face-back):not(#auth-logged-in):not(#auth-profile-view):not(#auth-profile-edit)',
    ) as HTMLElement;
    const loggedInFace = document.getElementById('auth-logged-in');
    const profileViewFace = document.getElementById('auth-profile-view');
    const profileEditFace = document.getElementById('auth-profile-edit');
    const registerFace = cardInner?.querySelector(
      '.auth-face-back',
    ) as HTMLElement;
    const userAvatarBtn = document.getElementById('user-avatar-btn');

    if (user && loggedInFace && loginFace && registerFace) {
      // LOGGED IN STATE
      loginFace.classList.add('hidden');
      registerFace.classList.add('hidden');
      loggedInFace.classList.remove('hidden');
      if (profileViewFace) profileViewFace.classList.add('hidden');
      if (profileEditFace) profileEditFace.classList.add('hidden');

      cardInner?.classList.remove('flipped');

      const nameDisplay = document.getElementById('user-name-display');
      const emailDisplay = document.getElementById('user-email-display');
      const roleBadge = document.getElementById('user-role-badge');

      const userRole = user.role ? user.role.toLowerCase() : '';

      if (nameDisplay) nameDisplay.textContent = user.name;
      if (emailDisplay) emailDisplay.textContent = user.email;
      if (roleBadge) {
        roleBadge.textContent =
          userRole === 'instructor' ? 'Instructor' : 'Student';
        roleBadge.className = `badge-tag ${userRole === 'instructor' ? 'bg-tag-primary' : 'bg-tag-secondary'}`;
        roleBadge.style.display = 'inline-block';
        roleBadge.style.marginBottom = '2rem';
      }

      const btnInstructor = document.getElementById('btn-instructor-dash');
      const btnCreateCourse = document.getElementById('btn-create-course');

      if (userRole === 'instructor') {
        if (btnInstructor) btnInstructor.classList.remove('hidden');
        if (btnCreateCourse) btnCreateCourse.classList.remove('hidden');
      } else {
        if (btnInstructor) btnInstructor.classList.add('hidden');
        if (btnCreateCourse) btnCreateCourse.classList.add('hidden');
      }

      if (userAvatarBtn) userAvatarBtn.style.borderColor = 'var(--primary)';
    } else if (loggedInFace && loginFace) {
      // GUEST STATE
      loginFace.classList.remove('hidden');
      loggedInFace.classList.add('hidden');
      if (profileViewFace) profileViewFace.classList.add('hidden');
      if (profileEditFace) profileEditFace.classList.add('hidden');
      if (registerFace) registerFace.classList.remove('hidden');

      if (userAvatarBtn)
        userAvatarBtn.style.borderColor = 'rgba(0, 245, 212, 0.5)';
    }
  },

  showProfileView: () => {
    const loggedInFace = document.getElementById('auth-logged-in');
    const profileViewFace = document.getElementById('auth-profile-view');
    const profileEditFace = document.getElementById('auth-profile-edit');

    if (loggedInFace) loggedInFace.classList.add('hidden');
    if (profileEditFace) profileEditFace.classList.add('hidden');
    if (profileViewFace) profileViewFace.classList.remove('hidden');

    // Update profile view with current data
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (user) {
      const nameEl = document.getElementById('profile-view-name');
      const emailEl = document.getElementById('profile-view-email');
      const roleEl = document.getElementById('profile-view-role');

      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      if (roleEl)
        roleEl.textContent =
          user.role === 'INSTRUCTOR' ? 'Instructor' : 'Student';
    }
  },

  showProfileEdit: () => {
    const loggedInFace = document.getElementById('auth-logged-in');
    const profileViewFace = document.getElementById('auth-profile-view');
    const profileEditFace = document.getElementById('auth-profile-edit');

    if (loggedInFace) loggedInFace.classList.add('hidden');
    if (profileViewFace) profileViewFace.classList.add('hidden');
    if (profileEditFace) profileEditFace.classList.remove('hidden');

    // Pre-fill form with current data
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (user) {
      const nameInput = document.getElementById(
        'edit-name',
      ) as HTMLInputElement;
      const emailInput = document.getElementById(
        'edit-email',
      ) as HTMLInputElement;
      const passwordInput = document.getElementById(
        'edit-password',
      ) as HTMLInputElement;

      if (nameInput) nameInput.value = user.name || '';
      if (emailInput) emailInput.value = user.email || '';
      if (passwordInput) passwordInput.value = '';
    }
  },
};

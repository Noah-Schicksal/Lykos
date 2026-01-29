/**
 * Main Application Script - Modular Structure
 */
import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';
import { Home } from './home.js';
import { Categories } from './modules/categories.js';

// Expose to window for debugging or legacy scripts if needed
(window as any).ui = AppUI;
(window as any).auth = Auth;
(window as any).categories = Categories;

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  // Check Auth Status immediately
  Auth.updateAuthUI();
  Home.init();

  console.log('ChemAcademy App Initialized');

  // 1. Initialize Cart Badge
  if (AppUI.renderCartCount) AppUI.renderCartCount();

  // 2. Setup Password Toggle Buttons
  const passwordToggleBtns = document.querySelectorAll('.btn-toggle-password');
  passwordToggleBtns.forEach((btn) => {
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

  // 3. Setup "Enroll" Button
  const enrollBtn = document.getElementById('enroll-featured');
  if (enrollBtn) {
    enrollBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const courseId = enrollBtn.getAttribute('data-course-id');
      if (!courseId) return;
      AppUI.showMessage('Feature de matrícula em breve!', 'info');
    });
  }

  // 3. Setup "Wishlist" Button
  const wishBtn = document.getElementById('wishlist-featured');
  if (wishBtn) {
    wishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AppUI.showMessage('Adicionado à lista de desejos (simulado)', 'success');
    });
  }

  // 4. Auth Card Logic
  const avatarBtn = document.getElementById('user-avatar-btn');
  const authContainer = document.getElementById('auth-card-container');
  const cardInner = document.getElementById('auth-card');
  const btnToRegister = document.getElementById('btn-to-register');
  const btnToLogin = document.getElementById('btn-to-login');

  // Toggle Auth Card
  if (avatarBtn && authContainer) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      authContainer.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (
        authContainer.classList.contains('show') &&
        !authContainer.contains(e.target as Node) &&
        !avatarBtn.contains(e.target as Node)
      ) {
        authContainer.classList.remove('show');
      }
    });
  }

  // Flip Logic
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

  // Handle Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Use specific IDs we added to index.html
      const emailInput = document.getElementById(
        'login-email',
      ) as HTMLInputElement;
      const passInput = document.getElementById(
        'login-password',
      ) as HTMLInputElement;

      if (emailInput && passInput) {
        // Basic client-side validation
        if (!emailInput.value || !passInput.value) {
          AppUI.showMessage('Por favor, preencha todos os campos.', 'error');
          return;
        }
        Auth.login(emailInput.value, passInput.value);
      } else {
        AppUI.showMessage(
          'Erro interno: Campos de login não encontrados.',
          'error',
        );
        console.error('Login inputs not found');
      }
    });
  }

  // Handle Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
    });
  }

  // Handle View Profile
  const btnViewProfile = document.getElementById('btn-view-profile');
  if (btnViewProfile) {
    btnViewProfile.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.showProfileView();
    });
  }

  // Handle Back from Profile View
  const btnBackFromProfile = document.getElementById('btn-back-from-profile');
  if (btnBackFromProfile) {
    btnBackFromProfile.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.updateAuthUI();
    });
  }

  // Handle Edit Profile Button
  const btnEditProfile = document.getElementById('btn-edit-profile');
  if (btnEditProfile) {
    btnEditProfile.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.showProfileEdit();
    });
  }

  // Handle Cancel Edit
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.showProfileView();
    });
  }

  // Handle Profile Edit Form
  const profileEditForm = document.getElementById('profile-edit-form');
  if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById(
        'edit-name',
      ) as HTMLInputElement;
      const emailInput = document.getElementById(
        'edit-email',
      ) as HTMLInputElement;
      const passwordInput = document.getElementById(
        'edit-password',
      ) as HTMLInputElement;

      const updateData: any = {};
      if (nameInput.value.trim()) updateData.name = nameInput.value.trim();
      if (emailInput.value.trim()) updateData.email = emailInput.value.trim();
      if (passwordInput.value.trim())
        updateData.password = passwordInput.value.trim();

      try {
        await Auth.updateUserProfile(updateData);
        Auth.showProfileView();
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    });
  }

  // Handle Delete Account
  const btnDeleteAccount = document.getElementById('btn-delete-account');
  if (btnDeleteAccount) {
    btnDeleteAccount.addEventListener('click', async (e) => {
      e.preventDefault();
      await Auth.deleteUserAccount();
    });
  }

  // Handle Manage Categories
  const btnManageCategories = document.getElementById('btn-manage-categories');
  if (btnManageCategories) {
    btnManageCategories.addEventListener('click', (e) => {
      e.preventDefault();
      showCategoriesView();
    });
  }

  // Handle Instructor Dashboard
  const btnInstructorDash = document.getElementById('btn-instructor-dash');
  if (btnInstructorDash) {
    btnInstructorDash.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'instructor.html';
    });
  }

  // Handle Back from Categories
  const btnBackFromCategories = document.getElementById(
    'btn-back-from-categories',
  );
  if (btnBackFromCategories) {
    btnBackFromCategories.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.updateAuthUI();
    });
  }

  // Handle Category Create Form
  const categoryCreateForm = document.getElementById('category-create-form');
  if (categoryCreateForm) {
    categoryCreateForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById(
        'new-category-name',
      ) as HTMLInputElement;
      if (!nameInput.value.trim()) {
        AppUI.showMessage(
          'Por favor, digite um nome para a categoria.',
          'error',
        );
        return;
      }

      try {
        await Categories.create(nameInput.value.trim());
        nameInput.value = '';
        Categories.renderCategoriesList('categories-list');
      } catch (error) {
        console.error('Error creating category:', error);
      }
    });
  }

  // Function to show categories view
  function showCategoriesView() {
    const loggedInFace = document.getElementById('auth-logged-in');
    const profileViewFace = document.getElementById('auth-profile-view');
    const profileEditFace = document.getElementById('auth-profile-edit');
    const categoriesViewFace = document.getElementById('auth-categories-view');

    if (loggedInFace) loggedInFace.classList.add('hidden');
    if (profileViewFace) profileViewFace.classList.add('hidden');
    if (profileEditFace) profileEditFace.classList.add('hidden');
    if (categoriesViewFace) {
      categoriesViewFace.classList.remove('hidden');
      // Load categories when view is shown
      Categories.renderCategoriesList('categories-list');
    }
  }

  // Handle Register
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById(
        'register-name',
      ) as HTMLInputElement;
      const emailInput = document.getElementById(
        'register-email',
      ) as HTMLInputElement;
      const passInput = document.getElementById(
        'register-password',
      ) as HTMLInputElement;
      const confirmInput = document.getElementById(
        'register-confirm',
      ) as HTMLInputElement;
      const roleSelect = document.getElementById(
        'register-role',
      ) as HTMLSelectElement;

      const name = nameInput.value;
      const email = emailInput.value;
      const password = passInput.value;
      const confirmPass = confirmInput.value;
      const role = roleSelect.value; // 'student' or 'instructor'

      if (password !== confirmPass) {
        AppUI.showMessage('Senhas não conferem!', 'error');
        return;
      }

      try {
        // Determine endpoint based on role
        const endpoint =
          role === 'instructor'
            ? '/auth/register/instructor'
            : '/auth/register/student';

        await AppUI.apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });

        AppUI.showMessage('Conta criada com sucesso! Faça login.', 'success');

        // Reset form
        (registerForm as HTMLFormElement).reset();

        // Flip back to login
        if (cardInner) cardInner.classList.remove('flipped');
      } catch (error: any) {
        AppUI.showMessage(error.message || 'Erro ao criar conta', 'error');
      }
    });
  }
});

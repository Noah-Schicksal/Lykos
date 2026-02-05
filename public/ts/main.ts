/**
 * Main Application Script - Modular Structure
 */
import { AppUI } from './utils/ui.js';
import { Auth } from './modules/auth.js';
import { Home } from './home.js';
import { Categories } from './modules/categories.js';
import { Cart } from './modules/cart.js';
import { initThemeToggle } from './theme-toggle.js';

// Expose to window for debugging or legacy scripts if needed
(window as any).ui = AppUI;
(window as any).auth = Auth;
(window as any).categories = Categories;
(window as any).cart = Cart;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize theme toggle first
  initThemeToggle();

  // Initialize app
  await Auth.init();

  // Redirect Admin
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === 'ADMIN') {
        window.location.href = '/admin.html';
        return; // Stop execution
      }
    } catch (e) {
      console.error('Auth Parse Error', e);
    }
  }

  // Check Auth Status immediately
  Auth.updateAuthUI();
  Home.init();

  console.log('Lykos App Initialized');

  // 1. Initialize Cart
  Cart.updateBadge();

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

  // 3. Setup Cart Modal Toggle
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartModal = document.getElementById('cart-modal');
  const closeCartBtn = document.getElementById('close-cart-btn');

  if (cartToggleBtn && cartModal) {
    cartToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Check if logged in before showing cart
      if (!localStorage.getItem('auth_user')) {
        AppUI.showMessage(
          'Por favor, faça login para ver seu carrinho.',
          'info',
        );
        const authContainer = document.getElementById('auth-card-container');
        if (authContainer) authContainer.classList.add('show');
        return;
      }

      cartModal.classList.toggle('show');
      if (cartModal.classList.contains('show')) {
        renderCartItems();
      }
    });

    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
      });
    }

    document.addEventListener('click', (e) => {
      if (
        cartModal.classList.contains('show') &&
        !cartModal.contains(e.target as Node) &&
        !cartToggleBtn.contains(e.target as Node)
      ) {
        cartModal.classList.remove('show');
      }
    });
  }

  // Handle Checkout Button
  const checkoutBtn = document.getElementById('btn-cart-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      const confirm = await AppUI.promptModal(
        'Finalizar Compra',
        'Deseja confirmar a compra dos itens no carrinho?',
      );
      if (confirm) {
        const success = await Cart.checkout();
        if (success) {
          cartModal?.classList.remove('show');
          // Recarregar os cursos para atualizar o status dos cards
          Home.loadCourses();
        }
      }
    });
  }

  /**
   * Renderiza os itens do carrinho no modal
   */
  async function renderCartItems() {
    const listContainer = document.getElementById('cart-items-list');
    const totalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById(
      'btn-cart-checkout',
    ) as HTMLButtonElement;

    if (!listContainer || !totalPriceEl) return;

    listContainer.innerHTML =
      '<div class="cart-empty-msg">Carregando itens...</div>';

    try {
      const items = await Cart.getCart();

      if (items.length === 0) {
        listContainer.innerHTML =
          '<div class="cart-empty-msg">Seu carrinho está vazio.</div>';
        totalPriceEl.textContent = 'R$ 0,00';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
      }

      let total = 0;
      listContainer.innerHTML = items
        .map((item) => {
          total += item.price;
          const price = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(item.price);

          // Verificar se tem imagem
          const hasImage =
            item.coverImageUrl && item.coverImageUrl.trim() !== '';
          const imageHTML = hasImage
            ? `<img src="${item.coverImageUrl}" class="cart-item-img" alt="${item.title}" onerror="this.onerror=null;this.style.display='none';this.parentElement.insertAdjacentHTML('afterbegin','<div class=\'cart-item-img-placeholder\'><span class=\'material-symbols-outlined\'>image</span></div>');">`
            : `<div class="cart-item-img-placeholder"><span class="material-symbols-outlined">image</span></div>`;

          return `
          <div class="cart-item">
            ${imageHTML}
            <div class="cart-item-info">
              <h4 class="cart-item-title">${item.title}</h4>
              <div class="cart-item-price">${price}</div>
            </div>
            <button class="btn-remove-cart" data-id="${item.courseId}" title="Remover">
              <span class="material-symbols-outlined" style="font-size: 1.25rem">delete</span>
            </button>
          </div>
        `;
        })
        .join('');

      totalPriceEl.textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(total);
      if (checkoutBtn) checkoutBtn.disabled = false;

      // Add remove listeners
      const removeBtns = listContainer.querySelectorAll('.btn-remove-cart');
      removeBtns.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const courseId = (btn as HTMLElement).dataset.id!;
          const success = await Cart.remove(courseId);
          if (success) {
            renderCartItems(); // Refresh
          }
        });
      });
    } catch (error) {
      listContainer.innerHTML =
        '<div class="cart-empty-msg" style="color: #ef4444">Erro ao carregar carrinho.</div>';
    }
  }

  // 4. Auth Card Logic
  const avatarBtn = document.getElementById('user-avatar-btn');
  const userInfoBtn = document.getElementById('user-info-btn');
  const authContainer = document.getElementById('auth-card-container');
  const cardInner = document.getElementById('auth-card');
  const btnToRegister = document.getElementById('btn-to-register');
  const btnToLogin = document.getElementById('btn-to-login');

  // User Drawer Elements
  const userDrawer = document.getElementById('user-drawer');
  const openDrawerBtn = document.getElementById('open-drawer-btn'); // In navbar - opens drawer
  const menuDrawerBtn = document.getElementById('menu-drawer-btn'); // In drawer - closes drawer
  const drawerProfileToggle = document.getElementById('drawer-profile-toggle');
  const drawerProfilePanel = document.getElementById('drawer-profile-panel');
  const drawerManagementSection = document.getElementById(
    'drawer-management-section',
  );
  const drawerLogoutBtn = document.getElementById('drawer-logout');
  const drawerEditProfileBtn = document.getElementById('drawer-edit-profile');
  const drawerDeleteAccountBtn = document.getElementById(
    'drawer-delete-account',
  );
  const drawerCategoriesToggle = document.getElementById(
    'drawer-categories-toggle',
  );
  const drawerCategoriesPanel = document.getElementById(
    'drawer-categories-panel',
  );

  // Avatar always opens Auth Card (for login/register)
  if (avatarBtn && authContainer) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      authContainer.classList.toggle('show');
      closeDrawer();
    });
  }

  // User info button (when logged in) now toggles dropdown
  const dropdownMenu = document.getElementById('user-dropdown-menu');

  if (userInfoBtn && dropdownMenu) {
    userInfoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
      userInfoBtn.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (
        dropdownMenu.classList.contains('show') &&
        !dropdownMenu.contains(e.target as Node) &&
        !userInfoBtn.contains(e.target as Node)
      ) {
        dropdownMenu.classList.remove('show');
        userInfoBtn.classList.remove('open');
      }
    });

    // Dropdown Items
    const dropdownProfile = document.getElementById('dropdown-profile');
    const dropdownLogout = document.getElementById('dropdown-logout');

    if (dropdownProfile) {
      dropdownProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.remove('show');
        userInfoBtn.classList.remove('open');

        // Ensure auth container is visible
        if (authContainer) authContainer.classList.add('show');

        if (Auth && typeof Auth.showProfileView === 'function') {
          Auth.showProfileView();
        }
      });
    }

    if (dropdownLogout) {
      dropdownLogout.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.remove('show');
        userInfoBtn.classList.remove('open');
        Auth.logout();
      });
    }
  }

  // Open Drawer Button (in navbar) - opens the drawer
  if (openDrawerBtn && userDrawer) {
    openDrawerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDrawer();
      authContainer?.classList.remove('show');
    });
  }

  // Menu Button inside drawer - closes the drawer
  if (menuDrawerBtn && userDrawer) {
    menuDrawerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  // Get overlay element
  const drawerOverlay = document.querySelector('.drawer-overlay');

  // Close drawer when clicking on overlay
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', () => {
      closeDrawer();
    });
  }

  // Helper functions
  function openDrawer() {
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

  function closeDrawer() {
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
  }

  // Close elements when clicking outside
  document.addEventListener('click', (e) => {
    // Close auth container
    if (
      authContainer?.classList.contains('show') &&
      !authContainer.contains(e.target as Node) &&
      !avatarBtn?.contains(e.target as Node)
    ) {
      authContainer.classList.remove('show');
    }

    // Close user drawer
    if (
      userDrawer?.classList.contains('show') &&
      !userDrawer.contains(e.target as Node) &&
      !openDrawerBtn?.contains(e.target as Node)
    ) {
      closeDrawer();
    }
  });

  // Show/hide open drawer button, login button, and user info button based on login status
  function updateMenuButtonVisibility() {
    const user = localStorage.getItem('auth_user');

    // Show drawer button only when logged in
    if (openDrawerBtn) {
      if (user && !userDrawer?.classList.contains('show')) {
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
            // Map role to Portuguese
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

  // Initial check
  updateMenuButtonVisibility();

  // Listen for auth changes
  window.addEventListener('auth-login', updateMenuButtonVisibility);
  window.addEventListener('auth-logout', updateMenuButtonVisibility);

  // Profile accordion toggle
  if (drawerProfileToggle && drawerProfilePanel) {
    drawerProfileToggle.addEventListener('click', () => {
      drawerProfileToggle.classList.toggle('expanded');
      drawerProfilePanel.classList.toggle('expanded');
    });
  }

  // Drawer logout button
  if (drawerLogoutBtn) {
    drawerLogoutBtn.addEventListener('click', async () => {
      await Auth.logout();
      closeDrawer();
    });
  }

  // Drawer edit profile button
  // Drawer edit profile button
  if (drawerEditProfileBtn) {
    drawerEditProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const viewMode = document.getElementById('drawer-profile-view');
      const editMode = document.getElementById('drawer-profile-edit');

      if (viewMode && editMode) {
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');

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
      }
    });
  }

  const drawerCancelEditBtn = document.getElementById('drawer-cancel-edit');
  if (drawerCancelEditBtn) {
    drawerCancelEditBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const viewMode = document.getElementById('drawer-profile-view');
      const editMode = document.getElementById('drawer-profile-edit');

      if (viewMode && editMode) {
        editMode.classList.add('hidden');
        viewMode.classList.remove('hidden');
      }
    });
  }

  // Drawer delete account button
  if (drawerDeleteAccountBtn) {
    drawerDeleteAccountBtn.addEventListener('click', async () => {
      const confirm = await AppUI.promptModal(
        'Excluir Conta',
        'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.',
      );
      if (confirm) {
        await Auth.deleteUserAccount();
        userDrawer?.classList.remove('show');
      }
    });
  }

  // Drawer manage categories accordion
  if (drawerCategoriesToggle && drawerCategoriesPanel) {
    drawerCategoriesToggle.addEventListener('click', () => {
      drawerCategoriesToggle.classList.toggle('expanded');
      drawerCategoriesPanel.classList.toggle('expanded');

      if (drawerCategoriesPanel.classList.contains('expanded')) {
        Categories.renderCategoriesList('categories-list');
      }
    });
  }

  /**
   * Update drawer user info from localStorage
   */
  function updateDrawerUserInfo() {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const drawerName = document.getElementById('drawer-user-name');
      const drawerEmail = document.getElementById('drawer-user-email');
      const drawerRole = document.getElementById('drawer-user-role');

      // Normalize role for comparison
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

  // Update drawer when auth changes
  window.addEventListener('auth-login', () => {
    updateDrawerUserInfo();
  });

  window.addEventListener('auth-logout', () => {
    userDrawer?.classList.remove('show');
    // Reset accordion
    drawerProfileToggle?.classList.remove('expanded');
    drawerProfilePanel?.classList.remove('expanded');
  });

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
    loginForm.addEventListener('submit', async (e) => {
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
        if (!emailInput.value.trim()) {
          AppUI.showMessage('O campo email é obrigatório', 'error');
          emailInput.focus();
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          AppUI.showMessage('Formato de e-mail inválido', 'error');
          emailInput.focus();
          return;
        }

        if (!passInput.value) {
          AppUI.showMessage('Campo senha é obrigatório', 'error');
          passInput.focus();
          return;
        }
        await Auth.login(emailInput.value, passInput.value);
        // After successful login, update cart badge
        Cart.updateBadge();
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
      // Update badge on logout (will clear it)
      Cart.updateBadge();
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
      if (emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          AppUI.showMessage('Formato de e-mail inválido', 'error');
          emailInput.focus();
          return;
        }
        updateData.email = emailInput.value.trim();
      } else {
        AppUI.showMessage('O campo email é obrigatório', 'error');
        emailInput.focus();
        return;
      }
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

  // Handle My Learning (Student Dashboard)
  const btnMyLearning = document.getElementById('btn-my-learning');
  if (btnMyLearning) {
    btnMyLearning.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/estudante';
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

      if (!name.trim()) {
        AppUI.showMessage('O campo nome é obrigatório', 'error');
        nameInput.focus();
        return;
      }

      if (!email.trim()) {
        AppUI.showMessage('O campo email é obrigatório', 'error');
        emailInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        AppUI.showMessage('Formato de e-mail inválido', 'error');
        emailInput.focus();
        return;
      }

      // Password strength validation
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        AppUI.showMessage(
          'A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais',
          'error',
        );
        passInput.focus();
        return;
      }

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

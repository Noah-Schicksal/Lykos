/**
 * ChemAcademy - Enhanced Course Management System
 * Features: Course listing, filtering, search, pagination
 */

// Configuration
const API_BASE_URL = '/api'; // Adjust based on your backend
const COURSES_PER_PAGE = 12;

// State Management
const AppState = {
    courses: [],
    filteredCourses: [],
    categories: [],
    currentCategory: '',
    searchQuery: '',
    currentPage: 1,
    hasMoreCourses: true,
    isLoading: false
};

// UI Helper Functions
const AppUI = {
    renderCartCount: () => {
        const badge = document.getElementById('cart-count-badge');
        if (!badge) return;
        const count = 0;
        badge.textContent = count.toString();
        badge.style.display = count > 0 ? 'flex' : 'none';
    },

    apiFetch: async (url, options = {}) => {
        console.log(`[API] ${url}`, options);
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Request error');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    showMessage: (msg, type) => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'check_circle',
            error: 'error',
            info: 'info'
        };

        toast.innerHTML = `
            <span class="material-symbols-outlined toast-icon">${icons[type] || 'info'}</span>
            <span>${msg}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000);
    }
};

window.ui = AppUI;

// Course Management Functions
const CourseManager = {
    /**
     * Fetch all courses from API
     */
    async fetchCourses() {
        try {
            AppState.isLoading = true;
            this.showLoading(true);

            const params = new URLSearchParams({
                page: AppState.currentPage,
                limit: COURSES_PER_PAGE
            });

            if (AppState.currentCategory) {
                params.append('category', AppState.currentCategory);
            }

            const response = await AppUI.apiFetch(`${API_BASE_URL}/courses?${params}`);
            
            // Handle different response structures
            const courses = response.data?.courses || response.courses || response.data || [];
            const totalPages = response.data?.totalPages || response.totalPages || 1;
            
            if (AppState.currentPage === 1) {
                AppState.courses = courses;
            } else {
                AppState.courses = [...AppState.courses, ...courses];
            }

            AppState.hasMoreCourses = AppState.currentPage < totalPages;
            
            this.applyFilters();
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error fetching courses:', error);
            this.showLoading(false);
            this.showEmptyState('Error loading courses. Please try again.');
            AppUI.showMessage('Failed to load courses', 'error');
            
            // Fallback to mock data for demo purposes
            this.loadMockCourses();
        }
    },

    /**
     * Load mock courses for demo/testing
     */
    loadMockCourses() {
        AppState.courses = [
            {
                id: 1,
                title: 'Complete Python Bootcamp: From Zero to Hero',
                instructor: 'Jose Portilla, Lead Developer',
                category: 'Python',
                rating: 4.9,
                reviewCount: 185234,
                price: 84.99,
                oldPrice: 129.99,
                thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
                badge: 'Bestseller'
            },
            {
                id: 2,
                title: 'React - The Complete Guide 2024',
                instructor: 'Maximilian Schwarzmüller',
                category: 'React',
                rating: 4.7,
                reviewCount: 98145,
                price: 49.99,
                oldPrice: 89.99,
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
                badge: 'New'
            },
            {
                id: 3,
                title: 'AWS Certified Solutions Architect',
                instructor: 'Stephane Maarek',
                category: 'Cloud Computing',
                rating: 4.8,
                reviewCount: 156876,
                price: 19.99,
                oldPrice: 149.99,
                thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
                badge: 'Top Rated'
            },
            {
                id: 4,
                title: 'Docker & Kubernetes: The Complete Guide',
                instructor: 'Stephen Grider',
                category: 'DevOps',
                rating: 4.6,
                reviewCount: 45532,
                price: 34.99,
                oldPrice: 54.99,
                thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=450&fit=crop'
            },
            {
                id: 5,
                title: 'Machine Learning A-Z: Python & R in Data Science',
                instructor: 'Kirill Eremenko',
                category: 'Machine Learning',
                rating: 4.9,
                reviewCount: 234567,
                price: 69.99,
                oldPrice: 99.99,
                thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop'
            },
            {
                id: 6,
                title: 'Node.js: Building RESTful APIs',
                instructor: 'Mosh Hamedani',
                category: 'Node.js',
                rating: 4.5,
                reviewCount: 67421,
                price: 59.99,
                oldPrice: 89.99,
                thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop'
            },
            {
                id: 7,
                title: 'Cybersecurity Fundamentals: Ethical Hacking',
                instructor: 'Zaid Sabih',
                category: 'Cybersecurity',
                rating: 4.7,
                reviewCount: 89567,
                price: 74.99,
                oldPrice: 109.99,
                thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop'
            },
            {
                id: 8,
                title: 'Web Development Bootcamp 2024',
                instructor: 'Angela Yu',
                category: 'Web Development',
                rating: 4.8,
                reviewCount: 315234,
                price: 39.99,
                oldPrice: 69.99,
                thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop'
            },
            {
                id: 9,
                title: 'Java Programming Masterclass',
                instructor: 'Tim Buchalka',
                category: 'Java',
                rating: 4.6,
                reviewCount: 142567,
                price: 54.99,
                oldPrice: 94.99,
                thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop'
            },
            {
                id: 10,
                title: 'iOS & Swift Development',
                instructor: 'Angela Yu',
                category: 'Mobile Development',
                rating: 4.8,
                reviewCount: 78945,
                price: 64.99,
                oldPrice: 99.99,
                thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop'
            },
            {
                id: 11,
                title: 'SQL for Data Analysis',
                instructor: 'Jose Portilla',
                category: 'Database',
                rating: 4.7,
                reviewCount: 56789,
                price: 44.99,
                oldPrice: 79.99,
                thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=450&fit=crop'
            },
            {
                id: 12,
                title: 'Git & GitHub Complete Course',
                instructor: 'Jason Taylor',
                category: 'Version Control',
                rating: 4.5,
                reviewCount: 34567,
                price: 29.99,
                oldPrice: 59.99,
                thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=450&fit=crop'
            }
        ];

        AppState.hasMoreCourses = false;
        this.applyFilters();
        this.showLoading(false);
    },

    /**
     * Fetch categories from API
     */
    async fetchCategories() {
        try {
            const response = await AppUI.apiFetch(`${API_BASE_URL}/categories`);
            AppState.categories = response.data || response || [];
            this.renderCategories();
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to mock categories
            AppState.categories = [
                'Web Development',
                'Python',
                'React',
                'Node.js',
                'Machine Learning',
                'DevOps',
                'Cloud Computing',
                'Mobile Development',
                'Database',
                'Cybersecurity',
                'Java',
                'Version Control'
            ];
            this.renderCategories();
        }
    },

    /**
     * Apply search and category filters
     */
    applyFilters() {
        let filtered = [...AppState.courses];

        // Apply category filter
        if (AppState.currentCategory) {
            filtered = filtered.filter(course => 
                course.category === AppState.currentCategory
            );
        }

        // Apply search filter
        if (AppState.searchQuery) {
            const query = AppState.searchQuery.toLowerCase();
            filtered = filtered.filter(course =>
                course.title.toLowerCase().includes(query) ||
                (course.instructor && course.instructor.toLowerCase().includes(query))
            );
        }

        AppState.filteredCourses = filtered;
        this.renderCourses();
        this.updateCourseCount();
    },

    /**
     * Render category tabs
     */
    renderCategories() {
        const tabsContainer = document.getElementById('category-tabs');
        if (!tabsContainer) return;

        // Keep "All Courses" button
        const allButton = tabsContainer.querySelector('[data-category=""]');
        tabsContainer.innerHTML = '';
        if (allButton) {
            tabsContainer.appendChild(allButton);
        } else {
            const btn = document.createElement('button');
            btn.className = 'category-tab active';
            btn.setAttribute('data-category', '');
            btn.textContent = 'All Courses';
            tabsContainer.appendChild(btn);
        }

        // Add category buttons
        AppState.categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-tab';
            btn.setAttribute('data-category', category);
            btn.textContent = category;
            tabsContainer.appendChild(btn);
        });
    },

    /**
     * Render courses grid
     */
    renderCourses() {
        const grid = document.getElementById('courses-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!grid) return;

        if (AppState.filteredCourses.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            this.updatePaginationUI();
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        grid.innerHTML = AppState.filteredCourses.map((course, index) => `
            <div class="card-base" style="animation-delay: ${index * 0.05}s" data-course-id="${course.id}">
                <div class="card-img-container">
                    <img alt="${course.title}" class="card-img"
                        src="${course.thumbnail || this.getPlaceholderImage()}" 
                        onerror="this.src='${this.getPlaceholderImage()}'" />
                    ${course.badge ? `<div class="badge-tag bg-tag-${this.getBadgeClass(course.badge)}">${course.badge}</div>` : ''}
                </div>
                <div class="card-body">
                    <h3 class="card-title">${course.title}</h3>
                    <div class="card-instructor">
                        <span class="material-symbols-outlined" style="font-size: 14px;">person</span>
                        ${course.instructor || 'Instructor'}
                    </div>
                    <div class="rating-row">
                        <span style="color: var(--primary); font-weight: bold; font-size: 0.875rem;">${course.rating || 4.5}</span>
                        <div class="star-set">
                            ${this.renderStars(course.rating || 4.5)}
                        </div>
                        <span class="rating-count">(${course.reviewCount || 0})</span>
                    </div>
                    <div class="price-row">
                        <span class="price-main">$${course.price || '0.00'}</span>
                        ${course.oldPrice ? `<span class="price-strike">$${course.oldPrice}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers to course cards
        grid.querySelectorAll('.card-base').forEach(card => {
            card.addEventListener('click', () => {
                const courseId = card.getAttribute('data-course-id');
                this.viewCourse(courseId);
            });
        });

        this.updatePaginationUI();
    },

    /**
     * Get placeholder image URL
     */
    getPlaceholderImage() {
        return 'https://via.placeholder.com/400x225/5e17eb/ffffff?text=Course+Image';
    },

    /**
     * Get badge CSS class based on badge text
     */
    getBadgeClass(badge) {
        const lowerBadge = badge.toLowerCase();
        if (lowerBadge.includes('best')) return 'primary';
        if (lowerBadge.includes('new')) return 'new';
        return 'secondary';
    },

    /**
     * Render star ratings
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="material-symbols-outlined" style="font-size: 14px; fill: currentColor;">star</span>';
        }

        if (hasHalfStar) {
            stars += '<span class="material-symbols-outlined" style="font-size: 14px;">star_half</span>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="material-symbols-outlined" style="font-size: 14px; opacity: 0.3;">star</span>';
        }

        return stars;
    },

    /**
     * Update course count display
     */
    updateCourseCount() {
        const countEl = document.getElementById('course-count');
        const titleEl = document.getElementById('section-title-text');
        
        if (countEl) {
            const count = AppState.filteredCourses.length;
            const total = AppState.courses.length;
            countEl.textContent = `Showing ${count} ${count === 1 ? 'course' : 'courses'}${AppState.currentCategory ? ` in ${AppState.currentCategory}` : ''}`;
        }

        if (titleEl) {
            titleEl.textContent = AppState.currentCategory || 'All Courses';
        }
    },

    /**
     * Update pagination UI
     */
    updatePaginationUI() {
        const loadMoreContainer = document.getElementById('load-more-container');
        const infiniteScrollLoading = document.getElementById('infinite-scroll-loading');

        if (loadMoreContainer) {
            if (AppState.hasMoreCourses && !AppState.isLoading) {
                loadMoreContainer.classList.remove('hidden');
            } else {
                loadMoreContainer.classList.add('hidden');
            }
        }

        if (infiniteScrollLoading) {
            infiniteScrollLoading.classList.add('hidden');
        }
    },

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        const loading = document.getElementById('loading-indicator');
        const grid = document.getElementById('courses-grid');

        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }

        if (grid) {
            grid.style.opacity = show ? '0.5' : '1';
        }
    },

    /**
     * Show empty state with custom message
     */
    showEmptyState(message) {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            const messageEl = emptyState.querySelector('p');
            if (messageEl && message) {
                messageEl.textContent = message;
            }
            emptyState.classList.remove('hidden');
        }
    },

    /**
     * View course details (placeholder)
     */
    viewCourse(courseId) {
        AppUI.showMessage(`Opening course ${courseId}...`, 'info');
        // TODO: Navigate to course details page
        // window.location.href = `/course/${courseId}`;
    },

    /**
     * Load more courses (pagination)
     */
    async loadMoreCourses() {
        if (AppState.isLoading || !AppState.hasMoreCourses) return;

        AppState.currentPage++;
        
        const infiniteScrollLoading = document.getElementById('infinite-scroll-loading');
        if (infiniteScrollLoading) {
            infiniteScrollLoading.classList.remove('hidden');
        }

        await this.fetchCourses();

        if (infiniteScrollLoading) {
            infiniteScrollLoading.classList.add('hidden');
        }
    },

    /**
     * Setup infinite scroll
     */
    setupInfiniteScroll() {
        let isNearBottom = false;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Trigger when user is 300px from bottom
            isNearBottom = scrollTop + windowHeight >= documentHeight - 300;

            if (isNearBottom && !AppState.isLoading && AppState.hasMoreCourses) {
                this.loadMoreCourses();
            }
        });
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('Lykos.eng Platform Initialized');

    // Initialize cart badge
    if (AppUI.renderCartCount) AppUI.renderCartCount();

    // Fetch categories and courses
    CourseManager.fetchCategories();
    CourseManager.fetchCourses();

    // Setup infinite scroll
    CourseManager.setupInfiniteScroll();

    // Category filter event delegation
    const categoryTabs = document.getElementById('category-tabs');
    if (categoryTabs) {
        categoryTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                // Remove active class from all tabs
                categoryTabs.querySelectorAll('.category-tab').forEach(tab => {
                    tab.classList.remove('active');
                });

                // Add active class to clicked tab
                e.target.classList.add('active');

                // Update filter
                AppState.currentCategory = e.target.getAttribute('data-category');
                AppState.currentPage = 1;
                CourseManager.applyFilters();
            }
        });
    }

    // Search functionality
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                AppState.searchQuery = e.target.value.trim();
                CourseManager.applyFilters();
            }, 300); // Debounce search
        });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            CourseManager.loadMoreCourses();
        });
    }

    // Auth Card Logic
    setupAuthCard();

    // Auth Forms
    setupAuthForms();

    // Theme Toggle
    setupThemeToggle();

    // Scroll Navigation
    setupScrollNavigation();
});


// Theme Toggle Setup
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    if (currentTheme === 'light') {
        document.documentElement.classList.add('light');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('light');
            
            // Save theme preference
            const theme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
            localStorage.setItem('theme', theme);
            
            // Add animation effect
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }
}

// Scroll Navigation Setup
function setupScrollNavigation() {
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');
    const scrollNavContainer = document.getElementById('scroll-nav-container');
    const coursesGrid = document.getElementById('courses-grid');
    
    if (!scrollLeftBtn || !scrollRightBtn || !coursesGrid || !scrollNavContainer) return;
    
    // Check if scroll is needed
    const checkScrollNeeded = () => {
        const gridWidth = coursesGrid.scrollWidth;
        const containerWidth = coursesGrid.clientWidth;
        
        if (gridWidth > containerWidth && AppState.filteredCourses.length > 4) {
            scrollNavContainer.style.display = 'flex';
            updateScrollButtons();
        } else {
            scrollNavContainer.style.display = 'none';
        }
    };
    
    // Update button states
    const updateScrollButtons = () => {
        const scrollLeft = coursesGrid.scrollLeft;
        const maxScroll = coursesGrid.scrollWidth - coursesGrid.clientWidth;
        
        scrollLeftBtn.disabled = scrollLeft <= 0;
        scrollRightBtn.disabled = scrollLeft >= maxScroll - 10;
    };
    
    // Scroll left
    scrollLeftBtn.addEventListener('click', () => {
        const cardWidth = coursesGrid.querySelector('.card-base')?.offsetWidth || 300;
        coursesGrid.scrollBy({
            left: -(cardWidth * 2 + 48), // 2 cards + gap
            behavior: 'smooth'
        });
    });
    
    // Scroll right
    scrollRightBtn.addEventListener('click', () => {
        const cardWidth = coursesGrid.querySelector('.card-base')?.offsetWidth || 300;
        coursesGrid.scrollBy({
            left: cardWidth * 2 + 48, // 2 cards + gap
            behavior: 'smooth'
        });
    });
    
    // Listen to scroll events
    coursesGrid.addEventListener('scroll', updateScrollButtons);
    
    // Listen to window resize
    window.addEventListener('resize', checkScrollNeeded);
    
    // Check initially and when courses are loaded
    const observer = new MutationObserver(checkScrollNeeded);
    observer.observe(coursesGrid, { childList: true });
    
    // Initial check
    setTimeout(checkScrollNeeded, 100);
}

// Auth Card Setup
function setupAuthCard() {
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

            // Check session state when opening
            const data = localStorage.getItem('userData');
            if (data) {
                updateAuthUI(JSON.parse(data));
            } else {
                updateAuthUI(null);
            }
        });

        document.addEventListener('click', (e) => {
            if (authContainer.classList.contains('show') &&
                !authContainer.contains(e.target) &&
                !avatarBtn.contains(e.target)) {
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

    // Check Session on Load
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            updateAuthUI(user);
        } catch (e) {
            localStorage.removeItem('userData');
        }
    }
}

// Auth Forms Setup
function setupAuthForms() {
    // Handle Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('login-email');
            const passInput = document.getElementById('login-password');

            const email = emailInput?.value?.trim();
            const password = passInput?.value?.trim();

            if (!email || !password) {
                AppUI.showMessage('Please fill in all fields.', 'error');
                return;
            }

            try {
                const response = await AppUI.apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                if (response.data && response.data.token) {
                    const { user, token } = response.data;
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userData', JSON.stringify(user));

                    AppUI.showMessage(`Welcome back, ${user.name}!`, 'success');
                    updateAuthUI(user);
                    loginForm.reset();

                    const authContainer = document.getElementById('auth-card-container');
                    if (authContainer) authContainer.classList.remove('show');
                }
            } catch (error) {
                AppUI.showMessage(error.message || 'Login failed', 'error');
            }
        });
    }

    // Handle Register
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('register-name');
            const emailInput = document.getElementById('register-email');
            const passInput = document.getElementById('register-password');
            const confirmInput = document.getElementById('register-confirm');
            const roleSelect = document.getElementById('register-role');

            const name = nameInput.value;
            const email = emailInput.value;
            const password = passInput.value;
            const confirmPass = confirmInput.value;
            const role = roleSelect.value;

            if (password !== confirmPass) {
                AppUI.showMessage('Passwords do not match!', 'error');
                return;
            }

            try {
                const endpoint = role === 'instructor' ? '/auth/register/instructor' : '/auth/register/student';
                await AppUI.apiFetch(endpoint, {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });

                AppUI.showMessage('Account created! Please log in.', 'success');
                registerForm.reset();
                
                const cardInner = document.getElementById('auth-card');
                if (cardInner) cardInner.classList.remove('flipped');
            } catch (error) {
                AppUI.showMessage(error.message || 'Error creating account', 'error');
            }
        });
    }

    // Handle Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            updateAuthUI(null);
            AppUI.showMessage('You have logged out.', 'info');
        });
    }
}

// Update Auth UI
function updateAuthUI(user) {
    const loginFace = document.querySelector('.auth-face:not(.auth-face-back):not(#auth-logged-in)');
    const registerFace = document.querySelector('.auth-face-back');
    const loggedInFace = document.getElementById('auth-logged-in');

    if (!loggedInFace) return;

    if (user) {
        // Hide login/register, show profile
        if (loginFace) loginFace.style.display = 'none';
        if (registerFace) registerFace.style.display = 'none';
        loggedInFace.classList.remove('hidden');
        loggedInFace.style.display = 'flex';

        // Populate user data
        const nameEl = document.getElementById('user-name-display');
        const emailEl = document.getElementById('user-email-display');
        const roleEl = document.getElementById('user-role-badge');

        if (nameEl) nameEl.textContent = user.name;
        if (emailEl) emailEl.textContent = user.email;
        if (roleEl) {
            roleEl.textContent = user.role || 'Student';
            roleEl.className = user.role === 'INSTRUCTOR' ? 'badge-tag bg-tag-secondary' : 'badge-tag bg-tag-primary';
        }

        // Show/hide instructor buttons
        const instructorDash = document.getElementById('btn-instructor-dash');
        const createCourse = document.getElementById('btn-create-course');
        if (user.role === 'INSTRUCTOR') {
            if (instructorDash) instructorDash.classList.remove('hidden');
            if (createCourse) createCourse.classList.remove('hidden');
        } else {
            if (instructorDash) instructorDash.classList.add('hidden');
            if (createCourse) createCourse.classList.add('hidden');
        }
    } else {
        // Show login/register, hide profile
        if (loginFace) loginFace.style.display = 'flex';
        if (registerFace) registerFace.style.display = 'flex';
        loggedInFace.classList.add('hidden');
        loggedInFace.style.display = 'none';
    }
}
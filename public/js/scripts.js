// ChemAcademy Public Frontend Scripts

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCart();
    initFeaturedButtons();
});

function initTheme() {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        // Remove inline onclick to handle here for persistence
        toggleBtn.onclick = null;
        toggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
}

function initCart() {
    // Simulation of checking cart count
    const cartBadge = document.getElementById('cart-count-badge');
    if (cartBadge) {
        // Example: logic to fetch real count would go here
        // For now, we just show 0 or hide it as per example default
        // If we want to simulate a count:
        // cartBadge.textContent = '2';
        // cartBadge.style.display = 'flex';
    }
}

function initFeaturedButtons() {
    const enrollBtn = document.getElementById('enroll-featured');
    if (enrollBtn) {
        enrollBtn.addEventListener('click', async () => {
            const courseId = enrollBtn.getAttribute('data-course-id');
            console.log(`Attempting to enroll in ${courseId}`);

            // Check if window.ui exists (from potential shared codebase)
            if (window.ui && window.ui.apiFetch) {
                try {
                    await window.ui.apiFetch('/auth/me');
                    await window.ui.apiFetch(`/students/${encodeURIComponent(courseId)}/enroll`, { method: 'POST' });
                    if (window.ui.showMessage) window.ui.showMessage('Inscrito com sucesso', 'success');
                } catch (err) {
                    if (window.ui.showMessage) window.ui.showMessage('Faça login ou tente novamente.', 'info');
                    console.error(err);
                }
            } else {
                // Fallback for standalone demo
                alert('Enrollment feature requires backend integration.');
            }
        });
    }

    const wishBtn = document.getElementById('wishlist-featured');
    if (wishBtn) {
        wishBtn.addEventListener('click', () => {
            // Toggle visual state
            wishBtn.classList.toggle('btn-outline');
            wishBtn.classList.toggle('btn-primary');
            const isAdded = wishBtn.classList.contains('btn-primary');
            alert(isAdded ? 'Added to Wishlist' : 'Removed from Wishlist');
        });
    }
}

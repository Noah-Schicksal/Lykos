import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { CourseGrid } from './components/CourseGrid.js';
import { FeaturedSection } from './components/FeaturedSection.js';
import { TrustSection } from './components/TrustSection.js';
import { Footer } from './components/Footer.js';
import { courses, categories } from './data.js';
import { createElement } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('app-root');
    if (!root) return;

    // 1. Navigation
    root.appendChild(Navbar());

    // 2. Categories Bar
    const catBar = createElement('div', { className: 'categories-bar glass-panel' });
    const catContainer = createElement('div', { className: 'container categories-container' });
    categories.forEach((cat, index) => {
        const link = createElement('a', { href: '#', className: index === 1 ? 'active' : '' }, cat);
        catContainer.appendChild(link);
    });
    catBar.appendChild(catContainer);
    root.appendChild(catBar);

    // 3. Main Content
    const main = createElement('main', { className: 'container main-content' });

    main.appendChild(Hero());
    main.appendChild(CourseGrid(courses));
    main.appendChild(FeaturedSection());
    main.appendChild(TrustSection());

    root.appendChild(main);

    // 4. Footer
    root.appendChild(Footer());

    // 5. Theme Toggle
    const toggle = createElement('button', {
        className: 'theme-toggle',
        onclick: function () {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        }
    }, createElement('span', { className: 'material-symbols-outlined' }, 'dark_mode'));
    document.body.appendChild(toggle);

    // Init Logic
    initTheme();

    // Attach event listeners for dynamic content
    initDynamicEvents();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function initDynamicEvents() {
    // Re-attach listeners to the featured buttons now that they are in DOM
    const enrollBtn = document.getElementById('enroll-featured');
    if (enrollBtn) {
        enrollBtn.addEventListener('click', () => {
            alert('Enroll functionality would trigger here.');
        });
    }

    const wishBtn = document.getElementById('wishlist-featured');
    if (wishBtn) {
        wishBtn.addEventListener('click', () => {
            wishBtn.classList.toggle('btn-outline');
            wishBtn.classList.toggle('btn-primary');
            const isAdded = wishBtn.classList.contains('btn-primary');
            alert(isAdded ? 'Added to Wishlist' : 'Removed from Wishlist');
        });
    }
}

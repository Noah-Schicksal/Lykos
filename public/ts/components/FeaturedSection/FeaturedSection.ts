import { createElement, loadCSS } from '../../utils.js';

export function FeaturedSection(): HTMLElement {
    loadCSS('js/components/FeaturedSection/FeaturedSection.css');

    const section = createElement('section', { className: 'featured-section' });

    section.appendChild(createElement('h2', {}, 'Course of the Month'));

    const card = createElement('div', { className: 'featured-card glass-panel' });

    // Image
    const imageDiv = createElement('div', { className: 'featured-image' });
    const img = createElement('img', {
        alt: 'Featured Course',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLEVdIVc5uxBTRJra3svY1M_056F7opU5FyfPImWutFm1MvFvuLOER2uTydYcskzm4Tpq5OAX-cUYw6T6ByKYTAs6C_-8kb8uyPUvbK2KuGVY2BDj_h9v23igVO8ymYJ4ba2GNRb0OtqRbMpkzv2PG2sXsYt414gWonDK1_tFV7ABFNGFaJUbWXm3px9Nug6QIYb4FTh_zuml5d0nw-BS5RgL8D6edLlhtR1hSN5YNx04ElP8GNw_pwXJogECFnn4bQd_ad2K0gzKx'
    });
    const gradient = createElement('div', { className: 'overlay-gradient' });
    imageDiv.append(img, gradient);

    // Content
    const content = createElement('div', { className: 'featured-content' });

    const pattern = createElement('div', { className: 'molecular-pattern' });

    const badge = createElement('div', { className: 'premium-badge' },
        createElement('span', { className: 'material-symbols-outlined' }, 'workspace_premium'),
        ' Premium Selection'
    );

    const title = createElement('h3', {}, 'Thermodynamics: The Physics and Chemistry of Energy');

    const desc = createElement('p', {}, 'Deep dive into entropy, enthalpy, and the laws of thermodynamics with world-renowned expert Prof. David Chen. This course includes 40 hours of HD video, downloadable molecular simulation tools, and a verified certificate.');

    // Stats
    const stats = createElement('div', { className: 'course-stats' });
    const stat1 = createElement('div', { className: 'stat-item' },
        createElement('span', { className: 'stat-label' }, 'Duration'),
        createElement('span', { className: 'stat-value' }, '42 Hours')
    );
    const stat2 = createElement('div', { className: 'stat-item' },
        createElement('span', { className: 'stat-label' }, 'Level'),
        createElement('span', { className: 'stat-value' }, 'Intermediate')
    );
    const stat3 = createElement('div', { className: 'stat-item' },
        createElement('span', { className: 'stat-label' }, 'Students'),
        createElement('span', { className: 'stat-value' }, '12,450+')
    );
    stats.append(stat1, stat2, stat3);

    // Buttons
    const buttons = createElement('div', { className: 'action-buttons' });
    const enrollBtn = createElement('button', { id: 'enroll-featured', 'data-course-id': 'thermo-001', className: 'btn btn-primary btn-lg' }, 'Enroll Now');
    const wishBtn = createElement('button', { id: 'wishlist-featured', 'data-course-id': 'thermo-001', className: 'btn btn-outline btn-lg' }, 'Add to Wishlist');
    buttons.append(enrollBtn, wishBtn);

    content.append(pattern, badge, title, desc, stats, buttons);
    card.append(imageDiv, content);
    section.appendChild(card);

    return section;
}

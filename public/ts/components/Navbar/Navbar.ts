import { createElement, loadCSS } from '../../utils.js';

export function Navbar(): HTMLElement {
    // Load component styles
    loadCSS('js/components/Navbar/Navbar.css');

    const nav = createElement('nav', { className: 'main-nav glass-nav sticky-nav' });
    const container = createElement('div', { className: 'container nav-container' });

    // Brand
    const brand = createElement('div', { className: 'nav-brand' });
    const logoBox = createElement('div', { className: 'logo-box' },
        createElement('span', { className: 'material-symbols-outlined logo-icon' }, 'science')
    );
    const brandName = createElement('span', { className: 'brand-name' }, 'ChemAcademy');
    brand.append(logoBox, brandName);

    // Explore Button
    const exploreBtn = createElement('button', { className: 'nav-explore-btn' },
        'Explore',
        createElement('span', { className: 'material-symbols-outlined' }, 'expand_more')
    );

    // Search
    const searchDiv = createElement('div', { className: 'nav-search' });
    const searchIconWrapper = createElement('div', { className: 'search-icon-wrapper' },
        createElement('span', { className: 'material-symbols-outlined' }, 'search')
    );
    const searchInput = createElement('input', {
        className: 'search-input',
        placeholder: 'Search organic mechanisms, thermodynamics, lab protocols...',
        type: 'text'
    });
    searchDiv.append(searchIconWrapper, searchInput);

    // Actions
    const actionsDiv = createElement('div', { className: 'nav-actions' });

    const linksDiv = createElement('div', { className: 'nav-links' },
        createElement('a', { href: '#' }, 'Solutions'),
        createElement('a', { href: '#' }, 'Teach')
    );

    const cartBtn = createElement('button', { className: 'icon-btn cart-btn' },
        createElement('span', { className: 'material-symbols-outlined' }, 'shopping_cart'),
        createElement('span', { id: 'cart-count-badge', className: 'badge', style: { display: 'none' } as any }, '0')
    );

    const notifBtn = createElement('button', { className: 'icon-btn notification-btn' },
        createElement('span', { className: 'material-symbols-outlined' }, 'notifications')
    );

    const avatar = createElement('div', { className: 'user-avatar' },
        createElement('img', {
            alt: 'User avatar',
            src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYH54o-pesZe_AaOpu7x_4oQp7OS21INF7YcU6bV52w6jH7YHib3H0iuZxRU9o91FKg0rVUUK8-7knG5zwYG-haYnr9ZYQ-ecwzVJLTlkxQjpj9OzF3dEle3RcTAuFMsnUnYxdNKLlfbUB1XjzcroWiCAPMZ1hygMfvLMV5y-2wrZ-yy0zAlklxLPXhC2lFCR-qlCbWyttDE9U4wwUpq2oA6QLGIsY2VbXPr8vwlv5mxgToWfuApwOBNiLmGif4UEExzp-7cKx5pdQ'
        })
    );

    actionsDiv.append(linksDiv, cartBtn, notifBtn, avatar);

    container.append(brand, exploreBtn, searchDiv, actionsDiv);
    nav.appendChild(container);

    return nav;
}

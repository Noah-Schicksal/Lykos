import { createElement } from '../utils.js';

export function Footer() {
    const footer = createElement('footer', { className: 'main-footer' });

    const container = createElement('div', { className: 'container footer-grid' });

    // Brand Col
    const col1 = createElement('div', { className: 'footer-brand-col' });
    const brand = createElement('div', { className: 'footer-brand' },
        createElement('div', { className: 'logo-box' }, createElement('span', { className: 'material-symbols-outlined logo-icon' }, 'science')),
        createElement('span', { className: 'brand-name' }, 'ChemAcademy')
    );
    const p = createElement('p', {}, 'The world\'s premier digital infrastructure for chemical education, molecular research, and laboratory training.');
    const social = createElement('div', { className: 'social-links' },
        createElement('a', { href: '#' }, createElement('span', { className: 'material-symbols-outlined' }, 'public')),
        createElement('a', { href: '#' }, createElement('span', { className: 'material-symbols-outlined' }, 'mail')),
        createElement('a', { href: '#' }, createElement('span', { className: 'material-symbols-outlined' }, 'forum'))
    );
    col1.append(brand, p, social);

    // Link Cols
    const createLinkCol = (title, items) => {
        const col = createElement('div', { className: 'footer-links-col' });
        col.appendChild(createElement('h4', {}, title));
        const ul = createElement('ul', {});
        items.forEach(item => {
            ul.appendChild(createElement('li', {}, createElement('a', { href: '#' }, item)));
        });
        col.appendChild(ul);
        return col;
    };

    const col2 = createLinkCol('Programs', ['Degree Tracks', 'Lab Certifications', 'Enterprise Research', 'Academic Partnerships']);
    const col3 = createLinkCol('Resources', ['Simulation Tools', 'Safety Protocols', 'Journal Access', 'API Documentation']);
    const col4 = createLinkCol('Global', ['Student Forum', 'Research Blog', 'Affiliates', 'Scholarships']);

    // Newsletter Col
    const col5 = createElement('div', { className: 'footer-newsletter-col' });
    col5.appendChild(createElement('h4', {}, 'Newsletter'));
    col5.appendChild(createElement('p', {}, 'Stay updated on breakthroughs in synthetic and computational chemistry.'));
    const form = createElement('div', { className: 'newsletter-form' },
        createElement('input', { type: 'email', placeholder: 'researcher@lab.edu' }),
        createElement('button', { className: 'btn btn-primary' }, 'Subscribe')
    );
    col5.appendChild(form);

    container.append(col1, col2, col3, col4, col5);

    // Bottom
    const bottom = createElement('div', { className: 'container footer-bottom' });
    bottom.appendChild(createElement('p', {}, '© 2024 ChemAcademy Education Inc. Molecularly Precise Education.'));
    const legal = createElement('div', { className: 'footer-legal' },
        createElement('a', { href: '#' }, 'Terms'),
        createElement('a', { href: '#' }, 'Privacy'),
        createElement('a', { href: '#' }, 'Security')
    );
    bottom.appendChild(legal);

    footer.append(container, bottom);
    return footer;
}

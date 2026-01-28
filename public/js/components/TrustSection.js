import { createElement } from '../utils.js';
import { trustedLogos } from '../data.js';

export function TrustSection() {
    const section = createElement('section', { className: 'trust-section' });

    section.appendChild(createElement('h2', {}, 'Trusted by Global Research Institutions'));

    const grid = createElement('div', { className: 'logos-grid' });

    trustedLogos.forEach(logo => {
        const item = createElement('div', { className: 'logo-item' },
            createElement('span', { className: 'material-symbols-outlined' }, logo.icon),
            ` ${logo.text}`
        );
        grid.appendChild(item);
    });

    section.appendChild(grid);
    return section;
}

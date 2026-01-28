import { createElement } from '../utils.js';

export function Hero() {
    const header = createElement('header', { className: 'hero-header' });

    const glow = createElement('div', { className: 'hero-glow' });

    const title = createElement('h1', {},
        'Chemistry Mastery ',
        createElement('span', { className: 'gradient-text' }, 'Courses')
    );

    const subtitle = createElement('p', { className: 'hero-subtitle' },
        'Unravel the molecular world with expert-led courses. From orbital mechanics to complex organic synthesis, master the science of matter.'
    );

    header.append(glow, title, subtitle);
    return header;
}

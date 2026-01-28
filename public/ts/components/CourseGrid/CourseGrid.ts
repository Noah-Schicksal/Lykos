import { createElement, loadCSS } from '../../utils.js';
import { CourseCard } from '../CourseCard/CourseCard.js';
import { Course } from '../../data.js';

export function CourseGrid(courses: Course[]): HTMLElement {
    loadCSS('js/components/CourseGrid/CourseGrid.css');

    const section = createElement('section', { className: 'courses-section' });

    // Header
    const header = createElement('div', { className: 'section-header' });
    const content = createElement('div', { className: 'header-content' });
    const h2 = createElement('h2', {},
        createElement('span', { className: 'material-symbols-outlined accent-icon' }, 'biotech'),
        ' Start Your Lab Journey'
    );
    const p = createElement('p', {}, 'Personalized curriculum based on your research interests.');
    content.append(h2, p);

    const navButtons = createElement('div', { className: 'nav-buttons' },
        createElement('button', { className: 'nav-btn' }, createElement('span', { className: 'material-symbols-outlined' }, 'chevron_left')),
        createElement('button', { className: 'nav-btn' }, createElement('span', { className: 'material-symbols-outlined' }, 'chevron_right'))
    );
    header.append(content, navButtons);

    // Grid
    const grid = createElement('div', { className: 'course-grid' });
    courses.forEach(course => {
        grid.appendChild(CourseCard(course));
    });

    section.append(header, grid);
    return section;
}

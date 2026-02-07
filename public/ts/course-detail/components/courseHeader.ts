/**
 * Course Header component - title, meta, rating
 */

import { el, icon, setHTML } from '../utils/dom.js';
import { Course } from '../../modules/courses.js';

export function renderCourseHeader(): DocumentFragment {
    const fragment = document.createDocumentFragment();

    // Breadcrumb
    const breadcrumb = el('nav', { className: 'breadcrumb' },
        el('a', { href: '/', className: 'breadcrumb-link' },
            icon('arrow_back', 'breadcrumb-icon'),
            ' Voltar'
        ),
        el('span', { className: 'breadcrumb-separator' }, '/'),
        el('span', { id: 'breadcrumb-category', className: 'breadcrumb-tag loading-text-inline' }, 'Carregando...')
    );
    fragment.appendChild(breadcrumb);

    // Header
    const header = el('header', { className: 'course-header' },
        el('h1', { id: 'course-title', className: 'course-title-main loading-text-inline' }, 'Carregando título...'),

        el('div', { className: 'course-meta-top' },
            // Rating
            el('div', { id: 'rating-meta-item', className: 'meta-item' },
                icon('star', 'star-icon'),
                el('span', { id: 'course-rating', className: 'rating-value' }, '--')
            ),
            // Instructor
            el('div', { className: 'meta-item' },
                icon('person'),
                el('span', null,
                    'Criado por ',
                    el('strong', { id: 'course-instructor', className: 'loading-text-inline' }, 'Carregando...')
                )
            ),
            // Date
            el('div', { className: 'meta-item' },
                icon('event'),
                el('span', null,
                    'Criado em ',
                    el('span', { id: 'course-created-date', className: 'loading-text-inline' }, 'Carregando...')
                )
            )
        )
    );
    fragment.appendChild(header);

    return fragment;
}

export function populateCourseHeader(course: Course): void {
    const removeLoading = (el: HTMLElement | null) => {
        if (el) el.classList.remove('loading-text-inline', 'loading-text', 'loading-compact', 'loading-price');
    };

    // Breadcrumb category
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = course.category?.name || 'Sem categoria';
        removeLoading(breadcrumbCategory);
    }

    // Title
    const titleEl = document.getElementById('course-title');
    if (titleEl) {
        titleEl.textContent = course.title;
        removeLoading(titleEl);
    }

    // Instructor
    const instructorEl = document.getElementById('course-instructor');
    if (instructorEl) {
        instructorEl.textContent = course.instructor?.name || 'Instrutor';
        removeLoading(instructorEl);
    }

    // Date
    const dateEl = document.getElementById('course-created-date');
    if (dateEl) {
        const date = new Date(course.createdAt);
        dateEl.textContent = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
        removeLoading(dateEl);
    }

    // Rating
    const ratingEl = document.getElementById('course-rating');
    if (ratingEl) {
        const rating = course.averageRating ?? 0;
        ratingEl.textContent = rating.toFixed(1);
    }

    // Page title
    document.title = `${course.title} | Lykos`;
}

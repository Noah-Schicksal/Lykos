/**
 * Courses View Component - Display student's enrolled courses
 */

import { el, icon, clearChildren } from '../utils/dom.js';
import type { Course } from '../state/studentState.js';

export function renderCoursesView(): HTMLElement {
    return el('section', { id: 'courses-view', className: 'content-section' },
        // Filters header section
        el('div', { className: 'section-header' },
            el('div', { className: 'search-container' },
                el('input', {
                    type: 'text',
                    id: 'course-search-input',
                    className: 'search-input',
                    placeholder: 'Buscar cursos...'
                }),
                el('span', { className: 'search-icon' }, icon('search'))
            ),
            el('div', { className: 'filter-container' },
                el('select', { id: 'category-filter', className: 'category-select' },
                    el('option', { value: '' }, 'Todas as Categorias')
                )
            )
        ),

        // Courses grid
        el('div', { id: 'courses-grid', className: 'courses-grid' },
            el('div', { className: 'col-span-full py-10 text-center' },
                el('p', { className: 'text-slate-500' }, 'Carregando cursos...')
            )
        )
    );
}

export function updateCoursesList(courses: Course[]): void {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    clearChildren(grid);

    if (courses.length === 0) {
        grid.appendChild(
            el('div', { className: 'col-span-full py-20 text-center bg-surface-dark border border-white/5 rounded-xl' },
                el('span', { className: 'material-symbols-outlined text-6xl text-slate-700 mb-4' }, 'school'),
                el('p', { className: 'text-slate-500 text-lg' }, 'Nenhum curso encontrado.'),
                el('a', { href: '/inicio', className: 'text-primary hover:underline mt-4 inline-block font-bold' }, 'Explorar Catálogo de Cursos')
            )
        );
        return;
    }

    courses.forEach(course => {
        grid.appendChild(renderCourseCard(course));
    });
}

export function renderCourseCard(course: Course): HTMLElement {
    const progress = course.progress || 0;
    const iconName = course.category && course.category.toLowerCase().includes('code') ? 'code' : 'school';
    const hasCoverImage = course.coverImageUrl && course.coverImageUrl.trim() !== '';

    return el('div', { className: 'course-card', 'data-course-id': course.id },
        el('div', { className: `course-cover ${!hasCoverImage ? 'no-image' : ''}` },
            hasCoverImage
                ? el('img', { src: course.coverImageUrl!, alt: course.title, className: 'course-cover-img' })
                : el('div', { className: 'course-cover-placeholder' },
                    icon(iconName)
                ),
            el('span', { className: `course-badge ${progress === 100 ? 'completed' : ''}` },
                progress === 100 ? 'Concluído' : 'Em Andamento'
            )
        ),
        el('div', { className: 'course-body' },
            el('h3', { className: 'course-title' }, course.title),
            el('p', { className: 'course-meta' }, course.instructorName || 'Lykos Instructor'),
            el('div', { className: 'course-progress' },
                el('div', { className: 'progress-bar-small' },
                    el('div', {
                        className: `progress-fill-small ${progress === 100 ? 'completed' : ''}`,
                        style: `width: ${progress}%`
                    })
                ),
                el('div', { className: `progress-info ${progress === 100 ? 'completed' : ''}` },
                    el('span', null, 'PROGRESSO'),
                    el('span', { className: 'progress-value' }, `${progress}%`)
                )
            ),
            el('div', { className: 'course-footer' },
                el('button', { className: 'btn-resume-course small', 'data-course-id': course.id }, 'Continuar Estudando')
            )
        )
    );
}

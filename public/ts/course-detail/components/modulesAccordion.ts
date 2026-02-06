/**
 * Modules Accordion component - course content structure
 */

import { el, icon, clearChildren } from '../utils/dom.js';

// Extended Module interface with classes
interface ModuleWithClasses {
    id: string;
    title: string;
    courseId: string;
    orderIndex: number;
    createdAt: string;
    classes?: {
        id: string;
        title: string;
        description?: string;
    }[];
}

export function renderModulesAccordion(): HTMLElement {
    const section = el('section', { id: 'course-content-section', className: 'course-content-section' },
        el('div', { className: 'content-header' },
            el('h2', { className: 'section-title-alt' }, 'Conteúdo do Curso'),
            el('div', { className: 'content-meta' },
                el('span', { id: 'module-count' }, '0 módulos'),
                ' • ',
                el('span', { id: 'class-count' }, '0 aulas')
            )
        ),
        el('div', { id: 'modules-accordion', className: 'modules-accordion' },
            el('p', { className: 'loading-text' }, 'Carregando conteúdo...')
        )
    );

    return section;
}

export function populateModulesAccordion(modules: ModuleWithClasses[]): void {
    const accordion = document.getElementById('modules-accordion');
    if (!accordion) return;

    if (modules.length === 0) {
        accordion.innerHTML = '<p class="loading-text">Nenhum módulo disponível.</p>';
        return;
    }

    // Update counts
    const moduleCountEl = document.getElementById('module-count');
    const classCountEl = document.getElementById('class-count');

    let totalClasses = 0;
    modules.forEach(module => {
        totalClasses += module.classes?.length || 0;
    });

    if (moduleCountEl) {
        moduleCountEl.textContent = `${modules.length} ${modules.length === 1 ? 'módulo' : 'módulos'}`;
    }
    if (classCountEl) {
        classCountEl.textContent = `${totalClasses} ${totalClasses === 1 ? 'aula' : 'aulas'}`;
    }

    // Clear and rebuild
    clearChildren(accordion);

    modules.forEach((module, index) => {
        const classes = module.classes || [];

        // Create module card
        const moduleCard = el('div', { className: 'module-card', 'data-module-index': String(index) },
            // Header
            el('div', { className: 'module-header' },
                el('div', { className: 'module-title-wrapper' },
                    el('div', { className: 'module-num' }, String(index + 1).padStart(2, '0')),
                    el('h3', { className: 'module-title-text' }, module.title)
                ),
                icon('expand_more', 'module-chevron')
            ),
            // Classes container
            el('div', { className: 'module-classes' },
                ...(classes.length > 0
                    ? classes.map((cls: any) =>
                        el('div', { className: 'class-item' },
                            el('div', { className: 'class-title-row' },
                                icon('play_circle', 'class-play-icon'),
                                el('span', null, cls.title)
                            )
                        )
                    )
                    : [el('p', { style: 'padding: 1rem; color: var(--text-muted); font-size: 0.85rem;' }, 'Nenhuma aula disponível.')]
                )
            )
        );

        accordion.appendChild(moduleCard);
    });
}

export function setupModuleAccordion(): void {
    const accordion = document.getElementById('modules-accordion');
    if (!accordion) return;

    accordion.addEventListener('click', (e) => {
        const header = (e.target as HTMLElement).closest('.module-header');
        if (!header) return;

        const card = header.closest('.module-card');
        if (card) {
            card.classList.toggle('active');
        }
    });
}

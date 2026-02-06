/**
 * Learning Outcomes component - what you will learn section
 */

import { el, icon, clearChildren } from '../utils/dom.js';

export function renderLearningOutcomes(): HTMLElement {
    const section = el('section', { className: 'learning-outcomes' },
        el('h2', { className: 'section-title-alt' }, 'O que você vai aprender'),
        el('p', { id: 'course-description', className: 'learning-description-text' },
            'Carregando descrição do curso...'
        ),
        el('div', { id: 'learning-list', className: 'learning-grid' },
            el('p', { className: 'loading-text' }, 'Carregando...')
        )
    );

    return section;
}

export function populateLearningOutcomes(description: string): void {
    const descEl = document.getElementById('course-description');
    const learningList = document.getElementById('learning-list');

    if (descEl) {
        descEl.classList.remove('loading-text-inline', 'loading-text');

        if (description.trim() === '') {
            descEl.textContent = 'O instrutor não especificou os objetivos de aprendizagem para este curso.';
            if (learningList) {
                learningList.style.display = 'none';
            }
            return;
        }

        descEl.textContent = description;
    }

    if (!learningList) return;

    clearChildren(learningList);
    learningList.style.display = 'grid';

    // Extract learning items from description (bullet points)
    const lines = description.split('\n');
    const learningItems: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        // Match lines starting with -, *, •, or numbers followed by . or )
        const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
        const numberMatch = trimmed.match(/^\d+[.)]\s+(.+)/);

        if (bulletMatch && bulletMatch[1]) {
            learningItems.push(bulletMatch[1].trim());
        } else if (numberMatch && numberMatch[1]) {
            learningItems.push(numberMatch[1].trim());
        }
    }

    if (learningItems.length === 0) {
        learningList.style.display = 'none';
        return;
    }

    learningItems.forEach(item => {
        const div = el('div', { className: 'learning-item' },
            icon('check_circle', 'check-icon'),
            el('span', null, item)
        );
        learningList.appendChild(div);
    });
}

/**
 * Reviews Section component - ratings and reviews
 */

import { el, icon, clearChildren } from '../utils/dom.js';

export function renderReviewsSection(): HTMLElement {
    const section = el('section', { id: 'reviews-section', className: 'reviews-section' },
        // Header
        el('div', { className: 'reviews-header' },
            el('h2', { className: 'section-title-alt' }, 'Avaliações'),
            el('div', { className: 'reviews-summary' },
                el('div', { className: 'reviews-summary-rating' },
                    icon('star', 'star-icon-large'),
                    el('span', { id: 'reviews-average', className: 'reviews-average-value' }, '--')
                ),
                el('span', { id: 'reviews-count', className: 'reviews-count' }, '0 avaliações')
            )
        ),

        // Review Form (hidden by default)
        renderReviewForm(),

        // Reviews List
        el('div', { id: 'reviews-list', className: 'reviews-list' },
            el('p', { className: 'loading-text' }, 'Carregando avaliações...')
        ),

        // Pagination
        el('div', { id: 'reviews-pagination', className: 'reviews-pagination' })
    );

    return section;
}

function renderReviewForm(): HTMLElement {
    return el('div', { id: 'review-form-container', className: 'review-form-container hidden' },
        el('h3', { className: 'review-form-title' }, 'Sua Avaliação'),
        el('form', { id: 'review-form', className: 'review-form' },
            // Star rating
            el('div', { className: 'star-rating-input' },
                el('span', { className: 'rating-label' }, 'Nota:'),
                el('div', { id: 'star-rating-selector', className: 'star-rating-selector' },
                    ...[1, 2, 3, 4, 5].map(rating =>
                        el('button', { type: 'button', className: 'star-btn', 'data-rating': String(rating) },
                            icon('star')
                        )
                    )
                ),
                el('span', { id: 'selected-rating-text', className: 'selected-rating-text' }, 'Selecione')
            ),

            // Comment textarea
            el('div', { className: 'form-group' },
                el('label', { className: 'form-label', for: 'review-comment' }, 'Comentário (opcional)'),
                (() => {
                    const textarea = document.createElement('textarea');
                    textarea.id = 'review-comment';
                    textarea.className = 'form-textarea';
                    textarea.rows = 3;
                    textarea.placeholder = 'Compartilhe sua experiência com o curso...';
                    return textarea;
                })()
            ),

            // Submit button
            el('button', { type: 'submit', className: 'btn-submit-review' },
                icon('send'),
                'Enviar Avaliação'
            )
        )
    );
}

export function renderReviewsList(reviews: any[], currentUserName: string = ''): void {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="reviews-empty">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>';
        return;
    }

    clearChildren(reviewsList);

    reviews.forEach(review => {
        const date = new Date(review.createdAt);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const isOwnReview = review.userName === currentUserName;

        // Create stars
        const starsContainer = el('div', { className: 'review-stars' });
        for (let i = 0; i < 5; i++) {
            const starIcon = icon('star', i < review.rating ? '' : 'empty');
            starsContainer.appendChild(starIcon);
        }

        const card = el('div', {
            className: isOwnReview ? 'review-card own-review' : 'review-card',
            style: isOwnReview ? 'border-color: var(--primary); border-width: 2px;' : ''
        },
            el('div', { className: 'review-card-header' },
                el('div', { className: 'review-user-info' },
                    el('span', { className: 'review-user-name' },
                        review.userName,
                        isOwnReview ? el('span', { style: 'color: var(--primary); font-size: 0.75rem;' }, ' (você)') : null
                    ),
                    el('span', { className: 'review-date' }, formattedDate)
                ),
                starsContainer
            ),
            review.comment ? el('p', { className: 'review-comment' }, review.comment) : null
        );

        reviewsList.appendChild(card);
    });
}

export function renderReviewsPagination(meta: any, onPageChange: (page: number) => void): void {
    const container = document.getElementById('reviews-pagination');
    if (!container) return;

    if (meta.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    clearChildren(container);

    const prevDisabled = meta.currentPage === 1;
    const nextDisabled = meta.currentPage >= meta.totalPages;

    // Previous button
    const prevBtn = el('button', {
        type: 'button',
        className: 'reviews-pagination-btn',
        disabled: prevDisabled
    }, icon('chevron_left')) as HTMLButtonElement;

    if (!prevDisabled) {
        prevBtn.addEventListener('click', () => onPageChange(meta.currentPage - 1));
    }

    // Info
    const info = el('span', { className: 'reviews-pagination-info' },
        `${meta.currentPage} de ${meta.totalPages}`
    );

    // Next button
    const nextBtn = el('button', {
        type: 'button',
        className: 'reviews-pagination-btn',
        disabled: nextDisabled
    }, icon('chevron_right')) as HTMLButtonElement;

    if (!nextDisabled) {
        nextBtn.addEventListener('click', () => onPageChange(meta.currentPage + 1));
    }

    container.appendChild(prevBtn);
    container.appendChild(info);
    container.appendChild(nextBtn);
}

export function updateReviewsSummary(average: number, count: number): void {
    const avgEl = document.getElementById('reviews-average');
    const countEl = document.getElementById('reviews-count');

    if (avgEl) avgEl.textContent = average.toFixed(1);
    if (countEl) countEl.textContent = `${count} ${count === 1 ? 'avaliação' : 'avaliações'}`;
}

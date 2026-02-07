/**
 * Review Handlers - reviews CRUD operations
 */

import { AppUI } from '../../utils/ui.js';
import {
    getCourseId,
    getSelectedRating,
    setSelectedRating,
    getUserHasReview,
    setUserHasReview,
    setCurrentReviewsPage,
    getUserFromStorage
} from '../state/courseDetailState.js';
import { renderReviewsList, renderReviewsPagination, updateReviewsSummary } from '../components/reviewsSection.js';

interface ReviewData {
    id: string;
    userName: string;
    rating: number;
    comment?: string;
    createdAt: string;
}

interface ReviewsResponse {
    data: ReviewData[];
    meta: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        averageRating: number;
    };
}

export async function loadReviews(courseId: string, page: number = 1): Promise<void> {
    setCurrentReviewsPage(page);

    const reviewsList = document.getElementById('reviews-list');

    if (reviewsList) {
        reviewsList.innerHTML = '<p class="loading-text">Carregando avaliações...</p>';
    }

    try {
        const response = await AppUI.apiFetch(`/courses/${courseId}/reviews?page=${page}&limit=5`) as ReviewsResponse;

        // Update summary
        updateReviewsSummary(response.meta.averageRating ?? 0, response.meta.totalItems);

        // Check if current user has a review
        const user = getUserFromStorage();
        const currentUserName = user?.name || '';

        const userReview = response.data.find(r => r.userName === currentUserName);
        if (userReview) {
            setUserHasReview(true);
            loadUserReviewIntoForm(userReview);
        }

        // Render reviews
        renderReviewsList(response.data, currentUserName);

        // Render pagination
        renderReviewsPagination(response.meta, (newPage) => loadReviews(courseId, newPage));

    } catch (error) {
        console.error('Error loading reviews:', error);
        if (reviewsList) {
            reviewsList.innerHTML = '<p class="reviews-empty">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>';
        }
    }
}

function loadUserReviewIntoForm(review: ReviewData): void {
    const starSelector = document.getElementById('star-rating-selector');
    const ratingText = document.getElementById('selected-rating-text');
    const commentEl = document.getElementById('review-comment') as HTMLTextAreaElement;
    const submitBtn = document.querySelector('.btn-submit-review') as HTMLButtonElement;
    const formTitle = document.querySelector('.review-form-title');

    // Set rating
    setSelectedRating(review.rating);
    if (starSelector) {
        const starBtns = starSelector.querySelectorAll('.star-btn');
        starBtns.forEach((btn, i) => {
            if (i < review.rating) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    if (ratingText) {
        ratingText.textContent = `${review.rating} estrela${review.rating > 1 ? 's' : ''}`;
    }

    // Set comment
    if (commentEl && review.comment) {
        commentEl.value = review.comment;
    }

    // Update UI to show "edit mode"
    if (formTitle) {
        formTitle.textContent = 'Editar sua Avaliação';
    }
    if (submitBtn) {
        submitBtn.innerHTML = `
      <span class="material-symbols-outlined">edit</span>
      Atualizar Avaliação
    `;
    }

    // Show delete button
    showDeleteButton();
}

function showDeleteButton(): void {
    const form = document.getElementById('review-form');
    if (!form) return;

    if (form.querySelector('.btn-delete-review')) return;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete-review';
    deleteBtn.innerHTML = `
    <span class="material-symbols-outlined">delete</span>
    Remover Avaliação
  `;
    deleteBtn.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  `;
    deleteBtn.onmouseover = () => {
        deleteBtn.style.background = '#ef4444';
        deleteBtn.style.color = 'white';
    };
    deleteBtn.onmouseout = () => {
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.color = '#ef4444';
    };

    deleteBtn.addEventListener('click', async () => {
        const courseId = getCourseId();
        if (!courseId) return;

        if (!confirm('Tem certeza que deseja remover sua avaliação?')) return;

        deleteBtn.disabled = true;
        try {
            await AppUI.apiFetch(`/courses/${courseId}/reviews`, {
                method: 'DELETE'
            });

            AppUI.showMessage('Avaliação removida com sucesso!', 'success');
            resetReviewForm();
            setUserHasReview(false);
            await loadReviews(courseId, 1);

        } catch (error: any) {
            AppUI.showMessage(error.message || 'Erro ao remover avaliação.', 'error');
        } finally {
            deleteBtn.disabled = false;
        }
    });

    const submitBtn = form.querySelector('.btn-submit-review');
    if (submitBtn && submitBtn.parentElement) {
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display: flex; gap: 1rem; flex-wrap: wrap;';
        submitBtn.parentElement.insertBefore(btnContainer, submitBtn);
        btnContainer.appendChild(submitBtn);
        btnContainer.appendChild(deleteBtn);
    }
}

function resetReviewForm(): void {
    const starSelector = document.getElementById('star-rating-selector');
    const ratingText = document.getElementById('selected-rating-text');
    const commentEl = document.getElementById('review-comment') as HTMLTextAreaElement;
    const submitBtn = document.querySelector('.btn-submit-review') as HTMLButtonElement;
    const formTitle = document.querySelector('.review-form-title');
    const deleteBtn = document.querySelector('.btn-delete-review');

    setSelectedRating(0);

    if (starSelector) {
        starSelector.querySelectorAll('.star-btn').forEach(btn => {
            btn.classList.remove('active', 'hover');
        });
    }
    if (ratingText) ratingText.textContent = 'Selecione';
    if (commentEl) commentEl.value = '';
    if (formTitle) formTitle.textContent = 'Sua Avaliação';
    if (submitBtn) {
        submitBtn.innerHTML = `
      <span class="material-symbols-outlined">send</span>
      Enviar Avaliação
    `;
    }
    if (deleteBtn) deleteBtn.remove();
}

export function setupReviewForm(courseId: string, isEnrolled: boolean): void {
    const formContainer = document.getElementById('review-form-container');
    const form = document.getElementById('review-form') as HTMLFormElement;
    const starSelector = document.getElementById('star-rating-selector');
    const ratingText = document.getElementById('selected-rating-text');

    // Only show form if user is enrolled
    if (!isEnrolled || !localStorage.getItem('auth_user')) {
        if (formContainer) formContainer.classList.add('hidden');
        return;
    }

    if (formContainer) formContainer.classList.remove('hidden');

    // Setup star rating interaction
    if (starSelector) {
        const starBtns = starSelector.querySelectorAll('.star-btn');

        starBtns.forEach((btn, index) => {
            btn.addEventListener('mouseenter', () => {
                starBtns.forEach((b, i) => {
                    if (i <= index) {
                        b.classList.add('hover');
                    } else {
                        b.classList.remove('hover');
                    }
                });
            });

            btn.addEventListener('click', () => {
                setSelectedRating(index + 1);
                starBtns.forEach((b, i) => {
                    if (i <= index) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
                if (ratingText) {
                    const rating = index + 1;
                    ratingText.textContent = `${rating} estrela${rating > 1 ? 's' : ''}`;
                }
            });
        });

        starSelector.addEventListener('mouseleave', () => {
            const currentRating = getSelectedRating();
            starBtns.forEach((btn, i) => {
                btn.classList.remove('hover');
                if (i < currentRating) {
                    btn.classList.add('active');
                }
            });
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const selectedRating = getSelectedRating();
            if (selectedRating === 0) {
                AppUI.showMessage('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
                return;
            }

            const commentEl = document.getElementById('review-comment') as HTMLTextAreaElement;
            const comment = commentEl?.value.trim() || '';

            const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (submitBtn) submitBtn.disabled = true;

            try {
                await AppUI.apiFetch(`/courses/${courseId}/reviews`, {
                    method: 'POST',
                    body: JSON.stringify({
                        rating: selectedRating,
                        comment: comment
                    })
                });

                const message = getUserHasReview() ? 'Avaliação atualizada com sucesso!' : 'Avaliação enviada com sucesso!';
                AppUI.showMessage(message, 'success');
                setUserHasReview(true);

                await loadReviews(courseId, 1);

                // Update main rating display
                const mainRatingEl = document.getElementById('course-rating');
                const avgEl = document.getElementById('reviews-average');
                if (mainRatingEl && avgEl) {
                    mainRatingEl.textContent = avgEl.textContent || '--';
                }

            } catch (error: any) {
                AppUI.showMessage(error.message || 'Erro ao enviar avaliação.', 'error');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}

/**
 * Sidebar component - course image, price, actions
 */

import { el, icon } from '../utils/dom.js';
import { Course } from '../../modules/courses.js';

export function renderSidebar(): HTMLElement {
    const aside = el('aside', { className: 'course-sidebar' },
        el('div', { className: 'sidebar-card' },
            // Image container
            el('div', { className: 'sidebar-image-container' },
                el('div', { className: 'sidebar-img-placeholder' },
                    (() => {
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.setAttribute('width', '48');
                        svg.setAttribute('height', '48');
                        svg.setAttribute('viewBox', '0 0 24 24');
                        svg.setAttribute('fill', 'none');
                        svg.setAttribute('stroke', 'currentColor');
                        svg.setAttribute('stroke-width', '1.5');
                        svg.setAttribute('stroke-linecap', 'round');
                        svg.setAttribute('stroke-linejoin', 'round');
                        svg.innerHTML = `
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            `;
                        return svg;
                    })()
                ),
                (() => {
                    const img = document.createElement('img');
                    img.id = 'course-sidebar-img';
                    img.src = '';
                    img.alt = 'Capa do Curso';
                    img.className = 'sidebar-course-img';
                    img.style.display = 'none';
                    return img;
                })()
            ),

            // Content
            el('div', { className: 'sidebar-content' },
                // Price
                el('div', { className: 'price-container' },
                    el('div', { className: 'price-values' },
                        el('span', { id: 'course-price', className: 'current-price loading-text-inline loading-price' }, 'Carregando...')
                    )
                ),

                // Slots/Vagas
                el('div', { id: 'course-slots', className: 'slots-container' },
                    icon('groups'),
                    el('span', { id: 'slots-info', className: 'loading-text-inline loading-compact' }, 'Carregando vagas...')
                ),

                // Action buttons
                el('div', { className: 'action-buttons', style: 'display: none;' },
                    el('button', { id: 'btn-buy-now', className: 'btn-primary-large' }, 'Comprar agora'),
                    el('button', { id: 'btn-add-to-cart', className: 'btn-secondary-large' }, 'Adicionar ao carrinho')
                ),

                // Footer actions
                el('div', { className: 'sidebar-footer-actions' },
                    el('button', { id: 'btn-share-course', className: 'btn-link-sidebar' }, 'COMPARTILHAR')
                )
            )
        )
    );

    return aside;
}

export function populateSidebar(course: Course): void {
    const removeLoading = (el: HTMLElement | null) => {
        if (el) el.classList.remove('loading-text-inline', 'loading-text', 'loading-compact', 'loading-price');
    };

    // Price
    const priceEl = document.getElementById('course-price');
    if (priceEl) {
        priceEl.textContent = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(course.price);
        removeLoading(priceEl);
    }

    // Slots
    const slotsInfoEl = document.getElementById('slots-info');
    if (slotsInfoEl) {
        const maxStudents = course.maxStudents ?? 0;
        const enrolledCount = course.enrolledCount ?? 0;
        const availableSlots = maxStudents - enrolledCount;

        if (maxStudents > 0) {
            slotsInfoEl.textContent = `${availableSlots} vagas disponíveis de ${maxStudents}`;
        } else {
            slotsInfoEl.textContent = 'Vagas ilimitadas';
        }
        removeLoading(slotsInfoEl);
    }

    // Image
    const sidebarImg = document.getElementById('course-sidebar-img') as HTMLImageElement;
    const imgPlaceholder = document.querySelector('.sidebar-img-placeholder') as HTMLElement;

    if (sidebarImg) {
        let imageUrl = course.coverImageUrl;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = '/' + imageUrl;
        }

        if (imageUrl) {
            sidebarImg.onload = function () {
                sidebarImg.style.display = 'block';
                if (imgPlaceholder) imgPlaceholder.style.display = 'none';
            };
            sidebarImg.onerror = function () {
                sidebarImg.style.display = 'none';
                if (imgPlaceholder) imgPlaceholder.style.display = 'flex';
            };
            sidebarImg.src = imageUrl;
        } else {
            sidebarImg.style.display = 'none';
            if (imgPlaceholder) imgPlaceholder.style.display = 'flex';
        }
    }
}

export function updateSidebarForEnrolled(): void {
    const actionButtons = document.querySelector('.action-buttons') as HTMLElement;
    if (actionButtons) {
        actionButtons.style.display = 'flex';
        actionButtons.innerHTML = `
      <div class="status-card status-enrolled">
        <span class="material-symbols-outlined status-icon">check_circle</span>
        <span class="status-text">Você já possui este curso</span>
        <a href="/estudante" class="status-link">Acessar conteúdo <span class="material-symbols-outlined" style="font-size: 1rem; vertical-align: middle;">arrow_forward</span></a>
      </div>
    `;
    }
}

export function updateSidebarForCreator(): void {
    const actionButtons = document.querySelector('.action-buttons') as HTMLElement;
    const btnBuyNow = document.getElementById('btn-buy-now');
    const btnAddToCart = document.getElementById('btn-add-to-cart');

    if (btnBuyNow) btnBuyNow.style.display = 'none';
    if (btnAddToCart) btnAddToCart.style.display = 'none';

    if (actionButtons) {
        actionButtons.style.display = 'flex';
        actionButtons.innerHTML = `
      <div class="status-card status-creator">
        <span class="material-symbols-outlined status-icon">verified</span>
        <span class="status-text">Você é o criador deste curso</span>
      </div>
    `;
    }
}

export function showActionButtons(): void {
    const actionButtons = document.querySelector('.action-buttons') as HTMLElement;
    if (actionButtons) {
        actionButtons.style.display = 'flex';
    }
}

import { el, icon } from '../utils/dom.js';

/**
 * Renders pagination controls
 */
export function renderPagination(
  currentPage: number,
  totalPages: number,
): HTMLElement {
  const effectiveTotalPages = totalPages < 1 ? 1 : totalPages;
  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage >= effectiveTotalPages;

  return el(
    'div',
    { style: 'display: flex; align-items: center; gap: 1rem;' },
    el(
      'button',
      {
        type: 'button',
        className: `btn-icon ${prevDisabled ? 'disabled' : ''}`,
        'data-page': String(currentPage - 1),
        style: `border: 1px solid var(--border-med); border-radius: 0.5rem; ${prevDisabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}`,
        disabled: prevDisabled,
      },
      icon('chevron_left'),
    ),
    el(
      'span',
      { style: 'color: var(--text-muted); font-size: 0.875rem;' },
      `Página ${currentPage} de ${effectiveTotalPages}`,
    ),
    el(
      'button',
      {
        type: 'button',
        className: `btn-icon ${nextDisabled ? 'disabled' : ''}`,
        'data-page': String(currentPage + 1),
        style: `border: 1px solid var(--border-med); border-radius: 0.5rem; ${nextDisabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}`,
        disabled: nextDisabled,
      },
      icon('chevron_right'),
    ),
  );
}

/**
 * Renders the validate certificate button
 */
export function renderValidateButton(): HTMLElement {
  return el(
    'div',
    {
      style:
        'width: 100%; display: flex; justify-content: center; margin-top: 1rem;',
    },
    el(
      'a',
      {
        href: '/validar-certificado',
        className: 'btn-validate-home',
        style: `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1.2rem;
        background: rgba(94, 23, 235, 0.1);
        border: 1px solid var(--primary);
        border-radius: 0.5rem;
        color: var(--text-primary);
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
      `,
      },
      el(
        'span',
        {
          className: 'material-symbols-outlined',
          style: 'font-size: 1.2rem; color: var(--primary);',
        },
        'verified',
      ),
      'Validar Certificado',
    ),
  );
}

/**
 * Updates pagination controls in both top and bottom containers
 */
export function updatePagination(
  currentPage: number,
  totalPages: number,
): void {
  const topContainer = document.getElementById('pagination-top');
  const bottomContainer = document.getElementById('pagination-bottom');

  const paginationControls = renderPagination(currentPage, totalPages);

  if (topContainer) {
    topContainer.innerHTML = '';
    topContainer.appendChild(paginationControls.cloneNode(true));
  }

  if (bottomContainer) {
    bottomContainer.innerHTML = '';
    const wrapper = el('div', {
      style:
        'display: flex; flex-direction: column; align-items: center; width: 100%;',
    });
    wrapper.appendChild(renderPagination(currentPage, totalPages));
    wrapper.appendChild(renderValidateButton());
    bottomContainer.appendChild(wrapper);
  }
}

/**
 * Sets up pagination click handlers
 */
export function setupPaginationHandlers(
  onPageChange: (page: number) => void,
): void {
  ['pagination-top', 'pagination-bottom'].forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      container.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('button');
        if (
          btn &&
          !btn.classList.contains('disabled') &&
          !btn.hasAttribute('disabled')
        ) {
          const page = parseInt(btn.getAttribute('data-page') || '1');
          onPageChange(page);
        }
      });
    }
  });
}

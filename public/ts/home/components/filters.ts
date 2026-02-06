import { el, icon } from '../utils/dom.js';

/**
 * Renders the search and category filters
 */
export function renderFilters(): HTMLElement {
  return el(
    'div',
    { className: 'filters-container' },
    el(
      'div',
      { className: 'search-filter' },
      icon('search'),
      el('input', {
        id: 'main-search-input',
        placeholder: 'Buscar cursos...',
        type: 'text',
      }),
    ),
    el(
      'div',
      { className: 'category-filter' },
      el(
        'select',
        { id: 'category-filter' },
        el('option', { value: '' }, 'Todas Categorias'),
        el('option', { disabled: true }, 'Carregando...'),
      ),
    ),
  );
}

/**
 * Updates the category filter options
 */
export function updateCategoryFilter(
  categories: Array<{ id: string; name: string }>,
): void {
  const select = document.getElementById(
    'category-filter',
  ) as HTMLSelectElement;
  if (!select) return;

  select.innerHTML = '';
  select.appendChild(el('option', { value: '' }, 'Todas Categorias'));

  categories.forEach((cat) => {
    select.appendChild(el('option', { value: cat.id }, cat.name));
  });
}

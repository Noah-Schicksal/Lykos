import { Categories } from '../../modules/categories.js';
import { AppUI } from '../../utils/ui.js';
import { getAllCategories, setAllCategories } from '../state/instructorState.js';
import { showCategoryModal } from '../components/modals.js';
import { el, clearChildren } from '../utils/dom.js';

export function setupCategoryHandlers(): void {
  const categoryCreateForm = document.getElementById(
    'category-create-form',
  ) as HTMLFormElement;

  if (categoryCreateForm) {
    categoryCreateForm.addEventListener('submit', handleCategoryFormSubmit);
  }

  document
    .getElementById('btn-manage-categories')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      showCategoriesView();
    });

  document
    .getElementById('btn-back-from-categories')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      const loggedInFace = document.getElementById('auth-logged-in');
      const categoriesFace = document.getElementById('auth-categories-view');
      if (loggedInFace && categoriesFace) {
        loggedInFace.classList.remove('hidden');
        categoriesFace.classList.add('hidden');
      }
    });
}

function showCategoriesView(): void {
  const loggedInFace = document.getElementById('auth-logged-in');
  const categoriesFace = document.getElementById('auth-categories-view');

  if (loggedInFace && categoriesFace) {
    loggedInFace.classList.add('hidden');
    categoriesFace.classList.remove('hidden');

    Categories.renderCategoriesList('categories-list-container');
  }
}

async function handleCategoryFormSubmit(e: Event): Promise<void> {
  e.preventDefault();

  const nameInput = document.getElementById(
    'category-name-input',
  ) as HTMLInputElement;
  const name = nameInput.value.trim();

  if (!name) {
    AppUI.showMessage(
      'Por favor, digite um nome para a categoria.',
      'error',
    );
    return;
  }

  try {
    await Categories.create(name);
    nameInput.value = '';
    AppUI.showMessage('Categoria criada com sucesso!', 'success');

    const allCats = await Categories.getAll();
    setAllCategories(allCats);

    Categories.renderCategoriesList('categories-list-container');
  } catch (error: any) {
    console.error('Error creating category:', error);
    AppUI.showMessage(
      error.message || 'Erro ao criar categoria',
      'error',
    );
  }
}

export function populateCategories(
  selectElement: HTMLSelectElement,
  selectedId?: string,
): void {
  const categories = getAllCategories();

  clearChildren(selectElement);

  selectElement.appendChild(
    el('option', { value: '' }, 'Selecione uma categoria...')
  );

  const newCatOption = el('option', { value: '__new_category__' }, '+ Nova Categoria') as HTMLOptionElement;
  newCatOption.style.fontWeight = 'bold';
  newCatOption.style.color = 'var(--primary)';
  selectElement.appendChild(newCatOption);

  categories.forEach((cat) => {
    const option = el('option', { value: cat.id }, cat.name) as HTMLOptionElement;
    if (selectedId && cat.id === selectedId) {
      option.selected = true;
    }
    selectElement.appendChild(option);
  });

  if ((selectElement as any)._hasListeners) {
    return;
  }

  let previousValue = selectElement.value;

  selectElement.addEventListener('focus', () => {
    previousValue = selectElement.value;
  });

  selectElement.addEventListener('change', async () => {
    if (selectElement.value === '__new_category__') {
      selectElement.value = previousValue;

      const categoryName = await showCategoryModal();
      if (categoryName) {
        try {
          const newCategory = await Categories.create(categoryName);
          if (newCategory && newCategory.id) {
            const allCats = await Categories.getAll();
            setAllCategories(allCats);

            populateCategories(selectElement, newCategory.id);
            selectElement.value = newCategory.id;
            previousValue = newCategory.id;
          }
        } catch (error: any) {
          console.error('Error creating category:', error);
          AppUI.showMessage(
            error.message || 'Erro ao criar categoria',
            'error',
          );
        }
      }
    } else {
      previousValue = selectElement.value;
    }
  });

  (selectElement as any)._hasListeners = true;
}

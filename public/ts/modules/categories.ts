/**
 * Categories Module
 */
import { AppUI } from '../utils/ui.js';

export interface Category {
  id: string;
  name: string;
}

export interface CategoryWithCourses extends Category {
  courses?: any[];
}

export const Categories = {
  /**
   * Listar todas as categorias
   */
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await AppUI.apiFetch('/categories', {
        method: 'GET',
      });

      return response.data || [];
    } catch (error: any) {
      AppUI.showMessage(
        error.message || 'Erro ao carregar categorias',
        'error',
      );
      throw error;
    }
  },

  /**
   * Listar cursos de uma categoria
   */
  getCoursesByCategory: async (categoryId: string) => {
    try {
      const response = await AppUI.apiFetch(
        `/categories/${categoryId}/courses`,
        {
          method: 'GET',
        },
      );

      return response.data || [];
    } catch (error: any) {
      AppUI.showMessage(
        error.message || 'Erro ao carregar cursos da categoria',
        'error',
      );
      throw error;
    }
  },

  /**
   * Criar nova categoria (apenas INSTRUCTOR)
   */
  create: async (name: string): Promise<Category> => {
    try {
      const response = await AppUI.apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });

      AppUI.showMessage(
        response.message || 'Categoria criada com sucesso!',
        'success',
      );
      window.dispatchEvent(new CustomEvent('categories-changed'));
      return response.data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao criar categoria', 'error');
      throw error;
    }
  },

  /**
   * Atualizar categoria (apenas INSTRUCTOR)
   */
  update: async (categoryId: string, name: string): Promise<Category> => {
    try {
      const response = await AppUI.apiFetch(`/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      });

      AppUI.showMessage(
        response.message || 'Categoria atualizada com sucesso!',
        'success',
      );
      window.dispatchEvent(new CustomEvent('categories-changed'));
      return response.data;
    } catch (error: any) {
      AppUI.showMessage(
        error.message || 'Erro ao atualizar categoria',
        'error',
      );
      throw error;
    }
  },

  /**
   * Deletar categoria (apenas INSTRUCTOR)
   */
  delete: async (categoryId: string): Promise<boolean> => {
    const confirmed = await AppUI.promptModal(
      'Excluir Categoria',
      'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.',
    );

    if (!confirmed) return false;

    try {
      await AppUI.apiFetch(`/categories/${categoryId}`, {
        method: 'DELETE',
      });

      AppUI.showMessage('Categoria excluída com sucesso!', 'success');
      window.dispatchEvent(new CustomEvent('categories-changed'));
      return true;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao excluir categoria', 'error');
      return false;
    }
  },

  /**
   * Renderizar lista de categorias no DOM
   */
  renderCategoriesList: async (containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const categories = await Categories.getAll();

      if (categories.length === 0) {
        container.innerHTML =
          '<p style="color: var(--text-muted);">Nenhuma categoria encontrada.</p>';
        return;
      }

      container.innerHTML = categories
        .map(
          (category) => `
                <div class="category-item" data-id="${category.id}">
                    <span class="category-name">${category.name}</span>
                    <div class="category-actions">
                        <button class="btn-category-edit" data-id="${category.id}" data-name="${category.name}">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="btn-category-delete" data-id="${category.id}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `,
        )
        .join('');

      // Add event listeners
      container.querySelectorAll('.btn-category-edit').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          const currentName = btn.getAttribute('data-name');
          if (!id || !currentName) return;

          const newName = prompt(
            'Digite o novo nome da categoria:',
            currentName,
          );
          if (newName && newName.trim() && newName !== currentName) {
            await Categories.update(id, newName.trim());
            Categories.renderCategoriesList(containerId);
          }
        });
      });

      container.querySelectorAll('.btn-category-delete').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          if (!id) return;

          const deleted = await Categories.delete(id);
          if (deleted) {
            Categories.renderCategoriesList(containerId);
          }
        });
      });
    } catch (error) {
      container.innerHTML =
        '<p style="color: #ef4444;">Erro ao carregar categorias.</p>';
    }
  },
};

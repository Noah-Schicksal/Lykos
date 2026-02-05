/**
 * Courses Module
 */
import { AppUI } from '../utils/ui.js';

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  coverImageUrl?: string;
  maxStudents?: number;
  enrolledCount?: number;
  averageRating?: number;
  instructorId: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  instructor?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export const Courses = {
  /**
   * Listar todos os cursos (com paginação)
   */
  getAll: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<any> => {
    try {
      let url = `/courses?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await AppUI.apiFetch(url, {
        method: 'GET',
      });

      return response;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao carregar cursos', 'error');
      throw error;
    }
  },

  /**
   * Buscar curso por ID
   */
  getById: async (courseId: string): Promise<Course> => {
    try {
      const response = await AppUI.apiFetch(`/courses/${courseId}`, {
        method: 'GET',
      });

      return response.data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao carregar curso', 'error');
      throw error;
    }
  },

  /**
   * Criar novo curso (apenas INSTRUCTOR)
   */
  create: async (
    data: {
      title: string;
      description: string;
      price: number;
      categoryId: string;
      maxStudents?: number;
    },
    coverImage?: File,
  ): Promise<Course> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('categoryId', data.categoryId);
      if (data.maxStudents) {
        formData.append('maxStudents', data.maxStudents.toString());
      }
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      const response = await fetch('/courses', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || 'Erro ao criar curso',
        );
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao criar curso', 'error');
      throw error;
    }
  },

  /**
   * Atualizar curso (apenas INSTRUCTOR dono)
   */
  update: async (
    courseId: string,
    data: {
      title?: string;
      description?: string;
      price?: number;
      categoryId?: string;
      maxStudents?: number;
    },
    coverImage?: File,
    clearCover?: boolean,
  ): Promise<Course> => {
    try {
      // Use FormData if we have a file or need to clear the cover
      if (coverImage || clearCover) {
        const formData = new FormData();
        if (data.title) formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.price !== undefined) formData.append('price', data.price.toString());
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.maxStudents !== undefined) formData.append('maxStudents', data.maxStudents.toString());
        if (coverImage) formData.append('coverImage', coverImage);
        if (clearCover) formData.append('clearCover', 'true');

        const response = await fetch(`/courses/${courseId}`, {
          method: 'PUT',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'Erro ao atualizar curso');
        }

        const result = await response.json();
        return result.data;
      }

      // Otherwise use JSON
      const response = await AppUI.apiFetch(`/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return response.data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao atualizar curso', 'error');
      throw error;
    }
  },

  /**
   * Deletar curso (apenas INSTRUCTOR dono)
   */
  delete: async (courseId: string): Promise<boolean> => {
    const confirmed = await AppUI.promptModal(
      'Excluir Curso',
      'Tem certeza que deseja excluir este curso? Todos os módulos e aulas serão excluídos. Esta ação não pode ser desfeita.',
    );

    if (!confirmed) return false;

    try {
      await AppUI.apiFetch(`/courses/${courseId}`, {
        method: 'DELETE',
      });

      return true;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao excluir curso', 'error');
      return false;
    }
  },

  /**
   * Listar cursos do instrutor logado
   */
  getMyCourses: async (): Promise<Course[]> => {
    try {
      const response = await AppUI.apiFetch('/courses/authored', {
        method: 'GET',
      });

      return response.data || [];
    } catch (error: any) {
      AppUI.showMessage(
        error.message || 'Erro ao carregar seus cursos',
        'error',
      );
      throw error;
    }
  },
};

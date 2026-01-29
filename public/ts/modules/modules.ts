/**
 * Modules Module
 */
import { AppUI } from '../utils/ui.js';

export interface Module {
  id: string;
  title: string;
  courseId: string;
  orderIndex: number;
  createdAt: string;
}

export const Modules = {
  /**
   * Listar módulos de um curso
   */
  getByCourse: async (courseId: string): Promise<Module[]> => {
    try {
      const response = await AppUI.apiFetch(`/courses/${courseId}/modules`, {
        method: 'GET',
      });

      return response.data || [];
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao carregar módulos', 'error');
      throw error;
    }
  },

  /**
   * Buscar módulo por ID
   */
  getById: async (moduleId: string): Promise<any> => {
    try {
      const response = await AppUI.apiFetch(`/modules/${moduleId}`, {
        method: 'GET',
      });

      return response.data || response;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao carregar módulo', 'error');
      throw error;
    }
  },

  /**
   * Criar novo módulo
   */
  create: async (
    courseId: string,
    data: {
      title: string;
      orderIndex: number;
    },
  ): Promise<Module> => {
    try {
      const response = await AppUI.apiFetch(`/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response.data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao criar módulo', 'error');
      throw error;
    }
  },

  /**
   * Atualizar módulo
   */
  update: async (
    moduleId: string,
    data: {
      title?: string;
      orderIndex?: number;
    },
  ): Promise<Module> => {
    try {
      const response = await AppUI.apiFetch(`/modules/${moduleId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return response.data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao atualizar módulo', 'error');
      throw error;
    }
  },

  /**
   * Deletar módulo
   */
  delete: async (moduleId: string): Promise<boolean> => {
    try {
      await AppUI.apiFetch(`/modules/${moduleId}`, {
        method: 'DELETE',
      });

      return true;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao excluir módulo', 'error');
      return false;
    }
  },

  /**
   * Criar aula em um módulo
   */
  createClass: async (
    moduleId: string,
    data: {
      title: string;
      description: string;
      videoUrl: string;
    },
  ): Promise<any> => {
    try {
      const response = await AppUI.apiFetch(`/modules/${moduleId}/classes`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response.data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao criar aula', 'error');
      throw error;
    }
  },
};

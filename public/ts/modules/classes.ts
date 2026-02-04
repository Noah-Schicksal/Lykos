/**
 * Classes Module
 */
import { AppUI } from '../utils/ui.js';

export interface Class {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  materialUrl?: string;
  moduleId: string;
  createdAt: string;
}

export const Classes = {
  /**
   * Buscar aula por ID
   */
  getById: async (classId: string): Promise<Class> => {
    try {
      const response = await AppUI.apiFetch(`/classes/${classId}`, {
        method: 'GET',
      });

      return response.data || response;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao carregar aula', 'error');
      throw error;
    }
  },

  /**
   * Atualizar aula
   */
  update: async (
    classId: string,
    data: {
      title?: string;
      description?: string;
      videoUrl?: string;
      materialUrl?: string;
    },
  ): Promise<Class> => {
    try {
      const response = await AppUI.apiFetch(`/classes/${classId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return response.data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao atualizar aula', 'error');
      throw error;
    }
  },

  /**
   * Upload Material File
   */
  uploadMaterial: async (classId: string, file: File): Promise<{ materialUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      // Content-Type must be undefined so browser sets boundary
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`/classes/${classId}/upload`, {
        method: 'POST',
        body: formData,
        headers: headers,
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro no upload');
      return data.data || data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao enviar arquivo', 'error');
      throw error;
    }
  },
  
  /**
   * Upload Video (MP4)
   */
  uploadVideo: async (classId: string, file: File): Promise<{ videoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`/classes/${classId}/video`, {
        method: 'POST',
        body: formData,
        headers: headers,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro no upload do vídeo');
      return data.data || data;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao enviar vídeo', 'error');
      throw error;
    }
  },

  /**
   * Deletar aula
   */
  delete: async (classId: string): Promise<boolean> => {
    try {
      await AppUI.apiFetch(`/classes/${classId}`, {
        method: 'DELETE',
      });

      return true;
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao excluir aula', 'error');
      return false;
    }
  },

  /**
   * Marcar aula como concluída (para estudantes)
   */
  markAsCompleted: async (
    classId: string,
    completed: boolean,
  ): Promise<void> => {
    try {
      const response = await AppUI.apiFetch(`/classes/${classId}/progress`, {
        method: 'POST',
        body: JSON.stringify({ completed }),
      });

      AppUI.showMessage(
        completed ? 'Aula marcada como concluída!' : 'Progresso atualizado',
        'success',
      );
    } catch (error: any) {
      AppUI.showMessage(
        error.message || 'Erro ao atualizar progresso',
        'error',
      );
      throw error;
    }
  },

  /**
   * Remover conclusão da aula
   */
  removeProgress: async (classId: string): Promise<void> => {
    try {
      await AppUI.apiFetch(`/classes/${classId}/progress`, {
        method: 'DELETE',
      });

      AppUI.showMessage('Progresso removido!', 'info');
    } catch (error: any) {
      AppUI.showMessage(error.message || 'Erro ao remover progresso', 'error');
      throw error;
    }
  },
};

/**
 * Classes Module
 */
import { AppUI } from '../utils/ui.js';
export const Classes = {
    /**
     * Buscar aula por ID
     */
    getById: async (classId) => {
        try {
            const response = await AppUI.apiFetch(`/classes/${classId}`, {
                method: 'GET',
            });
            return response.data || response;
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao carregar aula', 'error');
            throw error;
        }
    },
    /**
     * Atualizar aula
     */
    update: async (classId, data) => {
        try {
            const response = await AppUI.apiFetch(`/classes/${classId}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            return response.data;
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao atualizar aula', 'error');
            throw error;
        }
    },
    /**
     * Upload Material File
     */
    uploadMaterial: async (classId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('auth_token');
        const headers = {
        // Content-Type must be undefined so browser sets boundary
        };
        if (token)
            headers['Authorization'] = `Bearer ${token}`;
        try {
            const response = await fetch(`/classes/${classId}/upload`, {
                method: 'POST',
                body: formData,
                headers: headers,
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Erro no upload');
            return data.data || data;
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao enviar arquivo', 'error');
            throw error;
        }
    },
    /**
     * Deletar aula
     */
    delete: async (classId) => {
        try {
            await AppUI.apiFetch(`/classes/${classId}`, {
                method: 'DELETE',
            });
            return true;
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao excluir aula', 'error');
            return false;
        }
    },
    /**
     * Marcar aula como concluída (para estudantes)
     */
    markAsCompleted: async (classId, completed) => {
        try {
            const response = await AppUI.apiFetch(`/classes/${classId}/progress`, {
                method: 'POST',
                body: JSON.stringify({ completed }),
            });
            AppUI.showMessage(completed ? 'Aula marcada como concluída!' : 'Progresso atualizado', 'success');
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao atualizar progresso', 'error');
            throw error;
        }
    },
    /**
     * Remover conclusão da aula
     */
    removeProgress: async (classId) => {
        try {
            await AppUI.apiFetch(`/classes/${classId}/progress`, {
                method: 'DELETE',
            });
            AppUI.showMessage('Progresso removido!', 'info');
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao remover progresso', 'error');
            throw error;
        }
    },
};

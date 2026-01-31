/**
 * Courses Module
 */
import { AppUI } from '../utils/ui.js';
export const Courses = {
    /**
     * Listar todos os cursos (com paginação)
     */
    getAll: async (page = 1, limit = 10, search) => {
        try {
            let url = `/courses?page=${page}&limit=${limit}`;
            if (search)
                url += `&search=${encodeURIComponent(search)}`;
            const response = await AppUI.apiFetch(url, {
                method: 'GET',
            });
            return response;
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao carregar cursos', 'error');
            throw error;
        }
    },
    /**
     * Buscar curso por ID
     */
    getById: async (courseId) => {
        try {
            const response = await AppUI.apiFetch(`/courses/${courseId}`, {
                method: 'GET',
            });
            return response.data;
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao carregar curso', 'error');
            throw error;
        }
    },
    /**
     * Criar novo curso (apenas INSTRUCTOR)
     */
    create: async (data, coverImage) => {
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
                throw new Error(errorData.message || errorData.error || 'Erro ao criar curso');
            }
            const result = await response.json();
            return result.data;
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao criar curso', 'error');
            throw error;
        }
    },
    /**
     * Atualizar curso (apenas INSTRUCTOR dono)
     */
    update: async (courseId, data) => {
        try {
            const response = await AppUI.apiFetch(`/courses/${courseId}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            return response.data;
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao atualizar curso', 'error');
            throw error;
        }
    },
    /**
     * Deletar curso (apenas INSTRUCTOR dono)
     */
    delete: async (courseId) => {
        const confirmed = await AppUI.promptModal('Excluir Curso', 'Tem certeza que deseja excluir este curso? Todos os módulos e aulas serão excluídos. Esta ação não pode ser desfeita.');
        if (!confirmed)
            return false;
        try {
            await AppUI.apiFetch(`/courses/${courseId}`, {
                method: 'DELETE',
            });
            return true;
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao excluir curso', 'error');
            return false;
        }
    },
    /**
     * Listar cursos do instrutor logado
     */
    getMyCourses: async () => {
        try {
            const response = await AppUI.apiFetch('/courses/authored', {
                method: 'GET',
            });
            return response.data || [];
        }
        catch (error) {
            AppUI.showMessage(error.message || 'Erro ao carregar seus cursos', 'error');
            throw error;
        }
    },
};

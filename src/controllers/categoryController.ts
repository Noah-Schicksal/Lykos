import { Request, Response } from 'express';
import { CategoryService, ApplicationError } from '../services/categoryService';
import { ApiResponse } from '../utils/apiResponse';

export class CategoryController {
    private categoryService: CategoryService;

    constructor(categoryService: CategoryService = new CategoryService()) {
        this.categoryService = categoryService;
    }

    async create(req: Request, res: Response) {
        try {
            const { name } = req.body;
            const category = await this.categoryService.create(name);
            return ApiResponse.created(res, category, 'Categoria criada com sucesso');
        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.conflict(res, error.message);
            }
            if (error instanceof Error && error.message.includes('mínimo')) {
                return ApiResponse.error(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao criar categoria', 500);
        }
    }

    async index(req: Request, res: Response) {
        try {
            const categories = await this.categoryService.list();
            return ApiResponse.success(res, categories);
        } catch (error) {
            return ApiResponse.error(res, 'Erro ao listar categorias', 500);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const category = await this.categoryService.update(String(id), name);
            return ApiResponse.success(res, category, 'Categoria atualizada com sucesso');
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('não encontrada')) {
                    return ApiResponse.error(res, error.message, 404);
                }
                return ApiResponse.conflict(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao atualizar categoria', 500);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.categoryService.delete(String(id));
            return ApiResponse.success(res, null, 'Categoria deletada com sucesso');
        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.error(res, error.message, 404);
            }
            return ApiResponse.error(res, 'Erro ao deletar categoria', 500);
        }
    }
}

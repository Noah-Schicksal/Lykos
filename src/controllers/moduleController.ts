import { Request, Response } from 'express';
import { ModuleService, ApplicationError } from '../services/moduleService';
import { ApiResponse } from '../utils/apiResponse';

export class ModuleController {
    private moduleService: ModuleService;

    constructor(moduleService: ModuleService = new ModuleService()) {
        this.moduleService = moduleService;
    }

    // cria um novo módulo para um curso específico
    async create(req: Request, res: Response) {
        try {
            const courseId = req.params.id as string;
            const instructorId = req.user.id;

            const module = await this.moduleService.create(courseId, instructorId, req.body);
            return ApiResponse.created(res, module, 'Módulo criado com sucesso');
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('permissão')) return ApiResponse.forbidden(res, error.message);
                if (error.message.includes('não encontrado')) return ApiResponse.notFound(res, error.message);
                return ApiResponse.error(res, error.message);
            }
            if (error instanceof Error) {
                return ApiResponse.error(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao criar módulo', 500);
        }
    }

    // atualiza um módulo existente
    async update(req: Request, res: Response) {
        try {
            const moduleId = req.params.id as string;
            const instructorId = req.user.id;

            const module = await this.moduleService.update(moduleId, instructorId, req.body);
            return ApiResponse.success(res, module, 'Módulo atualizado com sucesso');
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('permissão')) return ApiResponse.forbidden(res, error.message);
                return ApiResponse.notFound(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao atualizar módulo', 500);
        }
    }

    // remove um módulo
    async delete(req: Request, res: Response) {
        try {
            const moduleId = req.params.id as string;
            const instructorId = req.user.id;

            await this.moduleService.delete(moduleId, instructorId);
            return ApiResponse.noContent(res);
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('permissão')) return ApiResponse.forbidden(res, error.message);
                return ApiResponse.notFound(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao remover módulo', 500);
        }
    }

    // lista módulos de um curso
    async listByCourse(req: Request, res: Response) {
        try {
            const courseId = req.params.id as string;
            // permite acesso público se o curso for público ou verificar matrícula.
            // por enquanto, vamos deixar público na vitrine, o frontend pode filtrar.
            // Idealmente: courseService.checkAccess(user, courseId).

            const modules = await this.moduleService.listByCourseId(courseId);
            return ApiResponse.success(res, modules);
        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.notFound(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao listar módulos', 500);
        }
    }

    // exibe detalhes de um módulo (incluindo aulas)
    async show(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const module = await this.moduleService.getById(id);
            return ApiResponse.success(res, module);
        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.notFound(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao buscar módulo', 500);
        }
    }
}

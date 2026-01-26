import { Request, Response } from 'express';
import { CourseService, ApplicationError } from '../services/courseService';
import { ApiResponse } from '../utils/apiResponse';

export class CourseController {
    private courseService: CourseService;

    constructor(courseService: CourseService = new CourseService()) {
        this.courseService = courseService;
    }

    // lista cursos (vitrine) com paginação e metadados
    async index(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const { courses, total } = await this.courseService.list(page, limit, search);

            const totalPages = Math.ceil(total / limit);

            return ApiResponse.paginated(res, courses, {
                currentPage: page,
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limit
            });

        } catch (error) {
            return ApiResponse.error(res, 'Erro ao listar cursos', 500);
        }
    }

    // exibe detalhes de um único curso
    // exibe detalhes de um único curso
    async show(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const course = await this.courseService.getById(id);
            return ApiResponse.success(res, course);
        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.notFound(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao buscar curso', 500);
        }
    }

    // cria um novo curso (requer usuário autenticado como instrutor)
    async create(req: Request, res: Response) {
        try {
            const instructorId = req.user.id;
            const course = await this.courseService.create(req.body, instructorId);
            return ApiResponse.created(res, course, 'Curso criado com sucesso');
        } catch (error) {
            if (error instanceof Error) {
                return ApiResponse.error(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao criar curso', 500);
        }
    }

    // atualiza um curso existente
    // atualiza um curso existente
    async update(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const instructorId = req.user.id;
            const course = await this.courseService.update(id, req.body, instructorId);
            return ApiResponse.success(res, course, 'Curso atualizado com sucesso');
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('não encontrado')) return ApiResponse.notFound(res, error.message);
                if (error.message.includes('permissão')) return ApiResponse.forbidden(res, error.message);
                return ApiResponse.error(res, error.message);
            }
            if (error instanceof Error) {
                return ApiResponse.error(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao atualizar curso', 500);
        }
    }

    // remove (soft delete) um curso
    // remove (soft delete) um curso
    async delete(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const instructorId = req.user.id;
            await this.courseService.delete(id, instructorId);
            return ApiResponse.noContent(res);
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('permissão')) return ApiResponse.forbidden(res, error.message);
                return ApiResponse.notFound(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao remover curso', 500);
        }
    }

    // lista os estudantes de um curso específico
    // lista os estudantes de um curso específico
    async getStudents(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const instructorId = req.user.id;
            const students = await this.courseService.getStudents(id, instructorId);
            return ApiResponse.success(res, students);
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('permissão')) return ApiResponse.forbidden(res, error.message);
                return ApiResponse.notFound(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao listar alunos', 500);
        }
    }
}

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
            const userId = (req as any).user?.id; // Optional: get logged user ID for isEnrolled check

            const { courses, total } = await this.courseService.list(page, limit, search, userId);

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

    // lista cursos de uma categoria específica
    async listByCategory(req: Request, res: Response) {
        try {
            const categoryId = req.params.id as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { courses, total } = await this.courseService.listByCategory(categoryId, page, limit);
            const totalPages = Math.ceil(total / limit);

            return ApiResponse.paginated(res, courses, {
                currentPage: page,
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limit
            });
        } catch (error) {
            return ApiResponse.error(res, 'Erro ao listar cursos da categoria', 500);
        }
    }

    // lista cursos criados pelo instrutor logado (dashboard)
    async listAuthored(req: Request, res: Response) {
        try {
            const instructorId = req.user.id;
            const courses = await this.courseService.listByInstructor(instructorId);
            return ApiResponse.success(res, courses);
        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.error(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao listar cursos do instrutor', 500);
        }
    }

    // exibe detalhes de um único curso
    // exibe detalhes de um único curso
    async show(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const userId = (req as any).user?.id; // Optional auth for progress check
            const course = await this.courseService.getById(id, userId);
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

            // Manual parsing is now handled by validateCourseCreate middleware
            // req.body.price and req.body.maxStudents are already numbers if present

            const course = await this.courseService.create(req.body, instructorId);

            // Check for file and upload if present
            // We use 'coverImage' field name as planned
            if ((req as any).file) {
                const { StorageService } = require('../services/storageService');
                const storageService = new StorageService();
                try {
                    const coverUrl = await storageService.uploadCourseCover(course.id, (req as any).file, instructorId);
                    // Update the returned object to reflect the new url locally
                    course.setCoverImageUrl(coverUrl);
                } catch (uploadError: any) {
                    // If upload fails, we should ideally rollback course creation or return a warning.
                    // For now, we will just log/warn and return the course created without image.
                    // Or we can try to delete the course.
                    // Making it robust:
                    console.error('Failed to upload cover image:', uploadError);
                    // Not failing the request, but image wont be there.
                    return ApiResponse.created(res, course, 'Curso criado, mas falha no upload da imagem: ' + uploadError.message);
                }
            }

            return ApiResponse.created(res, course.toJSON(), 'Curso criado com sucesso');
        } catch (error) {
            if (error instanceof Error) {
                return ApiResponse.error(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao criar curso', 500);
        }
    }

    // GET /courses/:id/cover
    async getCover(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            // Public route, so no user check needed for access, just fetch path.
            // But we need to get the path from the course entity.
            const course = await this.courseService.getById(id);

            if (!course || !course.coverImageUrl) {
                return ApiResponse.notFound(res, 'Imagem de capa não encontrada');
            }

            const path = require('path');
            const fs = require('fs');

            // Resolve local path
            // The stored URL is like "/storage/courses/..." (web url)
            // We need to convert back to system path.
            // Remove leading slash if present
            const relativePath = course.coverImageUrl.startsWith('/') || course.coverImageUrl.startsWith('\\')
                ? course.coverImageUrl.substring(1)
                : course.coverImageUrl;

            const fullPath = path.resolve(process.cwd(), relativePath);

            if (!fs.existsSync(fullPath)) {
                return ApiResponse.notFound(res, 'Arquivo de imagem não encontrado no servidor');
            }

            // Serve the file
            res.sendFile(fullPath);

        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.notFound(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao obter imagem de capa', 500);
        }
    }

    // atualiza um curso existente
    // atualiza um curso existente
    async update(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const instructorId = req.user.id;
            
            // First update the course data
            const course = await this.courseService.update(id, req.body, instructorId);
            
            // Handle cover image upload if present
            if ((req as any).file) {
                const { StorageService } = require('../services/storageService');
                const storageService = new StorageService();
                try {
                    const coverUrl = await storageService.uploadCourseCover(course.id, (req as any).file, instructorId);
                    course.setCoverImageUrl(coverUrl);
                    // Persist the updated cover URL
                    await this.courseService.update(id, { coverImageUrl: coverUrl }, instructorId);
                } catch (uploadError: any) {
                    console.error('Failed to upload cover image:', uploadError);
                    return ApiResponse.success(res, course.toJSON ? course.toJSON() : course, 'Curso atualizado, mas falha no upload da imagem: ' + uploadError.message);
                }
            } else if (req.body.clearCover === 'true' || req.body.clearCover === true) {
                // Clear the cover image
                const { StorageService } = require('../services/storageService');
                const storageService = new StorageService();
                try {
                    // Get current course to find old cover
                    const currentCourse = await this.courseService.getById(id);
                    if (currentCourse?.coverImageUrl) {
                        await storageService.deleteFile(currentCourse.coverImageUrl);
                    }
                    await this.courseService.update(id, { coverImageUrl: null } as any, instructorId);
                    course.setCoverImageUrl(null as any);
                } catch (deleteError: any) {
                    console.error('Failed to delete cover image:', deleteError);
                }
            }
            
            return ApiResponse.success(res, course.toJSON ? course.toJSON() : course, 'Curso atualizado com sucesso');
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

            // Fetch course to get title for folder deletion
            const course = await this.courseService.getById(id);
            if (course) {
                // Instantiate StorageService lazily or inject
                const { StorageService } = require('../services/storageService');
                const storageService = new StorageService();
                await storageService.deleteCourseFolder(course.title);
            }

            await this.courseService.delete(id, req.user);
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

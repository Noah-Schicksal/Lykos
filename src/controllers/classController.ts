import { Request, Response, NextFunction } from 'express';
import { ClassService } from '../services/classService';
import { ApiResponse } from '../utils/apiResponse';

export class ClassController {
    private classService: ClassService;

    constructor() {
        this.classService = new ClassService();
    }

    // POST /modules/:moduleId/classes
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { moduleId } = req.params as { moduleId: string };
            const instructorId = req.user.id;
            const { title, description, videoUrl, materialUrl } = req.body;

            const classEntity = await this.classService.create(moduleId, instructorId, {
                title,
                description,
                videoUrl,
                materialUrl
            });

            return ApiResponse.created(res, classEntity, 'Aula criada com sucesso');
        } catch (error) {
            next(error);
        }
    }

    // PUT /classes/:id
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const instructorId = req.user.id;
            const { title, description, videoUrl, materialUrl } = req.body;

            const classEntity = await this.classService.update(id, instructorId, {
                title,
                description,
                videoUrl,
                materialUrl
            });

            return ApiResponse.success(res, classEntity, 'Aula atualizada com sucesso');
        } catch (error) {
            next(error);
        }
    }

    // DELETE /classes/:id
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const instructorId = req.user.id;

            await this.classService.delete(id, instructorId);

            return ApiResponse.noContent(res);
        } catch (error) {
            next(error);
        }
    }

    // PATCH /classes/:id/progress (mark as done)
    markProgress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const userId = req.user.id;

            const progress = await this.classService.markProgress(id, userId);

            return ApiResponse.success(res, progress, 'Aula marcada como concluída');
        } catch (error) {
            next(error);
        }
    }

    // DELETE /classes/:id/progress (unmark as done)
    unmarkProgress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const userId = req.user.id;

            await this.classService.unmarkProgress(id, userId);

            return ApiResponse.noContent(res);
        } catch (error) {
            next(error);
        }
    }
}

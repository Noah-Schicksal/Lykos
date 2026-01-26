import { Request, Response, NextFunction } from 'express';
import { ClassService } from '../services/classService';
import { ApiResponse } from '../utils/apiResponse';

export class ClassController {
    private classService: ClassService;
    private storageService: any; // Import StorageService properly if possible or instantiate inside

    constructor() {
        this.classService = new ClassService();
        this.storageService = null; // Will instantiate lazily or import
    }

    // GET /classes/:id
    show = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const classData = await this.classService.getById(id);
            return ApiResponse.success(res, classData);
        } catch (error) {
            next(error);
        }
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

            return ApiResponse.created(res, progress, 'Aula marcada como concluída');
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

    // POST /classes/:id/upload
    uploadMaterial = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const instructorId = req.user.id;
            const file = (req as any).file;

            if (!file) {
                return ApiResponse.error(res, 'Nenhum arquivo enviado');
            }

            // Lazy load StorageService to avoid circular dependency if any, or just import top level
            // Ideally import at top. I will add import via tool call if I missed it.
            // Assuming I will add import: import { StorageService } from '../services/storageService';
            const { StorageService } = require('../services/storageService');
            const storageService = new StorageService();

            const fileUrl = await storageService.uploadClassMaterial(id, file, instructorId);

            return ApiResponse.success(res, { materialUrl: fileUrl }, 'Material enviado com sucesso');
        } catch (error) {
            // Remove o arquivo temporário se houver erro
            if ((req as any).file && (req as any).file.path) {
                const fs = require('fs');
                if (fs.existsSync((req as any).file.path)) {
                    fs.unlinkSync((req as any).file.path);
                }
            }
            next(error);
        }
    }

    // GET /classes/:id/material
    getMaterial = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const userId = req.user.id;
            const userRole = req.user.role;

            const materialPath = await this.classService.getMaterial(id, userId, userRole);

            const path = require('path');
            const fullPath = path.resolve(process.cwd(), materialPath);

            // Verifica se o arquivo existe antes de enviar (embora o service já verifique se a URL existe, o arquivo pode ter sido deletado)
            const fs = require('fs');
            if (!fs.existsSync(fullPath)) {
                return ApiResponse.notFound(res, 'Arquivo físico não encontrado');
            }

            res.download(fullPath, (err) => {
                if (err) {
                    if (!res.headersSent) {
                        next(err);
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

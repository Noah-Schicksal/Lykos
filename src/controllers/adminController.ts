import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/courseService';
import { ApiResponse } from '../utils/apiResponse';
import { ModuleService } from '../services/moduleService';

export class AdminController {
    private courseService: CourseService;
    private moduleService: ModuleService;

    constructor() {
        this.courseService = new CourseService();
        this.moduleService = new ModuleService();
    }

    // GET /admin/courses
    listCourses = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;

            // Passando undefined para userId e false para includeInactive (esconder deletados)
            const result = await this.courseService.list(page, limit, search, undefined, false);

            return ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    // GET /admin/courses/:id
    showCourse = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };

            const course = await this.courseService.getById(id);
            const modules = await this.moduleService.listByCourseId(id);

            return ApiResponse.success(res, { ...course, modules });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /admin/courses/:id
    deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const user = req.user;

            await this.courseService.delete(id, { id: user.id, role: user.role });

            return ApiResponse.noContent(res);
        } catch (error) {
            next(error);
        }
    }
}

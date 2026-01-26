import { Request, Response, NextFunction } from 'express';
import { StudentService, ApplicationError } from '../services/studentService';
import { ApiResponse } from '../utils/apiResponse';

export class StudentController {
    private studentService: StudentService;

    constructor() {
        this.studentService = new StudentService();
    }

    // GET /my-courses
    listMyCourses = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const courses = await this.studentService.listMyCourses(userId);
            return ApiResponse.success(res, courses, 'Cursos listados com sucesso');
        } catch (error) {
            next(error);
        }
    }

    // GET /my-courses/:id
    getCourseDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { id } = req.params as { id: string };

            const courseDetails = await this.studentService.getCourseDetails(userId, id);
            return ApiResponse.success(res, courseDetails, 'Detalhes do curso recuperados com sucesso');
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('não encontrado')) return ApiResponse.notFound(res, error.message);
                if (error.message.includes('não matriculado')) return ApiResponse.forbidden(res, error.message);
            }
            next(error);
        }
    }

    // POST /courses/:id/certificate
    issueCertificate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { id } = req.params as { id: string };
            const studentName = req.user.name;

            const certificate = await this.studentService.issueCertificate(userId, id, studentName);
            return ApiResponse.created(res, certificate, 'Certificado emitido com sucesso!');
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('não concluído')) return ApiResponse.forbidden(res, error.message);
                if (error.message.includes('já emitido')) return ApiResponse.error(res, error.message, 409); // Conflict
            }
            next(error);
        }
    }
}

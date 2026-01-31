import { Request, Response, NextFunction } from 'express';
import { CertificationService, ApplicationError } from '../services/certificationService';
import { ApiResponse } from '../utils/apiResponse';

export class CertificationController {
    private certificationService: CertificationService;

    constructor() {
        this.certificationService = new CertificationService();
    }

    // GET /certificates/:hash
    validate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { hash } = req.params as { hash: string };
            const certificate = await this.certificationService.validateCertificate(hash);

            // Retorna formato data: { ... }
            return ApiResponse.success(res, certificate, undefined);
        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.notFound(res, error.message);
            }
            next(error);
        }
    }

    // POST /courses/:id/certificate
    issueCertificate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string }; // Course ID
            const userId = (req as any).user?.id; // From authMiddleware

            if (!userId) {
                return ApiResponse.unauthorized(res, 'Usuário não autenticado');
            }

            const hash = await this.certificationService.generateCertificate(userId, id);

            return ApiResponse.success(res, { hash }, 'Certificado gerado com sucesso');
        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.error(res, error.message);
            }
            next(error);
        }
    }
}

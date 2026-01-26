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
}

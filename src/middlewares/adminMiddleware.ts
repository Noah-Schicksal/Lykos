import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Middleware exclusivo para rotas administrativas.
 * Verifica se o usuário autenticado tem role ADMIN.
 * Deve ser usado após authMiddleware.
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
        return ApiResponse.unauthorized(res, 'Não autorizado');
    }

    if (user.role !== 'ADMIN') {
        return ApiResponse.forbidden(res, 'Acesso negado: Esta rota é restrita a administradores');
    }

    return next();
};

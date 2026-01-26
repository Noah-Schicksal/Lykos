import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export function roleMiddleware(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !allowedRoles.includes(user.role)) {
            return ApiResponse.forbidden(res, 'Acesso negado: Permissão insuficiente');
        }

        return next();
    };
}

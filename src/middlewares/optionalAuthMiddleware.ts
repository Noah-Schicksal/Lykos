import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
    email?: string;
    name?: string;
    role: string;
}

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Also check cookies if available
    const cookieToken = req.cookies && req.cookies.auth_token;

    const finalToken = token || cookieToken;

    if (!finalToken) {
        return next();
    }

    try {
        const secret = process.env.JWT_SECRET || 'default_secret'; // Fallback for dev
        const decoded = jwt.verify(finalToken, secret) as JwtPayload;

        req.user = {
            id: decoded.id,
            name: decoded.name || 'User',
            email: decoded.email,
            role: decoded.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
        };

        next();
    } catch (error) {
        // If token is invalid, we just proceed as guest (ignoring the error)
        next();
    }
};

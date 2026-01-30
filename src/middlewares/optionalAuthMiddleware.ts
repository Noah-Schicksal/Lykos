import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: string;
    name: string;
    role: string;
    iat: number;
    exp: number;
}

export function optionalAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // Try to get token from cookie or header
    let token = req.cookies?.token;

    if (!token) {
        const { authorization } = req.headers;
        if (authorization) {
            [, token] = authorization.split(' ');
        }
    }

    // If no token, just proceed (guest)
    if (!token) {
        return next();
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // Log warning but proceed as guest if config missing to avoid crash
            console.warn('JWT_SECRET not defined in optionalAuth');
            return next();
        }

        const decoded = jwt.verify(token, secret);
        const { id, name, role } = decoded as TokenPayload;

        req.user = {
            id,
            name,
            role,
        };

        return next();
    } catch (error) {
        // If token is invalid/expired, we treat as guest. 
        // We do NOT block the request.
        return next();
    }
}

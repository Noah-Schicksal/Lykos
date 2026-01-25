import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: string;
    name: string;
    role: string;
    iat: number;
    exp: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authorization.split(' ');

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("Erro interno: JWT_SECRET não definido.");
        }

        const decoded = jwt.verify(token, secret);

        const { id, name, role } = decoded as TokenPayload;

        req.user = {
            id,
            name,
            role
        };

        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/apiResponse';

interface TokenPayload {
  id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Tenta pegar o token do cookie primeiro, depois do header Authorization
  let token = req.cookies?.token;

  // Se não houver cookie, tenta o header Authorization (para compatibilidade)
  if (!token) {
    const { authorization } = req.headers;

    if (authorization) {
      [, token] = authorization.split(' ');
    }
  }

  if (!token) {
    return ApiResponse.unauthorized(res, 'Não autorizado');
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não definido');
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
    return ApiResponse.unauthorized(res, 'Não autorizado');
  }
}

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { DomainError } from '../entities/User';
import { ApplicationError } from '../services/userService';

/**
 * Handler global de erros
 * Categoriza erros por TIPO (não por mensagem)
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${error.name}: ${error.message}`);
  }

  if (res.headersSent) {
    return next(error);
  }

  // Erro de validação de domínio (formato inválido)
  if (error instanceof DomainError) {
    return ApiResponse.error(res, error.message, 400);
  }

  // Erro de aplicação (duplicidade, não encontrado)
  if (error instanceof ApplicationError) {
    // Categoriza por palavras-chave na mensagem
    if (error.message.includes('não encontrado')) {
      return ApiResponse.notFound(res, error.message);
    }

    if (error.message.includes('já está cadastrado')) {
      return ApiResponse.conflict(res, error.message);
    }

    if (error.message.includes('Email ou senha incorretos')) {
      return ApiResponse.unauthorized(res, error.message);
    }

    // Erro de aplicação genérico
    return ApiResponse.error(res, error.message, 400);
  }

  // Erro de Upload (Multer)
  if (error.name === 'MulterError') {
    if (error.message === 'File too large') {
      return ApiResponse.error(res, 'O arquivo excede o limite de tamanho permitido de 100MB.', 413);
    }
    return ApiResponse.error(res, `Erro no upload: ${error.message}`, 400);
  }

  // Erro de JWT
  if (
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError'
  ) {
    return ApiResponse.unauthorized(res, 'Não autorizado');
  }

  // Erro genérico (não tratado)
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : error.message,
    500,
  );
};

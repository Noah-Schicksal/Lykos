import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Valida apenas a PRESENÇA de campos obrigatórios
 * NÃO valida formato - isso é responsabilidade da Entidade
 */
function validateRequiredFields(
  fields: Record<string, any>,
  res: Response,
  next: NextFunction,
) {
  const missing = Object.keys(fields).filter((key) => !fields[key]);

  if (missing.length > 0) {
    return ApiResponse.error(
      res,
      `Campos obrigatórios ausentes: ${missing.join(', ')}`,
      400,
    );
  }

  next();
}

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, email, password } = req.body;
  return validateRequiredFields({ name, email, password }, res, next);
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  return validateRequiredFields({ email, password }, res, next);
};

export const validateUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, email, password } = req.body;

  // Update permite atualizar apenas alguns campos
  if (!name && !email && !password) {
    return ApiResponse.error(
      res,
      'Pelo menos um campo deve ser fornecido para atualização: name, email ou password',
      400,
    );
  }

  next();
};

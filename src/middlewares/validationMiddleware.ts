import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../utils/validator';

/**
 * Validação para Cadastro de Usuário
 */
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const errors: string[] = [];

  const nameError = Validator.required(name, 'name') || Validator.isString(name, 'name', 3);
  if (nameError) errors.push(nameError);

  const emailError = Validator.required(email, 'email') || Validator.isEmail(email, 'email');
  if (emailError) errors.push(emailError);

  const passError = Validator.required(password, 'password') || Validator.isString(password, 'password', 6);
  if (passError) errors.push(passError);

  if (errors.length > 0) {
    return ApiResponse.error(res, errors.join(' '), 400);
  }

  next();
};

/**
 * Validação para Login
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: string[] = [];

  const emailError = Validator.required(email, 'email') || Validator.isEmail(email, 'email');
  if (emailError) errors.push(emailError);

  const passError = Validator.required(password, 'password');
  if (passError) errors.push(passError);

  if (errors.length > 0) {
    return ApiResponse.error(res, errors.join(' '), 400);
  }

  next();
};

/**
 * Validação para Criação de Curso (Multipart Support)
 */
export const validateCourseCreate = (req: Request, res: Response, next: NextFunction) => {
  // Para multipart, os valores vêm como string no req.body
  let { title, description, price, maxStudents } = req.body;
  const errors: string[] = [];

  // Validar Título
  const titleError = Validator.required(title, 'title') || Validator.isString(title, 'title', 5);
  if (titleError) errors.push(titleError);

  // Validar Descrição
  const descError = Validator.required(description, 'description') || Validator.isString(description, 'description', 10);
  if (descError) errors.push(descError);

  // Validar/Parsing Preço
  if (price !== undefined) {
    const parsedPrice = Validator.parseNumber(price);
    if (parsedPrice === undefined) {
      errors.push('O campo \'price\' deve ser um número válido.');
    } else {
      req.body.price = parsedPrice; // Modifica req.body para o controller já receber o número
    }
  }

  // Validar/Parsing MaxStudents
  if (maxStudents !== undefined) {
    const parsedStudents = Validator.parseNumber(maxStudents);
    if (parsedStudents === undefined) {
      errors.push('O campo \'maxStudents\' deve ser um número válido.');
    } else {
      req.body.maxStudents = parsedStudents; // Modifica req.body
    }
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, errors.join(' '), 400);
  }

  next();
};

export const validateUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  if (!name && !email && !password) {
    return ApiResponse.error(res, 'Pelo menos um campo deve ser fornecido para atualização.', 400);
  }

  // Opcional: Adicionar validação individual se os campos existirem
  const errors: string[] = [];
  if (name) {
    const err = Validator.isString(name, 'name', 3);
    if (err) errors.push(err);
  }
  if (email) {
    const err = Validator.isEmail(email, 'email');
    if (err) errors.push(err);
  }
  if (password) {
    const err = Validator.isString(password, 'password', 6);
    if (err) errors.push(err);
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, errors.join(' '), 400);
  }

  next();
};


import { Response } from 'express';

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface SuccessResponseData<T = any> {
  message?: string;
  data: T;
  meta?: any;
}

interface ErrorResponseData {
  error: string;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
    meta?: any,
  ) {
    const response: SuccessResponseData<T> = {
      data,
    };

    if (meta) {
      response.meta = meta;
    }

    if (message) {
      response.message = message;
    }

    return res.status(statusCode).json(response);
  }

  static message(res: Response, message: string, statusCode: number = 200) {
    return res.status(statusCode).json({ message });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message?: string,
  ) {
    const response: SuccessResponseData<T[]> = {
      data,
      meta,
    };

    if (message) {
      response.message = message;
    }

    return res.status(200).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Recurso criado com sucesso',
  ) {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static error(res: Response, error: string, statusCode: number = 400) {
    const response: ErrorResponseData = {
      error,
    };

    return res.status(statusCode).json(response);
  }

  static unauthorized(res: Response, error: string = 'Não autorizado') {
    return this.error(res, error, 401);
  }

  static forbidden(res: Response, error: string = 'Acesso negado') {
    return this.error(res, error, 403);
  }

  static notFound(res: Response, error: string = 'Recurso não encontrado') {
    return this.error(res, error, 404);
  }

  static conflict(res: Response, error: string = 'Conflito de dados') {
    return this.error(res, error, 409);
  }
}

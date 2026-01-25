import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { getCookieOptions } from '../config/cookie';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const result = await this.authService.login({ email, password });

      res.cookie('token', result.token, getCookieOptions());

      // Retorna apenas os dados do usuário (token não vai no body)
      return ApiResponse.success(
        res,
        result.user,
        'Login realizado com sucesso',
      );
    } catch (error: any) {
      // Se for erro de credenciais, retornamos 401 Unauthorized
      if (error.message === 'Email ou senha incorretos.') {
        return ApiResponse.unauthorized(res, error.message);
      }

      // Outros erros
      return ApiResponse.error(res, error.message);
    }
  }

  async logout(req: Request, res: Response) {
    const { httpOnly, secure, sameSite } = getCookieOptions();

    res.clearCookie('token', {
      httpOnly,
      secure,
      sameSite,
    });

    return ApiResponse.success(res, null, 'Logout realizado com sucesso');
  }
}

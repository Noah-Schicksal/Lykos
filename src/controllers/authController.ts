import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { getCookieOptions } from '../config/cookie';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const result = await this.authService.login({ email, password });

      res.cookie('token', result.token, getCookieOptions());

      // Retorna os dados do usuário e o token no body
      return ApiResponse.success(
        res,
        result,
        'Login realizado com sucesso',
      );
    } catch (error) {
      next(error);
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

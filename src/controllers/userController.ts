import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../utils/apiResponse';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  private async register(
    req: Request,
    res: Response,
    next: NextFunction,
    role: 'STUDENT' | 'INSTRUCTOR',
  ) {
    const { name, email, password } = req.body;

    try {
      const user = await this.userService.create({
        name,
        email,
        password,
        role,
      });

      const message =
        role === 'STUDENT'
          ? 'Estudante registrado com sucesso'
          : 'Instrutor registrado com sucesso';

      return ApiResponse.created(res, user.toJSON(), message);
    } catch (error) {
      next(error);
    }
  }

  async registerStudent(req: Request, res: Response, next: NextFunction) {
    return this.register(req, res, next, 'STUDENT');
  }

  async registerInstructor(req: Request, res: Response, next: NextFunction) {
    //em um sistema real, aqui teria que ter uma verificação se quem está criando é um ADMIN master,
    //mas como pedido, é uma rota pública de registro de admin.
    return this.register(req, res, next, 'INSTRUCTOR');
  }

  async deleteSelf(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.delete(req.user.id);
      return ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  async updateSelfInfos(req: Request, res: Response, next: NextFunction) {
    const requesterId = req.user.id;
    const { name, email, password } = req.body;

    try {
      const updatedUser = await this.userService.update(requesterId, {
        name,
        email,
        password,
      });
      return ApiResponse.success(
        res,
        updatedUser.toJSON(),
        'Perfil atualizado com sucesso',
      );
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    const requesterId = req.user.id;

    try {
      const user = await this.userService.findById(requesterId);
      return ApiResponse.success(res, user.toJSON());
    } catch (error) {
      next(error);
    }
  }
}

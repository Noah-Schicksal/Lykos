import { AuthController } from './authController';
import { UserController } from './userController';

// Singleton pattern para evitar múltiplas instâncias
export const authController = new AuthController();
export const userController = new UserController();

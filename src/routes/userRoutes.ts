import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { AuthController } from '../controllers/authController';

const router = Router();
const userController = new UserController();
const authController = new AuthController();

router.post('/auth/students/register', userController.registerStudent.bind(userController));
router.post('/auth/admins/register', userController.registerAdmin.bind(userController));
router.post('/auth/login', authController.login.bind(authController));

export default router;
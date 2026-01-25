import { Router } from 'express';
import { studentRegister } from '../controllers/userController';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const userController = new studentRegister();
const authController = new AuthController();

//rotas publicas 

router.post('/auth/register/student', userController.registerStudent.bind(userController));
router.post('/auth/register/instructor', userController.registerInstructor.bind(userController));
router.post('/auth/login', authController.login.bind(authController));

// Rotas protegidas
router.delete('/users/:id', authMiddleware, userController.deleteSelf.bind(userController));

export default router;
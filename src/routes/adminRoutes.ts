import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const adminRoutes = Router();
const adminController = new AdminController();

// Todas as rotas de admin requerem autenticação e role ADMIN
adminRoutes.use(authMiddleware);
adminRoutes.use(adminMiddleware);

// Cursos
adminRoutes.get('/courses', (req, res, next) => adminController.listCourses(req, res, next));
adminRoutes.get('/courses/:id', (req, res, next) => adminController.showCourse(req, res, next));
adminRoutes.delete('/courses/:id', (req, res, next) => adminController.deleteCourse(req, res, next));

export default adminRoutes;

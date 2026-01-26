import { Router } from 'express';
import { CourseController } from '../controllers/courseController';
import { ReviewController } from '../controllers/reviewController';
import { ModuleController } from '../controllers/moduleController'; // Importando ModuleController
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const courseRoutes = Router();
const courseController = new CourseController();
const reviewController = new ReviewController();
const moduleController = new ModuleController(); // Instanciando ModuleController

// rotas públicas
courseRoutes.get('/', (req, res) => courseController.index(req, res));
courseRoutes.get('/:id', (req, res) => courseController.show(req, res));
courseRoutes.get('/:id/reviews', (req, res, next) => reviewController.list(req, res, next));
courseRoutes.post('/:id/reviews', authMiddleware, roleMiddleware(['STUDENT']), (req, res, next) => reviewController.create(req, res, next));

// rotas privadas (apenas instrutores)
// aplicando middlewares para todas as rotas abaixo
courseRoutes.post('/', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.create(req, res));
courseRoutes.post('/:id/modules', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => moduleController.create(req, res));
courseRoutes.put('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.update(req, res));
courseRoutes.delete('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.delete(req, res));
courseRoutes.get('/:id/students', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.getStudents(req, res));

export default courseRoutes;

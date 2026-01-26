import { Router } from 'express';
import { CourseController } from '../controllers/courseController';
import { ReviewController } from '../controllers/reviewController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const courseRoutes = Router();
const courseController = new CourseController();
const reviewController = new ReviewController();

// rotas públicas
courseRoutes.get('/', (req, res) => courseController.index(req, res));
courseRoutes.get('/:id', (req, res) => courseController.show(req, res));
courseRoutes.get('/:id/reviews', (req, res) => reviewController.list(req, res));

// rotas privadas (apenas instrutores)
// aplicando middlewares para todas as rotas abaixo
courseRoutes.post('/', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.create(req, res));
courseRoutes.put('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.update(req, res));
courseRoutes.delete('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.delete(req, res));
courseRoutes.get('/:id/students', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.getStudents(req, res));

export default courseRoutes;

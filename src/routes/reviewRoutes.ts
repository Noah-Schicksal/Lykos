import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const reviewRoutes = Router();
const reviewController = new ReviewController();

// Rotas de avaliações de cursos (sub-recurso de courses)
reviewRoutes.get('/courses/:id/reviews', (req, res, next) =>
  reviewController.list(req, res, next),
);
reviewRoutes.post(
  '/courses/:id/reviews',
  authMiddleware,
  roleMiddleware(['STUDENT']),
  (req, res, next) => reviewController.create(req, res, next),
);

// Operação direta em reviews
reviewRoutes.delete('/:id', authMiddleware, (req, res, next) =>
  reviewController.delete(req, res, next),
);

export default reviewRoutes;

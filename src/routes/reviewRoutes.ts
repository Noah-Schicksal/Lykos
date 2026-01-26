import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authMiddleware } from '../middlewares/authMiddleware';

const reviewRoutes = Router();
const reviewController = new ReviewController();

// rotas privadas (qualquer usuário autenticado)
reviewRoutes.use(authMiddleware);

// criar avaliação (qualquer aluno/instrutor pode avaliar)
reviewRoutes.post('/', (req, res) => reviewController.create(req, res));

// deletar avaliação (apenas o proprio autor)
reviewRoutes.delete('/:id', (req, res) => reviewController.delete(req, res));

export default reviewRoutes;

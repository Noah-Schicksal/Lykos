import { Router } from 'express';
import { ClassController } from '../controllers/classController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const classRoutes = Router();
const classController = new ClassController();

// Todas as rotas precisam de autenticação
classRoutes.use(authMiddleware);

// Rotas de progresso (qualquer usuário autenticado)
classRoutes.patch('/:id/progress', (req, res, next) => classController.markProgress(req, res, next));
classRoutes.delete('/:id/progress', (req, res, next) => classController.unmarkProgress(req, res, next));

// Rotas de gerenciamento (Apenas Instrutores)
// Criar um sub-router ou middleware específico para as rotas abaixo
// Mas como a ordem importa, podemos aplicar o middleware nas rotas específicas

classRoutes.put('/:id', roleMiddleware(['INSTRUCTOR']), (req, res, next) => classController.update(req, res, next));
classRoutes.delete('/:id', roleMiddleware(['INSTRUCTOR']), (req, res, next) => classController.delete(req, res, next));

export default classRoutes;

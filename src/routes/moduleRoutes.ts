import { Router } from 'express';
import { ModuleController } from '../controllers/moduleController';
import { ClassController } from '../controllers/classController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const moduleRoutes = Router();
const moduleController = new ModuleController();
const classController = new ClassController();

// rotas privadas (Instrutor)
moduleRoutes.use(authMiddleware);
moduleRoutes.use(roleMiddleware(['INSTRUCTOR']));

moduleRoutes.put('/:id', (req, res) => moduleController.update(req, res));
moduleRoutes.delete('/:id', (req, res) => moduleController.delete(req, res));

moduleRoutes.post('/:moduleId/classes', (req, res, next) => classController.create(req, res, next));

export default moduleRoutes;

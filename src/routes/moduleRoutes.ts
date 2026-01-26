import { Router } from 'express';
import { ModuleController } from '../controllers/moduleController';
import { ClassController } from '../controllers/classController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const moduleRoutes = Router();
const moduleController = new ModuleController();
const classController = new ClassController();

// rotas públicas (ou protegidas por auth apenas, sem role)
moduleRoutes.get('/:id', (req, res) => moduleController.show(req, res));

// rotas privadas (Instrutor)
moduleRoutes.put('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => moduleController.update(req, res));
moduleRoutes.delete('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => moduleController.delete(req, res));

moduleRoutes.post('/:moduleId/classes', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res, next) => classController.create(req, res, next));

export default moduleRoutes;

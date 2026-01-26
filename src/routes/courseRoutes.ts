import { Router } from 'express';
import { CourseController } from '../controllers/courseController';
import { ReviewController } from '../controllers/reviewController';
import { ModuleController } from '../controllers/moduleController'; // Importando ModuleController
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

import multer from 'multer';

// Multer config for course covers (using temp Storage first)
const upload = multer({ dest: 'storage/temp/' });

const courseRoutes = Router();
const courseController = new CourseController();
const reviewController = new ReviewController();
const moduleController = new ModuleController(); // Instanciando ModuleController

// rotas públicas
courseRoutes.get('/', (req, res) => courseController.index(req, res));

// Rota de dashboard de instrutor (precisa vir antes de /:id para não conflitar)
courseRoutes.get('/authored', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.listAuthored(req, res));

courseRoutes.get('/:id', (req, res) => courseController.show(req, res));
courseRoutes.get('/:id/cover', (req, res) => courseController.getCover(req, res)); // Nova rota de imagem pública
courseRoutes.get('/:id/modules', (req, res) => moduleController.listByCourse(req, res)); // Nova rota
courseRoutes.get('/:id/reviews', (req, res, next) => reviewController.list(req, res, next));
courseRoutes.post('/:id/reviews', authMiddleware, roleMiddleware(['STUDENT']), (req, res, next) => reviewController.create(req, res, next));

// rotas privadas (apenas instrutores)
// aplicando middlewares para todas as rotas abaixo
// Nota: POST / precisa de upload middleware agora
courseRoutes.post('/', authMiddleware, roleMiddleware(['INSTRUCTOR']), upload.single('coverImage'), (req, res) => courseController.create(req, res));
courseRoutes.post('/:id/modules', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => moduleController.create(req, res));
courseRoutes.put('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.update(req, res));
courseRoutes.delete('/:id', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.delete(req, res));
courseRoutes.get('/:id/students', authMiddleware, roleMiddleware(['INSTRUCTOR']), (req, res) => courseController.getStudents(req, res));

export default courseRoutes;

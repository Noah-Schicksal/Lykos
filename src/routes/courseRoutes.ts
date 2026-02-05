import { Router } from 'express';
import { CourseController } from '../controllers/courseController';
import { ModuleController } from '../controllers/moduleController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { optionalAuthMiddleware } from '../middlewares/optionalAuthMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

import multer from 'multer';
import { validateCourseCreate } from '../middlewares/validationMiddleware';

// Multer config for course covers (using temp Storage first)
const upload = multer({ dest: 'storage/temp/' });

const courseRoutes = Router();
const courseController = new CourseController();
const moduleController = new ModuleController();

// rotas públicas (with optional auth to check enrollment)
courseRoutes.get('/', optionalAuthMiddleware, (req, res) => courseController.index(req, res));

// Rota de dashboard de instrutor (precisa vir antes de /:id para não conflitar)
courseRoutes.get(
  '/authored',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR']),
  (req, res) => courseController.listAuthored(req, res),
);



courseRoutes.get('/:id', optionalAuthMiddleware, (req, res) => courseController.show(req, res));
courseRoutes.get('/:id/cover', (req, res) =>
  courseController.getCover(req, res),
);

// Rotas de módulos do curso (sub-recurso)
courseRoutes.get('/:id/modules', optionalAuthMiddleware, (req, res) =>
  moduleController.listByCourse(req, res),
);
courseRoutes.post(
  '/:id/modules',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR']),
  (req, res) => moduleController.create(req, res),
);

// rotas privadas (apenas instrutores)
courseRoutes.post(
  '/',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR']),
  upload.single('coverImage'),
  validateCourseCreate,
  (req, res) => courseController.create(req, res),
);
courseRoutes.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR']),
  upload.single('coverImage'),
  validateCourseCreate,
  (req, res) => courseController.update(req, res),
);
courseRoutes.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR']),
  (req, res) => courseController.delete(req, res),
);
courseRoutes.get(
  '/:id/students',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR']),
  (req, res) => courseController.getStudents(req, res),
);

// Rota de Certificado (Aluno)
import { CertificationController } from '../controllers/certificationController';
const certificationController = new CertificationController();

courseRoutes.post(
  '/:id/certificate',
  authMiddleware,
  (req, res, next) => certificationController.issueCertificate(req, res, next)
);

// Review routes (sub-resource of courses)
import { ReviewController } from '../controllers/reviewController';
const reviewController = new ReviewController();

courseRoutes.get('/:id/reviews', (req, res, next) =>
  reviewController.list(req, res, next)
);
courseRoutes.post(
  '/:id/reviews',
  authMiddleware,
  roleMiddleware(['STUDENT']),
  (req, res, next) => reviewController.create(req, res, next)
);
courseRoutes.delete(
  '/:id/reviews',
  authMiddleware,
  roleMiddleware(['STUDENT']),
  (req, res, next) => reviewController.delete(req, res, next)
);

export default courseRoutes;

import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { CourseController } from '../controllers/courseController'; // Importando CourseController
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const categoryRoutes = Router();
const categoryController = new CategoryController();
const courseController = new CourseController(); // Instanciando CourseController

//público: Listar categorias
categoryRoutes.get('/', (req, res) => categoryController.index(req, res));

// Público: Listar cursos de uma categoria
categoryRoutes.get('/:id/courses', (req, res) => courseController.listByCategory(req, res));

//privado (Instrutor): Criar categoria
categoryRoutes.post(
    '/',
    authMiddleware,
    roleMiddleware(['INSTRUCTOR']),
    (req, res) => categoryController.create(req, res)
);

// Privado (Instrutor): Atualizar categoria
categoryRoutes.put(
    '/:id',
    authMiddleware,
    roleMiddleware(['INSTRUCTOR']),
    (req, res) => categoryController.update(req, res)
);

// Privado (Instrutor): Deletar categoria
categoryRoutes.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['INSTRUCTOR']),
    (req, res) => categoryController.delete(req, res)
);

export default categoryRoutes;

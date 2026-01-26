import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const categoryRoutes = Router();
const categoryController = new CategoryController();

//público: Listar categorias
categoryRoutes.get('/', (req, res) => categoryController.index(req, res));

//privado (Instrutor): Criar categoria
categoryRoutes.post(
    '/',
    authMiddleware,
    roleMiddleware(['INSTRUCTOR']),
    (req, res) => categoryController.create(req, res)
);

export default categoryRoutes;

import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const cartRoutes = Router();
const cartController = new CartController();

// Rotas exclusivas para alunos
cartRoutes.use(authMiddleware);
cartRoutes.use(roleMiddleware(['STUDENT', 'INSTRUCTOR']));

cartRoutes.get('/cart', (req, res, next) => cartController.listCart(req, res, next));
cartRoutes.post('/cart', (req, res, next) => cartController.addToCart(req, res, next));
cartRoutes.delete('/cart/:courseId', (req, res, next) => cartController.removeFromCart(req, res, next));
cartRoutes.post('/checkout', (req, res, next) => cartController.checkout(req, res, next));

export default cartRoutes;

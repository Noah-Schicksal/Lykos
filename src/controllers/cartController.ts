import { Request, Response, NextFunction } from 'express';
import { CartService, ApplicationError } from '../services/cartService';
import { ApiResponse } from '../utils/apiResponse';

export class CartController {
    private cartService: CartService;

    constructor() {
        this.cartService = new CartService();
    }

    // GET /cart
    listCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const cartResponse = await this.cartService.getCart(userId);
            return ApiResponse.success(res, cartResponse.data, 'Carrinho listado', 200, cartResponse.meta);
        } catch (error) {
            next(error);
        }
    }

    // POST /cart
    addToCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { courseId } = req.body;

            if (!courseId) {
                return ApiResponse.error(res, 'Course ID is required');
            }

            const cartItem = await this.cartService.addToCart(userId, courseId);
            return ApiResponse.created(res, cartItem, 'Curso adicionado ao carrinho');
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('já matriculado')) return ApiResponse.error(res, error.message, 400);
                if (error.message.includes('já está no carrinho')) return ApiResponse.error(res, error.message, 409);
                if (error.message.includes('não encontrado')) return ApiResponse.notFound(res, error.message);
            }
            next(error);
        }
    }

    // DELETE /cart/:courseId
    removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { courseId } = req.params as { courseId: string };

            await this.cartService.removeFromCart(userId, courseId);
            return ApiResponse.noContent(res);
        } catch (error) {
            next(error);
        }
    }

    // POST /checkout
    checkout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const checkoutResponse = await this.cartService.checkout(userId);

            // Retorno 201 Created conforme pedido
            return ApiResponse.created(res, checkoutResponse.data, checkoutResponse.message);
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('vazio')) return ApiResponse.error(res, error.message, 400);
            }
            next(error);
        }
    }
}

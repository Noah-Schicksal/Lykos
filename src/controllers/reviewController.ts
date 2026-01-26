import { Request, Response } from 'express';
import { ReviewService, ApplicationError } from '../services/reviewService';
import { ApiResponse } from '../utils/apiResponse';

export class ReviewController {
    private reviewService: ReviewService;

    constructor(reviewService: ReviewService = new ReviewService()) {
        this.reviewService = reviewService;
    }

    // cria uma nova avaliação
    async create(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const review = await this.reviewService.create(userId, req.body);
            return ApiResponse.created(res, review, 'Avaliação criada com sucesso');
        } catch (error) {
            if (error instanceof ApplicationError) {
                return ApiResponse.conflict(res, error.message);
            }
            if (error instanceof Error) {
                return ApiResponse.error(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao criar avaliação', 500);
        }
    }

    // lista avaliações de um curso
    async list(req: Request, res: Response) {
        try {
            // Nota: este método pode ser chamado via rota /courses/:id/reviews (id no params)
            // ou via /reviews?courseId=... (query param). Vamos priorizar params se existir.
            const courseId = (req.params.id || req.query.courseId) as string;

            if (!courseId) {
                return ApiResponse.error(res, 'ID do curso é obrigatório');
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { reviews, total } = await this.reviewService.listByCourse(courseId, page, limit);
            const totalPages = Math.ceil(total / limit);

            return ApiResponse.paginated(res, reviews, {
                currentPage: page,
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limit
            });

        } catch (error) {
            return ApiResponse.error(res, 'Erro ao listar avaliações', 500);
        }
    }

    // deleta uma avaliação
    async delete(req: Request, res: Response) {
        try {
            const reviewId = req.params.id as string;
            const userId = req.user.id;
            await this.reviewService.delete(userId, reviewId);
            return ApiResponse.noContent(res);
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.message.includes('permissão')) return ApiResponse.forbidden(res, error.message);
                return ApiResponse.notFound(res, error.message);
            }
            return ApiResponse.error(res, 'Erro ao remover avaliação', 500);
        }
    }
}

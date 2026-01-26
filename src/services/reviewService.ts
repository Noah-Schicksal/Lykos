import { Review } from '../entities/Review';
import { ReviewRepository, FindReviewsResponse } from '../repositories/reviewRepository';
import { CreateReviewDTO } from '../dtos/reviewDTOs';
import { CourseRepository } from '../repositories/courseRepository';

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class ReviewService {
    private reviewRepository: ReviewRepository;
    private courseRepository: CourseRepository;

    constructor(
        reviewRepository: ReviewRepository = new ReviewRepository(),
        courseRepository: CourseRepository = new CourseRepository()
    ) {
        this.reviewRepository = reviewRepository;
        this.courseRepository = courseRepository;
    }

    // cria uma nova avaliação
    async create(userId: string, data: CreateReviewDTO): Promise<Review> {
        // verifica se o curso existe
        const course = this.courseRepository.findById(data.courseId);
        if (!course) {
            throw new ApplicationError('Curso não encontrado');
        }

        // verifica se o usuário já avaliou este curso
        const hasReviewed = this.reviewRepository.hasUserReviewed(userId, data.courseId);
        if (hasReviewed) {
            throw new ApplicationError('Você já avaliou este curso');
        }

        const review = new Review({
            userId,
            courseId: data.courseId,
            rating: data.rating,
            comment: data.comment
        });

        return this.reviewRepository.save(review);
    }

    // lista avaliações de um curso
    async listByCourse(courseId: string, page: number, limit: number): Promise<FindReviewsResponse> {
        return this.reviewRepository.findByCourseId({ courseId, page, limit });
    }

    // deleta uma avaliação, verificando permissão (somente o autor)
    async delete(userId: string, reviewId: string): Promise<void> {
        const review = this.reviewRepository.findById(reviewId);
        if (!review) {
            throw new ApplicationError('Avaliação não encontrada');
        }

        if (review.userId !== userId) {
            throw new ApplicationError('Você não tem permissão para remover esta avaliação');
        }

        this.reviewRepository.delete(reviewId);
    }
}

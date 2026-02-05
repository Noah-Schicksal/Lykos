import { ReviewRepository } from '../repositories/reviewRepository';
import { EnrollmentRepository } from '../repositories/enrollmentRepository';
import { ReviewListResponseDTO, ReviewDTO, CreateReviewDTO } from '../dtos/reviewDTOs';
import { Review } from '../entities/Review';

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class ReviewService {
    private reviewRepository: ReviewRepository;
    private enrollmentRepository: EnrollmentRepository;

    constructor(
        reviewRepository: ReviewRepository = new ReviewRepository(),
        enrollmentRepository: EnrollmentRepository = new EnrollmentRepository()
    ) {
        this.reviewRepository = reviewRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // Lista avaliações de um curso
    async listReviews(courseId: string, page: number = 1, limit: number = 5): Promise<ReviewListResponseDTO> {
        const result = this.reviewRepository.findByCourseId({ courseId, page, limit });
        const averageRating = this.reviewRepository.getAverageRating(courseId);

        const reviewDTOs: ReviewDTO[] = result.reviews.map(r => ({
            id: r.id,
            userName: r.user.name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt
        }));

        return {
            data: reviewDTOs,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(result.total / limit),
                totalItems: result.total,
                itemsPerPage: limit,
                averageRating: parseFloat(averageRating.toFixed(1))
            }
        };
    }

    // Cria ou atualiza avaliação
    async addOrUpdateReview(userId: string, courseId: string, data: CreateReviewDTO): Promise<Review> {
        // Verificar se o usuário está matriculado no curso
        const enrollment = this.enrollmentRepository.findEnrollment(userId, courseId);
        if (!enrollment) {
            throw new ApplicationError('Você precisa estar matriculado neste curso para poder avaliá-lo.');
        }

        const existingReview = this.reviewRepository.findByUserAndCourse(userId, courseId);

        if (existingReview) {
            // Update
            existingReview.setRating(data.rating);
            existingReview.setComment(data.comment);
            return this.reviewRepository.update(existingReview);
        } else {
            // Create
            const review = new Review({
                userId,
                courseId,
                rating: data.rating,
                comment: data.comment
            });
            return this.reviewRepository.save(review);
        }
    }

    // Deleta a avaliação do usuário para um curso
    async deleteReview(userId: string, courseId: string): Promise<boolean> {
        return this.reviewRepository.deleteByUserAndCourse(userId, courseId);
    }
}

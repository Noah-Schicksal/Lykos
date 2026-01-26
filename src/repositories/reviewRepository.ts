import db from '../database/connection';
import { Review } from '../entities/Review';
import { randomUUID } from 'crypto';

export interface FindReviewsParams {
    courseId: string;
    page: number;
    limit: number;
}

export interface FindReviewsResponse {
    reviews: any[];
    total: number;
}

export class ReviewRepository {

    // salva uma avaliação no banco
    save(review: Review): Review {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO reviews (id, user_id, course_id, rating, comment, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            review.userId,
            review.courseId,
            review.rating,
            review.comment,
            review.createdAt.toISOString()
        );

        return new Review({
            ...review.toJSON(),
            id: id
        });
    }

    // atualiza uma avaliação (para upsert)
    update(review: Review): Review {
        const stmt = db.prepare(`
            UPDATE reviews 
            SET rating = ?, comment = ?
            WHERE id = ?
        `);

        stmt.run(
            review.rating,
            review.comment,
            review.id
        );

        return review;
    }

    // busca avaliações de um curso com paginação e dados do usuário
    findByCourseId({ courseId, page, limit }: FindReviewsParams): FindReviewsResponse {
        const offset = (page - 1) * limit;

        const countStmt = db.prepare('SELECT COUNT(*) as total FROM reviews WHERE course_id = ?');
        const total = (countStmt.get(courseId) as any).total;

        const query = `
            SELECT r.*, u.name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.course_id = ?
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const rows = db.prepare(query).all(courseId, limit, offset) as any[];

        const reviews = rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            courseId: row.course_id,
            rating: row.rating,
            comment: row.comment,
            createdAt: new Date(row.created_at),
            user: {
                name: row.user_name
            }
        }));

        return { reviews, total };
    }

    // deleta uma avaliação
    delete(id: string): void {
        const stmt = db.prepare('DELETE FROM reviews WHERE id = ?');
        stmt.run(id);
    }

    // busca uma avaliação pelo id
    findById(id: string): Review | null {
        const stmt = db.prepare('SELECT * FROM reviews WHERE id = ?');
        const row = stmt.get(id) as any;

        if (!row) return null;

        return new Review({
            id: row.id,
            userId: row.user_id,
            courseId: row.course_id,
            rating: row.rating,
            comment: row.comment,
            createdAt: new Date(row.created_at)
        });
    }

    // busca avaliação por usuario e curso (para upsert)
    findByUserAndCourse(userId: string, courseId: string): Review | null {
        const stmt = db.prepare('SELECT * FROM reviews WHERE user_id = ? AND course_id = ?');
        const row = stmt.get(userId, courseId) as any;

        if (!row) return null;

        return new Review({
            id: row.id,
            userId: row.user_id,
            courseId: row.course_id,
            rating: row.rating,
            comment: row.comment,
            createdAt: new Date(row.created_at)
        });
    }

    // calcula média de avaliações de um curso
    getAverageRating(courseId: string): number {
        const stmt = db.prepare('SELECT AVG(rating) as avgRating FROM reviews WHERE course_id = ?');
        const result = stmt.get(courseId) as { avgRating: number };
        return result.avgRating || 0;
    }
}


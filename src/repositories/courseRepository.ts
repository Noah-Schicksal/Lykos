import db from '../database/connection';
import { Course } from '../entities/Course';
import { randomUUID } from 'crypto';
import { CourseStudentDTO } from '../dtos/courseDTOs';

export interface FindAllParams {
    page: number;
    limit: number;
    search?: string;
}

export interface FindAllResponse {
    courses: any[]; // Retornamos any aqui pois é um objeto montado com joins, não apenas a entidade
    total: number;
}

export class CourseRepository {

    // salva um novo curso no banco de dados
    save(course: Course): Course {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO courses (
                id, title, description, price, cover_image_url, 
                max_students, instructor_id, category_id, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            course.title,
            course.description,
            course.price,
            course.coverImageUrl,
            course.maxStudents,
            course.instructorId,
            course.categoryId,
            course.isActive ? 1 : 0,
            course.createdAt.toISOString()
        );

        return new Course({
            ...course.toJSON(),
            id: id
        });
    }

    // busca todos os cursos com filtros, paginação e joins
    findAll({ page, limit, search }: FindAllParams): FindAllResponse {
        const offset = (page - 1) * limit;
        let query = `
            SELECT 
                c.*, 
                cat.name as category_name, 
                u.name as instructor_name
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            JOIN users u ON c.instructor_id = u.id
            WHERE c.is_active = 1
        `;

        const params: any[] = [];

        if (search) {
            query += ` AND c.title LIKE ?`;
            params.push(`%${search}%`);
        }

        // conta o total de itens para a paginação
        const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
        const total = (db.prepare(countQuery).get(...params) as any).total;

        // adiciona limite e offset para paginação
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const rows = db.prepare(query).all(...params) as any[];

        // mapeia os resultados para o formato esperado
        const courses = rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            price: row.price,
            coverImageUrl: row.cover_image_url,
            category: row.category_id ? {
                id: row.category_id,
                name: row.category_name
            } : null,
            instructor: {
                name: row.instructor_name
            }
        }));

        return { courses, total };
    }

    // busca um curso pelo id com joins detalhados e média de avaliações
    findById(id: string): any | null {
        const query = `
            SELECT 
                c.*, 
                cat.name as category_name, 
                u.name as instructor_name,
                u.email as instructor_email,
                (SELECT AVG(rating) FROM reviews WHERE course_id = c.id) as rating_average,
                (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            JOIN users u ON c.instructor_id = u.id
            WHERE c.id = ?
        `;

        const row = db.prepare(query).get(id) as any;

        if (!row) return null;

        // mapeia para objeto de retorno (não estritamente a Entidade Course, mas um DTO enriquecido)
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            price: row.price,
            coverImageUrl: row.cover_image_url,
            maxStudents: row.max_students,
            enrolledCount: row.enrolled_count,
            averageRating: row.rating_average || 0,
            createdAt: new Date(row.created_at),
            category: row.category_id ? {
                id: row.category_id,
                name: row.category_name
            } : null,
            instructor: {
                id: row.instructor_id,
                name: row.instructor_name,
                email: row.instructor_email
            }
        };
    }

    // atualiza os dados de um curso existente
    update(course: Course): Course {
        const stmt = db.prepare(`
            UPDATE courses 
            SET title = ?, description = ?, price = ?, cover_image_url = ?, 
                max_students = ?, category_id = ?, is_active = ?
            WHERE id = ?
        `);

        stmt.run(
            course.title,
            course.description,
            course.price,
            course.coverImageUrl,
            course.maxStudents,
            course.categoryId,
            course.isActive ? 1 : 0,
            course.id
        );

        return course;
    }

    // realiza o soft delete (apenas marca como inativo)
    softDelete(id: string): void {
        const stmt = db.prepare('UPDATE courses SET is_active = 0 WHERE id = ?');
        stmt.run(id);
    }

    // busca os estudantes matriculados em um curso específico
    findStudents(courseId: string): CourseStudentDTO[] {
        const query = `
            SELECT 
                u.id, u.name, u.email, e.enrolled_at
            FROM enrollments e
            JOIN users u ON e.user_id = u.id
            WHERE e.course_id = ?
        `;

        const rows = db.prepare(query).all(courseId) as any[];

        return rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            enrolledAt: new Date(row.enrolled_at)
        }));
    }
}

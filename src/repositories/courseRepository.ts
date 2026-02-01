import db from '../database/connection';
import { Course } from '../entities/Course';
import { randomUUID } from 'crypto';
import { CourseStudentDTO } from '../dtos/courseDTOs';

export interface FindAllParams {
    page: number;
    limit: number;
    search?: string;
    userId?: string;
}

export interface FindAllResponse {
    courses: any[];
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
    findAll({ page, limit, search, userId }: FindAllParams): FindAllResponse {
        const offset = (page - 1) * limit;

        // Base select
        let query = `
            SELECT 
                c.*, 
                cat.name as category_name, 
                u.name as instructor_name,
                (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
        `;

        // If userId provided, add enrollment status and progress columns
        if (userId) {
            query += `,
                (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND user_id = ?) as is_enrolled,
                (SELECT COUNT(cl.id) 
                 FROM classes cl 
                 JOIN modules m ON cl.module_id = m.id 
                 WHERE m.course_id = c.id) as total_classes,
                (SELECT COUNT(cp.class_id) 
                 FROM class_progress cp 
                 JOIN classes cl ON cp.class_id = cl.id 
                 JOIN modules m ON cl.module_id = m.id 
                 WHERE m.course_id = c.id AND cp.user_id = ?) as completed_classes
            `;
        }

        query += `
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            JOIN users u ON c.instructor_id = u.id
            WHERE c.is_active = 1
        `;

        const params: any[] = [];

        if (userId) {
            params.push(userId, userId); // One for is_enrolled, one for completed_classes
        }

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
        const courses = rows.map(row => {
            // Calculate progress if data available
            let progress = 0;
            if (row.total_classes > 0) {
                progress = Math.round((row.completed_classes / row.total_classes) * 100);
            }

            return {
                id: row.id,
                title: row.title,
                description: row.description,
                price: row.price,
                coverImageUrl: row.cover_image_url,
                maxStudents: row.max_students,
                enrolledCount: row.enrolled_count,
                isEnrolled: !!row.is_enrolled,
                progress: row.is_enrolled ? progress : undefined, // Only send progress if enrolled
                instructorId: row.instructor_id, // Added for owner check
                category: row.category_id ? {
                    id: row.category_id,
                    name: row.category_name
                } : null,
                instructor: {
                    id: row.instructor_id, // Added for owner check
                    name: row.instructor_name
                }
            };
        });

        return { courses, total };
    }

    // busca cursos por categoria com paginação
    findByCategoryId(categoryId: string, page: number, limit: number): FindAllResponse {
        const offset = (page - 1) * limit;

        const countQuery = 'SELECT COUNT(*) as total FROM courses WHERE category_id = ? AND is_active = 1';
        const total = (db.prepare(countQuery).get(categoryId) as any).total;

        const query = `
            SELECT 
                c.id, c.title, c.description, c.price, c.cover_image_url, c.max_students, c.instructor_id,
                (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count,
                u.name as instructor_name
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            WHERE c.category_id = ? AND c.is_active = 1
            LIMIT ? OFFSET ?
        `;

        const rows = db.prepare(query).all(categoryId, limit, offset) as any[];

        const courses = rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            price: row.price,
            coverImageUrl: row.cover_image_url,
            maxStudents: row.max_students,
            enrolledCount: row.enrolled_count,
            instructorId: row.instructor_id,
            instructor: {
                id: row.instructor_id,
                name: row.instructor_name
            }
        }));

        return { courses, total };
    }

    // busca cursos de um instrutor específico
    findByInstructorId(instructorId: string): any[] {
        const query = `
            SELECT 
                c.id, c.title, c.description, c.price, c.cover_image_url, c.is_active,
                cat.name as category_name,
                (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.instructor_id = ?
            ORDER BY c.created_at DESC
        `;

        const rows = db.prepare(query).all(instructorId) as any[];

        return rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            price: row.price,
            coverImageUrl: row.cover_image_url,
            isActive: !!row.is_active,
            enrolledCount: row.enrolled_count,
            category: row.category_name ? {
                name: row.category_name
            } : null
        }));
    }

    // busca um curso pelo id com joins detalhados e média de avaliações
    findById(id: string, userId?: string): any | null {
        let query = `
            SELECT 
                c.*, 
                cat.name as category_name, 
                u.name as instructor_name,
                u.email as instructor_email,
                (SELECT AVG(rating) FROM reviews WHERE course_id = c.id) as rating_average,
                (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
        `;

        // Add progress columns if userId is provided
        if (userId) {
            query += `,
                (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND user_id = ?) as is_enrolled,
                (SELECT COUNT(cl.id) 
                 FROM classes cl 
                 JOIN modules m ON cl.module_id = m.id 
                 WHERE m.course_id = c.id) as total_classes,
                (SELECT COUNT(cp.class_id) 
                 FROM class_progress cp 
                 JOIN classes cl ON cp.class_id = cl.id 
                 JOIN modules m ON cl.module_id = m.id 
                 WHERE m.course_id = c.id AND cp.user_id = ?) as completed_classes
            `;
        }

        query += `
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            JOIN users u ON c.instructor_id = u.id
            WHERE c.id = ?
        `;

        const params: any[] = [];
        if (userId) {
            params.push(userId, userId);
        }
        params.push(id);

        const row = db.prepare(query).get(...params) as any;

        if (!row) return null;

        // Calculate progress
        let progress = undefined;
        let isEnrolled = false;

        if (userId) {
            isEnrolled = !!row.is_enrolled;
            if (isEnrolled && row.total_classes > 0) {
                progress = Math.round((row.completed_classes / row.total_classes) * 100);
            } else if (isEnrolled) {
                progress = 0;
            }
        }

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
            isEnrolled: isEnrolled,
            progress: progress,
            createdAt: new Date(row.created_at),
            category: row.category_id ? {
                id: row.category_id,
                name: row.category_name
            } : null,
            instructorId: row.instructor_id,
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

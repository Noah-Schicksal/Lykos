import db from '../database/connection';
import { Enrollment } from '../entities/Enrollment';

import { randomUUID } from 'crypto';

export class EnrollmentRepository {

    // Cria uma nova matrícula
    save(enrollment: Enrollment): Enrollment {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO enrollments (id, user_id, course_id, enrolled_at)
            VALUES (?, ?, ?, ?)
        `);

        stmt.run(
            id,
            enrollment.userId,
            enrollment.courseId,
            enrollment.enrolledAt.toISOString()
        );

        return new Enrollment({
            ...enrollment.toJSON(),
            id: id
        });
    }

    // Retorna as matrículas de um aluno
    findStudentEnrollments(userId: string): Enrollment[] {
        const stmt = db.prepare(`
            SELECT * FROM enrollments WHERE user_id = ?
        `);
        const rows = stmt.all(userId) as any[];

        return rows.map(row => new Enrollment({
            id: row.id,
            userId: row.user_id,
            courseId: row.course_id,
            enrolledAt: new Date(row.enrolled_at),
            certificateHash: row.certificate_hash
        }));
    }

    // Busca uma matrícula específica
    findEnrollment(userId: string, courseId: string): Enrollment | null {
        const stmt = db.prepare(`
            SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?
        `);
        const row = stmt.get(userId, courseId) as any;

        if (!row) return null;

        return new Enrollment({
            id: row.id,
            userId: row.user_id,
            courseId: row.course_id,
            enrolledAt: new Date(row.enrolled_at),
            certificateHash: row.certificate_hash
        });
    }

    // Conta total de aulas de um curso
    countCourseClasses(courseId: string): number {
        const stmt = db.prepare(`
            SELECT COUNT(c.id) as total
            FROM classes c
            JOIN modules m ON c.module_id = m.id
            WHERE m.course_id = ?
        `);
        const result = stmt.get(courseId) as { total: number };
        return result.total || 0;
    }

    // Conta quantas aulas o aluno completou no curso
    countCompletedClasses(userId: string, courseId: string): number {
        const stmt = db.prepare(`
            SELECT COUNT(cp.class_id) as total
            FROM class_progress cp
            JOIN classes c ON cp.class_id = c.id
            JOIN modules m ON c.module_id = m.id
            WHERE cp.user_id = ? AND m.course_id = ?
        `);
        const result = stmt.get(userId, courseId) as { total: number };
        return result.total || 0;
    }

    // Retorna IDs das aulas completadas pelo aluno em um curso
    getCompletedClassIds(userId: string, courseId: string): Set<string> {
        const stmt = db.prepare(`
            SELECT cp.class_id
            FROM class_progress cp
            JOIN classes c ON cp.class_id = c.id
            JOIN modules m ON c.module_id = m.id
            WHERE cp.user_id = ? AND m.course_id = ?
        `);
        const rows = stmt.all(userId, courseId) as { class_id: string }[];
        return new Set(rows.map(r => r.class_id));
    }

    // Atualiza o hash do certificado
    updateCertificateHash(enrollmentId: string, hash: string): void {
        const stmt = db.prepare(`
            UPDATE enrollments SET certificate_hash = ? WHERE id = ?
        `);
        stmt.run(hash, enrollmentId);
    }

    // Busca matrícula pelo hash do certificado (com dados para validação pública)
    findByCertificateHash(hash: string): any | null {
        const stmt = db.prepare(`
            SELECT 
                e.certificate_hash,
                u.name as student_name,
                c.title as course_title,
                u2.name as instructor_name,
                e.enrolled_at,
                c.id as course_id
            FROM enrollments e
            JOIN users u ON e.user_id = u.id
            JOIN courses c ON e.course_id = c.id
            JOIN users u2 ON c.instructor_id = u2.id
            WHERE e.certificate_hash = ?
        `);
        return stmt.get(hash);
    }
}

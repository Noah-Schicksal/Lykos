import db from '../database/connection';
import { Module } from '../entities/Module';
import { randomUUID } from 'crypto';

export class ModuleRepository {

    // salva um módulo no banco de dados
    save(module: Module): Module {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO modules (id, title, course_id, order_index, created_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            module.title,
            module.courseId,
            module.orderIndex,
            module.createdAt.toISOString()
        );

        return new Module({
            ...module.toJSON(),
            id: id
        });
    }

    // atualiza um módulo existente
    update(module: Module): Module {
        const stmt = db.prepare(`
            UPDATE modules 
            SET title = ?, order_index = ?
            WHERE id = ?
        `);

        stmt.run(
            module.title,
            module.orderIndex,
            module.id
        );

        return module;
    }

    // remove um módulo
    delete(id: string): void {
        const stmt = db.prepare('DELETE FROM modules WHERE id = ?');
        stmt.run(id);
    }

    // busca um módulo pelo ID
    findById(id: string): Module | null {
        const stmt = db.prepare('SELECT * FROM modules WHERE id = ?');
        const row = stmt.get(id) as any;

        if (!row) return null;

        return new Module({
            id: row.id,
            title: row.title,
            courseId: row.course_id,
            orderIndex: row.order_index,
            createdAt: new Date(row.created_at)
        });
    }

    // busca módulos de um curso ordenados
    findByCourseId(courseId: string): Module[] {
        const stmt = db.prepare('SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC');
        const rows = stmt.all(courseId) as any[];

        return rows.map(row => new Module({
            id: row.id,
            title: row.title,
            courseId: row.course_id,
            orderIndex: row.order_index,
            createdAt: new Date(row.created_at)
        }));
    }

    // busca a maior ordem (índice) de um curso para adicionar no final da lista
    findMaxOrderIndex(courseId: string): number {
        const stmt = db.prepare('SELECT MAX(order_index) as maxOrder FROM modules WHERE course_id = ?');
        const row = stmt.get(courseId) as any;
        return row.maxOrder || 0;
    }
}

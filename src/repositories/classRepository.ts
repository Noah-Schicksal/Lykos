import db from '../database/connection';
import { Class } from '../entities/Class';
import { randomUUID } from 'crypto';
import { ClassProgressDTO } from '../dtos/classDTOs';

export class ClassRepository {

    // salva uma nova aula
    save(classEntity: Class): Class {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO classes (id, title, description, video_url, material_url, module_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            classEntity.title,
            classEntity.description,
            classEntity.videoUrl,
            classEntity.materialUrl,
            classEntity.moduleId,
            classEntity.createdAt.toISOString()
        );

        return new Class({
            ...classEntity.toJSON(),
            id: id
        });
    }

    // atualiza uma aula existente
    update(classEntity: Class): Class {
        const stmt = db.prepare(`
            UPDATE classes 
            SET title = ?, description = ?, video_url = ?, material_url = ?
            WHERE id = ?
        `);

        stmt.run(
            classEntity.title,
            classEntity.description,
            classEntity.videoUrl,
            classEntity.materialUrl,
            classEntity.id
        );

        return classEntity;
    }

    // remove uma aula
    delete(id: string): void {
        const stmt = db.prepare('DELETE FROM classes WHERE id = ?');
        stmt.run(id);
    }

    // busca uma aula pelo ID
    findById(id: string): Class | null {
        const stmt = db.prepare('SELECT * FROM classes WHERE id = ?');
        const row = stmt.get(id) as any;

        if (!row) return null;

        return new Class({
            id: row.id,
            title: row.title,
            description: row.description,
            videoUrl: row.video_url,
            materialUrl: row.material_url,
            moduleId: row.module_id,
            createdAt: new Date(row.created_at)
        });
    }

    // marca uma aula como concluída pelo aluno
    markProgress(classId: string, userId: string): ClassProgressDTO {
        // verifica se já existe para evitar erro de UNIQUE constraint
        const checkStmt = db.prepare('SELECT 1 FROM class_progress WHERE user_id = ? AND class_id = ?');
        if (checkStmt.get(userId, classId)) {
            // se já existe, retorna o registro existente (pode atualizar a data se quiser, mas aqui só retornamos)
            return {
                classId,
                userId,
                completedAt: new Date() // data aproximada, idealmente buscaria do banco
            };
        }

        const completedAt = new Date();
        const stmt = db.prepare(`
            INSERT INTO class_progress (user_id, class_id, completed_at)
            VALUES (?, ?, ?)
        `);

        stmt.run(userId, classId, completedAt.toISOString());

        return {
            classId,
            userId,
            completedAt
        };
    }

    // desmarca a conclusão de uma aula
    unmarkProgress(classId: string, userId: string): void {
        const stmt = db.prepare('DELETE FROM class_progress WHERE user_id = ? AND class_id = ?');
        stmt.run(userId, classId);
    }
}

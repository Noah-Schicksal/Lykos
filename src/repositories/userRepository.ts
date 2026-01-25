import db from '../database/connection';
import { User } from '../entities/User';
import { randomUUID } from 'crypto';

export class UserRepository {

    save(user: User): User {
        const id = randomUUID();
        const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        // Usamos os getters da entidade para pegar os valores validados
        stmt.run(
            id,
            user.name,
            user.email,
            user.password,
            user.role,
            user.createdAt.toISOString()
        );

        // Retornamos uma nova Entidade com o ID gerado
        return new User({
            id: id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            createdAt: user.createdAt
        });
    }

    findByEmail(email: string): User | null {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const row = stmt.get(email) as any;

        if (!row) return null;

        return new User({
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            role: row.role,
            createdAt: new Date(row.created_at)
        });
    }
}
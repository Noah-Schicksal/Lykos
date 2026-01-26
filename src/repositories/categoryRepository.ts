import db from '../database/connection';
import { Category } from '../entities/Category';
import { randomUUID } from 'crypto';

export class CategoryRepository {

    save(category: Category): Category {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO categories (id, name)
            VALUES (?, ?)
        `);

        stmt.run(id, category.name);

        return new Category({
            id: id,
            name: category.name
        });
    }

    findAll(): Category[] {
        const stmt = db.prepare('SELECT * FROM categories');
        const rows = stmt.all() as any[];

        return rows.map(row => new Category({
            id: row.id,
            name: row.name
        }));
    }

    findByName(name: string): Category | null {
        const stmt = db.prepare('SELECT * FROM categories WHERE name = ?');
        const row = stmt.get(name) as any;

        if (!row) return null;

        return new Category({
            id: row.id,
            name: row.name
        });
    }

    findById(id: string): Category | null {
        const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
        const row = stmt.get(id) as any;

        if (!row) return null;

        return new Category({
            id: row.id,
            name: row.name
        });
    }
}

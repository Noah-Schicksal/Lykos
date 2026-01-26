import db from '../database/connection';
import { CartItem } from '../entities/CartItem';
import { randomUUID } from 'crypto';

export class CartRepository {

    // Adiciona item ao carrinho
    save(cartItem: CartItem): CartItem {
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO cart_items (id, user_id, course_id, added_at)
            VALUES (?, ?, ?, ?)
        `);

        stmt.run(
            id,
            cartItem.userId,
            cartItem.courseId,
            cartItem.addedAt.toISOString()
        );

        return new CartItem({
            ...cartItem.toJSON(),
            id: id
        });
    }

    // Remove item do carrinho
    delete(userId: string, courseId: string): void {
        const stmt = db.prepare('DELETE FROM cart_items WHERE user_id = ? AND course_id = ?');
        stmt.run(userId, courseId);
    }

    // Limpa carrinho do usuário
    clearCart(userId: string): void {
        const stmt = db.prepare('DELETE FROM cart_items WHERE user_id = ?');
        stmt.run(userId);
    }

    // Verifica se item já existe no carrinho
    exists(userId: string, courseId: string): boolean {
        const stmt = db.prepare('SELECT 1 FROM cart_items WHERE user_id = ? AND course_id = ?');
        return !!stmt.get(userId, courseId);
    }

    // Retorna itens do carrinho (com join para pegar dados do curso)
    // Retornamos um array de objetos customizados, não CartItem entity pura, pois precisamos de dados do curso
    getCartItems(userId: string): any[] {
        const stmt = db.prepare(`
            SELECT 
                ci.id, 
                ci.course_id, 
                c.title, 
                c.price, 
                c.cover_image_url, 
                u.name as instructor_name,
                ci.added_at
            FROM cart_items ci
            JOIN courses c ON ci.course_id = c.id
            JOIN users u ON c.instructor_id = u.id
            WHERE ci.user_id = ?
            ORDER BY ci.added_at DESC
        `);

        return stmt.all(userId) as any[];
    }
}

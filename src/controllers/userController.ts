import { Request, Response } from 'express';
import { CreateUserService } from '../services/userService';

export class UserController {
    async register(req: Request, res: Response) {
        const { name, email, password } = req.body;

        const service = new CreateUserService();

        try {
            const user = await service.execute({ name, email, password });

            // Resposta limpa usando o método da entidade
            return res.status(201).json(user.toJSON());

        } catch (error: any) {
            // Tratamento de erros
            if (error.message.includes('Regra de Negócio')) {
                return res.status(422).json({ error: error.message }); // 422 Unprocessable Entity
            }
            if (error.message.includes('Conflito')) {
                return res.status(409).json({ error: error.message }); // 409 Conflict
            }
            return res.status(400).json({ error: error.message });
        }
    }
}
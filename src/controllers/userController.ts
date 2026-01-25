import { Request, Response } from 'express';
import { CreateUserService } from '../services/userService';

export class UserController {
    async registerStudent(req: Request, res: Response) {
        const { name, email, password } = req.body;

        const service = new CreateUserService();

        try {
            // Força a role STUDENT
            const user = await service.execute({ name, email, password, role: 'STUDENT' });

            return res.status(201).json(user.toJSON());

        } catch (error: any) {
            return this.handleError(res, error);
        }
    }

    async registerAdmin(req: Request, res: Response) {
        const { name, email, password } = req.body;

        // Em um sistema real, aqui teria que ter uma verificação se quem está criando é um ADMIN master,
        // mas como pedido, é uma rota pública de registro de admin.

        const service = new CreateUserService();

        try {
            // Força a role ADMIN
            const user = await service.execute({ name, email, password, role: 'ADMIN' });

            return res.status(201).json(user.toJSON());

        } catch (error: any) {
            return this.handleError(res, error);
        }
    }

    private handleError(res: Response, error: any) {
        if (error.message.includes('Regra de Negócio')) {
            return res.status(422).json({ error: error.message });
        }
        if (error.message.includes('Conflito') || error.message.includes('duplicidade')) {
            return res.status(409).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
    }
}
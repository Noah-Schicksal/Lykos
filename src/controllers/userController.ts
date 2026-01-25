import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class studentRegister {
    async registerStudent(req: Request, res: Response) {
        const { name, email, password } = req.body;

        const service = new UserService();

        try {
            // Força a role STUDENT
            const user = await service.create({ name, email, password, role: 'STUDENT' });

            return res.status(201).json(user.toJSON());

        } catch (error: any) {
            return this.handleError(res, error);
        }
    }

    async registerInstructor(req: Request, res: Response) {
        const { name, email, password } = req.body;

        //em um sistema real, aqui teria que ter uma verificação se quem está criando é um ADMIN master,
        //mas como pedido, é uma rota pública de registro de admin.

        const service = new UserService();

        try {
            // Força a role INSTRUCTOR
            const user = await service.create({ name, email, password, role: 'INSTRUCTOR' });

            return res.status(201).json(user.toJSON());

        } catch (error: any) {
            return this.handleError(res, error);
        }
    }

    private handleError(res: Response, error: any) {
        if (error.message.includes('Regra de Negócio') || error.message.includes('Proibido')) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes('Conflito') || error.message.includes('duplicidade')) {
            return res.status(409).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
    }

    async deleteSelf(req: Request, res: Response) {
        const { id } = req.params;
        const requesterId = req.user.id;

        const service = new UserService();

        try {
            await service.delete({ userIdToDelete: id as string, requesterId });
            return res.status(204).send();
        } catch (error: any) {
            return this.handleError(res, error);
        }
    }
}
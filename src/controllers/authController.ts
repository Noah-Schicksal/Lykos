import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        const service = new AuthService();

        try {
            const result = await service.login({ email, password });

            return res.status(200).json(result);

        } catch (error: any) {
            // Se for erro de credenciais, retornamos 401 Unauthorized
            if (error.message === 'Email ou senha incorretos.') {
                return res.status(401).json({ error: error.message });
            }

            // Outros erros
            return res.status(400).json({ error: error.message });
        }
    }
}

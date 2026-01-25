import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';

interface LoginRequestDTO {
    email: string;
    password: string; // senha crua
}

interface LoginResponseDTO {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    token: string;
}

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async login({ email, password }: LoginRequestDTO): Promise<LoginResponseDTO> {
        // 1. Buscar usuário pelo email
        const user = this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error("Email ou senha incorretos."); // Mensagem genérica por segurança
        }

        // 2. Verificar a senha (Hash comparison)
        // user.password vem do banco (hash), password vem do request (plano)
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new Error("Email ou senha incorretos.");
        }

        // 3. Gerar o Token JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("Erro interno: JWT_SECRET não definido.");
        }

        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            secret,
            { expiresIn: expiresIn as any }
        );

        // 4. Retornar dados (sem a senha, obviamente)
        return {
            user: {
                id: user.id!,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        };
    }
}

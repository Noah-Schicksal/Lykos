import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { LoginRequestDTO, LoginResponseDTO } from '../dtos/authDTOs';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async login({ email, password }: LoginRequestDTO): Promise<LoginResponseDTO> {
    //busca o usuário pelo email
    const user = this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Email ou senha incorretos.'); // Mensagem genérica por segurança
    }

    //verifica a senha (Hash comparison)
    // user.password vem do banco (hash), password vem do request (plano)
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Email ou senha incorretos.');
    }

    //gera o token jwt
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Erro interno: JWT_SECRET não definido.');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

    const token = jwt.sign(
      {
        name: user.name,
        id: user.id,
        role: user.role,
      },
      secret,
      { expiresIn: expiresIn as any },
    );

    //retorna os dados do usuário e o token jwt
    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { LoginRequestDTO, LoginResponseDTO } from '../dtos/authDTOs';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  private async validateCredentials(email: string, password: string) {
    const user = this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Email ou senha incorretos.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Email ou senha incorretos.');
    }

    return user;
  }

  async login({ email, password }: LoginRequestDTO): Promise<LoginResponseDTO> {
    //busca o usuário pelo email e valida a senha
    const user = await this.validateCredentials(email, password);

    //gera o token jwt
    const secret = process.env.JWT_SECRET!;

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

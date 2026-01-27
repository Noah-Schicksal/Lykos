import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { LoginRequestDTO, LoginResponseDTO } from '../dtos/authDTOs';
import { ApplicationError } from './userService';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  private async validateCredentials(email: string, password: string) {
    const user = this.userRepository.findByEmail(email);

    if (!user) {
      throw new ApplicationError('Email ou senha incorretos');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new ApplicationError('Email ou senha incorretos');
    }

    return user;
  }

  async login({
    email,
    password,
  }: LoginRequestDTO): Promise<{
    user: LoginResponseDTO['user'];
    token: string;
  }> {
    const user = await this.validateCredentials(email, password);

    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN;

    const token = jwt.sign(
      {
        name: user.name,
        id: user.id,
        role: user.role,
      },
      secret,
      { expiresIn: expiresIn as any },
    );

    //retorna os dados do usuário e o token (token é usado apenas no controller para o cookie)
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

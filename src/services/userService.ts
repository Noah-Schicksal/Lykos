import bcrypt from 'bcrypt';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/userRepository';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/userDTOs';

/**
 * Erros de aplicação (relacionados ao banco/regras de aplicação)
 */
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async create({ name, email, password, role }: CreateUserDTO): Promise<User> {
    // Valida duplicidade (Regra de Aplicação)
    const exists = this.userRepository.findByEmail(email);
    if (exists) {
      throw new ApplicationError('Este e-mail já está cadastrado');
    }

    // Valida senha crua ANTES de hashear (Regra de Negócio)
    User.validatePasswordRules(password);

    // Hash da senha (Infraestrutura)
    const passwordHash = await bcrypt.hash(password, 10);

    // Cria entidade (validações de formato acontecem aqui)
    const newUser = new User({
      name,
      email,
      password: passwordHash,
      role,
    });

    // Salva no banco
    return this.userRepository.save(newUser);
  }

  async delete(userId: string): Promise<void> {
    // Deleta o usuário (já validado pelo authMiddleware)
    this.userRepository.delete(userId);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new ApplicationError('Usuário não encontrado');
    }

    // Atualiza campos (validações de formato acontecem nos setters)
    if (data.name) {
      user.setName(data.name);
    }

    if (data.email) {
      // Verifica duplicidade
      const userWithEmail = this.userRepository.findByEmail(data.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ApplicationError('Este e-mail já está cadastrado');
      }
      user.setEmail(data.email);
    }

    if (data.password) {
      // Valida senha crua
      User.validatePasswordRules(data.password);
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Recria entidade com nova senha
      const updatedUser = new User({
        id: user.id,
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
        createdAt: user.createdAt,
      });

      return this.userRepository.update(updatedUser);
    }

    return this.userRepository.update(user);
  }

  async findById(id: string): Promise<User> {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new ApplicationError('Usuário não encontrado');
    }
    return user;
  }
}

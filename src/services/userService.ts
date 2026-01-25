import bcrypt from 'bcrypt';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/userRepository';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/userDTOs';

const ERROR_USER_NOT_FOUND = 'Usuário não encontrado.';
const ERROR_EMAIL_ALREADY_EXISTS = 'Este e-mail já está cadastrado';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async create({ name, email, password, role }: CreateUserDTO): Promise<User> {
    //verifica duplicidade (Regra de Aplicação)
    const exists = this.userRepository.findByEmail(email);
    if (exists) {
      throw new Error(ERROR_EMAIL_ALREADY_EXISTS);
    }

    //valida a senha crua (Regra de Negócio)
    User.validatePasswordRules(password);

    //hash da senha (Regra de Segurança/Infra)
    const passwordHash = await bcrypt.hash(password, 10);

    //instancia a Entidade
    //SE OS DADOS ESTIVEREM INVÁLIDOS, A CLASSE USER LANÇA ERRO AQUI.
    const newUser = new User({
      name,
      email,
      password: passwordHash,
      role: role, // passada explicitamente
    });

    //salva no banco
    const savedUser = this.userRepository.save(newUser);

    return savedUser;
  }

  async delete(userId: string): Promise<void> {
    // Deleta o usuário (já validado pelo authMiddleware)
    this.userRepository.delete(userId);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new Error(ERROR_USER_NOT_FOUND);
    }

    if (data.name) {
      user.setName(data.name);
    }

    if (data.email) {
      // Verifica se o email já está em uso por outro usuário
      const userWithEmail = this.userRepository.findByEmail(data.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error(ERROR_EMAIL_ALREADY_EXISTS);
      }
      user.setEmail(data.email);
    }

    if (data.password) {
      User.validatePasswordRules(data.password);
      const passwordHash = await bcrypt.hash(data.password, 10);

      //recriamos a entidade pois a senha é imutável/privada sem setter público de hash
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

    //salva as alterações de nome/email se houve mudança
    return this.userRepository.update(user);
  }

  async findById(id: string): Promise<User> {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new Error(ERROR_USER_NOT_FOUND);
    }
    return user;
  }
}

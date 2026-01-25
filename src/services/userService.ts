import bcrypt from 'bcrypt';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/userRepository';
import { CreateUserDTO, UpdateUserDTO, DeleteUserDTO } from '../dtos/userDTOs';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async create({ name, email, password, role }: CreateUserDTO): Promise<User> {
    //verifica duplicidade (Regra de Aplicação)
    const exists = this.userRepository.findByEmail(email);
    if (exists) {
      throw new Error('Esse email ja esta cadastrado');
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

  async delete({ userIdToDelete, requesterId }: DeleteUserDTO): Promise<void> {
    // Regra de negócio: Usuário só pode deletar a si mesmo.
    if (userIdToDelete !== requesterId) {
      throw new Error('Proibido: Você só pode deletar a sua própria conta.');
    }

    // Verifica se o usuário existe (embora se ele está autenticado, deveria existir, mas é bom garantir)
    // Como o repositório só tem findByEmail, vamos assumir que o ID veio do token e é válido.

    // Deleta o usuário
    this.userRepository.delete(userIdToDelete);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    if (data.name) {
      user.setName(data.name);
    }

    if (data.email) {
      // Verifica se o email já está em uso por outro usuário
      const userWithEmail = this.userRepository.findByEmail(data.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error(
          'Este email já está sendo utilizado por outro usuário.',
        );
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
      throw new Error('Usuário não encontrado.');
    }
    return user;
  }
}

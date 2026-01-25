import bcrypt from 'bcrypt';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/userRepository';

interface CreateUserDTO {
    name: string;
    email: string;
    password: string;//senha crua sem hash
    role: string;
}

interface DeleteUserDTO {
    userIdToDelete: string;
    requesterId: string;
}

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async create({ name, email, password, role }: CreateUserDTO): Promise<User> {
        //verifica duplicidade (Regra de Aplicação)
        const exists = this.userRepository.findByEmail(email);
        if (exists) {
            throw new Error("Esse email ja esta cadastrado");
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
            role: role // passada explicitamente
        });

        //salva no banco
        const savedUser = this.userRepository.save(newUser);

        return savedUser;
    }

    async delete({ userIdToDelete, requesterId }: DeleteUserDTO): Promise<void> {
        // Regra de negócio: Usuário só pode deletar a si mesmo.
        if (userIdToDelete !== requesterId) {
            throw new Error("Proibido: Você só pode deletar a sua própria conta.");
        }

        // Verifica se o usuário existe (embora se ele está autenticado, deveria existir, mas é bom garantir)
        // Como o repositório só tem findByEmail, vamos assumir que o ID veio do token e é válido.

        // Deleta o usuário
        this.userRepository.delete(userIdToDelete);
    }
}
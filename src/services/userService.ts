import bcrypt from 'bcrypt';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/userRepository';

interface RequestDTO {
    name: string;
    email: string;
    password: string;//senha crua sem hash
}

export class CreateUserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async execute({ name, email, password }: RequestDTO): Promise<User> {
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
            password: passwordHash
            // role é opcional agora e defaulta para STUDENT na entidade
        });

        //salva no banco
        const savedUser = this.userRepository.save(newUser);

        return savedUser;
    }
}
import { UserRepository } from '../repositories/userRepository';

interface DeleteRequest {
    userIdToDelete: string;
    requesterId: string;
}

export class DeleteUserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async execute({ userIdToDelete, requesterId }: DeleteRequest): Promise<void> {

        // Regra de negócio: Usuário só pode deletar a si mesmo.
        if (userIdToDelete !== requesterId) {
            throw new Error("Usuário só pode deletar a si mesmo.");
        }

        // Verifica se o usuário existe (embora se ele está autenticado, deveria existir, mas é bom garantir)
        // Como o repositório só tem findByEmail, vamos assumir que o ID veio do token e é válido.
        // Se quiséssemos ser mais rigorosos, implementaríamos um findById no repositório.

        // Deleta o usuário
        this.userRepository.delete(userIdToDelete);
    }
}

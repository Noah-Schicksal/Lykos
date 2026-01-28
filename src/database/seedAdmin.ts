import bcrypt from 'bcrypt';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/userRepository';

const userRepository = new UserRepository();

export const seedAdmin = async () => {
	const email = 'admin@chemacademy.com';

	// Verifica se já existe
	const existing = userRepository.findByEmail(email);
	if (existing) {
		console.log('Admin já existe:', existing.email);
		return existing;
	}

	// Senha em texto (exemplo) — será armazenada em hash
	const plainPassword = 'admin123456';
	const passwordHash = await bcrypt.hash(plainPassword, 10);

	const adminUser = new User({
		name: 'Admin',
		email,
		password: passwordHash,
		role: 'ADMIN',
	});

	const saved = userRepository.save(adminUser);
	console.log('Usuário admin criado:', saved.email);
	return saved;
};

// Executa automaticamente se este script for chamado diretamente
if (require && require.main === module) {
	seedAdmin().catch((err) => {
		console.error('Erro ao criar admin:', err);
		process.exit(1);
	});
}


export type UserRole = 'STUDENT';

export interface UserProps {
    id?: string;
    name: string;
    email: string;
    password: string; //senha em hash
    role?: string;
    createdAt?: Date;
}

export class User {
    public readonly id?: string;
    public readonly createdAt: Date;

    private _name!: string;
    private _email!: string;
    private _password!: string;
    private _role!: UserRole;

    constructor(props: UserProps) {
        this.id = props.id;
        this.createdAt = props.createdAt || new Date();

        this.setName(props.name);
        this.setEmail(props.email);
        this.setRole(props.role || 'STUDENT');

        // O construtor assume que o que entra aqui JÁ É O HASH
        this._password = props.password;
    }

    // --- MÉTODOS DE NEGÓCIO ---

    public setName(name: string) {
        if (!name || name.trim().length < 3) {
            throw new Error("Regra de Negócio: O nome deve ter no mínimo 3 caracteres.");
        }
        this._name = name.trim();
    }

    public setEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Regra de Negócio: Formato de e-mail inválido.");
        }
        this._email = email.toLowerCase();
    }

    public setRole(role: string) {
        if (role !== 'STUDENT') {
            throw new Error("O perfil deve ser 'STUDENT'.");
        }
        this._role = role as UserRole;
    }

    //validação da senha CRUA (Regra de Negócio)
    //validamos a string antes de criar o objeto User
    static validatePasswordRules(password: string) {
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!password || password.length < 8 || !passRegex.test(password)) {
            throw new Error("A senha deve ter no mínimo 8 caracteres, com pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.");
        }

    }

    // --- Getters ---
    get name(): string { return this._name; }
    get email(): string { return this._email; }
    get role(): UserRole { return this._role; }
    get password(): string { return this._password; }

    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            createdAt: this.createdAt
        };
    }
}


export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string; //senha em hash
  role?: UserRole;
  createdAt?: Date;
}

/**
 * Classe de erros customizados para domínio
 * Facilita identificação no errorHandler
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
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
      throw new DomainError('O nome deve ter no mínimo 3 caracteres');
    }
    this._name = name.trim();
  }

  public setEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainError('Formato de e-mail inválido');
    }
    this._email = email.toLowerCase();
  }

  public setRole(role: UserRole) {
    const validRoles: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
    if (!validRoles.includes(role as UserRole)) {
      throw new DomainError('Tipo de usuário inválido');
    }
    this._role = role as UserRole;
  }

  /**
   * Valida regras de senha ANTES de hashear
   * Chamado pelo Service antes do bcrypt
   */
  static validatePasswordRules(password: string): void {
    if (password.length < 8) {
      throw new DomainError('A senha deve ter no mínimo 8 caracteres');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new DomainError(
        'A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais',
      );
    }
  }

  // --- Getters ---
  get name(): string {
    return this._name;
  }
  get email(): string {
    return this._email;
  }
  get role(): UserRole {
    return this._role;
  }
  get password(): string {
    return this._password;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}

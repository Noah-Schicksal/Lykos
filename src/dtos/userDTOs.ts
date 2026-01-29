import { UserRole } from '../entities/User';

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}

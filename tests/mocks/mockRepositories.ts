import { UserRepository } from '../../src/repositories/userRepository';
import { User } from '../../src/entities/User';

export const createMockUserRepository = (): jest.Mocked<UserRepository> => {
  return {
    save: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
};

export const mockUser = new User({
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Student Test',
  email: 'student@test.com',
  password: '$2b$10$hashedPasswordExample123456789012',
  role: 'STUDENT',
  createdAt: new Date('2024-01-01'),
});

export const mockInstructor = new User({
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Instructor Test',
  email: 'instructor@test.com',
  password: '$2b$10$hashedPasswordExample123456789012',
  role: 'INSTRUCTOR',
  createdAt: new Date('2024-01-01'),
});

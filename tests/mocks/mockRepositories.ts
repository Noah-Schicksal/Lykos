import { UserRepository } from '../../src/repositories/userRepository';
import { CategoryRepository } from '../../src/repositories/categoryRepository';
import { CourseRepository } from '../../src/repositories/courseRepository';
import { User } from '../../src/entities/User';
import { Category } from '../../src/entities/Category';
import { Course } from '../../src/entities/Course';

/**
 * Factory para criar mock do UserRepository
 * @returns Objeto mock com todos os métodos do UserRepository
 */
export const createMockUserRepository = () => {
  return {
    save: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
};

/**
 * Factory para criar mock do CategoryRepository
 * @returns Objeto mock com todos os métodos do CategoryRepository
 */
export const createMockCategoryRepository = () => {
  return {
    save: jest.fn(),
    findByName: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
};

/**
 * Factory para criar mock do CourseRepository
 * @returns Objeto mock com todos os métodos do CourseRepository
 */
export const createMockCourseRepository = () => {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByCategoryId: jest.fn(),
    findByInstructorId: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findStudents: jest.fn(),
  } as any;
};

/**
 * Mock de usuário padrão para testes - STUDENT
 * ID: 123e4567-e89b-12d3-a456-426614174000
 */
export const mockUser = new User({
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Student Test',
  email: 'student@test.com',
  password: '$2b$10$hashedPasswordExample123456789012',
  role: 'STUDENT',
  createdAt: new Date('2024-01-01'),
});

/**
 * Mock de usuário padrão para testes - INSTRUCTOR
 * ID: 123e4567-e89b-12d3-a456-426614174001
 */
export const mockInstructor = new User({
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Instructor Test',
  email: 'instructor@test.com',
  password: '$2b$10$hashedPasswordExample123456789012',
  role: 'INSTRUCTOR',
  createdAt: new Date('2024-01-01'),
});

/**
 * Mock de categoria padrão para testes
 * ID: 123e4567-e89b-12d3-a456-426614174000
 */
export const mockCategory = new Category({
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Category',
});

/**
 * Mock de segunda categoria para testes
 * ID: 123e4567-e89b-12d3-a456-426614174001
 */
export const mockCategoryTwo = new Category({
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Another Category',
});

/**
 * Mock de curso padrão para testes
 * ID: 123e4567-e89b-12d3-a456-426614174100
 * Pertence ao mockInstructor
 */
export const mockCourse = {
  id: '123e4567-e89b-12d3-a456-426614174100',
  title: 'Test Course',
  description: 'A comprehensive test course',
  price: 99.99,
  coverImageUrl: 'https://example.com/course-cover.jpg',
  maxStudents: 30,
  category: mockCategory,
  categoryId: mockCategory.id,
  instructorId: mockInstructor.id,
  isActive: true,
  createdAt: new Date('2024-01-15'),
} as any;

/**
 * Mock de segundo curso para testes
 * ID: 123e4567-e89b-12d3-a456-426614174101
 * Pertence ao mockInstructor
 */
export const mockCourseTwo = {
  id: '123e4567-e89b-12d3-a456-426614174101',
  title: 'Advanced Test Course',
  description: 'An advanced course for testing',
  price: 199.99,
  coverImageUrl: 'https://example.com/advanced-cover.jpg',
  maxStudents: 20,
  category: mockCategoryTwo,
  categoryId: mockCategoryTwo.id,
  instructorId: mockInstructor.id,
  isActive: true,
  createdAt: new Date('2024-02-01'),
} as any;

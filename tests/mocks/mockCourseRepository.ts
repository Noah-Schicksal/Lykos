import { CourseRepository } from '../../src/repositories/courseRepository';
import { Course } from '../../src/entities/Course';

export const createMockCourseRepository = (): jest.Mocked<CourseRepository> => {
    return {
        save: jest.fn(),
        findAll: jest.fn(),
        findByCategoryId: jest.fn(),
        findByInstructorId: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        findStudents: jest.fn()
    } as any;
};

export const mockCourse = new Course({
    id: 'course-123',
    title: 'Curso NodeJS',
    description: 'Curso completo de Backend',
    price: 100,
    instructorId: 'instructor-123',
    categoryId: 'category-123',
    maxStudents: 50,
    coverImageUrl: 'http://img.url/cover.jpg'
});
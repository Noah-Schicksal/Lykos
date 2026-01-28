import { CourseService, ApplicationError } from '../../../src/services/courseService';
import { Course } from '../../../src/entities/Course';
import { createMockCourseRepository, mockCourse } from '../../mocks/mockCourseRepository';
import { createMockCategoryRepository } from '../../mocks/mockCategoryRepository';

describe('CourseService', () => {
    let courseService: CourseService;
    let mockCourseRepo: ReturnType<typeof createMockCourseRepository>;
    let mockCategoryRepo: ReturnType<typeof createMockCategoryRepository>;

    beforeEach(() => {
        mockCourseRepo = createMockCourseRepository();
        mockCategoryRepo = createMockCategoryRepository();
        courseService = new CourseService(mockCourseRepo, mockCategoryRepo);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a course successfully', async () => {
            // Arrange
            mockCategoryRepo.findById.mockReturnValue({ id: 'cat-1', name: 'Tech' } as any);
            mockCourseRepo.save.mockReturnValue(mockCourse);

            const courseData = {
                title: 'Curso NodeJS',
                description: 'Desc',
                price: 100,
                categoryId: 'cat-1',
                maxStudents: 10
            };

            // Act
            const result = await courseService.create(courseData, 'instructor-123');

            // Assert
            expect(result).toEqual(mockCourse);
            expect(mockCategoryRepo.findById).toHaveBeenCalledWith('cat-1');
            expect(mockCourseRepo.save).toHaveBeenCalled();
        });

        it('should throw error if category does not exist', async () => {
            mockCategoryRepo.findById.mockReturnValue(null);

            await expect(courseService.create({
                title: 'T', description: 'D', price: 10, categoryId: 'invalid'
            }, 'inst-1')).rejects.toThrow('Categoria não encontrada');
        });
    });

    describe('list', () => {
        it('should return list of courses', async () => {
            const response = { courses: [mockCourse], total: 1 };
            mockCourseRepo.findAll.mockReturnValue(response);

            const result = await courseService.list(1, 10);

            expect(result).toEqual(response);
            expect(mockCourseRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, search: undefined });
        });
    });

    describe('getById', () => {
        it('should return course details if found', async () => {
            mockCourseRepo.findById.mockReturnValue(mockCourse);
            const result = await courseService.getById('course-123');
            expect(result).toEqual(mockCourse);
        });

        it('should throw error if course not found', async () => {
            mockCourseRepo.findById.mockReturnValue(null);
            await expect(courseService.getById('invalid')).rejects.toThrow('Curso não encontrado');
        });
    });

    describe('update', () => {
        it('should update course if user is owner', async () => {
            // Repositório retorna um objeto com instrutor correto
            const courseWithInstructor = new Course({ ...mockCourse.toJSON(), instructorId: 'inst-1' });
            mockCourseRepo.findById.mockReturnValue(courseWithInstructor);
            mockCourseRepo.update.mockReturnValue(mockCourse);

            await courseService.update('course-123', { title: 'Novo Titulo' }, 'inst-1');

            expect(mockCourseRepo.update).toHaveBeenCalled();
        });

        it('should throw error if user is not owner', async () => {
            const courseWithInstructor = new Course({ ...mockCourse.toJSON(), instructorId: 'inst-1' });
            mockCourseRepo.findById.mockReturnValue(courseWithInstructor);

            await expect(courseService.update('course-123', {}, 'other-inst')).rejects.toThrow('Permissão para edição negada');
        });
    });

    describe('delete', () => {
        it('should soft delete course if user is owner', async () => {
            const courseWithInstructor = new Course({ ...mockCourse.toJSON(), instructorId: 'inst-1' });
            mockCourseRepo.findById.mockReturnValue(courseWithInstructor);

            await courseService.delete('course-123', 'inst-1');
            expect(mockCourseRepo.softDelete).toHaveBeenCalledWith('course-123');
        });

        it('should throw error if user is not owner', async () => {
            const courseWithInstructor = new Course({ ...mockCourse.toJSON(), instructorId: 'inst-1' });
            mockCourseRepo.findById.mockReturnValue(courseWithInstructor);

            await expect(courseService.delete('course-123', 'other')).rejects.toThrow('Você não tem permissão para remover este curso');
        });
    });
});
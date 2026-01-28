import { StudentService, ApplicationError } from '../../../src/services/studentService';
import { createMockEnrollmentRepository } from '../../mocks/mockEnrollmentRepository';
import { createMockCourseRepository, mockCourse } from '../../mocks/mockCourseRepository';
import { createMockModuleRepository } from '../../mocks/mockModuleRepository';
import { createMockClassRepository } from '../../mocks/mockClassRepository';
import { EnrollmentRepository } from '../../../src/repositories/enrollmentRepository';
import { CourseRepository } from '../../../src/repositories/courseRepository';
import { ModuleRepository } from '../../../src/repositories/moduleRepository';
import { ClassRepository } from '../../../src/repositories/classRepository';
import { Enrollment } from '../../../src/entities/Enrollment';

// Mock crypto if needed, but for now we expect a string
jest.mock('crypto', () => ({
    randomUUID: () => 'mocked-uuid-hash'
}));

describe('StudentService', () => {
    let studentService: StudentService;
    let mockEnrollmentRepo: jest.Mocked<EnrollmentRepository>;
    let mockCourseRepo: jest.Mocked<CourseRepository>;
    let mockModuleRepo: jest.Mocked<ModuleRepository>;
    let mockClassRepo: jest.Mocked<ClassRepository>;

    const userId = 'user-123';
    const courseId = mockCourse.id!;

    beforeEach(() => {
        mockEnrollmentRepo = createMockEnrollmentRepository();
        mockCourseRepo = createMockCourseRepository();
        mockModuleRepo = createMockModuleRepository();
        mockClassRepo = createMockClassRepository();

        studentService = new StudentService(
            mockEnrollmentRepo,
            mockCourseRepo,
            mockModuleRepo,
            mockClassRepo
        );

        jest.clearAllMocks();
    });

    describe('listMyCourses', () => {
        it('should return list of courses with progress', async () => {
            // Arrange
            const mockEnrollments = [
                { userId, courseId, enrolledAt: new Date(), certificateHash: null }
            ];
            mockEnrollmentRepo.findStudentEnrollments.mockReturnValue({
                enrollments: mockEnrollments as any,
                total: 1
            });
            mockCourseRepo.findById.mockReturnValue(mockCourse);
            // Simulate 50% progress
            mockEnrollmentRepo.countCourseClasses.mockReturnValue(10);
            mockEnrollmentRepo.countCompletedClasses.mockReturnValue(5);

            // Act
            const result = await studentService.listMyCourses(userId);

            // Assert
            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toBe(courseId);
            expect(result.data[0].progress).toBe(50);
            expect(result.meta.totalItems).toBe(1);
        });

        it('should handle pagination meta', async () => {
            // Arrange
            mockEnrollmentRepo.findStudentEnrollments.mockReturnValue({
                enrollments: [],
                total: 15
            });

            // Act
            const result = await studentService.listMyCourses(userId, 2, 5);

            // Assert
            expect(result.meta.currentPage).toBe(2);
            expect(result.meta.totalPages).toBe(3); // 15 / 5 = 3
            expect(result.meta.itemsPerPage).toBe(5);
        });
    });

    describe('getCourseDetails', () => {
        it('should return course details with modules and classes status', async () => {
            // Arrange
            mockEnrollmentRepo.findEnrollment.mockReturnValue(new Enrollment({ userId, courseId }));
            mockCourseRepo.findById.mockReturnValue(mockCourse);

            // Progress setup
            mockEnrollmentRepo.countCourseClasses.mockReturnValue(2);
            mockEnrollmentRepo.countCompletedClasses.mockReturnValue(1);
            mockEnrollmentRepo.getCompletedClassIds.mockReturnValue(new Set(['class-1']));

            // Modules and Classes
            const mockModules = [
                { id: 'module-1', title: 'Module 1', orderIndex: 1, courseId }
            ];
            mockModuleRepo.findByCourseId.mockReturnValue(mockModules as any);

            const mockClasses = [
                { id: 'class-1', title: 'Class 1', module_id: 'module-1' },
                { id: 'class-2', title: 'Class 2', module_id: 'module-1' }
            ];
            mockClassRepo.findByModule.mockReturnValue(mockClasses as any);

            // Act
            const result = await studentService.getCourseDetails(userId, courseId);

            // Assert
            expect(result.id).toBe(courseId);
            expect(result.progress).toBe(50);
            expect(result.modules).toHaveLength(1);
            expect(result.modules[0].classes).toHaveLength(2);
            // Class 1 completed (in Set)
            expect(result.modules[0].classes[0].completed).toBe(true);
            // Class 2 not completed
            expect(result.modules[0].classes[1].completed).toBe(false);
        });

        it('should throw ApplicationError if not enrolled', async () => {
            // Arrange
            mockEnrollmentRepo.findEnrollment.mockReturnValue(null);

            // Act & Assert
            await expect(studentService.getCourseDetails(userId, courseId)).rejects.toThrow(
                new ApplicationError('Aluno não matriculado neste curso')
            );
        });

        it('should throw ApplicationError if course not found', async () => {
            // Arrange
            mockEnrollmentRepo.findEnrollment.mockReturnValue(new Enrollment({ userId, courseId }));
            mockCourseRepo.findById.mockReturnValue(null);

            // Act & Assert
            await expect(studentService.getCourseDetails(userId, courseId)).rejects.toThrow(
                new ApplicationError('Curso não encontrado')
            );
        });
    });

    describe('issueCertificate', () => {
        const studentName = 'Student Name';

        it('should issue certificate when progress is 100%', async () => {
            // Arrange
            const enrollment = new Enrollment({ userId, courseId, id: 'enrollment-1' });
            mockEnrollmentRepo.findEnrollment.mockReturnValue(enrollment);
            mockCourseRepo.findById.mockReturnValue(mockCourse);

            mockEnrollmentRepo.countCourseClasses.mockReturnValue(10);
            mockEnrollmentRepo.countCompletedClasses.mockReturnValue(10); // 100%

            // Act
            const result = await studentService.issueCertificate(userId, courseId, studentName);

            // Assert
            expect(result.certificateHash).toBe('mocked-uuid-hash');
            expect(mockEnrollmentRepo.updateCertificateHash).toHaveBeenCalledWith('enrollment-1', 'mocked-uuid-hash');
        });

        it('should throw ApplicationError if not enrolled', async () => {
            mockEnrollmentRepo.findEnrollment.mockReturnValue(null);

            await expect(studentService.issueCertificate(userId, courseId, studentName)).rejects.toThrow(
                new ApplicationError('Matrícula não encontrada')
            );
        });

        it('should throw ApplicationError if already issued', async () => {
            const enrollment = new Enrollment({ userId, courseId, certificateHash: 'existing-hash' });
            mockEnrollmentRepo.findEnrollment.mockReturnValue(enrollment);

            await expect(studentService.issueCertificate(userId, courseId, studentName)).rejects.toThrow(
                new ApplicationError('Certificado já emitido')
            );
        });

        it('should throw ApplicationError if course not completed', async () => {
            // Arrange
            const enrollment = new Enrollment({ userId, courseId });
            mockEnrollmentRepo.findEnrollment.mockReturnValue(enrollment);

            mockEnrollmentRepo.countCourseClasses.mockReturnValue(10);
            mockEnrollmentRepo.countCompletedClasses.mockReturnValue(9); // 90%

            // Act & Assert
            await expect(studentService.issueCertificate(userId, courseId, studentName)).rejects.toThrow(
                new ApplicationError('Curso não concluído (progresso < 100%)')
            );
        });
    });
});

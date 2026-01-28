import { EnrollmentRepository } from '../../src/repositories/enrollmentRepository';

export const createMockEnrollmentRepository = (): jest.Mocked<EnrollmentRepository> => {
    return {
        findEnrollment: jest.fn(),
        save: jest.fn(),
        findStudentEnrollments: jest.fn(),
        countCourseClasses: jest.fn(),
        countCompletedClasses: jest.fn(),
        getCompletedClassIds: jest.fn(),
        updateCertificateHash: jest.fn(),
    } as any;
};

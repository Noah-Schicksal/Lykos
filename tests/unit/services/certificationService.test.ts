import { CertificationService, ApplicationError } from '../../../src/services/certificationService';
import { EnrollmentRepository } from '../../../src/repositories/enrollmentRepository';

describe('CertificationService', () => {
    let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
    let certificationService: CertificationService;

    beforeEach(() => {
        enrollmentRepository = {
            findByCertificateHash: jest.fn(),
            countCourseClasses: jest.fn()
        } as unknown as jest.Mocked<EnrollmentRepository>;

        certificationService = new CertificationService(enrollmentRepository);
    });

    it('should throw ApplicationError if certificate is not found', async () => {
        enrollmentRepository.findByCertificateHash.mockReturnValue(null);

        await expect(
            certificationService.validateCertificate('invalid-hash')
        ).rejects.toThrow(ApplicationError);

        await expect(
            certificationService.validateCertificate('invalid-hash')
        ).rejects.toThrow('Certificado inválido ou não encontrado.');
    });

    it('should validate certificate and return correct data', async () => {
        const fakeEnrollment = {
            certificate_hash: 'valid-hash',
            student_name: 'João Silva',
            course_title: 'Node.js Avançado',
            instructor_name: 'Maria Souza',
            enrolled_at: '2024-01-10T00:00:00.000Z',
            course_id: 'course-123'
        };

        enrollmentRepository.findByCertificateHash.mockReturnValue(fakeEnrollment as any);
        enrollmentRepository.countCourseClasses.mockReturnValue(30);

        const result = await certificationService.validateCertificate('valid-hash');

        expect(result).toEqual({
            certificateHash: 'valid-hash',
            isValid: true,
            studentName: 'João Silva',
            courseTitle: 'Node.js Avançado',
            workloadHours: 30,
            instructorName: 'Maria Souza',
            issuedAt: new Date('2024-01-10T00:00:00.000Z')
        });
    });

    it('should use fallback workload when course has no classes', async () => {
        const fakeEnrollment = {
            certificate_hash: 'valid-hash',
            student_name: 'Ana Costa',
            course_title: 'TypeScript Básico',
            instructor_name: 'Carlos Lima',
            enrolled_at: '2024-02-01T00:00:00.000Z',
            course_id: 'course-456'
        };

        enrollmentRepository.findByCertificateHash.mockReturnValue(fakeEnrollment as any);
        enrollmentRepository.countCourseClasses.mockReturnValue(0);

        const result = await certificationService.validateCertificate('valid-hash');

        expect(result.workloadHours).toBe(20);
    });
});

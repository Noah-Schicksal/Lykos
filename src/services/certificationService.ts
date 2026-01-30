import { EnrollmentRepository } from '../repositories/enrollmentRepository';
import { CertificateValidationDTO } from '../dtos/certificateDTOs';
import crypto from 'crypto';

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class CertificationService {
    private enrollmentRepository: EnrollmentRepository;

    constructor(
        enrollmentRepository: EnrollmentRepository = new EnrollmentRepository()
    ) {
        this.enrollmentRepository = enrollmentRepository;
    }

    async validateCertificate(hash: string): Promise<CertificateValidationDTO> {
        const enrollment = this.enrollmentRepository.findByCertificateHash(hash);

        if (!enrollment) {
            throw new ApplicationError('Certificado inválido ou não encontrado.');
        }

        // Estimando carga horária baseada no número de aulas (1 aula = 1 hora)
        const totalClasses = this.enrollmentRepository.countCourseClasses(enrollment.course_id);
        const estimatedWorkload = totalClasses > 0 ? totalClasses : 20;

        return {
            certificateHash: enrollment.certificate_hash,
            isValid: true,
            studentName: enrollment.student_name,
            courseTitle: enrollment.course_title,
            workloadHours: estimatedWorkload,
            instructorName: enrollment.instructor_name,
            issuedAt: new Date(enrollment.enrolled_at)
        };
    }

    async generateCertificate(userId: string, courseId: string): Promise<string> {
        // 1. Verify Enrollment
        const enrollment = this.enrollmentRepository.findEnrollment(userId, courseId);
        if (!enrollment) {
            throw new ApplicationError('Matrícula não encontrada.');
        }

        // 2. Return existing hash if already issued
        if (enrollment.certificateHash) {
            return enrollment.certificateHash;
        }

        // 3. Verify Completion (100%)
        const totalClasses = this.enrollmentRepository.countCourseClasses(courseId);
        const completedClasses = this.enrollmentRepository.countCompletedClasses(userId, courseId);

        if (totalClasses === 0 || completedClasses < totalClasses) {
            throw new ApplicationError('O curso não foi concluído 100%. Complete todas as aulas antes de gerar o certificado.');
        }

        // 4. Generate Hash (UUID)
        const hash = crypto.randomUUID();

        // 5. Save Hash
        this.enrollmentRepository.updateCertificateHash(enrollment.id!, hash);

        return hash;
    }
}

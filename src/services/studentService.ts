import { EnrollmentRepository } from '../repositories/enrollmentRepository';
import { CourseRepository } from '../repositories/courseRepository';
import { ModuleRepository } from '../repositories/moduleRepository';
import { ClassRepository } from '../repositories/classRepository';
import { MyCourseDTO, CourseDetailsDTO, CertificateDTO, ModuleStatusDTO, ClassStatusDTO } from '../dtos/studentDTOs';
import { randomUUID } from 'crypto';

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class StudentService {
    private enrollmentRepository: EnrollmentRepository;
    private courseRepository: CourseRepository;
    private moduleRepository: ModuleRepository;
    private classRepository: ClassRepository;

    constructor(
        enrollmentRepository: EnrollmentRepository = new EnrollmentRepository(),
        courseRepository: CourseRepository = new CourseRepository(),
        moduleRepository: ModuleRepository = new ModuleRepository(),
        classRepository: ClassRepository = new ClassRepository()
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.moduleRepository = moduleRepository;
        this.classRepository = classRepository;
    }

    // Retorna lista de cursos com progresso
    async listMyCourses(userId: string, page: number = 1, limit: number = 10): Promise<{ data: MyCourseDTO[], meta: any }> {
        const { enrollments, total } = this.enrollmentRepository.findStudentEnrollments(userId, page, limit);

        // Para cada matrícula, buscamos detalhes do curso e calculamos progresso
        const myCourses: MyCourseDTO[] = [];

        for (const enrollment of enrollments) {
            const course = this.courseRepository.findById(enrollment.courseId);
            if (!course) continue;

            const totalClasses = this.enrollmentRepository.countCourseClasses(course.id!);
            const completedClasses = this.enrollmentRepository.countCompletedClasses(userId, course.id!);

            const progress = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

            myCourses.push({
                id: course.id!,
                title: course.title,
                description: course.description,
                coverImageUrl: course.coverImageUrl,
                categoryId: course.category?.id,
                enrolledAt: enrollment.enrolledAt,
                progress,
                totalClasses,
                completedClasses,
                certificateHash: enrollment.certificateHash
            });
        }

        return {
            data: myCourses,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    }

    // Retorna detalhes do curso com status de completude de cada aula
    async getCourseDetails(userId: string, courseId: string): Promise<CourseDetailsDTO> {
        // Verifica matrícula
        const enrollment = this.enrollmentRepository.findEnrollment(userId, courseId);
        if (!enrollment) {
            throw new ApplicationError('Aluno não matriculado neste curso');
        }

        const course = this.courseRepository.findById(courseId);
        if (!course) throw new ApplicationError('Curso não encontrado');

        // Calcula progresso geral
        const totalClasses = this.enrollmentRepository.countCourseClasses(courseId);
        const completedClasses = this.enrollmentRepository.countCompletedClasses(userId, courseId);
        const progress = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

        // Busca IDs de aulas completadas para comparação rápida
        const completedClassIds = this.enrollmentRepository.getCompletedClassIds(userId, courseId);

        // Busca módulos e aulas
        const modules = this.moduleRepository.findByCourseId(courseId);

        const modulesWithClasses: ModuleStatusDTO[] = [];

        for (const module of modules) {
            // Busca as aulas do módulo usando o ClassRepository
            const classes = await this.classRepository.findByModule(module.id!);

            const classesStatus: ClassStatusDTO[] = classes.map(c => ({
                id: c.id!,
                title: c.title,
                videoUrl: c.videoUrl,
                description: c.description,
                materialUrl: c.materialUrl,
                completed: completedClassIds.has(c.id!)
            }));

            // Adiciona módulo apenas se tiver aulas (opcional, mas comum para não mostrar módulos vazios)
            // Ou mostra mesmo vazio. Vamos mostrar mesmo vazio para o aluno saber que existe.
            modulesWithClasses.push({
                id: module.id!,
                title: module.title,
                orderIndex: module.orderIndex,
                classes: classesStatus
            });
        }

        return {
            id: course.id!,
            title: course.title,
            description: course.description,
            progress,
            modules: modulesWithClasses
        };
    }

    // Emite certificado
    async issueCertificate(userId: string, courseId: string, studentName: string): Promise<CertificateDTO> {
        const enrollment = this.enrollmentRepository.findEnrollment(userId, courseId);
        if (!enrollment) throw new ApplicationError('Matrícula não encontrada');

        if (enrollment.certificateHash) {
            // Se já tem certificado, poderíamos retornar o existente ou erro.
            // Vamos retornar erro conforme costume de "issue" action, ou retornar o existente.
            // Prompt pede "Gera o hash... se o progresso for 100%".
            // Se já gerou, throw error "Certificado já emitido" parece seguro.
            throw new ApplicationError('Certificado já emitido');
        }

        const totalClasses = this.enrollmentRepository.countCourseClasses(courseId);
        const completedClasses = this.enrollmentRepository.countCompletedClasses(userId, courseId);

        if (completedClasses < totalClasses || totalClasses === 0) {
            throw new ApplicationError('Curso não concluído (progresso < 100%)');
        }

        const hash = randomUUID();
        this.enrollmentRepository.updateCertificateHash(enrollment.id!, hash);

        const course = this.courseRepository.findById(courseId);

        return {
            certificateHash: hash,
            issuedAt: new Date(),
            courseTitle: course?.title || 'Unknown Course',
            studentName: studentName,
            validationUrl: `seusite.com/validate/${hash}`
        };
    }
}

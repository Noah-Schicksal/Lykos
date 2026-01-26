import { Class } from '../entities/Class';
import { ClassRepository } from '../repositories/classRepository';
import { CreateClassDTO, UpdateClassDTO, ClassProgressDTO } from '../dtos/classDTOs';
import { ModuleRepository } from '../repositories/moduleRepository';
import { CourseRepository } from '../repositories/courseRepository';

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class ClassService {
    private classRepository: ClassRepository;
    private moduleRepository: ModuleRepository;
    private courseRepository: CourseRepository;

    constructor(
        classRepository: ClassRepository = new ClassRepository(),
        moduleRepository: ModuleRepository = new ModuleRepository(),
        courseRepository: CourseRepository = new CourseRepository()
    ) {
        this.classRepository = classRepository;
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
    }

    // cria uma nova aula dentro de um módulo
    async create(moduleId: string, instructorId: string, data: CreateClassDTO): Promise<Class> {
        // verifica se o módulo existe
        const module = this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new ApplicationError('Módulo não encontrado');
        }

        // verifica permissão (se o instrutor é dono do curso do módulo)
        const course = this.courseRepository.findById(module.courseId);
        if (!course || course.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para adicionar aulas neste módulo');
        }

        const classEntity = new Class({
            title: data.title,
            description: data.description,
            videoUrl: data.videoUrl,
            materialUrl: data.materialUrl,
            moduleId: moduleId
        });

        return this.classRepository.save(classEntity);
    }

    // atualiza uma aula existente
    async update(classId: string, instructorId: string, data: UpdateClassDTO): Promise<Class> {
        const classEntity = this.classRepository.findById(classId);
        if (!classEntity) {
            throw new ApplicationError('Aula não encontrada');
        }

        // verifica permissão
        const module = this.moduleRepository.findById(classEntity.moduleId);
        if (!module) {
            throw new ApplicationError('Módulo associado não encontrado');
        }

        const course = this.courseRepository.findById(module.courseId);
        if (!course || course.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para editar esta aula');
        }

        // atualiza os campos
        const updatedClass = new Class({
            id: classEntity.id,
            moduleId: classEntity.moduleId,
            title: data.title ?? classEntity.title,
            description: data.description ?? classEntity.description,
            videoUrl: data.videoUrl ?? classEntity.videoUrl,
            materialUrl: data.materialUrl ?? classEntity.materialUrl,
            createdAt: classEntity.createdAt
        });

        return this.classRepository.update(updatedClass);
    }

    // remove uma aula
    async delete(classId: string, instructorId: string): Promise<void> {
        const classEntity = this.classRepository.findById(classId);
        if (!classEntity) {
            throw new ApplicationError('Aula não encontrada');
        }

        // verifica permissão
        const module = this.moduleRepository.findById(classEntity.moduleId);
        if (!module) {
            throw new ApplicationError('Módulo associado não encontrado');
        }

        const course = this.courseRepository.findById(module.courseId);
        if (!course || course.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para remover esta aula');
        }

        this.classRepository.delete(classId);
    }

    // marca a aula como concluída pelo aluno
    async markProgress(classId: string, userId: string): Promise<ClassProgressDTO> {
        // verifica se a aula existe
        const classEntity = this.classRepository.findById(classId);
        if (!classEntity) {
            throw new ApplicationError('Aula não encontrada');
        }

        // aqui poderíamos verificar se o aluno está matriculado no curso, 
        // mas como não temos o repositório de matrícula injetado ainda, vamos assumir que o middleware de rota já protegeu ou faremos depois.
        // Simplificação: qualquer aluno autenticado pode marcar progresso se a aula existir.

        return this.classRepository.markProgress(classId, userId);
    }

    // desmarca a conclusão
    async unmarkProgress(classId: string, userId: string): Promise<void> {
        const classEntity = this.classRepository.findById(classId);
        if (!classEntity) {
            throw new ApplicationError('Aula não encontrada');
        }

        this.classRepository.unmarkProgress(classId, userId);
    }
}

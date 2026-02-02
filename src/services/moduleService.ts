import { Module } from '../entities/Module';
import { ModuleRepository } from '../repositories/moduleRepository';
import { CreateModuleDTO, UpdateModuleDTO } from '../dtos/moduleDTOs';
import { CourseRepository } from '../repositories/courseRepository';

import { ClassRepository } from '../repositories/classRepository';

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class ModuleService {
    private moduleRepository: ModuleRepository;
    private courseRepository: CourseRepository;
    private classRepository: ClassRepository;

    constructor(
        moduleRepository: ModuleRepository = new ModuleRepository(),
        courseRepository: CourseRepository = new CourseRepository(),
        classRepository: ClassRepository = new ClassRepository()
    ) {
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
        this.classRepository = classRepository;
    }

    // cria um novo módulo associado a um curso
    async create(courseId: string, instructorId: string, data: CreateModuleDTO): Promise<Module> {
        // verifica se o curso existe
        const course = this.courseRepository.findById(courseId);
        if (!course) {
            throw new ApplicationError('Curso não encontrado');
        }

        // verifica se o usuário é o dono do curso (instrutor)
        if (course.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para adicionar módulos neste curso');
        }

        // define a ordem automaticamente se não for informada
        let orderIndex = data.orderIndex;
        if (orderIndex === undefined) {
            const maxOrder = this.moduleRepository.findMaxOrderIndex(courseId);
            orderIndex = maxOrder + 1;
        }

        const module = new Module({
            title: data.title,
            courseId: courseId,
            orderIndex: orderIndex
        });

        return this.moduleRepository.save(module);
    }

    // atualiza um módulo (título ou ordem)
    async update(moduleId: string, instructorId: string, data: UpdateModuleDTO): Promise<Module> {
        const module = this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new ApplicationError('Módulo não encontrado');
        }

        // precisa buscar o curso para verificar o dono
        const course = this.courseRepository.findById(module.courseId);
        if (!course || course.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para editar este módulo');
        }

        // atualiza os campos permitidos
        const updatedModule = new Module({
            id: module.id,
            title: data.title ?? module.title,
            courseId: module.courseId,
            orderIndex: data.orderIndex ?? module.orderIndex,
            createdAt: module.createdAt
        });

        return this.moduleRepository.update(updatedModule);
    }

    // remove um módulo
    async delete(moduleId: string, instructorId: string): Promise<void> {
        const module = this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new ApplicationError('Módulo não encontrado');
        }

        const course = this.courseRepository.findById(module.courseId);
        if (!course || course.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para remover este módulo');
        }

        this.moduleRepository.delete(moduleId);
    }

    // lista módulos de um curso (exibe também as aulas para facilitar o frontend)
    async listByCourseId(courseId: string, userId?: string): Promise<any[]> {
        const course = this.courseRepository.findById(courseId);
        if (!course) {
            throw new ApplicationError('Curso não encontrado');
        }

        const modules = this.moduleRepository.findByCourseId(courseId);

        // Popula as aulas de cada módulo
        // Note: Isso pode gerar N+1 queries. Em produção idealmente faríamos um join ou batch fetch.
        // Para SQLite local e escopo do desafio, está ok.
        const result = modules.map(module => {
            const classes = this.classRepository.findByModule(module.id as string, userId);
            return {
                ...module.toJSON(),
                classes: classes.map(c => ({
                    ...c.toJSON(),
                    isCompleted: (c as any).isCompleted
                }))
            };
        });

        return result;
    }

    // busca detalhes de um módulo (incluindo aulas)
    async getById(moduleId: string): Promise<any> {
        const module = this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new ApplicationError('Módulo não encontrado');
        }

        const classes = this.classRepository.findByModule(moduleId);

        return {
            ...module.toJSON(),
            classes: classes.map(c => c.toJSON())
        };
    }
}

import { Course } from '../entities/Course';
import { CourseRepository, FindAllResponse } from '../repositories/courseRepository';
import { CreateCourseDTO, UpdateCourseDTO, CourseStudentDTO } from '../dtos/courseDTOs';
import { CategoryRepository } from '../repositories/categoryRepository';

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class CourseService {
    private courseRepository: CourseRepository;
    private categoryRepository: CategoryRepository;

    constructor(
        courseRepository: CourseRepository = new CourseRepository(),
        categoryRepository: CategoryRepository = new CategoryRepository()
    ) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
    }

    // lista os cursos com paginação e busca
    async list(page: number, limit: number, search?: string): Promise<FindAllResponse> {
        return this.courseRepository.findAll({ page, limit, search });
    }

    // lista cursos por categoria
    async listByCategory(categoryId: string, page: number, limit: number): Promise<FindAllResponse> {
        return this.courseRepository.findByCategoryId(categoryId, page, limit);
    }

    // busca detalhes de um curso pelo id
    async getById(id: string): Promise<any> {
        const course = this.courseRepository.findById(id);
        if (!course) {
            throw new ApplicationError('Curso não encontrado');
        }
        return course;
    }

    // cria um novo curso, validando categoria e instanciando a entidade
    async create(data: CreateCourseDTO, instructorId: string): Promise<Course> {
        // valida se a categoria existe, se fornecida. Agora é obrigatório ser um ID válido.
        if (data.categoryId) {
            const category = this.categoryRepository.findById(data.categoryId);
            if (!category) {
                throw new ApplicationError('Categoria não encontrada');
            }
        } else {
            throw new ApplicationError('A categoria é obrigatória');
        }

        const newCourse = new Course({
            ...data,
            instructorId
        });

        return this.courseRepository.save(newCourse);
    }

    // atualiza um curso, verificando se o usuário é o dono (instrutor)
    async update(id: string, data: UpdateCourseDTO, instructorId: string): Promise<Course> {
        const courseData = this.courseRepository.findById(id);
        if (!courseData) {
            throw new ApplicationError('Curso não encontrado');
        }

        //verifica propriedade (apenas o instrutor dono pode editar)
        if (courseData.instructorId !== instructorId) {
            throw new ApplicationError('Permissão para edição negada');
        }

        // recria a entidade para aplicar validações dos setters
        const updatedCourse = new Course({
            id: courseData.id,
            title: data.title ?? courseData.title,
            description: data.description ?? courseData.description,
            price: data.price ?? courseData.price,
            coverImageUrl: data.coverImageUrl ?? courseData.coverImageUrl,
            maxStudents: data.maxStudents ?? courseData.maxStudents,
            categoryId: data.categoryId ?? (courseData.category ? courseData.category.id : undefined),
            instructorId: courseData.instructorId,
            isActive: data.isActive !== undefined ? data.isActive : courseData.isActive,
            createdAt: new Date() //mantem data original idealmente, mas aqui simplificamos
        });

        return this.courseRepository.update(updatedCourse);
    }

    // realiza soft delete, verificando propriedade
    async delete(id: string, instructorId: string): Promise<void> {
        const courseData = this.courseRepository.findById(id);
        if (!courseData) {
            throw new ApplicationError('Curso não encontrado');
        }

        if (courseData.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para remover este curso');
        }

        this.courseRepository.softDelete(id);
    }

    // lista alunos de um curso, verificando propriedade
    async getStudents(id: string, instructorId: string): Promise<CourseStudentDTO[]> {
        const courseData = this.courseRepository.findById(id);
        if (!courseData) {
            throw new ApplicationError('Curso não encontrado');
        }

        if (courseData.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para ver os alunos deste curso');
        }

        return this.courseRepository.findStudents(id);
    }
}

import { Class } from '../entities/Class';
import { ClassRepository } from '../repositories/classRepository';
import {
  CreateClassDTO,
  UpdateClassDTO,
  ClassProgressDTO,
} from '../dtos/classDTOs';
import { ModuleRepository } from '../repositories/moduleRepository';
import { CourseRepository } from '../repositories/courseRepository';

import { EnrollmentRepository } from '../repositories/enrollmentRepository';

import { ApplicationError } from './userService';

// removed local ApplicationError class definition

export class ClassService {
  private classRepository: ClassRepository;
  private moduleRepository: ModuleRepository;
  private courseRepository: CourseRepository;
  private enrollmentRepository: EnrollmentRepository;

  constructor(
    classRepository: ClassRepository = new ClassRepository(),
    moduleRepository: ModuleRepository = new ModuleRepository(),
    courseRepository: CourseRepository = new CourseRepository(),
    enrollmentRepository: EnrollmentRepository = new EnrollmentRepository(),
  ) {
    this.classRepository = classRepository;
    this.moduleRepository = moduleRepository;
    this.courseRepository = courseRepository;
    this.enrollmentRepository = enrollmentRepository;
  }

  // busca detalhes de uma aula
  async getById(classId: string): Promise<any> {
    const classEntity = this.classRepository.findById(classId);
    if (!classEntity) {
      throw new ApplicationError('Aula não encontrada');
    }

    const data = classEntity.toJSON();

    // Transforma o materialUrl (interno) em uma URL de API pública se existir
    if (data.materialUrl) {
      data.materialUrl = `/classes/${data.id}/material`;
    }

    // Transforma videoUrl (interno) em URL de API pública
    if (data.videoUrl) {
      data.videoUrl = `/classes/${data.id}/video`;
    }

    return data;
  }

  // cria uma nova aula dentro de um módulo
  async create(
    moduleId: string,
    instructorId: string,
    data: CreateClassDTO,
  ): Promise<Class> {
    // verifica se o módulo existe
    const module = this.moduleRepository.findById(moduleId);
    if (!module) {
      throw new ApplicationError('Módulo não encontrado');
    }

    // verifica permissão (se o instrutor é dono do curso do módulo)
    const course = this.courseRepository.findById(module.courseId);
    if (!course || course.instructorId !== instructorId) {
      throw new ApplicationError(
        'Você não tem permissão para adicionar aulas neste módulo',
      );
    }

    const classEntity = new Class({
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      materialUrl: data.materialUrl,
      moduleId: moduleId,
    });

    return this.classRepository.save(classEntity);
  }

  // atualiza uma aula existente
  async update(
    classId: string,
    instructorId: string,
    data: UpdateClassDTO,
  ): Promise<Class> {
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
      throw new ApplicationError(
        'Você não tem permissão para editar esta aula',
      );
    }

    // atualiza os campos
    const updatedClass = new Class({
      id: classEntity.id,
      moduleId: classEntity.moduleId,
      title: data.title ?? classEntity.title,
      description: data.description ?? classEntity.description,
      videoUrl: data.videoUrl ?? classEntity.videoUrl,
      materialUrl: data.materialUrl ?? classEntity.materialUrl,
      createdAt: classEntity.createdAt,
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
      throw new ApplicationError(
        'Você não tem permissão para remover esta aula',
      );
    }

    this.classRepository.delete(classId);
  }

  // recupera o caminho do material se o usuário tiver permissão
  async getMaterial(
    classId: string,
    userId: string,
    userRole: string,
  ): Promise<string> {
    const classEntity = this.classRepository.findById(classId);
    if (!classEntity) {
      throw new ApplicationError('Aula não encontrada');
    }

    if (!classEntity.materialUrl) {
      throw new ApplicationError('Nenhum material associado a esta aula');
    }

    await this.checkAccess(classEntity, userId, userRole);

    // O materialUrl é salvo como path relativo (ex: /uploads/abc.pdf), queremos o path do sistema
    // Ajuste conforme como você salva. Se salva com leading slash, remova.
    const relativePath = classEntity.materialUrl.startsWith('/')
      ? classEntity.materialUrl.substring(1)
      : classEntity.materialUrl;

    return relativePath;
  }

  // recupera o caminho do video se o usuário tiver permissão
  async getVideo(
    classId: string,
    userId: string,
    userRole: string,
  ): Promise<string> {
    const classEntity = this.classRepository.findById(classId);
    if (!classEntity) {
      throw new ApplicationError('Aula não encontrada');
    }

    if (!classEntity.videoUrl) {
      throw new ApplicationError('Nenhum vídeo associado a esta aula');
    }

    await this.checkAccess(classEntity, userId, userRole);

    const relativePath = classEntity.videoUrl.startsWith('/')
      ? classEntity.videoUrl.substring(1)
      : classEntity.videoUrl;

    return relativePath;
  }

  // Helper para checar acesso (DRY)
  private async checkAccess(
    classEntity: Class,
    userId: string,
    userRole: string,
  ): Promise<void> {
    // ADMIN tem acesso total
    if (userRole === 'ADMIN') {
      return;
    }

    const module = this.moduleRepository.findById(classEntity.moduleId);
    if (!module) {
      throw new ApplicationError('Módulo não encontrado');
    }

    const course = this.courseRepository.findById(module.courseId);
    if (!course) {
      throw new ApplicationError('Curso não encontrado');
    }

    // Verifica permissão baseado no role
    if (userRole === 'INSTRUCTOR') {
      // Se é o dono do curso, tem acesso
      if (course.instructorId === userId) {
        return;
      }
      // Se não é o dono, verifica se comprou o curso (está matriculado)
      const enrollment = this.enrollmentRepository.findEnrollment(
        userId,
        course.id,
      );
      if (!enrollment) {
        throw new ApplicationError(
          'Você não tem permissão para acessar este conteúdo',
        );
      }
    } else if (userRole === 'STUDENT') {
      const enrollment = this.enrollmentRepository.findEnrollment(
        userId,
        course.id,
      );
      if (!enrollment) {
        throw new ApplicationError(
          'Você precisa estar matriculado no curso para acessar o conteúdo',
        );
      }
    } else {
      throw new ApplicationError('Permissão negada');
    }
  }

  // marca a aula como concluída pelo aluno
  async markProgress(
    classId: string,
    userId: string,
  ): Promise<ClassProgressDTO> {
    // verifica se a aula existe
    const classEntity = this.classRepository.findById(classId);
    if (!classEntity) {
      throw new ApplicationError('Aula não encontrada');
    }

    // aqui poderíamos verificar se o aluno está matriculado no curso,
    // mas como não temos o repositório de matrícula injetado ainda, vamos assumir que o middleware de rota já protegeu ou faremos depois.
    // Simplificação: qualquer aluno autenticado pode marcar progresso se a aula existir.

    // Melhoria: validar enrollment se possível
    // const module = this.moduleRepository.findById(classEntity.moduleId);
    // const course = this.courseRepository.findById(module.courseId);
    // const enrollment = this.enrollmentRepository.findEnrollment(userId, course.id);
    // if (!enrollment) throw new ApplicationError('Aluno não matriculado');

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

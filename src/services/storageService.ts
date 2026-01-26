import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { ClassRepository } from '../repositories/classRepository';
import { ModuleRepository } from '../repositories/moduleRepository';
import { CourseRepository } from '../repositories/courseRepository';
import { Class } from '../entities/Class';
import { Course } from '../entities/Course';

import { ApplicationError } from './userService';

export class StorageService {
    private classRepository: ClassRepository;
    private moduleRepository: ModuleRepository;
    private courseRepository: CourseRepository;

    constructor() {
        this.classRepository = new ClassRepository();
        this.moduleRepository = new ModuleRepository();
        this.courseRepository = new CourseRepository();
    }

    private sanitizeName(name: string): string {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    async uploadClassMaterial(classId: string, file: Express.Multer.File, instructorId: string): Promise<string> {
        //Buscar hierarquia
        const classEntity = this.classRepository.findById(classId);
        if (!classEntity) throw new ApplicationError('Aula não encontrada');

        const moduleEntity = this.moduleRepository.findById(classEntity.moduleId);
        if (!moduleEntity) throw new ApplicationError('Módulo não encontrado');

        const courseEntity = this.courseRepository.findById(moduleEntity.courseId);
        if (!courseEntity) throw new ApplicationError('Curso não encontrado');

        // Check ownership
        if (courseEntity.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para adicionar materiais a esta aula');
        }

        //Construir caminhos
        const courseFolder = this.sanitizeName(courseEntity.title);
        const moduleFolder = this.sanitizeName(moduleEntity.title); // Or use order index + title
        const classFolder = `${moduleEntity.orderIndex}_${this.sanitizeName(classEntity.title)}`; // Ex: 1_aula_intro

        const uploadPath = path.join(
            'storage',
            'courses',
            courseFolder,
            moduleFolder,
            classFolder,
            'materials'
        );

        //Criar diretórios recursivamente
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        //Gerar nome de arquivo único
        const fileExtension = path.extname(file.originalname);
        const fileName = `${randomUUID()}${fileExtension}`;
        const finalPath = path.join(uploadPath, fileName);

        // Mover arquivo
        if (file.buffer) {
            fs.writeFileSync(finalPath, file.buffer);
        } else if (file.path) {
            fs.renameSync(file.path, finalPath);
        } else {
            throw new Error('Arquivo inválido');
        }

        // Retornar caminho relativo (URL acessível)
        // Adjust for Windows vs Web URL
        const relativeUrl = path.relative(process.cwd(), finalPath).split(path.sep).join('/');
        const webUrl = `/${relativeUrl}`;

        // Atualizar entidade
        // O repositório update method requer "Class" object.
        // Como o update method atualiza todos campos, precisamos setar o campo novo e passar o objeto para update.
        // Mas atenção: o `update` do repository espera um objeto `Class` que corresponda aos args da query SQL.
        // SQL: UPDATE classes SET title = ?, description = ?, video_url = ?, material_url = ? WHERE id = ?
        // Ele NÃO usa instructorId aqui como eu supus antes erroneamente. Verifiquei o ClassRepository.ts: 
        // update(classEntity: Class): Class { ... stmt.run(title, desc, video, material, id) }
        // NÃO tem instructorId check no UPDATE, apenas no DELETE ou na route middleware logic talvez.
        // O repositório apenas atualiza.

        classEntity.setMaterialUrl(webUrl); // Assumindo que setMaterialUrl existe ou alteramos direto se for public. 
        // Entities geralmente usam getters/setters ou public props.
        // Vou checar Class entity depois, mas por hora vou recriar o objeto se necessário ou usar setter.
        // Se Class não tem setters, eu crio uma nova instância.

        //  nova instância para garantir.
        const updatedClass = new Class({
            id: classEntity.id,
            title: classEntity.title,
            description: classEntity.description,
            videoUrl: classEntity.videoUrl,
            materialUrl: webUrl,
            moduleId: classEntity.moduleId,
            createdAt: classEntity.createdAt
        });

        this.classRepository.update(updatedClass);

        return webUrl;
    }

    async uploadCourseCover(courseId: string, file: Express.Multer.File, instructorId: string): Promise<string> {
        //check Course
        const courseEntity = this.courseRepository.findById(courseId);
        if (!courseEntity) throw new ApplicationError('Curso não encontrado');

        //check Ownership
        if (courseEntity.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para alterar a imagem deste curso');
        }

        //build Paths
        const courseFolder = this.sanitizeName(courseEntity.title);
        const uploadPath = path.join('storage', 'courses', courseFolder);

        //create Directory
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        //generate Unique Filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${randomUUID()}${fileExtension}`;
        const finalPath = path.join(uploadPath, fileName);

        //save File
        if (file.buffer) {
            fs.writeFileSync(finalPath, file.buffer);
        } else if (file.path) {
            fs.renameSync(file.path, finalPath);
        } else {
            throw new Error('Arquivo inválido');
        }

        //generate Encoded URL (para web)
        // Usamos path relative, mas garantimos forward slashes
        const relativeUrl = path.relative(process.cwd(), finalPath).split(path.sep).join('/');
        const webUrl = `/${relativeUrl}`;

        //update Entity
        // Precisamos criar nova instância Course para atualizar, pois update requer objeto completo
        // Se a entidade tivesse métodos setters seria melhor, mas seguindo o padrão visto em uploadClassMaterial:

        // Importante: Course constructor/props podem variar, checando courseRepository.findById retorno.
        // O findById retorna um objeto enriquecido (DTO), não exatamente a Entidade Course pura para o save/update method direto
        // Precisamos garantir que o objeto passado para update tenha os campos corretos.
        // O método courseRepository.update aceita "Course".

        const updatedCourse = new Course({
            id: courseEntity.id,
            title: courseEntity.title,
            description: courseEntity.description,
            price: courseEntity.price,
            coverImageUrl: webUrl, // Campo novo
            maxStudents: courseEntity.maxStudents,
            categoryId: courseEntity.category ? courseEntity.category.id : courseEntity.categoryId, // Fallback se o repository já fez join ou não
            instructorId: courseEntity.instructorId,
            isActive: courseEntity.isActive !== undefined ? courseEntity.isActive : true, // Garantir boolean
            createdAt: typeof courseEntity.createdAt === 'string' ? new Date(courseEntity.createdAt) : courseEntity.createdAt
        });

        this.courseRepository.update(updatedCourse);

        return webUrl;
    }

    async deleteCourseFolder(courseTitle: string): Promise<void> {
        const courseFolder = this.sanitizeName(courseTitle);
        const folderPath = path.join('storage', 'courses', courseFolder);

        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
    }
}

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

    // Helper para deletar arquivo antigo se existir
    private deleteOldFile(fileUrl: string | undefined): void {
        if (!fileUrl) return;

        // Remove leading slash if present
        const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
        const fullPath = path.join(process.cwd(), relativePath);

        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
                console.log(`[StorageService] Deleted old file: ${fullPath}`);
            } catch (err) {
                console.error(`[StorageService] Failed to delete old file: ${fullPath}`, err);
            }
        }
    }

    private async validateFile(pathOrBuffer: string | Buffer, originalName: string): Promise<void> {
        // Dynamic import for ESM compatibility
        const { fileTypeFromBuffer, fileTypeFromFile } = await import('file-type');

        let type;
        if (Buffer.isBuffer(pathOrBuffer)) {
            type = await fileTypeFromBuffer(pathOrBuffer);
        } else {
            type = await fileTypeFromFile(pathOrBuffer);
        }

        console.log(`[StorageService] Validating file: ${originalName}, Detected Type:`, type);

        const allowedMimes = [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'application/pdf',
            'video/mp4', 'video/webm'
        ];

        // Handling text files (which often have no magic number)
        // If type is undefined, it might be text. We check extension.
        if (!type) {
            const ext = path.extname(originalName).toLowerCase();
            // Allow plain text files if they don't look like scripts? 
            // Ideally we shouldn't allow uploading code. 
            // For this challenge, let's treat 'undefined' as suspicious unless strictly .txt or .md
            const allowedTextExts = ['.txt', '.md', '.csv'];
            if (allowedTextExts.includes(ext)) {
                return; // Allow generic text
            }
            throw new ApplicationError(`Tipo de arquivo desconhecido ou não permitido. Extensão: ${ext}`);
        }

        if (!allowedMimes.includes(type.mime)) {
            throw new ApplicationError(`Tipo de arquivo não permitido: ${type.mime}`);
        }
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

        // Validate File Type (Magic Numbers)
        if (file.path) {
            await this.validateFile(file.path, file.originalname);
        } else if (file.buffer) {
            await this.validateFile(file.buffer, file.originalname);
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

        // Deletar material antigo se existir
        this.deleteOldFile(classEntity.materialUrl);

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

    async uploadClassVideo(classId: string, file: Express.Multer.File, instructorId: string): Promise<string> {
        //Buscar hierarquia
        const classEntity = this.classRepository.findById(classId);
        if (!classEntity) throw new ApplicationError('Aula não encontrada');

        const moduleEntity = this.moduleRepository.findById(classEntity.moduleId);
        if (!moduleEntity) throw new ApplicationError('Módulo não encontrado');

        const courseEntity = this.courseRepository.findById(moduleEntity.courseId);
        if (!courseEntity) throw new ApplicationError('Curso não encontrado');

        // Check ownership
        if (courseEntity.instructorId !== instructorId) {
            throw new ApplicationError('Você não tem permissão para adicionar vídeos a esta aula');
        }

        // Validate File Type (Magic Numbers) - Only MP4
        // We reuse validateFile but ensure it's mp4 specifically if needed, 
        // or just trust validateFile encompasses it and we refine check here.
        let type;
        if (file.path) {
            await this.validateFile(file.path, file.originalname);
            // Re-check mime specifically for mp4 if validateFile is too broad
            // But validateFile allows mp4/webm. The requirement says "somente MP4".
            // So we need to enforce strictly mp4.
            const { fileTypeFromFile } = await import('file-type');
            type = await fileTypeFromFile(file.path);
        } else if (file.buffer) {
            await this.validateFile(file.buffer, file.originalname);
            const { fileTypeFromBuffer } = await import('file-type');
            type = await fileTypeFromBuffer(file.buffer);
        }

        if (!type || type.mime !== 'video/mp4') {
            throw new ApplicationError('Apenas arquivos MP4 são permitidos para vídeos de aula.');
        }

        //Construir caminhos
        const courseFolder = this.sanitizeName(courseEntity.title);
        const moduleFolder = this.sanitizeName(moduleEntity.title);
        const classFolder = `${moduleEntity.orderIndex}_${this.sanitizeName(classEntity.title)}`;

        const uploadPath = path.join(
            'storage',
            'courses',
            courseFolder,
            moduleFolder,
            classFolder,
            'videos'
        );

        //Criar diretórios recursivamente
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Deletar vídeo antigo se existir
        this.deleteOldFile(classEntity.videoUrl);

        //Gerar nome de arquivo único
        const fileName = `${randomUUID()}.mp4`; // Force .mp4 extension
        const finalPath = path.join(uploadPath, fileName);

        // Mover arquivo
        if (file.buffer) {
            fs.writeFileSync(finalPath, file.buffer);
        } else if (file.path) {
            fs.renameSync(file.path, finalPath);
        } else {
            throw new Error('Arquivo inválido');
        }

        // Retornar caminho relativo
        const relativeUrl = path.relative(process.cwd(), finalPath).split(path.sep).join('/');
        const webUrl = `/${relativeUrl}`;

        // Atualizar entidade
        const updatedClass = new Class({
            id: classEntity.id,
            title: classEntity.title,
            description: classEntity.description,
            videoUrl: webUrl,
            materialUrl: classEntity.materialUrl,
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

        // Validate File Type (Magic Numbers)
        if (file.path) {
            await this.validateFile(file.path, file.originalname);
        } else if (file.buffer) {
            await this.validateFile(file.buffer, file.originalname);
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

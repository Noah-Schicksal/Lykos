import { ClassService } from '../../../src/services/classService';

describe('ClassService (skeleton)', () => {
  let classRepository: any;
  let moduleRepository: any;
  let courseRepository: any;
  let enrollmentRepository: any;
  let service: ClassService;

  beforeEach(() => {
    classRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByModule: jest.fn().mockReturnValue([]),
      markProgress: jest.fn(),
      unmarkProgress: jest.fn(),
    };

    moduleRepository = {
      findById: jest.fn(),
    };

    courseRepository = {
      findById: jest.fn(),
    };

    enrollmentRepository = {
      findEnrollment: jest.fn(),
    };

    service = new ClassService(classRepository, moduleRepository, courseRepository, enrollmentRepository);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('create - success when module exists and instructor matches', async () => {
    moduleRepository.findById.mockReturnValue({ id: 'mod1', courseId: 'course1' });
    courseRepository.findById.mockReturnValue({ id: 'course1', instructorId: 'instr1' });
    const savedClass = { id: 'c1', title: 'Aula 1' };
    classRepository.save.mockResolvedValue(savedClass);

    const result = await service.create('mod1', 'instr1', { title: 'Aula 1', description: '', videoUrl: '', materialUrl: '' });

    expect(classRepository.save).toHaveBeenCalled();
    expect(result).toEqual(savedClass);
  });

  test('getMaterial - student with enrollment gets relative path', async () => {
    const classEntity = { id: 'c2', materialUrl: '/uploads/file.pdf', moduleId: 'm2' };
    classRepository.findById.mockReturnValue(classEntity);
    moduleRepository.findById.mockReturnValue({ id: 'm2', courseId: 'course2' });
    courseRepository.findById.mockReturnValue({ id: 'course2', instructorId: 'instr2' });
    enrollmentRepository.findEnrollment.mockReturnValue({ id: 'en1' });

    const result = await service.getMaterial('c2', 'student1', 'STUDENT');

    expect(result).toEqual('uploads/file.pdf');
  });

  test('getMaterial - student without enrollment throws', async () => {
    const classEntity = { id: 'c3', materialUrl: '/uploads/other.pdf', moduleId: 'm3' };
    classRepository.findById.mockReturnValue(classEntity);
    moduleRepository.findById.mockReturnValue({ id: 'm3', courseId: 'course3' });
    courseRepository.findById.mockReturnValue({ id: 'course3', instructorId: 'instr3' });
    enrollmentRepository.findEnrollment.mockReturnValue(null);

    await expect(service.getMaterial('c3', 'student2', 'STUDENT')).rejects.toThrow();
  });
});

import { ModuleService } from '../../../src/services/moduleService';

describe('ModuleService (skeleton)', () => {
  let moduleRepository: any;
  let courseRepository: any;
  let classRepository: any;
  let service: ModuleService;

  beforeEach(() => {
    moduleRepository = {
      findById: jest.fn(),
      findMaxOrderIndex: jest.fn().mockReturnValue(0),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByCourseId: jest.fn().mockReturnValue([]),
    };

    courseRepository = {
      findById: jest.fn(),
    };

    classRepository = {
      findByModule: jest.fn().mockReturnValue([]),
    };

    service = new ModuleService(moduleRepository, courseRepository, classRepository);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('create - success when course exists and instructor matches', async () => {
    courseRepository.findById.mockReturnValue({ id: 'course1', instructorId: 'instr1' });
    moduleRepository.findMaxOrderIndex.mockReturnValue(2);
    const savedModule = { id: 'm1', title: 'Módulo 1', courseId: 'course1', orderIndex: 3 };
    moduleRepository.save.mockResolvedValue(savedModule);

    const result = await service.create('course1', 'instr1', { title: 'Módulo 1' });

    expect(moduleRepository.save).toHaveBeenCalled();
    expect(result).toEqual(savedModule);
  });

  test('create - throws when course not found', async () => {
    courseRepository.findById.mockReturnValue(null);

    await expect(service.create('courseX', 'instrX', { title: 'X' })).rejects.toThrow();
    expect(moduleRepository.save).not.toHaveBeenCalled();
  });
});

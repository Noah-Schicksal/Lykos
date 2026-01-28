import { ModuleRepository } from '../../src/repositories/moduleRepository';

export const createMockModuleRepository = (): jest.Mocked<ModuleRepository> => {
    return {
        findByCourseId: jest.fn(),
        findById: jest.fn(),
    } as any;
};

import { ClassRepository } from '../../src/repositories/classRepository';

export const createMockClassRepository = (): jest.Mocked<ClassRepository> => {
    return {
        findByModule: jest.fn(),
    } as any;
};

import { CategoryRepository } from '../../src/repositories/categoryRepository';
import { Category } from '../../src/entities/Category';

export const createMockCategoryRepository = (): jest.Mocked<CategoryRepository> => {
    return {
        save: jest.fn(),
        findByName: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    } as any;
};

export const mockCategory = new Category({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Tecnologia',
});
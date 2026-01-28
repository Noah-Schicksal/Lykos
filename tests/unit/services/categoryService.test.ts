import { CategoryService, ApplicationError } from '../../../src/services/categoryService';
import { CategoryRepository } from '../../../src/repositories/categoryRepository';
import { Category } from '../../../src/entities/Category';
import {
    createMockCategoryRepository,
    mockCategory,
} from '../../mocks/mockCategoryRepository';

describe('CategoryService', () => {
    let categoryService: CategoryService;
    let mockCategoryRepo: jest.Mocked<CategoryRepository>;

    beforeEach(() => {
        mockCategoryRepo = createMockCategoryRepository();
        categoryService = new CategoryService(mockCategoryRepo);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new category when name is unique', async () => {
            // Arrange
            mockCategoryRepo.findByName.mockReturnValue(null);
            mockCategoryRepo.save.mockReturnValue(mockCategory);

            // Act
            const result = await categoryService.create('Tecnologia');

            // Assert
            expect(result).toEqual(mockCategory);
            expect(mockCategoryRepo.findByName).toHaveBeenCalledWith('Tecnologia');
            expect(mockCategoryRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Tecnologia' })
            );
        });

        it('should throw ApplicationError when category name already exists', async () => {
            // Arrange
            mockCategoryRepo.findByName.mockReturnValue(mockCategory);

            // Act & Assert
            await expect(categoryService.create('Tecnologia')).rejects.toThrow(
                new ApplicationError('Já existe uma categoria com este nome')
            );
            expect(mockCategoryRepo.save).not.toHaveBeenCalled();
        });
    });

    describe('list', () => {
        it('should return a list of categories', async () => {
            // Arrange
            const categoriesList = [mockCategory];
            mockCategoryRepo.findAll.mockReturnValue(categoriesList);

            // Act
            const result = await categoryService.list();

            // Assert
            expect(result).toEqual(categoriesList);
            expect(mockCategoryRepo.findAll).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update category when id exists and name is unique', async () => {
            // Arrange
            const updatedCategory = new Category({ ...mockCategory.toJSON(), name: 'Nova Tech' });
            mockCategoryRepo.findById.mockReturnValue(mockCategory);
            mockCategoryRepo.findByName.mockReturnValue(null);
            mockCategoryRepo.update.mockReturnValue(updatedCategory);

            // Act
            const result = await categoryService.update(mockCategory.id!, 'Nova Tech');

            // Assert
            expect(result).toEqual(updatedCategory);
            expect(mockCategoryRepo.update).toHaveBeenCalledWith(mockCategory.id, 'Nova Tech');
        });

        it('should throw ApplicationError when category id not found', async () => {
            // Arrange
            mockCategoryRepo.findById.mockReturnValue(null);

            // Act & Assert
            await expect(categoryService.update('invalid-id', 'New Name')).rejects.toThrow(
                new ApplicationError('Categoria não encontrada')
            );
            expect(mockCategoryRepo.update).not.toHaveBeenCalled();
        });

        it('should throw ApplicationError when new name conflicts with another category', async () => {
            // Arrange
            const existingCategory = new Category({ id: 'other-id', name: 'Conflict Name' });

            mockCategoryRepo.findById.mockReturnValue(mockCategory);
            // Simula que achou outra categoria com o mesmo nome (ID diferente)
            mockCategoryRepo.findByName.mockReturnValue(existingCategory);

            // Act & Assert
            await expect(categoryService.update(mockCategory.id!, 'Conflict Name')).rejects.toThrow(
                new ApplicationError('Já existe uma categoria com este nome')
            );
            expect(mockCategoryRepo.update).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete category when it exists', async () => {
            // Arrange
            mockCategoryRepo.findById.mockReturnValue(mockCategory);

            // Act
            await categoryService.delete(mockCategory.id!);

            // Assert
            expect(mockCategoryRepo.delete).toHaveBeenCalledWith(mockCategory.id);
        });

        it('should throw ApplicationError when category to delete is not found', async () => {
            // Arrange
            mockCategoryRepo.findById.mockReturnValue(null);

            // Act & Assert
            await expect(categoryService.delete('invalid-id')).rejects.toThrow(
                new ApplicationError('Categoria não encontrada')
            );
            expect(mockCategoryRepo.delete).not.toHaveBeenCalled();
        });
    });
});
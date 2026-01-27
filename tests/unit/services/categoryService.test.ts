import { CategoryService, ApplicationError } from '../../../src/services/categoryService';
import { CategoryRepository } from '../../../src/repositories/categoryRepository';
import { Category } from '../../../src/entities/Category';

/**
 * Testes Unitários - CategoryService
 * 
 * Responsável por testar a lógica de negócio do serviço de categorias.
 * Cada teste segue o padrão AAA (Arrange-Act-Assert).
 * 
 * Cenários cobertos:
 * - Criar categoria (sucesso, duplicata)
 * - Listar categorias (com items, vazio)
 * - Atualizar categoria (sucesso, não encontrada, duplicata, mesmo nome)
 * - Deletar categoria (sucesso, não encontrada)
 * - Erro customizado ApplicationError
 * 
 * @see TESTES_UNITARIOS.md para documentação completa
 */
describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockCategoryRepository: any;

  const mockCategory = new Category({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Category',
  });

  const mockCategoryTwo = new Category({
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Another Category',
  });

  beforeEach(() => {
    // Create mock repository
    mockCategoryRepository = {
      save: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    categoryService = new CategoryService(mockCategoryRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category when name does not exist', async () => {
      // Arrange
      const categoryName = 'New Category';
      mockCategoryRepository.findByName.mockReturnValue(null);
      mockCategoryRepository.save.mockReturnValue(
        new Category({ id: '123', name: categoryName }),
      );

      // Act
      const result = await categoryService.create(categoryName);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: '123',
          name: categoryName,
        }),
      );
      expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(categoryName);
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it('should throw ApplicationError when category name already exists', async () => {
      // Arrange
      const categoryName = 'Test Category';
      mockCategoryRepository.findByName.mockReturnValue(mockCategory);

      // Act & Assert
      await expect(categoryService.create(categoryName)).rejects.toThrow(
        new ApplicationError('Já existe uma categoria com este nome'),
      );

      expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(categoryName);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return all categories', async () => {
      // Arrange
      const categories = [mockCategory, mockCategoryTwo];
      mockCategoryRepository.findAll.mockReturnValue(categories);

      // Act
      const result = await categoryService.list();

      // Assert
      expect(result).toEqual(categories);
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no categories exist', async () => {
      // Arrange
      mockCategoryRepository.findAll.mockReturnValue([]);

      // Act
      const result = await categoryService.list();

      // Assert
      expect(result).toEqual([]);
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update category when it exists and new name is unique', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      const newName = 'Updated Category';
      const updatedCategory = new Category({ id: categoryId, name: newName });

      mockCategoryRepository.findById.mockReturnValue(mockCategory);
      mockCategoryRepository.findByName.mockReturnValue(null);
      mockCategoryRepository.update.mockReturnValue(updatedCategory);

      // Act
      const result = await categoryService.update(categoryId, newName);

      // Assert
      expect(result).toEqual(updatedCategory);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(newName);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, newName);
    });

    it('should throw ApplicationError when category does not exist', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      const newName = 'Updated Category';
      mockCategoryRepository.findById.mockReturnValue(null);

      // Act & Assert
      await expect(categoryService.update(categoryId, newName)).rejects.toThrow(
        new ApplicationError('Categoria não encontrada'),
      );

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.findByName).not.toHaveBeenCalled();
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ApplicationError when new name already exists for another category', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      const newName = 'Another Category';
      const existingCategory = new Category({
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: newName,
      });

      mockCategoryRepository.findById.mockReturnValue(mockCategory);
      mockCategoryRepository.findByName.mockReturnValue(existingCategory);

      // Act & Assert
      await expect(categoryService.update(categoryId, newName)).rejects.toThrow(
        new ApplicationError('Já existe uma categoria com este nome'),
      );

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(newName);
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating with same name (same ID)', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      const sameName = 'Test Category';
      const sameCategory = new Category({ id: categoryId, name: sameName });

      mockCategoryRepository.findById.mockReturnValue(mockCategory);
      mockCategoryRepository.findByName.mockReturnValue(sameCategory);
      mockCategoryRepository.update.mockReturnValue(sameCategory);

      // Act
      const result = await categoryService.update(categoryId, sameName);

      // Assert
      expect(result).toEqual(sameCategory);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, sameName);
    });
  });

  describe('delete', () => {
    it('should delete category when it exists', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      mockCategoryRepository.findById.mockReturnValue(mockCategory);

      // Act
      await categoryService.delete(categoryId);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should throw ApplicationError when category does not exist', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      mockCategoryRepository.findById.mockReturnValue(null);

      // Act & Assert
      await expect(categoryService.delete(categoryId)).rejects.toThrow(
        new ApplicationError('Categoria não encontrada'),
      );

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('ApplicationError', () => {
    it('should be an instance of Error', () => {
      // Arrange
      const error = new ApplicationError('Test error message');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApplicationError');
      expect(error.message).toBe('Test error message');
    });
  });
});

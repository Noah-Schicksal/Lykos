import { Category } from '../entities/Category';
import { CategoryRepository } from '../repositories/categoryRepository';

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class CategoryService {
    private categoryRepository: CategoryRepository;

    constructor(categoryRepository: CategoryRepository = new CategoryRepository()) {
        this.categoryRepository = categoryRepository;
    }

    async create(name: string): Promise<Category> {
        const exists = this.categoryRepository.findByName(name);
        if (exists) {
            throw new ApplicationError('Já existe uma categoria com este nome');
        }

        const newCategory = new Category({ name });
        return this.categoryRepository.save(newCategory);
    }

    async list(): Promise<Category[]> {
        return this.categoryRepository.findAll();
    }
}

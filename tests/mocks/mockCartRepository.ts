import { CartRepository } from '../../src/repositories/cartRepository';

export const createMockCartRepository = (): jest.Mocked<CartRepository> => {
    return {
        getCartItems: jest.fn(),
        exists: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        clearCart: jest.fn(),
    } as any;
};

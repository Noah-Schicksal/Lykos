import { CartService, ApplicationError } from '../../../src/services/cartService';
import { createMockCartRepository } from '../../mocks/mockCartRepository';
import { createMockEnrollmentRepository } from '../../mocks/mockEnrollmentRepository';
import { createMockCourseRepository, mockCourse } from '../../mocks/mockCourseRepository';
import { CartRepository } from '../../../src/repositories/cartRepository';
import { EnrollmentRepository } from '../../../src/repositories/enrollmentRepository';
import { CourseRepository } from '../../../src/repositories/courseRepository';
import { CartItem } from '../../../src/entities/CartItem';
import { Enrollment } from '../../../src/entities/Enrollment';

describe('CartService', () => {
    let cartService: CartService;
    let mockCartRepo: jest.Mocked<CartRepository>;
    let mockEnrollmentRepo: jest.Mocked<EnrollmentRepository>;
    let mockCourseRepo: jest.Mocked<CourseRepository>;

    const userId = 'user-123';
    const courseId = mockCourse.id!;

    beforeEach(() => {
        mockCartRepo = createMockCartRepository();
        mockEnrollmentRepo = createMockEnrollmentRepository();
        mockCourseRepo = createMockCourseRepository();

        cartService = new CartService(
            mockCartRepo,
            mockEnrollmentRepo,
            mockCourseRepo
        );

        jest.clearAllMocks();
    });

    describe('getCart', () => {
        it('should return a list of cart items and total price', async () => {
            // Arrange
            const mockCartItems = [
                {
                    id: 'cart-item-1',
                    course_id: courseId,
                    title: 'Curso NodeJS',
                    price: 100,
                    cover_image_url: 'http://img.url',
                    instructor_name: 'Instructor Name',
                    added_at: new Date()
                }
            ];
            mockCartRepo.getCartItems.mockReturnValue(mockCartItems as any);

            // Act
            const result = await cartService.getCart(userId);

            // Assert
            expect(result.data).toHaveLength(1);
            expect(result.data[0].courseId).toBe(courseId);
            expect(result.meta.totalPrice).toBe(100);
            expect(mockCartRepo.getCartItems).toHaveBeenCalledWith(userId);
        });

        it('should return empty list when cart is empty', async () => {
            // Arrange
            mockCartRepo.getCartItems.mockReturnValue([]);

            // Act
            const result = await cartService.getCart(userId);

            // Assert
            expect(result.data).toHaveLength(0);
            expect(result.meta.totalPrice).toBe(0);
        });
    });

    describe('addToCart', () => {
        it('should add item to cart when valid', async () => {
            // Arrange
            mockCourseRepo.findById.mockReturnValue(mockCourse);
            mockEnrollmentRepo.findEnrollment.mockReturnValue(null);
            mockCartRepo.exists.mockReturnValue(false);

            const createdItem = new CartItem({ userId, courseId });
            mockCartRepo.save.mockReturnValue(createdItem);

            // Act
            const result = await cartService.addToCart(userId, courseId);

            // Assert
            expect(result).toEqual(createdItem);
            expect(mockCartRepo.save).toHaveBeenCalled();
        });

        it('should throw ApplicationError when course not found', async () => {
            // Arrange
            mockCourseRepo.findById.mockReturnValue(null);

            // Act & Assert
            await expect(cartService.addToCart(userId, courseId)).rejects.toThrow(
                new ApplicationError('Curso não encontrado')
            );
            expect(mockCartRepo.save).not.toHaveBeenCalled();
        });

        it('should throw ApplicationError when user already enrolled', async () => {
            // Arrange
            mockCourseRepo.findById.mockReturnValue(mockCourse);
            mockEnrollmentRepo.findEnrollment.mockReturnValue(new Enrollment({ userId, courseId }));

            // Act & Assert
            await expect(cartService.addToCart(userId, courseId)).rejects.toThrow(
                new ApplicationError('Aluno já matriculado neste curso')
            );
            expect(mockCartRepo.save).not.toHaveBeenCalled();
        });

        it('should throw ApplicationError when course already in cart', async () => {
            // Arrange
            mockCourseRepo.findById.mockReturnValue(mockCourse);
            mockEnrollmentRepo.findEnrollment.mockReturnValue(null);
            mockCartRepo.exists.mockReturnValue(true);

            // Act & Assert
            await expect(cartService.addToCart(userId, courseId)).rejects.toThrow(
                new ApplicationError('Curso já está no carrinho')
            );
            expect(mockCartRepo.save).not.toHaveBeenCalled();
        });
    });

    describe('removeFromCart', () => {
        it('should remove item from cart', async () => {
            // Act
            await cartService.removeFromCart(userId, courseId);

            // Assert
            expect(mockCartRepo.delete).toHaveBeenCalledWith(userId, courseId);
        });
    });

    describe('checkout', () => {
        it('should process checkout successfully', async () => {
            // Arrange
            const mockCartItems = [
                {
                    id: 'cart-item-1',
                    course_id: courseId,
                    title: 'Curso NodeJS',
                    price: 100,
                    cover_image_url: 'http://img.url',
                    instructor_name: 'Instructor Name',
                    added_at: new Date()
                }
            ];
            mockCartRepo.getCartItems.mockReturnValue(mockCartItems as any);
            mockEnrollmentRepo.findEnrollment.mockReturnValue(null); // Not enrolled yet

            // Act
            const result = await cartService.checkout(userId);

            // Assert
            expect(result.message).toBe('Compra realizada com sucesso!');
            expect(result.data.enrolledCourses).toBe(1);
            expect(mockEnrollmentRepo.save).toHaveBeenCalledTimes(1);
            expect(mockCartRepo.clearCart).toHaveBeenCalledWith(userId);
        });

        it('should throw ApplicationError when cart is empty', async () => {
            // Arrange
            mockCartRepo.getCartItems.mockReturnValue([]);

            // Act & Assert
            await expect(cartService.checkout(userId)).rejects.toThrow(
                new ApplicationError('Carrinho vazio')
            );
            expect(mockEnrollmentRepo.save).not.toHaveBeenCalled();
            expect(mockCartRepo.clearCart).not.toHaveBeenCalled();
        });

        it('should skip enrollment if user is already enrolled (race condition)', async () => {
            // Arrange
            const mockCartItems = [
                {
                    course_id: courseId,
                    title: 'Curso NodeJS',
                    price: 100
                }
            ];
            mockCartRepo.getCartItems.mockReturnValue(mockCartItems as any);
            // Simulate already enrolled
            mockEnrollmentRepo.findEnrollment.mockReturnValue(new Enrollment({ userId, courseId }));

            // Act
            const result = await cartService.checkout(userId);

            // Assert
            // Should still succeed but enroll 0 courses
            expect(result.data.enrolledCourses).toBe(0);
            expect(mockEnrollmentRepo.save).not.toHaveBeenCalled();
            expect(mockCartRepo.clearCart).toHaveBeenCalledWith(userId);
        });
    });
});

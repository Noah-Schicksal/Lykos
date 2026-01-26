import { CartRepository } from '../repositories/cartRepository';
import { EnrollmentRepository } from '../repositories/enrollmentRepository';
import { CourseRepository } from '../repositories/courseRepository';
import { CartResponseDTO, CheckoutResponseDTO } from '../dtos/cartDTOs';
import { CartItem } from '../entities/CartItem';
import { Enrollment } from '../entities/Enrollment';

export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApplicationError';
    }
}

export class CartService {
    private cartRepository: CartRepository;
    private enrollmentRepository: EnrollmentRepository;
    private courseRepository: CourseRepository;

    constructor(
        cartRepository: CartRepository = new CartRepository(),
        enrollmentRepository: EnrollmentRepository = new EnrollmentRepository(),
        courseRepository: CourseRepository = new CourseRepository()
    ) {
        this.cartRepository = cartRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
    }

    // Retorna itens do carrinho e total
    async getCart(userId: string): Promise<CartResponseDTO> {
        const items = this.cartRepository.getCartItems(userId);

        const mappedItems = items.map(item => ({
            id: item.id,
            courseId: item.course_id,
            title: item.title,
            price: item.price,
            coverImageUrl: item.cover_image_url,
            instructorName: item.instructor_name,
            addedAt: new Date(item.added_at)
        }));

        const totalPrice = mappedItems.reduce((acc, item) => acc + item.price, 0);

        return {
            data: mappedItems,
            meta: {
                itemCount: mappedItems.length,
                totalPrice: parseFloat(totalPrice.toFixed(2))
            }
        };
    }

    // Adiciona ao carrinho
    async addToCart(userId: string, courseId: string): Promise<CartItem> {
        // Valida se curso existe
        const course = this.courseRepository.findById(courseId);
        if (!course) {
            throw new ApplicationError('Curso não encontrado');
        }

        // Valida se já matriculado
        const enrollment = this.enrollmentRepository.findEnrollment(userId, courseId);
        if (enrollment) {
            throw new ApplicationError('Aluno já matriculado neste curso');
        }

        // Valida se já existe no carrinho
        const exists = this.cartRepository.exists(userId, courseId);
        if (exists) {
            // Pode retornar sucesso (idempotente) ou erro. Prompt sugere 409 ou ignorar.
            // Vamos lançar erro para controller decidir status 409
            throw new ApplicationError('Curso já está no carrinho'); // Controller deve checar mensagem para 409
        }

        const cartItem = new CartItem({
            userId,
            courseId
        });

        return this.cartRepository.save(cartItem);
    }

    // Remove do carrinho
    async removeFromCart(userId: string, courseId: string): Promise<void> {
        this.cartRepository.delete(userId, courseId);
    }

    // Checkout
    async checkout(userId: string): Promise<CheckoutResponseDTO> {
        const cartItems = this.cartRepository.getCartItems(userId); // Retorna raw joined data

        if (cartItems.length === 0) {
            throw new ApplicationError('Carrinho vazio');
        }

        const enrolledItems: { courseId: string, title: string }[] = [];

        // Iniciar transação (mockada pois db.connection não deve ter método transaction explícito simples exposto aqui, 
        // mas seria ideal. Como não temos transaction manager injetado, faremos sequencialmente.
        // Se falhar no meio, fica inconsistente. Para desafio, OK.)

        for (const item of cartItems) {
            // item é o objeto retornado pelo join (ci.course_id, c.title, etc)

            // Verifica matricula novamente por segurança
            const alreadyEnrolled = this.enrollmentRepository.findEnrollment(userId, item.course_id);
            if (alreadyEnrolled) continue; // Pula se já matriculado (race condition)

            const enrollment = new Enrollment({
                userId,
                courseId: item.course_id
            });

            this.enrollmentRepository.save(enrollment);

            enrolledItems.push({
                courseId: item.course_id,
                title: item.title
            });
        }

        // Limpa carrinho
        this.cartRepository.clearCart(userId);

        return {
            message: 'Compra realizada com sucesso!',
            data: {
                enrolledCourses: enrolledItems.length,
                orderDate: new Date(),
                items: enrolledItems
            }
        };
    }
}

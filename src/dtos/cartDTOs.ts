export interface CartItemDTO {
    id: string; // id do item no carrinho
    courseId: string;
    title: string;
    price: number;
    coverImageUrl?: string;
    instructorName: string;
    addedAt: Date;
}

export interface CartResponseDTO {
    data: CartItemDTO[];
    meta: {
        itemCount: number;
        totalPrice: number;
    };
}

export interface AddToCartDTO {
    courseId: string;
}

export interface CheckoutResponseDTO {
    message: string;
    data: {
        enrolledCourses: number;
        orderDate: Date;
        items: {
            courseId: string;
            title: string;
        }[];
    };
}

export interface CreateReviewDTO {
    courseId: string;
    rating: number;
    comment?: string;
}

export interface ReviewResponseDTO {
    id: string;
    userId: string;
    courseId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
    user?: {
        name: string;
    };
}

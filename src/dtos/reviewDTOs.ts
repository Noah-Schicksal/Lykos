export interface ReviewDTO {
    id: string;
    userName: string;
    rating: number;
    comment?: string;
    createdAt: Date;
}

export interface ReviewListResponseDTO {
    data: ReviewDTO[];
    meta: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        averageRating: number;
    };
}

export interface CreateReviewDTO {
    rating: number;
    comment: string;
}

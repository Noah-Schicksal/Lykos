export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface ReviewProps {
    id?: string;
    userId: string;
    courseId: string;
    rating: ReviewRating;
    comment?: string;
    createdAt?: Date;
}

export class Review {
    public readonly id?: string;
    public readonly createdAt: Date;

    private _userId!: string;
    private _courseId!: string;
    private _rating!: ReviewRating;
    private _comment!: string | null;

    constructor(props: ReviewProps) {
        this.id = props.id;
        this.createdAt = props.createdAt || new Date();

        this.setUserId(props.userId);
        this.setCourseId(props.courseId);
        this.setRating(props.rating);
        this.setComment(props.comment || null);
    }

    // --- MÉTODOS DE NEGÓCIO ---

    public setUserId(userId: string) {
        if (!userId) {
            throw new Error("User ID obrigatório.");
        }
        this._userId = userId;
    }

    public setCourseId(courseId: string) {
        if (!courseId) {
            throw new Error("Course ID obrigatório.");
        }
        this._courseId = courseId;
    }

    public setRating(rating: ReviewRating) {
        if (rating < 1 || rating > 5) {
            throw new Error("Rating deve ser entre 1 e 5.");
        }
        this._rating = rating;
    }

    public setComment(comment: string | null) {
        this._comment = comment;
    }

    // --- Getters ---
    get userId(): string { return this._userId; }
    get courseId(): string { return this._courseId; }
    get rating(): ReviewRating { return this._rating; }
    get comment(): string | null { return this._comment; }

    public toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            courseId: this.courseId,
            rating: this.rating,
            comment: this.comment,
            createdAt: this.createdAt
        };
    }
}

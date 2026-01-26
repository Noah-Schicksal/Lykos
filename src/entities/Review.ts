export interface ReviewProps {
    id?: string;
    userId: string;
    courseId: string;
    rating: number;
    comment?: string;
    createdAt?: Date;
}

export class Review {
    public readonly id?: string;
    public readonly userId: string;
    public readonly courseId: string;
    public readonly createdAt: Date;

    private _rating!: number;
    private _comment?: string;

    constructor(props: ReviewProps) {
        this.id = props.id;
        this.userId = props.userId;
        this.courseId = props.courseId;
        this.createdAt = props.createdAt || new Date();

        this.setRating(props.rating);
        this.setComment(props.comment);
    }

    // valida e define a nota (entre 1 e 5)
    public setRating(rating: number) {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new Error("A nota deve ser um número inteiro entre 1 e 5.");
        }
        this._rating = rating;
    }

    // define o comentário (opcional)
    public setComment(comment?: string) {
        if (comment && comment.trim().length > 500) {
            throw new Error("O comentário não pode exceder 500 caracteres.");
        }
        this._comment = comment ? comment.trim() : undefined;
    }

    public get rating(): number {
        return this._rating;
    }

    public get comment(): string | undefined {
        return this._comment;
    }

    // serializa o objeto
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

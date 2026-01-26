export interface CartItemProps {
    id?: string;
    userId: string;
    courseId: string;
    addedAt?: Date;
}

export class CartItem {
    public readonly id?: string;
    public readonly addedAt: Date;

    private _userId!: string;
    private _courseId!: string;

    constructor(props: CartItemProps) {
        this.id = props.id;
        this.addedAt = props.addedAt || new Date();

        this.setUserId(props.userId);
        this.setCourseId(props.courseId);
    }

    public setUserId(userId: string) {
        if (!userId || userId.trim().length === 0) {
            throw new Error('`userId` inválido.');
        }
        this._userId = userId;
    }

    public setCourseId(courseId: string) {
        if (!courseId || courseId.trim().length === 0) {
            throw new Error('`courseId` inválido.');
        }
        this._courseId = courseId;
    }

    // --- Getters ---
    get userId(): string { return this._userId; }
    get courseId(): string { return this._courseId; }

    public toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            courseId: this.courseId,
            addedAt: this.addedAt
        };
    }
}

export interface EnrollmentProps {
    id?: string;
    userId: string;
    courseId: string;
    enrolledAt?: Date;
    certificateHash?: string | null;
}

export class Enrollment {
    public readonly id?: string;
    public readonly enrolledAt: Date;

    private _userId!: string;
    private _courseId!: string;
    private _certificateHash: string | null;

    constructor(props: EnrollmentProps) {
        this.id = props.id;
        this.enrolledAt = props.enrolledAt || new Date();

        this.setUserId(props.userId);
        this.setCourseId(props.courseId);
        this._certificateHash = props.certificateHash || null;
    }

    // --- MÉTODOS DE NEGÓCIO ---

    public completeEnrollment(hash: string) {
        if (!hash || hash.length < 10) {
            throw new Error("Hash de certificado inválido.");
        }
        this._certificateHash = hash;
    }

    // Validações básicas
    public setUserId(userId: string) {
        if (!userId) throw new Error("User ID obrigatório.");
        this._userId = userId;
    }

    public setCourseId(courseId: string) {
        if (!courseId) throw new Error("Course ID obrigatório.");
        this._courseId = courseId;
    }

    // --- Getters ---
    get userId(): string { return this._userId; }
    get courseId(): string { return this._courseId; }
    get certificateHash(): string | null { return this._certificateHash; }

    public toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            courseId: this.courseId,
            enrolledAt: this.enrolledAt,
            certificateHash: this.certificateHash
        };
    }
}
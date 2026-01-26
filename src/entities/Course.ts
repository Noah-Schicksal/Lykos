

export interface UserCourse {
    id?: string;
    title: string;
    description: string;
    price?: number;
    coverImageUrl?: string;
    maxStudents?: number;
    instructorId: string;
    categoryId?: string;
    createdAt?: Date;
}


export class Course {
    public readonly id?: string;
    public readonly createdAt: Date;

    private _title!: string;
    private _description!: string;
    private _price!: number;
    private _coverImageUrl?: string;
    private _maxStudents?: number;
    private _instructorId!: string;
    private _categoryId?: string;

    constructor(props: UserCourse) {
        this.id = props.id;
        this.createdAt = props.createdAt || new Date();

        this.setTitle(props.title);
        this.setDescription(props.description);
        this.setPrice(props.price ?? 0);


        this.setCoverImageUrl(props.coverImageUrl);
        this.setMaxStudents(props.maxStudents);
        this.setInstructorId(props.instructorId);
        this.setCategoryId(props.categoryId);

    }

    public setTitle(title: string) {

        if (!title || title.trim().length < 3) {
            throw new Error("O título deve ter no mínimo 3 caracteres.");
        }
        this._title = title.trim();
    }

    public setDescription(description: string) {
        if (!description || description.trim().length < 3) {
            throw new Error("A descrição deve ter no mínimo 3 caracteres.");
        }
        this._description = description.trim();
    }


    public setPrice(price: number) {
        if (typeof price !== "number" || price <= 0) {
            throw new Error("O preço deve ser um inteiro maior que 0");
        }
        this._price = price;
    }

    public setCoverImageUrl(coverImageUrl?: string) {
        if (!coverImageUrl || !coverImageUrl.trim()) {
            this._coverImageUrl = undefined;
            return;
        }

        this._coverImageUrl = coverImageUrl.trim();
    }


    public setMaxStudents(maxStudents?: number) {
        if (maxStudents === undefined) {
            this._maxStudents = undefined;
            return;
        }

        if (!Number.isInteger(maxStudents) || maxStudents <= 0) {
            throw new Error("O número máximo de alunos deve ser um inteiro maior que zero.");
        }

        this._maxStudents = maxStudents;
    }

    public setInstructorId(instructorId: string) {
        if (!instructorId || instructorId.trim().length === 0) {
            throw new Error("O instrutor é obrigatório.");
        }

        this._instructorId = instructorId.trim();
    }


    public setCategoryId(categoryId?: string) {
        if (!categoryId || categoryId.trim().length === 0) {
            this._categoryId = undefined;
            return;
        }

        this._categoryId = categoryId.trim();
    }


    public get title(): string {
        return this._title;
    }

    public get description(): string {
        return this._description;
    }

    public get price(): number {
        return this._price;
    }

    public get coverImageUrl(): string | undefined {
        return this._coverImageUrl;
    }

    public get maxStudents(): number | undefined {
        return this._maxStudents;
    }

    public get instructorId(): string {
        return this._instructorId;
    }

    public get categoryId(): string | undefined {
        return this._categoryId;
    }


    public toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            price: this.price,
            coverImageUrl: this.coverImageUrl,
            maxStudents: this.maxStudents,
            instructorId: this.instructorId,
            categoryId: this.categoryId,
            createdAt: this.createdAt
        };
    }
}



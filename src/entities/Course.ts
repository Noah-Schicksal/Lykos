export interface UserCourse {
    id?: string;
    title: string;
    description: string;
    price?: number;
    coverImageUrl?: string;
    maxStudents?: number;
    instructorId: string;
    categoryId?: string;
    isActive?: boolean;
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
    private _isActive: boolean;

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

        // define se o curso está ativo ou não (soft delete)
        this._isActive = props.isActive ?? true;

    }

    // valida e define o título do curso
    public setTitle(title: string) {

        if (!title || title.trim().length < 3) {
            throw new Error("O título deve ter no mínimo 3 caracteres.");
        }
        this._title = title.trim();
    }

    // valida e define a descrição do curso
    public setDescription(description: string) {
        if (!description || description.trim().length < 3) {
            throw new Error("A descrição deve ter no mínimo 3 caracteres.");
        }
        this._description = description.trim();
    }


    // valida e define o preço do curso
    public setPrice(price: number) {
        if (typeof price !== "number" || price < 0) {
            throw new Error("O preço deve ser um valor positivo");
        }
        this._price = price;
    }

    // define a url da imagem de capa, removendo espaços
    public setCoverImageUrl(coverImageUrl?: string) {
        if (!coverImageUrl || !coverImageUrl.trim()) {
            this._coverImageUrl = undefined;
            return;
        }

        this._coverImageUrl = coverImageUrl.trim();
    }


    // valida e define o número máximo de estudantes
    public setMaxStudents(maxStudents?: number) {
        if (maxStudents === undefined || maxStudents === null) {
            this._maxStudents = undefined;
            return;
        }

        if (!Number.isInteger(maxStudents) || maxStudents <= 0) {
            throw new Error("O número máximo de alunos deve ser um inteiro maior que zero.");
        }

        this._maxStudents = maxStudents;
    }

    // valida e define o id do instrutor responsável
    public setInstructorId(instructorId: string) {
        if (!instructorId || instructorId.trim().length === 0) {
            throw new Error("O instrutor é obrigatório.");
        }

        this._instructorId = instructorId.trim();
    }


    // define a categoria do curso
    public setCategoryId(categoryId?: string) {
        if (!categoryId || categoryId.trim().length === 0) {
            this._categoryId = undefined;
            return;
        }

        this._categoryId = categoryId.trim();
    }

    // marca o curso como ativo ou inativo
    public setIsActive(isActive: boolean) {
        this._isActive = isActive;
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

    public get isActive(): boolean {
        return this._isActive;
    }


    // serializa o objeto para json
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
            isActive: this.isActive,
            createdAt: this.createdAt
        };
    }
}

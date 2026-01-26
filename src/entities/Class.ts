export interface ClassProps {
    id?: string;
    title: string;
    description?: string;
    videoUrl?: string;
    materialUrl?: string;
    moduleId: string;
    createdAt?: Date;
}

export class Class {
    public readonly id?: string;
    public readonly moduleId: string;
    public readonly createdAt: Date;

    private _title!: string;
    private _description?: string;
    private _videoUrl?: string;
    private _materialUrl?: string;

    constructor(props: ClassProps) {
        this.id = props.id;
        this.moduleId = props.moduleId;
        this.createdAt = props.createdAt || new Date();

        this.setTitle(props.title);
        this.setDescription(props.description);
        this.setVideoUrl(props.videoUrl);
        this.setMaterialUrl(props.materialUrl);
    }

    // define o título da aula
    public setTitle(title: string) {
        if (!title || title.trim().length < 3) {
            throw new Error("O título da aula deve ter no mínimo 3 caracteres.");
        }
        this._title = title.trim();
    }

    // define a descrição (opcional)
    public setDescription(description?: string) {
        if (!description || description.trim().length === 0) {
            this._description = undefined;
            return;
        }
        this._description = description.trim();
    }

    // define o link do vídeo
    public setVideoUrl(videoUrl?: string) {
        if (!videoUrl || videoUrl.trim().length === 0) {
            this._videoUrl = undefined;
            return;
        }
        this._videoUrl = videoUrl.trim();
    }

    // define o link do material complementar
    public setMaterialUrl(materialUrl?: string) {
        if (!materialUrl || materialUrl.trim().length === 0) {
            this._materialUrl = undefined;
            return;
        }
        this._materialUrl = materialUrl.trim();
    }

    public get title(): string {
        return this._title;
    }

    public get description(): string | undefined {
        return this._description;
    }

    public get videoUrl(): string | undefined {
        return this._videoUrl;
    }

    public get materialUrl(): string | undefined {
        return this._materialUrl;
    }

    // converte para JSON
    public toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            videoUrl: this.videoUrl,
            materialUrl: this.materialUrl,
            moduleId: this.moduleId,
            createdAt: this.createdAt
        };
    }
}

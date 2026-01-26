export interface CategoryProps {
    id?: string;
    name: string;
}

export class Category {
    public readonly id?: string;
    private _name: string;

    constructor(props: CategoryProps) {
        this.id = props.id;
        this._name = props.name;
        this.validateName(props.name);
    }

    public get name(): string {
        return this._name;
    }

    public setName(name: string) {
        this.validateName(name);
        this._name = name.trim();
    }

    private validateName(name: string) {
        if (!name || name.trim().length < 3) {
            throw new Error("O nome da categoria deve ter no mínimo 3 caracteres.");
        }
    }

    public toJSON() {
        return {
            id: this.id,
            name: this.name
        };
    }
}

export interface CartItemProps {
    id?: string;
    userId: string;
    productId: string;
    quantity: number;
    price: number; // preço unitário em centavos ou unidade monetária mínima
    createdAt?: Date;
}

export class CartItem {
    public readonly id?: string;
    public readonly createdAt: Date;

    private _userId!: string;
    private _productId!: string;
    private _quantity!: number;
    private _price!: number;

    constructor(props: CartItemProps) {
        this.id = props.id;
        this.createdAt = props.createdAt || new Date();

        this.setUserId(props.userId);
        this.setProductId(props.productId);
        this.setQuantity(props.quantity);
        this.setPrice(props.price);
    }

    public setUserId(userId: string) {
        if (!userId || userId.trim().length === 0) {
            throw new Error('`userId` inválido.');
        }
        this._userId = userId;
    }

    public setProductId(productId: string) {
        if (!productId || productId.trim().length === 0) {
            throw new Error('`productId` inválido.');
        }
        this._productId = productId;
    }

    public setQuantity(quantity: number) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error('`quantity` deve ser inteiro >= 1.');
        }
        this._quantity = quantity;
    }

    public setPrice(price: number) {
        if (typeof price !== 'number' || price < 0) {
            throw new Error('`price` deve ser número >= 0.');
        }
        this._price = price;
    }

    // --- Getters ---
    get userId(): string { return this._userId; }
    get productId(): string { return this._productId; }
    get quantity(): number { return this._quantity; }
    get price(): number { return this._price; }

    public toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            productId: this.productId,
            quantity: this.quantity,
            price: this.price,
            createdAt: this.createdAt
        };
    }
}

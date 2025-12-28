export interface IProduct {
    name: string;
    description?: string;
    category: string;

    price: number;
    unit: "kg" | "piece" | "litre" | "pack";

    sellerId: string;
    stock: number;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}
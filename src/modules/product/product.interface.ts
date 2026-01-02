import { ProductCategory } from "./product.type";

export interface IProduct {
    name: string;
    description?: string;
    category: ProductCategory;

    price: number;
    unit: "kg" | "piece" | "litre" | "pack";

    sellerId: string;
    stock: number;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}
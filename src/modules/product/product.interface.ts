import { ProductCategory, QuantityType } from "./product.type";

export interface IProductLocation {
    type: "Point";
    coordinates: [number, number];
}

export interface IProductSeller {
    location: IProductLocation;
    delivery_radius_km: number;
}

export interface IProductRating {
    avg: number;
    count: number;
}

export interface IProduct {
    name: string;
    category: ProductCategory;
    description: string;
    price: number;
    quantity: number;
    quantity_unit:QuantityType;
    seller_id: string;
    is_available: boolean;
    seller: IProductSeller;
    rating: IProductRating;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateProductInput {
    name: string;
    category: ProductCategory;
    description: string;
    price: number;
    quantity: number;
    quantity_unit:QuantityType;
    is_available?: boolean;
}

export interface IUpdateProductInput {
    description?: string;
    price?: number;
    quantity?: number;
    quantity_unit?: QuantityType;
}

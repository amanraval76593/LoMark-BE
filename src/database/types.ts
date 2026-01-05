import { DeliveryType, OrderStatus } from "../modules/orders";

export type UserRole =
    | "USER"
    | "FARMER"
    | "DELIVERY_PARTNER"
    | "ADMIN";

export interface UserRow {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    is_email_verified: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Order {
    id: string,
    buyer_id: string,
    seller_id: string,
    status: OrderStatus,
    delivery: DeliveryType,
    created_at: Date;
    expired_at: Date;
}

export interface OrderItems {
    id: string,
    order_id: string,
    product_id: string,
    quantity: number,
    price_snapshot: number
}
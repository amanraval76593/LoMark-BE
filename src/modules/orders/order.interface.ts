import { DeliveryType, OrderStatus } from "./order.type";


export interface orderDTO {
    userId: string,
    sellerId: string,
    deliveryType: DeliveryType,
    productList: Promise<ProductDTO>[];
}

export interface ProductDTO {
    id: string,
    quantity: number,
    price: number
}

export interface orderEntity {
    userId: string,
    sellerId: string,
    status: OrderStatus,
    deliveryType: DeliveryType,
    expiredAt: Date
}

export interface productEntity {
    id: string,
    quantity: number,
    price: number,
    orderId: string
}
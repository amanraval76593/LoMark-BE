import type { DeliveryType, OrderStatus } from './order.type';


export interface orderDTO {
    userId: string,
    sellerId: string,
    deliveryType: DeliveryType,
    buyerLocation: BuyerLocation,
    productList: ProductDTO[];
}

export interface BuyerLocation {
    latitude: number,
    longitude: number,
}

export interface ProductDTO {
    id: string,
    quantity: number
}

export interface orderEntity {
    userId: string,
    sellerId: string,
    status: OrderStatus,
    deliveryType: DeliveryType,
    totalAmount: number,
    expiredAt: Date
}

export interface productEntity {
    id: string,
    quantity: number,
    price: number,
    name: string,
    orderId: string
}

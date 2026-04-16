import { BadRequestError, NotFoundError } from "../../errors/app.error";
import { ProductRepository } from "../product/product.repository";
import { orderDTO } from "./order.interface";
import { orderRepository } from "./order.repository";
import { OrderStatus } from "./order.type";

export class OrderService {

    static async createOrder(data: orderDTO) {

        const expiredTime: Date = new Date(Date.now() + (60 * 60 * 1000));

        const order = await orderRepository.createOrder({
            userId: data.userId,
            sellerId: data.sellerId,
            deliveryType: data.deliveryType,
            expiredAt: expiredTime,
            status: OrderStatus.REQUESTED
        });

        if (!order) throw NotFoundError;

        const orderId = order.id;

        const productList = await Promise.all(data.productList.map(async product => {
            const checkProductStock=await ProductRepository.checkProductStock(product.id,product.quantity);
            if(!checkProductStock) {
                throw new BadRequestError(`product ${product.id} is not available`)
            }
            const result = orderRepository.addProduct({ id: product.id, orderId: orderId, price: product.price, quantity: product.quantity });
            return result;
        }));

        return { order: order, productList: productList}

    }
}
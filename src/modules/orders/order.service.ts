import { NotFoundError } from "../../errors/app.error";
import { orderDTO } from "./order.interface";
import { orderRepsitory } from "./order.repository";
import { OrderStatus } from "./order.type";

export class OrderService {

    static async createOrder(data: orderDTO) {

        const expiredTime: Date = new Date(Date.now() + (60 * 60 * 1000));

        const order = await orderRepsitory.createOrder({
            userId: data.userId,
            sellerId: data.sellerId,
            deliveryType: data.deliveryType,
            expiredAt: expiredTime,
            status: OrderStatus.REQUESTED
        });

        if (!order) throw NotFoundError;

        const orderId = order.id;

        const productList = await Promise.all(data.productList.map(async product => {
            const result = orderRepsitory.addProduct({ id: product.id, orderId: orderId, price: product.price, quantity: product.quantity });
            return result;
        }));

        return { order: order, productList: productList }

    }
}
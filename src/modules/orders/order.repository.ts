import { Order, OrderItems, postgresPool } from "../../database";
import { orderEntity, productEntity } from "./order.interface";

export class orderRepsitory {

    static async createOrder(order: orderEntity): Promise<Order> {
        const result = await postgresPool.query<Order>(
            `
            INSERT INTO orders(
                buyer_id,
                seller_id,
                status,
                delivery,
                expired_at
            )
            VALUES($1,$2,$3,$4,$5)
            RETURNING *
            `,
            [order.userId, order.sellerId, order.status, order.deliveryType, order.expiredAt]
        )
        return result.rows[0];
    }

    static async addProduct(product: productEntity): Promise<OrderItems> {

        const result = await postgresPool.query<OrderItems>(
            `
            INSERT INTO order_items(
                order_id,
                product_id,
                quantity,
                price_snapshot
            )
            VALUES[$1,$2,$3,$4]
            RETURNING *
            `,
            [product.orderId, product.id, product.quantity, product.price]
        )

        return result.rows[0];
    }
}
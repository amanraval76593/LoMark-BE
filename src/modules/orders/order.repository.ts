import type { PoolClient } from 'pg';
import type { Order, OrderItems } from '../../database';
import { postgresPool } from '../../database';
import type { orderEntity, productEntity } from './order.interface';

export class orderRepository {

  static async createOrder(order: orderEntity, client: PoolClient): Promise<Order> {
    const result = await client.query<Order>(
      `
            INSERT INTO orders(
                buyer_id,
                seller_id,
                status,
                delivery,
                total_amount,
                expires_at
            )
            VALUES($1,$2,$3,$4,$5,$6)
            RETURNING *
            `,
      [order.userId, order.sellerId, order.status, order.deliveryType, order.totalAmount, order.expiredAt],
    );
    return result.rows[0];
  }

  static async addProduct(product: productEntity, client: PoolClient): Promise<OrderItems> {

    const result = await client.query<OrderItems>(
      `
            INSERT INTO order_items(
                order_id,
                product_id,
                product_name,
                quantity,
                price_snapshot
            )
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *
            `,
      [product.orderId, product.id, product.name, product.quantity, product.price],
    );

    return result.rows[0];
  }

  static async getClient() {
    return postgresPool.connect();
  }

  static async fetchOrderById(orderId:string){
    const result=await postgresPool.query<Order>(
      `
      SELECT * 
      FROM orders
      WHERE id=$1
      LIMIT 1
            `,
      [orderId] ,
    );

    return result.rows[0];
  }

  static async fetchOrderItems(orderId:string){
    const result =await postgresPool.query<OrderItems>(
      `
        SELECT * 
        FROM order_items
        WHERE order_id=$1
        `,
      [orderId],
    );

    return result.rows;
  }

  static async fetchOrderForUser(userId:string){
    const result=await postgresPool.query<Order>(
      `
      SELECT * 
      FROM orders
      WHERE buyer_id=$1
            `,
      [userId] ,
    );

    return result.rows;
  }
   
  static async fetchOrderForSeller(userId:string){
    const result=await postgresPool.query<Order>(
      `
      SELECT * 
      FROM orders
      WHERE seller_id=$1
            `,
      [userId] ,
    );

    return result.rows;
  }
}

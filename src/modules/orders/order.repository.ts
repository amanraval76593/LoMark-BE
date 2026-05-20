import type { PoolClient } from 'pg';
import type { Order, OrderItems } from '../../database';
import { postgresPool } from '../../database';
import type { orderEntity, productEntity } from './order.interface';
import { OrderStatus } from './order.type';

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

  static async fetchOrderById(orderId:string, client?:PoolClient){
    const db=client ?? postgresPool;
    const result=await db.query<Order>(
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

  static async fetchOrderItems(orderId:string, client?:PoolClient){
    const db=client ?? postgresPool;
    const result =await db.query<OrderItems>(
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

  static async fetchOrderForSellerById(orderId:string, sellerId:string, client:PoolClient){
    const result=await client.query<Order>(
      `
      SELECT *
      FROM orders
      WHERE id=$1 AND seller_id=$2
      LIMIT 1
      FOR UPDATE
            `,
      [orderId, sellerId],
    );

    return result.rows[0];
  }

  static async orderAction(orderId:string,sellerId:string,action:OrderStatus.ACCEPTED|OrderStatus.REJECTED,client:PoolClient){
    const result=await client.query<Order>(
      `
      UPDATE orders
      SET status=$3,
          updated_at=NOW()
      WHERE id=$1 AND seller_id=$2 AND status=$4
      RETURNING *
            `,
      [orderId, sellerId, action, OrderStatus.REQUESTED],
    );

    return result.rows[0];
  }
}

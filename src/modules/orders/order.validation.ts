import { z } from 'zod';
import { DeliveryType } from './order.type';

export const createOrderSchema = z.object({
  body: z.object({
    sellerId: z.string(),
    deliveryType: z.enum(DeliveryType),
    productList: z.array(z.object({
      id: z.string(),
      quantity: z.number().positive(),
    })),
    buyerLocation:z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  }),
});

export const fetchOrderByIdSchema=z.object({
  params:z.object({
    orderId:z.string().min(1),
  }),
});

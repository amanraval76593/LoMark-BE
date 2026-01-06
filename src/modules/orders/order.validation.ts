import { z } from "zod"
import { DeliveryType } from "./order.type"

export const createOrderSchema = z.object({
    body: z.object({
        sellerId: z.string(),
        deliveryType: z.enum(DeliveryType),
        productList: z.array(z.object({
            id: z.string(),
            quantity: z.number().positive(),
            price: z.number().positive()
        }))
    })
})
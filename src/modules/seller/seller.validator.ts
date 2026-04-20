import { z } from "zod"

export const assignSellerLocationSchema = z.object({
    body: z.object({
        location:z.object({
            latitude: z.number().min(-90).max(90),
            longitude: z.number().min(-180).max(180)
        }),
        deliveryRadius:z.number().min(1),
        businessType:z.string().min(3)
    })
})
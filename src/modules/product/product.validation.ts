import { z } from "zod"
import { ProductCategory } from "./product.type";

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        desciption: z.string().optional(),
        category: z.enum(ProductCategory),
        price: z.number().positive(),
        unit: z.enum(["kg", "piece", "litre", "pack"]),
        stock: z.number().int().nonnegative()
    }),
});

export const fetchProductForSellerSchema = z.object({
    limit: z.number().min(1).optional(),
    cursor: z.string().optional()
})


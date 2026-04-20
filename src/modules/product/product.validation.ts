import { z } from "zod"
import { ProductCategory } from "./product.type";

const productCategorySchema = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(ProductCategory));

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        description:z.string().min(4),
        category: productCategorySchema,
        price: z.number().positive(),
        quantity: z.number().int().nonnegative(),
        is_available: z.boolean().optional()
    }),
});

export const fetchProductForSellerSchema = z.object({
    limit: z.number().min(1).optional(),
    cursor: z.string().optional()
})


export const fetchProductByLocationSchema = z.object({
    query: z.object({
        limit: z.coerce.number().int().min(1).optional(),
        cursor: z.string().optional(),
        latitude: z.coerce.number().min(-90).max(90),
        longitude: z.coerce.number().min(-180).max(180)
    })
})

export const checkProductStockSchema=z.object({
    body:z.object({
        productId:z.string(),
        quantity:z.number().int().min(1)
    })
})

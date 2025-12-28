import { z } from "zod"

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        desciption: z.string().optional(),
        category: z.string(),
        price: z.number().positive(),
        unit: z.enum(["kg", "piece", "litre", "pack"]),
        stock: z.number().int().nonnegative()
    }),
});


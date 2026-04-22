import { z } from 'zod';
import { ProductCategory, QuantityType } from './product.type';

const productCategorySchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.enum(ProductCategory));

const quantityUnitSchema=z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.enum(QuantityType));

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description:z.string().min(4),
    category: productCategorySchema,
    price: z.number().positive(),
    quantity: z.number().int().nonnegative(),
    quantity_unit:quantityUnitSchema,
    is_available: z.boolean().optional(),
  }),
});

export const fetchProductForSellerSchema = z.object({
  limit: z.number().min(1).optional(),
  cursor: z.string().optional(),
});


export const fetchProductByLocationSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).optional(),
    cursor: z.string().optional(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  }),
});

export const fetchProductByIdSchema=z.object({
  params:z.object({
    productId: z.string().trim().min(1),
  }),
});

export const checkProductStockSchema=z.object({
  body:z.object({
    productId:z.string(),
    quantity:z.number().int().min(1),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    productId: z.string().trim().min(1),
  }),
  body: z.object({
    description: z.string().min(4).optional(),
    price: z.number().positive().optional(),
    quantity: z.number().int().nonnegative().optional(),
    quantity_unit: quantityUnitSchema.optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field is required to update the product',
    },
  ),
});

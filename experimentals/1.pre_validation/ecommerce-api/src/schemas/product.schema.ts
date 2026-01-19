import { z } from 'zod';
import { paginationSchema, idParamSchema } from './common.schema.js';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).default(''),
    price: z
      .number()
      .positive('Price must be positive')
      .multipleOf(0.01, 'Price must have at most 2 decimal places'),
    category: z.string().min(1),
    imageUrl: z.string().url().optional(),
    stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
  }),
});

export const updateProductSchema = z.object({
  params: idParamSchema,
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    price: z
      .number()
      .positive('Price must be positive')
      .multipleOf(0.01, 'Price must have at most 2 decimal places')
      .optional(),
    category: z.string().min(1).optional(),
    imageUrl: z.string().url().optional(),
    stock: z.number().int().nonnegative('Stock cannot be negative').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getProductSchema = z.object({
  params: idParamSchema,
});

export const listProductsSchema = z.object({
  query: paginationSchema,
});

export const searchProductsSchema = z.object({
  query: paginationSchema.extend({
    query: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
  }),
});

export const deleteProductSchema = z.object({
  params: idParamSchema,
});

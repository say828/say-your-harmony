import { z } from 'zod';
import { idParamSchema } from './common.schema.js';

export const getStockSchema = z.object({
  params: z.object({
    productId: z.string().uuid(),
  }),
});

export const updateStockSchema = z.object({
  params: z.object({
    productId: z.string().uuid(),
  }),
  body: z.object({
    quantity: z.number().int().nonnegative(),
    reason: z.string().optional(),
  }),
});

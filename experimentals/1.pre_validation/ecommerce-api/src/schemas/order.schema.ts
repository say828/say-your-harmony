import { z } from 'zod';
import { idParamSchema } from './common.schema.js';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

export const createOrderSchema = z.object({
  body: z.object({
    cartId: z.string().uuid(),
    shippingAddress: addressSchema,
  }),
});

export const getOrderSchema = z.object({
  params: idParamSchema,
});

export const updateOrderStatusSchema = z.object({
  params: idParamSchema,
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  }),
});

export const cancelOrderSchema = z.object({
  params: idParamSchema,
});

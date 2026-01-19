import { z } from 'zod';

export const createCartSchema = z.object({
  body: z.object({
    sessionId: z.string().optional(),
    userId: z.string().uuid().optional(),
  }),
});

export const getCartSchema = z.object({
  params: z.object({
    cartId: z.string().uuid(),
  }),
});

export const addToCartSchema = z.object({
  params: z.object({
    cartId: z.string().uuid(),
  }),
  body: z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    cartId: z.string().uuid(),
    productId: z.string().uuid(),
  }),
  body: z.object({
    quantity: z.number().int().min(1).max(99),
  }),
});

export const removeCartItemSchema = z.object({
  params: z.object({
    cartId: z.string().uuid(),
    productId: z.string().uuid(),
  }),
});

export const clearCartSchema = z.object({
  params: z.object({
    cartId: z.string().uuid(),
  }),
});

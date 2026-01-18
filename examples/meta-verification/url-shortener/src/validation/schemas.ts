/**
 * Zod validation schemas for URL Shortener API
 */

import { z } from 'zod';

/**
 * Schema for creating a short URL
 * Only accepts http and https protocols
 */
export const CreateShortUrlSchema = z.object({
  url: z.string().url({ message: 'Invalid URL format' }).refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    { message: 'URL must use http or https protocol' }
  )
});

/**
 * Schema for validating a short ID
 */
export const ShortIdSchema = z.string().regex(/^[A-Za-z0-9]{6}$/, {
  message: 'Invalid short ID format. Must be 6 alphanumeric characters.'
});

/**
 * Type inference from schemas
 */
export type CreateShortUrlInput = z.infer<typeof CreateShortUrlSchema>;

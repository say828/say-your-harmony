import { z } from 'zod';
import type { UrlEntry } from '../types/index.js';
import { getUrl, setUrl, hasUrl, incrementClicks } from '../storage/url.storage.js';

/** Base62 character set for short ID generation */
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Maximum collision retry attempts */
const MAX_ATTEMPTS = 10;

/** Base URL for short URLs */
const BASE_URL = 'http://localhost:3000';

/**
 * Zod schema for URL shortening request
 */
export const ShortenSchema = z.object({
  url: z.string().url().regex(/^https?:\/\//, 'URL must start with http:// or https://'),
});

/**
 * Zod schema for short ID validation
 */
export const ShortIdSchema = z.string().length(6).regex(/^[A-Za-z0-9]{6}$/, 'ID must be 6 alphanumeric characters');

/**
 * Generate a random 6-character alphanumeric ID
 */
export function generateShortId(): string {
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += CHARSET[Math.floor(Math.random() * 62)];
  }
  return id;
}

/**
 * Generate a unique short ID with collision handling
 * Throws error after MAX_ATTEMPTS failures
 */
export function generateUniqueId(): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const id = generateShortId();
    if (!hasUrl(id)) {
      return id;
    }
  }
  throw new Error('Failed to generate unique ID after maximum attempts');
}

/**
 * Create a new short URL
 */
export function createShortUrl(originalUrl: string): UrlEntry {
  // Validate URL
  const parsed = ShortenSchema.parse({ url: originalUrl });

  // Generate unique ID
  const id = generateUniqueId();

  // Create entry
  const entry: UrlEntry = {
    id,
    shortUrl: `${BASE_URL}/${id}`,
    originalUrl: parsed.url,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };

  // Store and return
  setUrl(entry);
  return entry;
}

/**
 * Get URL details by short ID (does NOT increment clicks)
 */
export function getUrlDetails(id: string): UrlEntry | null {
  // Validate ID format
  ShortIdSchema.parse(id);

  const entry = getUrl(id);
  return entry ?? null;
}

/**
 * Redirect and increment click counter
 * Returns original URL or null if not found
 */
export function redirectAndIncrement(id: string): string | null {
  // Validate ID format
  ShortIdSchema.parse(id);

  const updated = incrementClicks(id);
  return updated?.originalUrl ?? null;
}

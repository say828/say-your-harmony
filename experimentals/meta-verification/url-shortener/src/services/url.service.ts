/**
 * URL shortener service layer - business logic
 */

import crypto from 'crypto';
import type { UrlRecord } from '../types/index.js';
import { urlStorage } from '../storage/url.storage.js';

/**
 * Base62 character set for short IDs
 */
const BASE62_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Maximum retry attempts for ID generation on collision
 */
const MAX_RETRY_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-character alphanumeric ID
 * @returns 6-character short ID
 */
function generateShortId(): string {
  const bytes = crypto.randomBytes(6);
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += BASE62_CHARS[bytes[i] % 62];
  }
  return id;
}

/**
 * Create a short URL from a long URL
 * @param longUrl - Original URL to shorten
 * @returns Created URL record
 * @throws Error if unable to generate unique ID after max retries
 */
export function createShortUrl(longUrl: string): UrlRecord {
  let attempts = 0;

  while (attempts < MAX_RETRY_ATTEMPTS) {
    const id = generateShortId();

    const record: UrlRecord = {
      id,
      longUrl,
      createdAt: new Date(),
      clicks: 0
    };

    const saved = urlStorage.save(record);
    if (saved) {
      return record;
    }

    attempts++;
  }

  throw new Error(`Failed to generate unique ID after ${MAX_RETRY_ATTEMPTS} attempts`);
}

/**
 * Get URL details by short ID
 * @param id - Short ID
 * @returns URL record or undefined if not found
 */
export function getUrlById(id: string): UrlRecord | undefined {
  return urlStorage.get(id);
}

/**
 * Increment click counter and return the long URL
 * @param id - Short ID
 * @returns Long URL or undefined if not found
 */
export function trackClickAndGetUrl(id: string): string | undefined {
  const record = urlStorage.get(id);
  if (!record) {
    return undefined;
  }

  urlStorage.incrementClicks(id);
  return record.longUrl;
}

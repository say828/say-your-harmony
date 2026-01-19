/**
 * Core types for URL Shortener API
 */

/**
 * Stored URL record in the database
 */
export interface UrlRecord {
  /** 6-character alphanumeric short ID */
  id: string;

  /** Original long URL */
  longUrl: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Number of times this short URL has been accessed */
  clicks: number;
}

/**
 * Request body for creating a short URL
 */
export interface CreateShortUrlRequest {
  url: string;
}

/**
 * Response for creating a short URL
 */
export interface CreateShortUrlResponse {
  id: string;
  shortUrl: string;
  longUrl: string;
}

/**
 * Response for getting URL details
 */
export interface GetUrlDetailsResponse {
  id: string;
  longUrl: string;
  clicks: number;
  createdAt: string; // ISO 8601 format
}

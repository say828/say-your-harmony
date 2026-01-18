/**
 * URL Entry stored in memory
 */
export interface UrlEntry {
  /** 6-character alphanumeric short ID */
  id: string;
  /** Full short URL (http://localhost:3000/{id}) */
  shortUrl: string;
  /** Original long URL provided by user */
  originalUrl: string;
  /** Number of times this URL has been redirected */
  clicks: number;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
}

/**
 * Response for POST /api/shorten
 */
export interface ShortenResponse {
  id: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

/**
 * Response for GET /api/urls/:id
 */
export interface UrlDetailsResponse {
  id: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: string;
  code: string;
}

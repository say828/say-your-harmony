/**
 * REST API Endpoint Handlers - Reference Implementation
 *
 * This module provides Express-style HTTP handler functions that demonstrate
 * type-safe REST API patterns in TypeScript. This is an educational reference
 * implementation showing modern async/await patterns, error handling, and
 * proper HTTP response structures.
 *
 * @module api-endpoints
 */

/**
 * Minimal Express-style Request interface.
 * Defines the essential properties of an HTTP request object.
 */
export interface Request {
  /** HTTP method (GET, POST, PUT, DELETE, etc.) */
  method: string;
  /** Request URL path */
  url: string;
  /** Request body (typically JSON data for POST/PUT) */
  body?: unknown;
  /** URL parameters extracted from path patterns (e.g., /user/:id) */
  params?: Record<string, string>;
  /** Query string parameters (e.g., ?page=1&limit=10) */
  query?: Record<string, string>;
}

/**
 * Minimal Express-style Response interface.
 * Defines methods for sending HTTP responses.
 */
export interface Response {
  /**
   * Sets the HTTP status code for the response.
   * Returns the response object for method chaining.
   *
   * @param code - HTTP status code (200, 201, 400, 500, etc.)
   * @returns The response object for chaining
   */
  status(code: number): Response;

  /**
   * Sends a JSON response to the client.
   *
   * @param data - Data to serialize and send as JSON
   */
  json(data: unknown): void;

  /**
   * Sends a plain text response to the client.
   *
   * @param data - Text data to send
   */
  send(data: string): void;
}

/**
 * Express-style next function for error handling middleware.
 * Passes control to the next middleware in the chain, optionally with an error.
 *
 * @param error - Optional error to pass to error handling middleware
 */
export type NextFunction = (error?: Error) => void;

/**
 * Express-style request handler function type.
 * Defines the signature for middleware and route handlers.
 */
export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Handles GET requests in Express-style pattern.
 *
 * This handler demonstrates proper async/await patterns, request validation,
 * JSON response formatting, and error propagation via the next() middleware
 * function. It returns HTTP 200 OK with request details.
 *
 * @param req - The request object containing URL, query, and params
 * @param res - The response object for sending responses
 * @param next - The next middleware function for error handling
 * @returns Promise that resolves when response is sent
 *
 * @throws {Error} Throws errors for invalid requests (missing URL)
 *
 * @example
 * ```typescript
 * const req = {
 *   method: 'GET',
 *   url: '/api/users',
 *   query: { page: '1' }
 * };
 * const res = {
 *   status: vi.fn().mockReturnThis(),
 *   json: vi.fn(),
 *   send: vi.fn()
 * };
 * const next = vi.fn();
 *
 * await handleGet(req, res, next);
 * // res.status(200).json({
 * //   message: 'GET request successful',
 * //   method: 'GET',
 * //   url: '/api/users',
 * //   query: { page: '1' }
 * // });
 * ```
 */
export async function handleGet(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate request object
    if (!req || !req.url) {
      throw new Error('Invalid request: missing URL');
    }

    // Build success response
    const responseData: {
      message: string;
      method: string;
      url: string;
      query?: Record<string, string>;
      params?: Record<string, string>;
    } = {
      message: 'GET request successful',
      method: req.method,
      url: req.url,
    };

    // Include query parameters if present
    if (req.query) {
      responseData.query = req.query;
    }

    // Include URL parameters if present
    if (req.params) {
      responseData.params = req.params;
    }

    // Send 200 OK response with JSON data
    res.status(200).json(responseData);
  } catch (error) {
    // Pass error to error handling middleware
    next(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Handles POST requests in Express-style pattern.
 *
 * This handler demonstrates proper async/await patterns, request validation,
 * JSON response formatting, and error propagation via the next() middleware
 * function. It returns HTTP 201 Created with request details including body.
 *
 * @param req - The request object containing URL, body, and params
 * @param res - The response object for sending responses
 * @param next - The next middleware function for error handling
 * @returns Promise that resolves when response is sent
 *
 * @throws {Error} Throws errors for invalid requests (missing URL)
 *
 * @example
 * ```typescript
 * const req = {
 *   method: 'POST',
 *   url: '/api/users',
 *   body: { name: 'John Doe', email: 'john@example.com' }
 * };
 * const res = {
 *   status: vi.fn().mockReturnThis(),
 *   json: vi.fn(),
 *   send: vi.fn()
 * };
 * const next = vi.fn();
 *
 * await handlePost(req, res, next);
 * // res.status(201).json({
 * //   message: 'POST request successful',
 * //   method: 'POST',
 * //   url: '/api/users',
 * //   body: { name: 'John Doe', email: 'john@example.com' }
 * // });
 * ```
 */
export async function handlePost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate request object
    if (!req || !req.url) {
      throw new Error('Invalid request: missing URL');
    }

    // Build success response
    const responseData: {
      message: string;
      method: string;
      url: string;
      body: unknown;
    } = {
      message: 'POST request successful',
      method: req.method,
      url: req.url,
      body: req.body,
    };

    // Send 201 Created response with JSON data
    res.status(201).json(responseData);
  } catch (error) {
    // Pass error to error handling middleware
    next(error instanceof Error ? error : new Error(String(error)));
  }
}

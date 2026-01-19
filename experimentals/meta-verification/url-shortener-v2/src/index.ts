import express, { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createShortUrl, getUrlDetails, redirectAndIncrement, ShortIdSchema } from './services/url.service.js';
import type { ErrorResponse } from './types/index.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

/**
 * POST /api/shorten - Create a short URL
 */
app.post('/api/shorten', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body as { url?: string };

    if (!url) {
      const error: ErrorResponse = { error: 'URL is required', code: 'URL_REQUIRED' };
      return res.status(400).json(error);
    }

    const entry = createShortUrl(url);
    return res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/urls/:id - Get URL details (does NOT increment clicks)
 */
app.get('/api/urls/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const entry = getUrlDetails(id);

    if (!entry) {
      const error: ErrorResponse = { error: 'Short URL not found', code: 'URL_NOT_FOUND' };
      return res.status(404).json(error);
    }

    return res.status(200).json(entry);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /:id - Redirect to original URL (increments clicks)
 */
app.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate ID format first
    try {
      ShortIdSchema.parse(id);
    } catch {
      const error: ErrorResponse = { error: 'Invalid short ID format', code: 'INVALID_SHORT_ID' };
      return res.status(400).json(error);
    }

    const originalUrl = redirectAndIncrement(id);

    if (!originalUrl) {
      const error: ErrorResponse = { error: 'Short URL not found', code: 'URL_NOT_FOUND' };
      return res.status(404).json(error);
    }

    return res.redirect(301, originalUrl);
  } catch (error) {
    next(error);
  }
});

/**
 * Error handling middleware
 */
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    const errorResponse: ErrorResponse = {
      error: error.errors[0]?.message ?? 'Validation failed',
      code: 'VALIDATION_ERROR',
    };
    return res.status(400).json(errorResponse);
  }

  console.error('Unexpected error:', error);
  const errorResponse: ErrorResponse = {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  };
  return res.status(500).json(errorResponse);
});

// Export app for testing
export { app };

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`URL Shortener v2 running at http://localhost:${PORT}`);
  });
}

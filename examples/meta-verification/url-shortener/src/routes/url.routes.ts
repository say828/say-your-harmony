/**
 * URL shortener route handlers
 */

import { Router, Request, Response } from 'express';
import { CreateShortUrlSchema, ShortIdSchema } from '../validation/schemas.js';
import { createShortUrl, getUrlById, trackClickAndGetUrl } from '../services/url.service.js';
import type { CreateShortUrlRequest, CreateShortUrlResponse, GetUrlDetailsResponse } from '../types/index.js';

export const urlRouter = Router();

/**
 * POST /api/shorten - Create a short URL
 */
urlRouter.post('/api/shorten', (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = CreateShortUrlSchema.parse(req.body);

    // Create short URL
    const record = createShortUrl(validatedData.url);

    // Build response
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const response: CreateShortUrlResponse = {
      id: record.id,
      shortUrl: `${baseUrl}/${record.id}`,
      longUrl: record.longUrl
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid request body', details: error });
    } else if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * GET /api/urls/:id - Get URL details (clicks, timestamps)
 */
urlRouter.get('/api/urls/:id', (req: Request, res: Response) => {
  try {
    // Validate ID format
    const id = ShortIdSchema.parse(req.params.id);

    // Get URL record
    const record = getUrlById(id);
    if (!record) {
      res.status(404).json({ error: 'URL not found' });
      return;
    }

    // Build response
    const response: GetUrlDetailsResponse = {
      id: record.id,
      longUrl: record.longUrl,
      clicks: record.clicks,
      createdAt: record.createdAt.toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid short ID format' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * GET /health - Health check endpoint
 */
urlRouter.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * GET /:id - Redirect to original URL (301) and increment counter
 */
urlRouter.get('/:id', (req: Request, res: Response) => {
  try {
    // Validate ID format
    const id = ShortIdSchema.parse(req.params.id);

    // Track click and get long URL
    const longUrl = trackClickAndGetUrl(id);
    if (!longUrl) {
      res.status(404).json({ error: 'URL not found' });
      return;
    }

    // 301 Permanent Redirect
    res.redirect(301, longUrl);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid short ID format' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

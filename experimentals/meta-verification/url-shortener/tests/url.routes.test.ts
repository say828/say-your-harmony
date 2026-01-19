/**
 * Integration tests for URL routes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { urlStorage } from '../src/storage/url.storage.js';

describe('URL Routes Integration Tests', () => {
  beforeEach(() => {
    urlStorage.clear();
  });

  describe('POST /api/shorten', () => {
    it('should create a short URL and return 201', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/very/long/path' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('longUrl');
      expect(response.body.id).toMatch(/^[A-Za-z0-9]{6}$/);
      expect(response.body.longUrl).toBe('https://example.com/very/long/path');
      expect(response.body.shortUrl).toContain(response.body.id);
    });

    it('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing URL field', async () => {
      await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);
    });

    it('should handle multiple URL creations', async () => {
      const url1 = 'https://example.com/path1';
      const url2 = 'https://example.com/path2';

      const response1 = await request(app)
        .post('/api/shorten')
        .send({ url: url1 })
        .expect(201);

      const response2 = await request(app)
        .post('/api/shorten')
        .send({ url: url2 })
        .expect(201);

      expect(response1.body.id).not.toBe(response2.body.id);
    });
  });

  describe('GET /api/urls/:id', () => {
    it('should return URL details with clicks and timestamp', async () => {
      // Create a short URL first
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/details' })
        .expect(201);

      const id = createResponse.body.id;

      // Get URL details
      const response = await request(app)
        .get(`/api/urls/${id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', id);
      expect(response.body).toHaveProperty('longUrl', 'https://example.com/details');
      expect(response.body).toHaveProperty('clicks', 0);
      expect(response.body).toHaveProperty('createdAt');
      expect(new Date(response.body.createdAt).toISOString()).toBe(response.body.createdAt);
    });

    it('should return 404 for non-existent ID with valid format', async () => {
      await request(app)
        .get('/api/urls/aB3xY9')  // Valid format but doesn't exist
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/urls/abc')  // Too short
        .expect(400);

      await request(app)
        .get('/api/urls/abc-123')  // Invalid chars
        .expect(400);
    });
  });

  describe('GET /:id', () => {
    it('should redirect to original URL with 301 status', async () => {
      // Create a short URL first
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/redirect' })
        .expect(201);

      const id = createResponse.body.id;

      // Access short URL (should redirect)
      const response = await request(app)
        .get(`/${id}`)
        .expect(301);

      expect(response.headers.location).toBe('https://example.com/redirect');
    });

    it('should increment click counter on redirect', async () => {
      // Create a short URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/tracking' })
        .expect(201);

      const id = createResponse.body.id;

      // Verify initial clicks = 0
      const details1 = await request(app)
        .get(`/api/urls/${id}`)
        .expect(200);
      expect(details1.body.clicks).toBe(0);

      // Access short URL (redirect + increment)
      await request(app)
        .get(`/${id}`)
        .expect(301);

      // Verify clicks = 1
      const details2 = await request(app)
        .get(`/api/urls/${id}`)
        .expect(200);
      expect(details2.body.clicks).toBe(1);

      // Access again
      await request(app)
        .get(`/${id}`)
        .expect(301);

      // Verify clicks = 2
      const details3 = await request(app)
        .get(`/api/urls/${id}`)
        .expect(200);
      expect(details3.body.clicks).toBe(2);
    });

    it('should return 404 for non-existent ID with valid format', async () => {
      await request(app)
        .get('/aB3xY9')  // Valid format but doesn't exist
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/abc')  // Too short
        .expect(400);
    });
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('End-to-End Flow', () => {
    it('should handle complete URL shortening workflow', async () => {
      const originalUrl = 'https://example.com/e2e/test';

      // Step 1: Create short URL
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: originalUrl })
        .expect(201);

      const shortId = createRes.body.id;
      expect(shortId).toHaveLength(6);

      // Step 2: Get details (should have 0 clicks)
      const details1 = await request(app)
        .get(`/api/urls/${shortId}`)
        .expect(200);
      expect(details1.body.clicks).toBe(0);

      // Step 3: Access short URL (redirect)
      await request(app)
        .get(`/${shortId}`)
        .expect(301)
        .expect('Location', originalUrl);

      // Step 4: Verify click was tracked
      const details2 = await request(app)
        .get(`/api/urls/${shortId}`)
        .expect(200);
      expect(details2.body.clicks).toBe(1);

      // Step 5: Access multiple times
      await request(app).get(`/${shortId}`).expect(301);
      await request(app).get(`/${shortId}`).expect(301);

      // Step 6: Verify final click count
      const details3 = await request(app)
        .get(`/api/urls/${shortId}`)
        .expect(200);
      expect(details3.body.clicks).toBe(3);
    });
  });
});

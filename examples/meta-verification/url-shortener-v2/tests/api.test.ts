import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { clearStorage } from '../src/storage/url.storage.js';

describe('URL Shortener API', () => {
  beforeEach(() => {
    clearStorage();
  });

  describe('POST /api/shorten', () => {
    it('should create a short URL and return 201', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/test' })
        .expect(201);

      expect(response.body.id).toHaveLength(6);
      expect(response.body.shortUrl).toContain(response.body.id);
      expect(response.body.originalUrl).toBe('https://example.com/test');
      expect(response.body.clicks).toBe(0);
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return 400 for missing URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body.code).toBe('URL_REQUIRED');
    });

    it('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for non-HTTP URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ url: 'ftp://example.com' })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/urls/:id', () => {
    it('should return URL details for existing ID', async () => {
      // First create a short URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/details' })
        .expect(201);

      const id = createResponse.body.id;

      // Then get its details
      const response = await request(app)
        .get(`/api/urls/${id}`)
        .expect(200);

      expect(response.body.id).toBe(id);
      expect(response.body.originalUrl).toBe('https://example.com/details');
      expect(response.body.clicks).toBe(0);
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .get('/api/urls/notfnd')
        .expect(404);

      expect(response.body.code).toBe('URL_NOT_FOUND');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/urls/short')
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should NOT increment clicks when getting details', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/no-increment' })
        .expect(201);

      const id = createResponse.body.id;

      // Get details multiple times
      await request(app).get(`/api/urls/${id}`).expect(200);
      await request(app).get(`/api/urls/${id}`).expect(200);
      await request(app).get(`/api/urls/${id}`).expect(200);

      // Check clicks is still 0
      const response = await request(app)
        .get(`/api/urls/${id}`)
        .expect(200);

      expect(response.body.clicks).toBe(0);
    });
  });

  describe('GET /:id (redirect)', () => {
    it('should redirect with 301 and increment clicks', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/redirect-test' })
        .expect(201);

      const id = createResponse.body.id;

      // Perform redirect
      const redirectResponse = await request(app)
        .get(`/${id}`)
        .expect(301);

      expect(redirectResponse.headers.location).toBe('https://example.com/redirect-test');

      // Check clicks incremented
      const detailsResponse = await request(app)
        .get(`/api/urls/${id}`)
        .expect(200);

      expect(detailsResponse.body.clicks).toBe(1);
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .get('/notfnd')
        .expect(404);

      expect(response.body.code).toBe('URL_NOT_FOUND');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/sh')
        .expect(400);

      expect(response.body.code).toBe('INVALID_SHORT_ID');
    });

    it('should increment clicks on each redirect', async () => {
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/click-count' })
        .expect(201);

      const id = createResponse.body.id;

      // Redirect 3 times
      await request(app).get(`/${id}`).expect(301);
      await request(app).get(`/${id}`).expect(301);
      await request(app).get(`/${id}`).expect(301);

      // Check clicks is 3
      const response = await request(app)
        .get(`/api/urls/${id}`)
        .expect(200);

      expect(response.body.clicks).toBe(3);
    });
  });
});

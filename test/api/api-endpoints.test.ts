/**
 * Test Suite for REST API Endpoint Handlers
 *
 * This test suite verifies the behavior of Express-style HTTP handlers
 * including success cases, error cases, and edge cases. Tests use Vitest
 * mocking to simulate request/response objects.
 *
 * @module api-endpoints.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGet, handlePost } from './api-endpoints';
import type { Request, Response, NextFunction } from './api-endpoints';

/**
 * Helper function to create a mock Request object.
 *
 * @param overrides - Partial request properties to override defaults
 * @returns Mock request object with sensible defaults
 */
function createMockRequest(overrides?: Partial<Request>): Request {
  return {
    method: 'GET',
    url: '/test',
    ...overrides,
  };
}

/**
 * Helper function to create a mock Response object.
 *
 * @returns Mock response object with chainable status() method
 */
function createMockResponse(): {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
} {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
  };
  // Make status() chainable
  res.status.mockReturnValue(res);
  return res;
}

/**
 * Helper function to create a mock next function.
 *
 * @returns Mock next function for error handling
 */
function createMockNext(): ReturnType<typeof vi.fn> {
  return vi.fn();
}

describe('api-endpoints module', () => {
  describe('handleGet', () => {
    let req: Request;
    let res: ReturnType<typeof createMockResponse>;
    let next: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Reset mocks before each test
      res = createMockResponse();
      next = createMockNext();
    });

    it('should handle successful GET request', async () => {
      req = createMockRequest({
        method: 'GET',
        url: '/api/users',
      });

      await handleGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'GET request successful',
        method: 'GET',
        url: '/api/users',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should include query parameters in response', async () => {
      req = createMockRequest({
        method: 'GET',
        url: '/api/users',
        query: { page: '1', limit: '10' },
      });

      await handleGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'GET request successful',
        method: 'GET',
        url: '/api/users',
        query: { page: '1', limit: '10' },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should include params in response', async () => {
      req = createMockRequest({
        method: 'GET',
        url: '/api/users/123',
        params: { id: '123' },
      });

      await handleGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'GET request successful',
        method: 'GET',
        url: '/api/users/123',
        params: { id: '123' },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle request without query or params', async () => {
      req = createMockRequest({
        method: 'GET',
        url: '/api/health',
      });

      await handleGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'GET request successful',
        method: 'GET',
        url: '/api/health',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() with error when URL is missing', async () => {
      req = createMockRequest({
        method: 'GET',
        url: '',
      });

      await handleGet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0] as Error;
      expect(error.message).toBe('Invalid request: missing URL');
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() with error when request is invalid', async () => {
      // @ts-expect-error Testing invalid request
      req = null;

      await handleGet(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0] as Error;
      expect(error.message).toBe('Invalid request: missing URL');
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 200 status code for successful requests', async () => {
      req = createMockRequest({
        method: 'GET',
        url: '/api/test',
      });

      await handleGet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status).toHaveBeenCalledTimes(1);
    });

    it('should return JSON response for successful requests', async () => {
      req = createMockRequest({
        method: 'GET',
        url: '/api/test',
        query: { search: 'test' },
        params: { id: '1' },
      });

      await handleGet(req, res, next);

      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          method: expect.any(String),
          url: expect.any(String),
        })
      );
    });
  });

  describe('handlePost', () => {
    let req: Request;
    let res: ReturnType<typeof createMockResponse>;
    let next: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Reset mocks before each test
      res = createMockResponse();
      next = createMockNext();
    });

    it('should handle successful POST request with body', async () => {
      req = createMockRequest({
        method: 'POST',
        url: '/api/users',
        body: { name: 'John Doe', email: 'john@example.com' },
      });

      await handlePost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'POST request successful',
        method: 'POST',
        url: '/api/users',
        body: { name: 'John Doe', email: 'john@example.com' },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should include body in response', async () => {
      req = createMockRequest({
        method: 'POST',
        url: '/api/products',
        body: { title: 'Product 1', price: 99.99 },
      });

      await handlePost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'POST request successful',
        method: 'POST',
        url: '/api/products',
        body: { title: 'Product 1', price: 99.99 },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle request without body', async () => {
      req = createMockRequest({
        method: 'POST',
        url: '/api/ping',
      });

      await handlePost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'POST request successful',
        method: 'POST',
        url: '/api/ping',
        body: undefined,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle JSON body', async () => {
      req = createMockRequest({
        method: 'POST',
        url: '/api/data',
        body: { items: [1, 2, 3], metadata: { count: 3 } },
      });

      await handlePost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'POST request successful',
        method: 'POST',
        url: '/api/data',
        body: { items: [1, 2, 3], metadata: { count: 3 } },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() with error when URL is missing', async () => {
      req = createMockRequest({
        method: 'POST',
        url: '',
        body: { data: 'test' },
      });

      await handlePost(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0] as Error;
      expect(error.message).toBe('Invalid request: missing URL');
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() with error when request is invalid', async () => {
      // @ts-expect-error Testing invalid request
      req = null;

      await handlePost(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0] as Error;
      expect(error.message).toBe('Invalid request: missing URL');
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 201 status code for successful requests', async () => {
      req = createMockRequest({
        method: 'POST',
        url: '/api/create',
        body: { data: 'new' },
      });

      await handlePost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.status).toHaveBeenCalledTimes(1);
    });

    it('should return JSON response for successful requests', async () => {
      req = createMockRequest({
        method: 'POST',
        url: '/api/submit',
        body: { value: 123 },
      });

      await handlePost(req, res, next);

      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          method: expect.any(String),
          url: expect.any(String),
          body: expect.anything(),
        })
      );
    });
  });
});

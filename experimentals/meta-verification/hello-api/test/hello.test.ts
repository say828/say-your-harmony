import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Hello API', () => {
  it('GET /hello returns Hello World message', async () => {
    const response = await request(app).get('/hello');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello, World!' });
  });
});

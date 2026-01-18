import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, notes } from '../src/index.js';

describe('Note API', () => {
  beforeEach(() => {
    // Clear notes before each test
    notes.clear();
  });

  describe('POST /api/notes', () => {
    it('should create a note with valid input', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: 'Test Note', content: 'Test Content' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'Test Note',
        content: 'Test Content',
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid input');
    });
  });

  describe('GET /api/notes', () => {
    it('should return empty array when no notes', async () => {
      const response = await request(app).get('/api/notes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all notes', async () => {
      // Create test notes
      await request(app)
        .post('/api/notes')
        .send({ title: 'Note 1', content: 'Content 1' });
      await request(app)
        .post('/api/notes')
        .send({ title: 'Note 2', content: 'Content 2' });

      const response = await request(app).get('/api/notes');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should return a note by id', async () => {
      const createResponse = await request(app)
        .post('/api/notes')
        .send({ title: 'Test Note', content: 'Test Content' });

      const noteId = createResponse.body.id;

      const response = await request(app).get(`/api/notes/${noteId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(noteId);
    });

    it('should return 404 for non-existent note', async () => {
      const response = await request(app).get('/api/notes/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Note not found');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', async () => {
      const createResponse = await request(app)
        .post('/api/notes')
        .send({ title: 'Test Note', content: 'Test Content' });

      const noteId = createResponse.body.id;

      const response = await request(app).delete(`/api/notes/${noteId}`);

      expect(response.status).toBe(204);

      // Verify note is deleted
      const getResponse = await request(app).get(`/api/notes/${noteId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent note', async () => {
      const response = await request(app).delete('/api/notes/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Note not found');
    });
  });
});

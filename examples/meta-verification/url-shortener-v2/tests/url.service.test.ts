import { describe, it, expect, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import {
  generateShortId,
  createShortUrl,
  getUrlDetails,
  redirectAndIncrement,
  ShortenSchema,
  ShortIdSchema,
} from '../src/services/url.service.js';
import { clearStorage } from '../src/storage/url.storage.js';

describe('URL Service', () => {
  beforeEach(() => {
    clearStorage();
  });

  describe('generateShortId', () => {
    it('should generate a 6-character alphanumeric ID', () => {
      const id = generateShortId();
      expect(id).toHaveLength(6);
      expect(id).toMatch(/^[A-Za-z0-9]{6}$/);
    });

    it('should generate different IDs on each call', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateShortId());
      }
      // With 62^6 possibilities, 100 IDs should all be unique
      expect(ids.size).toBe(100);
    });
  });

  describe('createShortUrl', () => {
    it('should create a short URL for valid HTTPS URL', () => {
      const entry = createShortUrl('https://example.com/path');

      expect(entry.id).toHaveLength(6);
      expect(entry.shortUrl).toContain(entry.id);
      expect(entry.originalUrl).toBe('https://example.com/path');
      expect(entry.clicks).toBe(0);
      expect(entry.createdAt).toBeDefined();
    });

    it('should create a short URL for valid HTTP URL', () => {
      const entry = createShortUrl('http://example.com');

      expect(entry.id).toHaveLength(6);
      expect(entry.originalUrl).toBe('http://example.com');
    });

    it('should reject invalid URL format', () => {
      expect(() => createShortUrl('not-a-url')).toThrow(ZodError);
    });

    it('should reject non-HTTP(S) protocols', () => {
      expect(() => createShortUrl('ftp://example.com')).toThrow(ZodError);
    });
  });

  describe('getUrlDetails', () => {
    it('should return URL details for existing ID', () => {
      const created = createShortUrl('https://example.com');
      const details = getUrlDetails(created.id);

      expect(details).toEqual(created);
    });

    it('should return null for non-existent ID', () => {
      const details = getUrlDetails('notfnd');
      expect(details).toBeNull();
    });

    it('should reject invalid ID format', () => {
      expect(() => getUrlDetails('short')).toThrow(ZodError);
      expect(() => getUrlDetails('toolong')).toThrow(ZodError);
    });
  });

  describe('redirectAndIncrement', () => {
    it('should return original URL and increment clicks', () => {
      const created = createShortUrl('https://example.com/redirect');

      const url1 = redirectAndIncrement(created.id);
      expect(url1).toBe('https://example.com/redirect');

      const details1 = getUrlDetails(created.id);
      expect(details1?.clicks).toBe(1);

      const url2 = redirectAndIncrement(created.id);
      expect(url2).toBe('https://example.com/redirect');

      const details2 = getUrlDetails(created.id);
      expect(details2?.clicks).toBe(2);
    });

    it('should return null for non-existent ID', () => {
      const url = redirectAndIncrement('notfnd');
      expect(url).toBeNull();
    });
  });

  describe('Validation Schemas', () => {
    it('ShortenSchema should accept valid HTTP/HTTPS URLs', () => {
      expect(() => ShortenSchema.parse({ url: 'https://example.com' })).not.toThrow();
      expect(() => ShortenSchema.parse({ url: 'http://example.com' })).not.toThrow();
    });

    it('ShortenSchema should reject invalid URLs', () => {
      expect(() => ShortenSchema.parse({ url: 'ftp://example.com' })).toThrow();
      expect(() => ShortenSchema.parse({ url: 'not-a-url' })).toThrow();
    });

    it('ShortIdSchema should accept valid 6-char alphanumeric IDs', () => {
      expect(() => ShortIdSchema.parse('abc123')).not.toThrow();
      expect(() => ShortIdSchema.parse('AbC123')).not.toThrow();
    });

    it('ShortIdSchema should reject invalid IDs', () => {
      expect(() => ShortIdSchema.parse('short')).toThrow();
      expect(() => ShortIdSchema.parse('toolong')).toThrow();
      expect(() => ShortIdSchema.parse('abc-12')).toThrow();
    });
  });
});

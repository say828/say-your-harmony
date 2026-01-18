/**
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import { CreateShortUrlSchema, ShortIdSchema } from '../src/validation/schemas.js';

describe('Validation Schemas', () => {
  describe('CreateShortUrlSchema', () => {
    it('should accept valid URLs', () => {
      const validUrls = [
        { url: 'https://example.com' },
        { url: 'http://example.com/path' },
        { url: 'https://sub.domain.example.com/path?query=1' },
        { url: 'https://example.com:8080/path' }
      ];

      validUrls.forEach(data => {
        expect(() => CreateShortUrlSchema.parse(data)).not.toThrow();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        { url: 'not-a-url' },
        { url: 'ftp://example.com' }, // Not http/https
        { url: '' },
        { url: 'example.com' }, // Missing protocol
        {}
      ];

      invalidUrls.forEach(data => {
        expect(() => CreateShortUrlSchema.parse(data)).toThrow();
      });
    });

    it('should reject missing url field', () => {
      expect(() => CreateShortUrlSchema.parse({})).toThrow();
    });

    it('should reject non-string url', () => {
      expect(() => CreateShortUrlSchema.parse({ url: 12345 })).toThrow();
    });
  });

  describe('ShortIdSchema', () => {
    it('should accept valid 6-char alphanumeric IDs', () => {
      const validIds = [
        'abc123',
        'XYZ789',
        'aB3xY9',
        '123456',
        'ABCDEF',
        'abcdef'
      ];

      validIds.forEach(id => {
        expect(() => ShortIdSchema.parse(id)).not.toThrow();
      });
    });

    it('should reject IDs with incorrect length', () => {
      const invalidIds = [
        'abc12',    // Too short (5 chars)
        'abc1234',  // Too long (7 chars)
        '',         // Empty
        'a'         // Too short (1 char)
      ];

      invalidIds.forEach(id => {
        expect(() => ShortIdSchema.parse(id)).toThrow();
      });
    });

    it('should reject IDs with invalid characters', () => {
      const invalidIds = [
        'abc-12',   // Contains hyphen
        'abc_12',   // Contains underscore
        'abc 12',   // Contains space
        'abc!12',   // Contains special char
        'абв123'    // Contains non-ASCII
      ];

      invalidIds.forEach(id => {
        expect(() => ShortIdSchema.parse(id)).toThrow();
      });
    });

    it('should reject non-string input', () => {
      expect(() => ShortIdSchema.parse(123456)).toThrow();
      expect(() => ShortIdSchema.parse(null)).toThrow();
      expect(() => ShortIdSchema.parse(undefined)).toThrow();
    });
  });
});

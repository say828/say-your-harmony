/**
 * Tests for URL storage layer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { urlStorage } from '../src/storage/url.storage.js';
import type { UrlRecord } from '../src/types/index.js';

describe('UrlStorage', () => {
  beforeEach(() => {
    urlStorage.clear();
  });

  describe('save', () => {
    it('should save a new URL record', () => {
      const record: UrlRecord = {
        id: 'abc123',
        longUrl: 'https://example.com',
        createdAt: new Date(),
        clicks: 0
      };

      const result = urlStorage.save(record);

      expect(result).toBe(true);
      expect(urlStorage.size()).toBe(1);
    });

    it('should return false on ID collision', () => {
      const record1: UrlRecord = {
        id: 'abc123',
        longUrl: 'https://example.com',
        createdAt: new Date(),
        clicks: 0
      };

      const record2: UrlRecord = {
        id: 'abc123', // Same ID
        longUrl: 'https://different.com',
        createdAt: new Date(),
        clicks: 0
      };

      urlStorage.save(record1);
      const result = urlStorage.save(record2);

      expect(result).toBe(false);
      expect(urlStorage.size()).toBe(1);
    });
  });

  describe('get', () => {
    it('should retrieve an existing URL record', () => {
      const record: UrlRecord = {
        id: 'xyz789',
        longUrl: 'https://example.com/long/path',
        createdAt: new Date(),
        clicks: 5
      };

      urlStorage.save(record);
      const retrieved = urlStorage.get('xyz789');

      expect(retrieved).toEqual(record);
    });

    it('should return undefined for non-existent ID', () => {
      const retrieved = urlStorage.get('nonexistent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('incrementClicks', () => {
    it('should increment click counter atomically', () => {
      const record: UrlRecord = {
        id: 'test99',
        longUrl: 'https://example.com',
        createdAt: new Date(),
        clicks: 0
      };

      urlStorage.save(record);

      const clicks1 = urlStorage.incrementClicks('test99');
      expect(clicks1).toBe(1);

      const clicks2 = urlStorage.incrementClicks('test99');
      expect(clicks2).toBe(2);

      const retrieved = urlStorage.get('test99');
      expect(retrieved?.clicks).toBe(2);
    });

    it('should return undefined for non-existent ID', () => {
      const result = urlStorage.incrementClicks('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for existing ID', () => {
      const record: UrlRecord = {
        id: 'exists',
        longUrl: 'https://example.com',
        createdAt: new Date(),
        clicks: 0
      };

      urlStorage.save(record);
      expect(urlStorage.has('exists')).toBe(true);
    });

    it('should return false for non-existent ID', () => {
      expect(urlStorage.has('nonexistent')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return correct count of stored URLs', () => {
      expect(urlStorage.size()).toBe(0);

      urlStorage.save({
        id: 'id1',
        longUrl: 'https://example.com/1',
        createdAt: new Date(),
        clicks: 0
      });

      expect(urlStorage.size()).toBe(1);

      urlStorage.save({
        id: 'id2',
        longUrl: 'https://example.com/2',
        createdAt: new Date(),
        clicks: 0
      });

      expect(urlStorage.size()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should remove all stored URLs', () => {
      urlStorage.save({
        id: 'id1',
        longUrl: 'https://example.com/1',
        createdAt: new Date(),
        clicks: 0
      });

      urlStorage.save({
        id: 'id2',
        longUrl: 'https://example.com/2',
        createdAt: new Date(),
        clicks: 0
      });

      expect(urlStorage.size()).toBe(2);

      urlStorage.clear();

      expect(urlStorage.size()).toBe(0);
      expect(urlStorage.has('id1')).toBe(false);
      expect(urlStorage.has('id2')).toBe(false);
    });
  });
});

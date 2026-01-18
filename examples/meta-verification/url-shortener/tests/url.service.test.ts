/**
 * Tests for URL service layer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createShortUrl, getUrlById, trackClickAndGetUrl } from '../src/services/url.service.js';
import { urlStorage } from '../src/storage/url.storage.js';

describe('UrlService', () => {
  beforeEach(() => {
    urlStorage.clear();
  });

  describe('createShortUrl', () => {
    it('should create a short URL with 6-char ID', () => {
      const longUrl = 'https://example.com/very/long/path';
      const record = createShortUrl(longUrl);

      expect(record.id).toHaveLength(6);
      expect(record.id).toMatch(/^[A-Za-z0-9]{6}$/);
      expect(record.longUrl).toBe(longUrl);
      expect(record.clicks).toBe(0);
      expect(record.createdAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for multiple URLs', () => {
      const url1 = 'https://example.com/path1';
      const url2 = 'https://example.com/path2';

      const record1 = createShortUrl(url1);
      const record2 = createShortUrl(url2);

      expect(record1.id).not.toBe(record2.id);
    });

    it('should store the created URL in storage', () => {
      const longUrl = 'https://example.com/stored';
      const record = createShortUrl(longUrl);

      const retrieved = urlStorage.get(record.id);
      expect(retrieved).toEqual(record);
    });
  });

  describe('getUrlById', () => {
    it('should retrieve URL by ID', () => {
      const longUrl = 'https://example.com/retrieve';
      const record = createShortUrl(longUrl);

      const retrieved = getUrlById(record.id);
      expect(retrieved).toEqual(record);
    });

    it('should return undefined for non-existent ID', () => {
      const result = getUrlById('nonexist');
      expect(result).toBeUndefined();
    });
  });

  describe('trackClickAndGetUrl', () => {
    it('should return long URL and increment click counter', () => {
      const longUrl = 'https://example.com/track';
      const record = createShortUrl(longUrl);

      const url1 = trackClickAndGetUrl(record.id);
      expect(url1).toBe(longUrl);

      const retrieved1 = urlStorage.get(record.id);
      expect(retrieved1?.clicks).toBe(1);

      const url2 = trackClickAndGetUrl(record.id);
      expect(url2).toBe(longUrl);

      const retrieved2 = urlStorage.get(record.id);
      expect(retrieved2?.clicks).toBe(2);
    });

    it('should return undefined for non-existent ID', () => {
      const result = trackClickAndGetUrl('nonexist');
      expect(result).toBeUndefined();
    });

    it('should not increment clicks if ID does not exist', () => {
      const longUrl = 'https://example.com/test';
      const record = createShortUrl(longUrl);

      trackClickAndGetUrl('nonexist');

      const retrieved = urlStorage.get(record.id);
      expect(retrieved?.clicks).toBe(0); // Should remain 0
    });
  });
});

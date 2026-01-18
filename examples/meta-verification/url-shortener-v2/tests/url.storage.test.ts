import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUrl,
  setUrl,
  hasUrl,
  incrementClicks,
  clearStorage,
  getStorageSize,
} from '../src/storage/url.storage.js';
import type { UrlEntry } from '../src/types/index.js';

describe('URL Storage', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('should store and retrieve a URL entry', () => {
    const entry: UrlEntry = {
      id: 'abc123',
      shortUrl: 'http://localhost:3000/abc123',
      originalUrl: 'https://example.com',
      clicks: 0,
      createdAt: new Date().toISOString(),
    };

    setUrl(entry);
    const retrieved = getUrl('abc123');

    expect(retrieved).toEqual(entry);
    expect(hasUrl('abc123')).toBe(true);
    expect(getStorageSize()).toBe(1);
  });

  it('should return undefined for non-existent ID', () => {
    expect(getUrl('notfound')).toBeUndefined();
    expect(hasUrl('notfound')).toBe(false);
  });

  it('should increment clicks correctly', () => {
    const entry: UrlEntry = {
      id: 'xyz789',
      shortUrl: 'http://localhost:3000/xyz789',
      originalUrl: 'https://example.org',
      clicks: 0,
      createdAt: new Date().toISOString(),
    };

    setUrl(entry);

    const updated1 = incrementClicks('xyz789');
    expect(updated1?.clicks).toBe(1);

    const updated2 = incrementClicks('xyz789');
    expect(updated2?.clicks).toBe(2);
  });

  it('should return undefined when incrementing non-existent ID', () => {
    const result = incrementClicks('notfound');
    expect(result).toBeUndefined();
  });
});

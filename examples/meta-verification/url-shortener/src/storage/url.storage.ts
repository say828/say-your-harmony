/**
 * In-memory storage layer using Map
 */

import type { UrlRecord } from '../types/index.js';

/**
 * In-memory URL storage using Map for O(1) lookups
 */
class UrlStorage {
  private storage: Map<string, UrlRecord>;

  constructor() {
    this.storage = new Map<string, UrlRecord>();
  }

  /**
   * Save a new URL record
   * @param record - URL record to save
   * @returns true if saved, false if ID already exists
   */
  save(record: UrlRecord): boolean {
    if (this.storage.has(record.id)) {
      return false; // ID collision
    }
    this.storage.set(record.id, record);
    return true;
  }

  /**
   * Get a URL record by ID
   * @param id - Short ID
   * @returns URL record or undefined if not found
   */
  get(id: string): UrlRecord | undefined {
    return this.storage.get(id);
  }

  /**
   * Increment click counter for a URL
   * @param id - Short ID
   * @returns Updated click count, or undefined if not found
   */
  incrementClicks(id: string): number | undefined {
    const record = this.storage.get(id);
    if (!record) {
      return undefined;
    }
    record.clicks += 1;
    return record.clicks;
  }

  /**
   * Check if an ID exists
   * @param id - Short ID
   * @returns true if ID exists
   */
  has(id: string): boolean {
    return this.storage.has(id);
  }

  /**
   * Get total number of stored URLs
   * @returns Count of URLs
   */
  size(): number {
    return this.storage.size;
  }

  /**
   * Clear all stored URLs (for testing)
   */
  clear(): void {
    this.storage.clear();
  }
}

/**
 * Singleton instance
 */
export const urlStorage = new UrlStorage();

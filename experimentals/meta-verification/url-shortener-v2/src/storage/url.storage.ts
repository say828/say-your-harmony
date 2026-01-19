import type { UrlEntry } from '../types/index.js';

/**
 * In-memory URL storage using Map for O(1) lookups
 */
const urlStorage = new Map<string, UrlEntry>();

/**
 * Get a URL entry by its short ID
 */
export function getUrl(id: string): UrlEntry | undefined {
  return urlStorage.get(id);
}

/**
 * Store a new URL entry
 */
export function setUrl(entry: UrlEntry): void {
  urlStorage.set(entry.id, entry);
}

/**
 * Check if a short ID exists
 */
export function hasUrl(id: string): boolean {
  return urlStorage.has(id);
}

/**
 * Increment the click counter for a URL
 * Returns the updated entry or undefined if not found
 */
export function incrementClicks(id: string): UrlEntry | undefined {
  const entry = urlStorage.get(id);
  if (!entry) return undefined;

  const updated: UrlEntry = {
    ...entry,
    clicks: entry.clicks + 1,
  };
  urlStorage.set(id, updated);
  return updated;
}

/**
 * Clear all URLs (for testing)
 */
export function clearStorage(): void {
  urlStorage.clear();
}

/**
 * Get storage size (for testing)
 */
export function getStorageSize(): number {
  return urlStorage.size;
}

/**
 * JSON Export Functions
 */

import type { MetaPattern, PatternStore } from '../core/schema.js';
import { loadPatternStore, loadAllPatterns } from '../core/storage.js';

/**
 * Export patterns as JSON string
 *
 * @param pretty - Pretty print (default true)
 * @returns JSON string
 */
export async function exportPatternsJson(pretty: boolean = true): Promise<string> {
  const patterns = await loadAllPatterns();
  return JSON.stringify(patterns, null, pretty ? 2 : 0);
}

/**
 * Export pattern store as JSON string
 *
 * @param pretty - Pretty print (default true)
 * @returns JSON string
 */
export async function exportStoreJson(pretty: boolean = true): Promise<string> {
  const store = await loadPatternStore();
  return JSON.stringify(store, null, pretty ? 2 : 0);
}

/**
 * Export patterns to file
 *
 * @param filePath - Output file path
 * @param pretty - Pretty print
 */
export async function exportPatternsToFile(filePath: string, pretty: boolean = true): Promise<void> {
  const json = await exportPatternsJson(pretty);
  const fs = await import('fs/promises');
  await fs.writeFile(filePath, json, 'utf-8');
}

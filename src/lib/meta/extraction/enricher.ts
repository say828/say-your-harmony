/**
 * Enricher - Add embeddings and tags to patterns
 */

import type { MetaPattern } from '../core/schema.js';

/**
 * Compute TF-IDF based embedding (simple version)
 *
 * @param text - Text to embed
 * @returns Embedding vector
 */
export function computeSimpleEmbedding(text: string): number[] {
  // Tokenize
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  // Simple bag of words with frequency
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  // Create fixed-size vector (100 dimensions)
  // Use hash to map tokens to dimensions
  const dimensions = 100;
  const vector = new Array(dimensions).fill(0);

  for (const [token, count] of freq.entries()) {
    const hash = simpleHash(token);
    const idx = hash % dimensions;
    vector[idx] += count;
  }

  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= magnitude;
    }
  }

  return vector;
}

/**
 * Simple string hash function
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Extract tags from pattern content
 *
 * @param pattern - Pattern
 * @returns Array of tags
 */
export function extractTags(pattern: MetaPattern): string[] {
  const tags: string[] = [];

  // Add phase as tag
  tags.push(pattern.phase);

  // Add type as tag
  tags.push(pattern.type);

  // Extract keywords from content (simple approach)
  const keywords = pattern.content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3) // Only words > 3 chars
    .filter((w) => !STOP_WORDS.has(w)); // Remove stop words

  // Add top 5 keywords
  const uniqueKeywords = [...new Set(keywords)];
  tags.push(...uniqueKeywords.slice(0, 5));

  return tags;
}

/**
 * Stop words to filter out
 */
const STOP_WORDS = new Set([
  'that',
  'this',
  'with',
  'from',
  'have',
  'been',
  'were',
  'their',
  'there',
  'would',
  'about',
  'which',
  'these',
  'should',
  'could',
]);

/**
 * Enrich pattern with embedding and tags
 *
 * @param pattern - Pattern to enrich
 * @returns Enriched pattern
 */
export function enrichPattern(pattern: MetaPattern): MetaPattern {
  return {
    ...pattern,
    embedding: computeSimpleEmbedding(pattern.content),
    tags: extractTags(pattern),
  };
}

/**
 * Enrich multiple patterns
 *
 * @param patterns - Patterns to enrich
 * @returns Enriched patterns
 */
export function enrichPatterns(patterns: MetaPattern[]): MetaPattern[] {
  return patterns.map(enrichPattern);
}

/**
 * Compute cosine similarity between two embedding vectors
 *
 * @param a - Vector A
 * @param b - Vector B
 * @returns Similarity score [0, 1]
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

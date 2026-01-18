/**
 * Deduplication Algorithm - TF-IDF based fuzzy matching
 *
 * Merges very similar patterns (>0.9 similarity) to reduce redundancy.
 */

import type { MetaPattern } from '../core/schema.js';

/**
 * Compute TF-IDF similarity between two texts
 *
 * @param text1 - First text
 * @param text2 - Second text
 * @returns Similarity score [0, 1]
 */
export function computeTfIdfSimilarity(text1: string, text2: string): number {
  // Tokenize
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  // Create term frequency maps
  const tf1 = computeTermFrequency(tokens1);
  const tf2 = computeTermFrequency(tokens2);

  // Get all unique terms
  const allTerms = new Set([...tokens1, ...tokens2]);

  // Compute cosine similarity using TF-IDF vectors
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (const term of allTerms) {
    const tf1Value = tf1.get(term) || 0;
    const tf2Value = tf2.get(term) || 0;

    dotProduct += tf1Value * tf2Value;
    magnitude1 += tf1Value * tf1Value;
    magnitude2 += tf2Value * tf2Value;
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Tokenize text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/**
 * Compute term frequency
 */
function computeTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize by document length
  const total = tokens.length;
  for (const [term, count] of tf.entries()) {
    tf.set(term, count / total);
  }

  return tf;
}

/**
 * Deduplicate patterns by merging similar ones
 *
 * @param patterns - Patterns to deduplicate
 * @param threshold - Similarity threshold (default 0.9)
 * @returns Deduplicated patterns
 */
export function deduplicatePatterns(
  patterns: MetaPattern[],
  threshold: number = 0.9
): MetaPattern[] {
  const deduplicated: MetaPattern[] = [];

  for (const pattern of patterns) {
    let merged = false;

    // Try to merge with existing pattern
    for (const existing of deduplicated) {
      // Only merge patterns of same type and phase
      if (existing.type !== pattern.type || existing.phase !== pattern.phase) {
        continue;
      }

      const similarity = computeTfIdfSimilarity(existing.content, pattern.content);

      if (similarity >= threshold) {
        // Merge: combine metadata
        existing.frequency += pattern.frequency;
        existing.confidence = Math.max(existing.confidence, pattern.confidence);

        // Update last seen to most recent
        if (new Date(pattern.lastSeen).getTime() > new Date(existing.lastSeen).getTime()) {
          existing.lastSeen = pattern.lastSeen;
        }

        // Merge examples (keep unique, max 5)
        const allExamples = [...existing.examples, ...pattern.examples];
        existing.examples = [...new Set(allExamples)].slice(0, 5);

        // Update score to max
        existing.score = Math.max(existing.score, pattern.score);

        merged = true;
        break;
      }
    }

    if (!merged) {
      // Add as new pattern
      deduplicated.push({ ...pattern });
    }
  }

  return deduplicated;
}

/**
 * Find duplicate patterns (for analysis)
 *
 * @param patterns - Patterns to analyze
 * @param threshold - Similarity threshold
 * @returns Groups of duplicate patterns
 */
export function findDuplicates(
  patterns: MetaPattern[],
  threshold: number = 0.9
): MetaPattern[][] {
  const groups: MetaPattern[][] = [];

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    let addedToGroup = false;

    for (const group of groups) {
      const representative = group[0];

      if (
        representative.type === pattern.type &&
        representative.phase === pattern.phase &&
        computeTfIdfSimilarity(representative.content, pattern.content) >= threshold
      ) {
        group.push(pattern);
        addedToGroup = true;
        break;
      }
    }

    if (!addedToGroup) {
      groups.push([pattern]);
    }
  }

  // Return only groups with 2+ members
  return groups.filter((g) => g.length > 1);
}

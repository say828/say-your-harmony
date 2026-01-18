/**
 * Confidence Scoring Algorithm
 *
 * Confidence = Frequency Score (70%) + Recency Score (30%)
 */

import type { MetaPattern } from '../core/schema.js';

/**
 * Calculate confidence score for a pattern
 *
 * Confidence combines:
 * - Frequency: How many times the pattern appears (saturates at 10)
 * - Recency: How recently it was last seen (7 days = max, 30 days = reduced, 90+ = low)
 *
 * @param pattern - Pattern to score
 * @returns Confidence score [0, 1]
 */
export function calculateConfidence(pattern: MetaPattern): number {
  // Frequency score: saturates at 10 occurrences
  const freqScore = Math.min(pattern.frequency / 10.0, 1.0);

  // Recency score: based on days since last seen
  const now = Date.now();
  const lastSeenTime = new Date(pattern.lastSeen).getTime();
  const daysSinceLastSeen = (now - lastSeenTime) / (1000 * 60 * 60 * 24);

  let recencyScore: number;
  if (daysSinceLastSeen < 7) {
    recencyScore = 1.0; // Within a week: maximum bonus
  } else if (daysSinceLastSeen < 30) {
    recencyScore = 0.8; // Within a month: good
  } else if (daysSinceLastSeen < 90) {
    recencyScore = 0.5; // Within 3 months: moderate
  } else {
    recencyScore = 0.3; // Older: low recency
  }

  // Weighted combination: 70% frequency, 30% recency
  return freqScore * 0.7 + recencyScore * 0.3;
}

/**
 * Recalculate confidence for all patterns
 *
 * @param patterns - Patterns to update
 * @returns Updated patterns
 */
export function recalculateConfidence(patterns: MetaPattern[]): MetaPattern[] {
  return patterns.map((pattern) => ({
    ...pattern,
    confidence: calculateConfidence(pattern),
  }));
}

/**
 * Filter patterns by minimum confidence threshold
 *
 * @param patterns - Patterns to filter
 * @param minConfidence - Minimum confidence (default 0.5)
 * @returns Filtered patterns
 */
export function filterByConfidence(
  patterns: MetaPattern[],
  minConfidence: number = 0.5
): MetaPattern[] {
  return patterns.filter((p) => p.confidence >= minConfidence);
}

/**
 * Get high-confidence patterns (>0.7)
 *
 * @param patterns - Patterns to filter
 * @returns High-confidence patterns
 */
export function getHighConfidencePatterns(patterns: MetaPattern[]): MetaPattern[] {
  return filterByConfidence(patterns, 0.7);
}

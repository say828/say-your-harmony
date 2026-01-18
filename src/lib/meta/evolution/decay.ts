/**
 * Time Decay Algorithm
 *
 * Score = Confidence × Decay Factor
 * Decay Factor = 0.5^(days / half-life)
 *
 * Default half-life: 90 days
 */

import type { MetaPattern } from '../core/schema.js';

/**
 * Apply time decay to pattern score
 *
 * Uses exponential decay with configurable half-life (default 90 days).
 * Older patterns naturally fade away.
 *
 * @param pattern - Pattern to apply decay to
 * @param halfLifeDays - Half-life in days (default 90)
 * @returns Decayed score
 */
export function applyDecay(pattern: MetaPattern, halfLifeDays: number = 90): number {
  const now = Date.now();
  const lastSeenTime = new Date(pattern.lastSeen).getTime();
  const daysSinceLastSeen = (now - lastSeenTime) / (1000 * 60 * 60 * 24);

  // Exponential decay: 0.5^(t / half-life)
  const decayFactor = Math.pow(0.5, daysSinceLastSeen / halfLifeDays);

  return pattern.confidence * decayFactor;
}

/**
 * Apply decay to all patterns and update scores
 *
 * @param patterns - Patterns to apply decay to
 * @param halfLifeDays - Half-life in days (default 90)
 * @returns Updated patterns with decayed scores
 */
export function applyDecayToAll(
  patterns: MetaPattern[],
  halfLifeDays: number = 90
): MetaPattern[] {
  return patterns.map((pattern) => ({
    ...pattern,
    score: applyDecay(pattern, halfLifeDays),
  }));
}

/**
 * Get decay factor for a pattern
 *
 * @param daysSinceLastSeen - Days since pattern was last seen
 * @param halfLifeDays - Half-life in days
 * @returns Decay factor [0, 1]
 */
export function getDecayFactor(daysSinceLastSeen: number, halfLifeDays: number): number {
  return Math.pow(0.5, daysSinceLastSeen / halfLifeDays);
}

/**
 * Estimate when a pattern will decay below threshold
 *
 * @param currentScore - Current score
 * @param threshold - Target threshold
 * @param halfLifeDays - Half-life in days
 * @returns Days until below threshold
 */
export function daysUntilBelowThreshold(
  currentScore: number,
  threshold: number,
  halfLifeDays: number
): number {
  if (currentScore <= threshold) return 0;

  // Solve: threshold = currentScore × 0.5^(days / halfLife)
  // days = halfLife × log2(currentScore / threshold)
  const ratio = currentScore / threshold;
  const days = halfLifeDays * Math.log2(ratio);

  return Math.max(0, days);
}

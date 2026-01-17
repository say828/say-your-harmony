/**
 * Decay Scorer - Time-based pattern scoring
 *
 * Implements multiple decay algorithms:
 * - Exponential: Aggressive decay for recent-focused scoring
 * - Linear: Predictable decay with hard cutoff
 * - Hybrid: Balanced approach considering recency, frequency, and success rate
 */

import type { Pattern } from '../types/pattern.js';
import type { PatternConfig } from '../types/config.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Compute decay score for a pattern
 */
export function computeDecayScore(pattern: Pattern, config: PatternConfig): number {
  switch (config.decay.algorithm) {
    case 'exponential':
      return exponentialDecay(pattern, config);
    case 'linear':
      return linearDecay(pattern, config);
    case 'hybrid':
    default:
      return hybridDecay(pattern, config);
  }
}

/**
 * Exponential decay: score halves every HALF_LIFE days
 * Best for: Recent-focused systems where old patterns should fade quickly
 */
function exponentialDecay(pattern: Pattern, config: PatternConfig): number {
  const daysSinceLastSeen = getDaysSince(pattern.lastSeen);
  const decayFactor = Math.pow(0.5, daysSinceLastSeen / config.decay.halfLifeDays);

  return pattern.frequency * decayFactor * pattern.successRate;
}

/**
 * Linear decay: score decreases linearly to 0 at MAX_AGE
 * Best for: Predictable behavior with hard cutoff
 */
function linearDecay(pattern: Pattern, config: PatternConfig): number {
  const daysSinceLastSeen = getDaysSince(pattern.lastSeen);
  const maxAge = config.decay.halfLifeDays * 2;  // 2x half-life = max age
  const decayFactor = Math.max(0, 1 - (daysSinceLastSeen / maxAge));

  return pattern.frequency * decayFactor * pattern.successRate;
}

/**
 * Hybrid decay: balanced scoring with logarithmic frequency
 * Best for: Production systems requiring balanced consideration
 *
 * Formula:
 * score = (recency_weight × recency_score) +
 *         (frequency_weight × frequency_score) +
 *         (success_weight × success_score)
 */
function hybridDecay(pattern: Pattern, config: PatternConfig): number {
  const daysSinceLastSeen = getDaysSince(pattern.lastSeen);

  // Recency score (exponential decay)
  const recencyScore = Math.pow(0.5, daysSinceLastSeen / config.decay.halfLifeDays);

  // Frequency score (logarithmic to prevent domination)
  // log2(freq + 1) so freq=1 → 1.0, freq=3 → 2.0, freq=7 → 3.0, freq=15 → 4.0
  const frequencyScore = Math.log2(pattern.frequency + 1);

  // Success rate score (linear, 0.0 - 1.0)
  const successScore = pattern.successRate;

  // Weighted combination
  const { recency, frequency, successRate } = config.decay.weights;

  return (
    recencyScore * recency +
    frequencyScore * frequency +
    successScore * successRate
  );
}

/**
 * Get days since a timestamp
 */
function getDaysSince(isoTimestamp: string): number {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  return (now - then) / MS_PER_DAY;
}

/**
 * Recompute all decay scores for a list of patterns
 */
export function recomputeScores(patterns: Pattern[], config: PatternConfig): void {
  for (const pattern of patterns) {
    pattern.decayScore = computeDecayScore(pattern, config);
  }
}

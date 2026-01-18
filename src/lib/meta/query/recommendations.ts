/**
 * Pattern Recommendations
 */

import type { MetaPattern, Phase } from '../core/schema.js';
import { loadPatternsByPhase } from '../core/storage.js';

/**
 * Get recommended patterns for a phase
 *
 * Returns high-confidence patterns that are relevant.
 *
 * @param phase - Phase to get recommendations for
 * @param limit - Maximum recommendations
 * @returns Recommended patterns
 */
export async function recommendPatterns(
  phase: Phase,
  limit: number = 10
): Promise<MetaPattern[]> {
  const patterns = await loadPatternsByPhase(phase);

  // Filter high confidence (>0.7) and sort by score
  return patterns
    .filter((p) => p.confidence > 0.7)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get safe parallel execution patterns
 *
 * @param phase - Phase
 * @returns Parallel success patterns with high confidence
 */
export async function getSafeParallelPatterns(phase: Phase): Promise<MetaPattern[]> {
  const patterns = await loadPatternsByPhase(phase);

  return patterns
    .filter((p) => p.type === 'parallel-success' && p.confidence > 0.7)
    .sort((a, b) => b.score - a.score);
}

/**
 * Get anti-patterns to avoid
 *
 * @param phase - Phase
 * @returns Anti-patterns
 */
export async function getAntiPatterns(phase: Phase): Promise<MetaPattern[]> {
  const patterns = await loadPatternsByPhase(phase);

  return patterns
    .filter((p) => p.type === 'anti-pattern')
    .sort((a, b) => b.frequency - a.frequency);
}

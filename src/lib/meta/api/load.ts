/**
 * Load API - Load patterns with filters
 */

import type { MetaPattern, Phase, PatternType } from '../core/schema.js';
import { loadAllPatterns, loadPatternsByPhase } from '../core/storage.js';
import { getHighConfidencePatterns } from '../evolution/confidence.js';

/**
 * Load patterns with optional filters
 *
 * @param options - Filter options
 * @returns Filtered patterns
 */
export async function loadPatterns(options?: {
  phase?: Phase;
  type?: PatternType;
  minConfidence?: number;
}): Promise<MetaPattern[]> {
  let patterns: MetaPattern[];

  if (options?.phase) {
    patterns = await loadPatternsByPhase(options.phase);
  } else {
    patterns = await loadAllPatterns();
  }

  if (options?.type) {
    patterns = patterns.filter((p) => p.type === options.type);
  }

  if (options?.minConfidence !== undefined) {
    patterns = patterns.filter((p) => p.confidence >= options.minConfidence!);
  }

  return patterns;
}

/**
 * Load high-confidence patterns (>0.7)
 *
 * @param phase - Optional phase filter
 * @returns High-confidence patterns
 */
export async function loadHighConfidencePatterns(phase?: Phase): Promise<MetaPattern[]> {
  let patterns: MetaPattern[];

  if (phase) {
    patterns = await loadPatternsByPhase(phase);
  } else {
    patterns = await loadAllPatterns();
  }

  return getHighConfidencePatterns(patterns);
}

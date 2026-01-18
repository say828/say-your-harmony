/**
 * Eviction Algorithm - Remove low-score patterns
 *
 * Keeps top N patterns per phase (default 100) based on score.
 * Protects high-frequency (≥5) and recent (≤7 days) patterns.
 */

import type { MetaPattern, Phase } from '../core/schema.js';

/**
 * Eviction policy
 */
export interface EvictionPolicy {
  /** Maximum patterns per phase */
  maxPerPhase: number;

  /** Protect patterns with frequency >= this value */
  protectFrequency: number;

  /** Protect patterns seen within this many days */
  protectDays: number;
}

/**
 * Default eviction policy
 */
export const DEFAULT_EVICTION_POLICY: EvictionPolicy = {
  maxPerPhase: 100,
  protectFrequency: 5,
  protectDays: 7,
};

/**
 * Evict low-score patterns
 *
 * @param patterns - Patterns to evict from
 * @param policy - Eviction policy
 * @returns Kept patterns
 */
export function evictLowScorePatterns(
  patterns: MetaPattern[],
  policy: EvictionPolicy = DEFAULT_EVICTION_POLICY
): MetaPattern[] {
  // Group by phase
  const byPhase: Record<Phase, MetaPattern[]> = {
    planning: [],
    design: [],
    implementation: [],
    operation: [],
  };

  for (const pattern of patterns) {
    byPhase[pattern.phase].push(pattern);
  }

  // Evict from each phase independently
  const kept: MetaPattern[] = [];

  for (const phase of Object.keys(byPhase) as Phase[]) {
    const phasePatterns = byPhase[phase];

    // Sort by score descending
    const sorted = [...phasePatterns].sort((a, b) => b.score - a.score);

    // Separate protected and unprotected
    const protected_patterns = sorted.filter((p) => isProtected(p, policy));
    const unprotected = sorted.filter((p) => !isProtected(p, policy));

    // Keep all protected + top N unprotected
    const remainingSlots = Math.max(0, policy.maxPerPhase - protected_patterns.length);
    const toKeep = [...protected_patterns, ...unprotected.slice(0, remainingSlots)];

    kept.push(...toKeep);
  }

  return kept;
}

/**
 * Check if pattern is protected from eviction
 *
 * @param pattern - Pattern to check
 * @param policy - Eviction policy
 * @returns True if protected
 */
function isProtected(pattern: MetaPattern, policy: EvictionPolicy): boolean {
  // High frequency protection
  if (pattern.frequency >= policy.protectFrequency) {
    return true;
  }

  // Recency protection
  const now = Date.now();
  const lastSeenTime = new Date(pattern.lastSeen).getTime();
  const daysSinceLastSeen = (now - lastSeenTime) / (1000 * 60 * 60 * 24);

  if (daysSinceLastSeen <= policy.protectDays) {
    return true;
  }

  return false;
}

/**
 * Get eviction candidates (patterns that would be removed)
 *
 * @param patterns - Patterns to analyze
 * @param policy - Eviction policy
 * @returns Patterns that would be evicted
 */
export function getEvictionCandidates(
  patterns: MetaPattern[],
  policy: EvictionPolicy = DEFAULT_EVICTION_POLICY
): MetaPattern[] {
  const kept = new Set(evictLowScorePatterns(patterns, policy).map((p) => p.id));
  return patterns.filter((p) => !kept.has(p.id));
}

/**
 * Get eviction statistics
 *
 * @param patterns - Patterns to analyze
 * @param policy - Eviction policy
 * @returns Statistics
 */
export function getEvictionStats(
  patterns: MetaPattern[],
  policy: EvictionPolicy = DEFAULT_EVICTION_POLICY
): {
  total: number;
  toKeep: number;
  toEvict: number;
  protected: number;
  byPhase: Record<Phase, { total: number; toKeep: number; toEvict: number }>;
} {
  const kept = evictLowScorePatterns(patterns, policy);
  const keptIds = new Set(kept.map((p) => p.id));
  const evicted = patterns.filter((p) => !keptIds.has(p.id));
  const protected_patterns = patterns.filter((p) => isProtected(p, policy));

  const byPhase: Record<Phase, { total: number; toKeep: number; toEvict: number }> = {
    planning: { total: 0, toKeep: 0, toEvict: 0 },
    design: { total: 0, toKeep: 0, toEvict: 0 },
    implementation: { total: 0, toKeep: 0, toEvict: 0 },
    operation: { total: 0, toKeep: 0, toEvict: 0 },
  };

  for (const pattern of patterns) {
    byPhase[pattern.phase].total++;
  }

  for (const pattern of kept) {
    byPhase[pattern.phase].toKeep++;
  }

  for (const pattern of evicted) {
    byPhase[pattern.phase].toEvict++;
  }

  return {
    total: patterns.length,
    toKeep: kept.length,
    toEvict: evicted.length,
    protected: protected_patterns.length,
    byPhase,
  };
}

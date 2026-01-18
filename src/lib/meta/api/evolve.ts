/**
 * Evolution API - Run evolution pipeline
 */

import type { Phase } from '../core/schema.js';
import { loadPatternsByPhase, loadAllPatterns, savePatterns } from '../core/storage.js';
import { recalculateConfidence } from '../evolution/confidence.js';
import { applyDecayToAll } from '../evolution/decay.js';
import { clusterPatterns, assignClusterIds } from '../evolution/clustering.js';
import { deduplicatePatterns } from '../evolution/deduplication.js';
import { evictLowScorePatterns } from '../evolution/eviction.js';

/**
 * Run evolution pipeline for a phase
 *
 * Pipeline:
 * 1. Recalculate confidence
 * 2. Apply decay
 * 3. Deduplicate
 * 4. Cluster
 * 5. Evict low scores
 * 6. Save evolved patterns
 *
 * @param phase - Phase to evolve
 */
export async function evolvePatterns(phase: Phase): Promise<void> {
  // Load patterns for phase
  let patterns = await loadPatternsByPhase(phase);

  if (patterns.length === 0) return;

  // 1. Recalculate confidence
  patterns = recalculateConfidence(patterns);

  // 2. Apply decay
  patterns = applyDecayToAll(patterns, 90); // 90-day half-life

  // 3. Deduplicate
  patterns = deduplicatePatterns(patterns, 0.9);

  // 4. Cluster
  const clusters = clusterPatterns(patterns, 0.75);
  patterns = assignClusterIds(patterns, clusters);

  // 5. Evict low scores
  patterns = evictLowScorePatterns(patterns);

  // 6. Save evolved patterns
  await savePatterns(patterns);
}

/**
 * Run evolution for all phases
 */
export async function evolveAllPhases(): Promise<void> {
  const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];

  for (const phase of phases) {
    await evolvePatterns(phase);
  }
}

/**
 * Save API - Save patterns from semantic meta
 */

import type { SemanticPhaseMeta } from '../../../types/semantic-meta.js';
import type { MetaPattern, Phase } from '../core/schema.js';
import { extractPatterns, mergePatterns } from '../extraction/extractor.js';
import { enrichPatterns } from '../extraction/enricher.js';
import { loadAllPatterns, savePatterns } from '../core/storage.js';

/**
 * Save meta patterns from SemanticPhaseMeta
 *
 * Main entry point for saving patterns from phase completion.
 *
 * @param sessionId - Session ID
 * @param phase - Phase
 * @param semanticMeta - Semantic phase meta from LLM
 */
export async function saveMetaPatternsFromSemanticMeta(
  sessionId: string,
  phase: Phase,
  semanticMeta: SemanticPhaseMeta
): Promise<void> {
  // 1. Extract patterns
  const newPatterns = extractPatterns(semanticMeta, sessionId);

  // 2. Enrich with embeddings and tags
  const enriched = enrichPatterns(newPatterns);

  // 3. Load existing patterns
  const existing = await loadAllPatterns();

  // 4. Merge
  const merged = mergePatterns(existing, enriched);

  // 5. Save
  await savePatterns(merged);
}

/**
 * Save meta patterns directly (for manual use)
 *
 * @param patterns - Patterns to save
 */
export async function saveMetaPatterns(patterns: MetaPattern[]): Promise<void> {
  const existing = await loadAllPatterns();
  const merged = mergePatterns(existing, patterns);
  await savePatterns(merged);
}

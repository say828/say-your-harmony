/**
 * Search and Query Functions
 */

import type { MetaPattern, Phase, PatternType } from '../core/schema.js';
import { loadAllPatterns, loadPatternsByPhase, loadPatternsByType } from '../core/storage.js';

/**
 * Search patterns by text query
 *
 * @param query - Search query
 * @param patterns - Patterns to search (optional, loads all if not provided)
 * @returns Matching patterns
 */
export async function searchPatterns(query: string, patterns?: MetaPattern[]): Promise<MetaPattern[]> {
  const allPatterns = patterns || (await loadAllPatterns());
  const queryLower = query.toLowerCase();

  return allPatterns.filter((p) =>
    p.content.toLowerCase().includes(queryLower) ||
    p.description?.toLowerCase().includes(queryLower) ||
    p.tags?.some((t) => t.toLowerCase().includes(queryLower))
  );
}

/**
 * Search patterns by phase and type
 *
 * @param phase - Phase filter (optional)
 * @param type - Type filter (optional)
 * @returns Matching patterns
 */
export async function searchByPhaseAndType(
  phase?: Phase,
  type?: PatternType
): Promise<MetaPattern[]> {
  let patterns: MetaPattern[];

  if (phase) {
    patterns = await loadPatternsByPhase(phase);
  } else {
    patterns = await loadAllPatterns();
  }

  if (type) {
    patterns = patterns.filter((p) => p.type === type);
  }

  return patterns;
}

/**
 * Search patterns by tags
 *
 * @param tags - Tags to match (any)
 * @returns Matching patterns
 */
export async function searchByTags(tags: string[]): Promise<MetaPattern[]> {
  const allPatterns = await loadAllPatterns();
  const tagsLower = tags.map((t) => t.toLowerCase());

  return allPatterns.filter((p) =>
    p.tags?.some((tag) => tagsLower.includes(tag.toLowerCase()))
  );
}

/**
 * Get top patterns by score
 *
 * @param limit - Number of patterns to return
 * @param phase - Optional phase filter
 * @returns Top patterns
 */
export async function getTopPatterns(limit: number = 10, phase?: Phase): Promise<MetaPattern[]> {
  let patterns: MetaPattern[];

  if (phase) {
    patterns = await loadPatternsByPhase(phase);
  } else {
    patterns = await loadAllPatterns();
  }

  return patterns.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Get patterns by confidence threshold
 *
 * @param minConfidence - Minimum confidence
 * @param phase - Optional phase filter
 * @returns Patterns above threshold
 */
export async function getPatternsByConfidence(
  minConfidence: number,
  phase?: Phase
): Promise<MetaPattern[]> {
  let patterns: MetaPattern[];

  if (phase) {
    patterns = await loadPatternsByPhase(phase);
  } else {
    patterns = await loadAllPatterns();
  }

  return patterns.filter((p) => p.confidence >= minConfidence);
}

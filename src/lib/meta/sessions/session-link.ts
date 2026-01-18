/**
 * Session-Pattern Linking
 */

import type { SessionSummary, Phase } from '../core/schema.js';
import { loadPatternsByPhase } from '../core/storage.js';

/**
 * Get patterns generated in a session
 *
 * @param sessionId - Session ID
 * @param phase - Optional phase filter
 * @returns Pattern IDs
 */
export async function getPatternsForSession(
  sessionId: string,
  phase?: Phase
): Promise<string[]> {
  let patterns;

  if (phase) {
    patterns = await loadPatternsByPhase(phase);
  } else {
    const { loadAllPatterns } = await import('../core/storage.js');
    patterns = await loadAllPatterns();
  }

  return patterns.filter((p) => p.examples.includes(sessionId)).map((p) => p.id);
}

/**
 * Link patterns to session summary
 *
 * @param session - Session summary
 * @returns Updated session with pattern IDs
 */
export async function linkPatternsToSession(session: SessionSummary): Promise<SessionSummary> {
  const patternIds = await getPatternsForSession(session.sessionId);

  return {
    ...session,
    patternIds,
    totalPatterns: patternIds.length,
  };
}

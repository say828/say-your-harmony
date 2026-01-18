/**
 * Aggregation API - Session aggregation and PATTERNS.md generation
 */

import type { SessionSummary, Phase } from '../core/schema.js';
import { saveSession } from '../sessions/session-store.js';
import { linkPatternsToSession } from '../sessions/session-link.js';
import { generatePatternsMd } from '../export/markdown.js';
import { evolveAllPhases } from './evolve.js';

/**
 * Aggregate session and generate outputs
 *
 * Called after Phase 4 (Operation) completes.
 *
 * @param sessionId - Session ID
 * @param phases - Completed phases
 * @param startTime - Session start time
 * @param endTime - Session end time
 */
export async function aggregateSession(
  sessionId: string,
  phases: Phase[],
  startTime: string,
  endTime: string
): Promise<void> {
  // 1. Create session summary
  let session: SessionSummary = {
    sessionId,
    startTime,
    endTime,
    phases,
    patternIds: [],
    totalPatterns: 0,
  };

  // 2. Link patterns to session
  session = await linkPatternsToSession(session);

  // 3. Save session
  await saveSession(session);

  // 4. Run global evolution
  await evolveAllPhases();

  // 5. Generate PATTERNS.md
  await generatePatternsMd();
}

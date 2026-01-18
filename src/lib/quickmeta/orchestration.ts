/**
 * QuickMeta Orchestration - Harmony integration hooks
 *
 * Provides onPhaseComplete() and startPhase() functions
 * for seamless integration with the Harmony orchestrator.
 */

import type { Phase } from '../../types/pattern.js';
import type { QuickMeta, PhaseInsight, PhaseMetrics } from '../../types/quickmeta.js';
import { extractQuickPatterns } from './extractor.js';
import { saveQuickMeta, buildPhaseInsight, generateSessionId } from './storage.js';

/**
 * Context for phase completion handling
 */
export interface PhaseCompletionContext {
  sessionId: string;
  phase: Phase;
  agentOutput: string;
  toolUsage?: Record<string, number>;
  startTime: number;
  endTime: number;
  delegationCount: number;
  parallelTaskCount: number;
}

/**
 * Called when a phase completes
 * Extracts QuickMeta and saves to disk
 *
 * Performance: < 100ms total
 */
export async function onPhaseComplete(ctx: PhaseCompletionContext): Promise<QuickMeta> {
  // Extract patterns using rule-based algorithm
  const extraction = extractQuickPatterns({
    content: ctx.agentOutput,
    phase: ctx.phase,
    toolUsage: ctx.toolUsage,
    durationMs: ctx.endTime - ctx.startTime,
  });

  // Build metrics
  const metrics: PhaseMetrics = {
    durationMs: ctx.endTime - ctx.startTime,
    toolCalls: ctx.toolUsage ? Object.values(ctx.toolUsage).reduce((a, b) => a + b, 0) : 0,
    delegations: ctx.delegationCount,
    parallelTasks: ctx.parallelTaskCount,
  };

  // Generate handoff note based on phase
  const handoffNote = generateHandoffNote(ctx.phase, extraction.summary);

  // Assemble QuickMeta
  const meta: QuickMeta = {
    version: 1,
    sessionId: ctx.sessionId,
    phase: ctx.phase,
    completedAt: new Date().toISOString(),
    summary: extraction.summary,
    patterns: extraction.patterns,
    decisions: extraction.decisions,
    risks: extraction.risks,
    metrics,
    handoffNote,
  };

  // Save to disk
  await saveQuickMeta(meta);

  return meta;
}

/**
 * Generate handoff note for next phase
 */
function generateHandoffNote(phase: Phase, summary: string): string {
  const nextPhaseHints: Record<Phase, string> = {
    planning: 'Ready for architecture design. Requirements clarified.',
    design: 'Architecture complete. Ready for implementation.',
    implementation: 'Code complete. Ready for deployment verification.',
    operation: 'Deployment verified. Session complete.',
  };

  return `${nextPhaseHints[phase]} ${summary}`.slice(0, 200);
}

/**
 * Called before starting a phase
 * Returns insight to inject into agent prompt
 */
export async function startPhase(
  sessionId: string,
  phase: Phase
): Promise<{ insight: PhaseInsight | null; injectionText: string }> {
  const insight = await buildPhaseInsight(sessionId, phase);

  if (!insight) {
    return { insight: null, injectionText: '' };
  }

  return {
    insight,
    injectionText: insight.formatted,
  };
}

/**
 * Create or retrieve session ID
 * Should be called once at the start of a /harmony workflow
 */
export function initSession(): string {
  return generateSessionId();
}

/**
 * Session state for Harmony to track
 */
export interface HarmonySessionState {
  sessionId: string;
  currentPhase: Phase | null;
  phaseStartTime: number;
  completedPhases: Phase[];
  quickMetas: Partial<Record<Phase, QuickMeta>>;
}

/**
 * Create initial session state
 */
export function createSessionState(): HarmonySessionState {
  return {
    sessionId: generateSessionId(),
    currentPhase: null,
    phaseStartTime: 0,
    completedPhases: [],
    quickMetas: {},
  };
}

/**
 * Update session state when entering a phase
 */
export function enterPhase(state: HarmonySessionState, phase: Phase): HarmonySessionState {
  return {
    ...state,
    currentPhase: phase,
    phaseStartTime: Date.now(),
  };
}

/**
 * Update session state when completing a phase
 */
export function completePhase(
  state: HarmonySessionState,
  phase: Phase,
  meta: QuickMeta
): HarmonySessionState {
  return {
    ...state,
    currentPhase: null,
    completedPhases: [...state.completedPhases, phase],
    quickMetas: {
      ...state.quickMetas,
      [phase]: meta,
    },
  };
}

/**
 * Get phase duration from session state
 */
export function getPhaseDuration(state: HarmonySessionState): number {
  if (state.phaseStartTime === 0) {
    return 0;
  }
  return Date.now() - state.phaseStartTime;
}

/**
 * Check if all phases are complete
 */
export function isSessionComplete(state: HarmonySessionState): boolean {
  const allPhases: Phase[] = ['planning', 'design', 'implementation', 'operation'];
  return allPhases.every((phase) => state.completedPhases.includes(phase));
}

/**
 * Generate a summary of the session state
 */
export function getSessionSummary(state: HarmonySessionState): string {
  const lines: string[] = [
    `Session: ${state.sessionId}`,
    `Completed: ${state.completedPhases.join(' → ') || 'None'}`,
    `Current: ${state.currentPhase || 'N/A'}`,
  ];

  if (state.currentPhase && state.phaseStartTime > 0) {
    const duration = Math.round(getPhaseDuration(state) / 1000);
    lines.push(`Duration: ${duration}s`);
  }

  return lines.join('\n');
}

/**
 * Semantic Meta Types - LLM-based semantic pattern extraction
 *
 * Version 2 of meta-analysis: Replaces rule-based QuickMeta with LLM-extracted
 * semantic patterns. Provides richer context while maintaining compact storage.
 *
 * ## Overview
 *
 * Semantic meta-analysis uses LLM to extract meaningful patterns from phase outputs:
 * - What was accomplished (accomplishment)
 * - Key insights and learnings (keyInsight)
 * - Strategic decisions with rationale (decisions)
 * - Challenges and resolutions (challenges)
 * - Risks with severity and status (risks)
 * - Approach patterns and tool usage (approaches, toolsUsed)
 *
 * ## Design Goals
 *
 * 1. **Semantic Understanding**: LLM extracts meaning, not just keywords
 * 2. **Compact Storage**: Enforced character limits (< 2KB per phase)
 * 3. **Context Propagation**: Handoff context flows to next phase
 * 4. **Background Extraction**: Non-blocking LLM analysis
 * 5. **Session Aggregation**: Cross-phase patterns and insights
 *
 * ## Type Hierarchy
 *
 * ```
 * SemanticPhaseMeta (per-phase)
 *   ├── SemanticExtractions (LLM-generated)
 *   ├── PhaseHandoff (context for next phase)
 *   └── PhaseMetrics (quantitative data)
 *
 * SessionAggregatedMeta (session-wide)
 *   ├── PhaseSummary (per phase)
 *   ├── CrossPhasePattern (spanning phases)
 *   └── SessionInsights (holistic view)
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * // Extract semantic meta in background
 * const context: BackgroundMetaContext = {
 *   sessionId: 'abc123',
 *   phase: 'planning',
 *   phaseOutput: '...',
 *   startTime: Date.now() - 5000,
 *   endTime: Date.now(),
 *   toolCalls: 10,
 *   delegations: 2,
 *   parallelTasks: 3
 * };
 *
 * // Inject prior meta into next phase
 * const injection: MetaInjectionResult = {
 *   injected: true,
 *   content: '...',
 *   phasesAvailable: ['planning', 'design']
 * };
 * ```
 *
 * @see BackgroundMetaContext for spawning LLM extraction
 * @see MetaInjectionResult for context injection
 * @see SessionAggregatedMeta for cross-phase analysis
 */

import type { Phase } from './pattern.js';

/**
 * Decision impact level
 */
export type DecisionImpact = 'high' | 'medium' | 'low';

/**
 * Risk severity level (Priority 0-3)
 */
export type RiskSeverity = 'P0' | 'P1' | 'P2' | 'P3';

/**
 * Risk status tracking
 */
export type RiskStatus = 'new' | 'mitigated' | 'escalated' | 'accepted';

/**
 * Decision captured during a phase
 */
export interface SemanticDecision {
  /** What was decided (max 80 chars) */
  what: string;

  /** Why this decision was made (max 100 chars) */
  why: string;

  /** Impact level of this decision */
  impact: DecisionImpact;
}

/**
 * Challenge encountered and its resolution
 */
export interface SemanticChallenge {
  /** Problem description (max 80 chars) */
  problem: string;

  /** How it was resolved (max 100 chars) */
  resolution: string;
}

/**
 * Risk identified during a phase
 */
export interface SemanticRisk {
  /** Risk severity level */
  severity: RiskSeverity;

  /** Risk description (max 80 chars) */
  description: string;

  /** Current status of the risk */
  status: RiskStatus;
}

/**
 * Core semantic extractions from LLM analysis
 */
export interface SemanticExtractions {
  /** What was accomplished in this phase (max 200 chars) */
  accomplishment: string;

  /** Key insight or learning from this phase (max 150 chars) */
  keyInsight: string;

  /** Strategic decisions made (max 3) */
  decisions: SemanticDecision[];

  /** Challenges encountered and how addressed (max 2) */
  challenges: SemanticChallenge[];

  /** Risks identified or status changes (max 3) */
  risks: SemanticRisk[];

  /** Approach patterns used (max 3 keywords) */
  approaches: string[];

  /** Tools heavily used (max 5) */
  toolsUsed: string[];

  /**
   * Sequential dependencies - tasks that must complete BEFORE this phase
   *
   * Empty array means no dependencies (can run anytime/parallel).
   * Use short identifiers like "db-setup", "auth-implemented", "tests-passed".
   *
   * Examples:
   * - Planning: [] (no dependencies)
   * - Design: ["requirements-gathered"]
   * - Implementation: ["architecture-designed", "db-schema-created"]
   * - Operation: ["tests-passed", "build-succeeded"]
   *
   * Max 5 items, each max 60 chars
   */
  sequentialDeps: string[];

  /**
   * Parallel execution successes - tasks that successfully ran IN PARALLEL with this phase
   *
   * Records which tasks were executed concurrently and succeeded, enabling learning
   * of safe parallelization patterns. Empty array means no parallel execution history.
   *
   * Use short identifiers matching the task/phase names.
   *
   * Examples:
   * - Implementation: ["frontend-ui", "api-docs", "test-writing"] (ran together, all succeeded)
   * - Operation: ["staging-deploy", "monitoring-setup"] (parallel deployment succeeded)
   *
   * Learning effect:
   * - Future similar tasks can reference this to safely parallelize
   * - Builds positive examples for orchestration optimization
   * - Complements sequentialDeps (negative examples)
   *
   * Max 8 items, each max 60 chars
   */
  parallelSuccesses: string[];
}

/**
 * Context for next phase handoff
 */
export interface PhaseHandoff {
  /** What next phase can do now (max 100 chars) */
  readyFor: string;

  /** What might block the next phase (max 3 items) */
  blockers: string[];

  /** Key context to carry forward (max 150 chars) */
  context: string;
}

/**
 * Phase execution metrics (from phase execution, not LLM)
 */
export interface PhaseMetrics {
  /** Duration in milliseconds */
  durationMs: number;

  /** Number of tool calls */
  toolCalls: number;

  /** Number of agent delegations */
  delegations: number;

  /** Number of parallel tasks launched */
  parallelTasks: number;
}

/**
 * Semantic Phase Meta - LLM-extracted semantic patterns per phase
 * Version 2: Replaces rule-based QuickMeta
 */
export interface SemanticPhaseMeta {
  /** Schema version (v2 = semantic, v1 = rule-based) */
  version: 2;

  /** Session identifier */
  sessionId: string;

  /** Phase this meta covers */
  phase: Phase;

  /** ISO timestamp when phase completed */
  completedAt: string;

  /** Core semantic extractions (LLM-generated) */
  semantics: SemanticExtractions;

  /** Context for next phase */
  handoff: PhaseHandoff;

  /** Metrics from phase execution */
  metrics: PhaseMetrics;
}

/**
 * Summary of a single phase for cross-phase analysis
 */
export interface PhaseSummary {
  /** What was accomplished */
  accomplishment: string;

  /** Key insight from the phase */
  keyInsight: string;

  /** Duration in milliseconds */
  duration: number;
}

/**
 * Cross-phase pattern identified in session
 */
export interface CrossPhasePattern {
  /** Pattern description */
  pattern: string;

  /** Phases where this pattern appeared */
  phases: string[];

  /** Significance or impact of this pattern */
  significance: string;
}

/**
 * Session-level insights and efficiency metrics
 */
export interface SessionInsights {
  /** What worked well in this session */
  whatWorked: string[];

  /** What could be improved */
  whatToImprove: string[];

  /** Key decisions across all phases */
  keyDecisions: string[];

  /** Efficiency metrics for the session */
  efficiencyMetrics: {
    /** Total session duration in milliseconds */
    totalDuration: number;

    /** Speedup from parallel execution */
    parallelSpeedup: number;

    /** Time distribution per phase (phase -> percentage) */
    phaseBalance: Record<string, number>;
  };
}

/**
 * Session Aggregated Meta - Cross-phase analysis
 *
 * Generated after all phases complete, provides holistic view of the session.
 */
export interface SessionAggregatedMeta {
  /** Session identifier */
  sessionId: string;

  /** ISO timestamp when aggregation completed */
  completedAt: string;

  /** Summary of each completed phase */
  phaseSummaries: {
    planning?: PhaseSummary;
    design?: PhaseSummary;
    implementation?: PhaseSummary;
    operation?: PhaseSummary;
  };

  /** Patterns that span multiple phases */
  crossPhasePatterns: CrossPhasePattern[];

  /** Session-level insights and metrics */
  sessionInsights: SessionInsights;
}

/**
 * Context for spawning background meta extraction
 *
 * Passed to background task for LLM-based semantic analysis.
 */
export interface BackgroundMetaContext {
  /** Session identifier */
  sessionId: string;

  /** Phase being analyzed */
  phase: Phase;

  /** Raw output from the phase (for LLM analysis) */
  phaseOutput: string;

  /** Phase start time (unix timestamp ms) */
  startTime: number;

  /** Phase end time (unix timestamp ms) */
  endTime: number;

  /** Number of tool calls during phase */
  toolCalls: number;

  /** Number of agent delegations during phase */
  delegations: number;

  /** Number of parallel tasks launched */
  parallelTasks: number;
}

/**
 * Result of prior meta injection attempt
 *
 * Used to determine if context from previous phases should be injected.
 */
export interface MetaInjectionResult {
  /** Whether meta context was injected */
  injected: boolean;

  /** Formatted content that was injected (null if not injected) */
  content: string | null;

  /** Phases that have available meta data */
  phasesAvailable: Phase[];
}

/**
 * Type guard to check if a value is a valid Phase
 */
export function isPhase(value: unknown): value is Phase {
  return (
    typeof value === 'string' &&
    ['planning', 'design', 'implementation', 'operation'].includes(value)
  );
}

/**
 * Type guard to check if a value is a valid RiskSeverity
 */
export function isRiskSeverity(value: unknown): value is RiskSeverity {
  return (
    typeof value === 'string' &&
    ['P0', 'P1', 'P2', 'P3'].includes(value)
  );
}

/**
 * Type guard to check if a value is a valid RiskStatus
 */
export function isRiskStatus(value: unknown): value is RiskStatus {
  return (
    typeof value === 'string' &&
    ['new', 'mitigated', 'escalated', 'accepted'].includes(value)
  );
}

/**
 * Type guard to check if a value is a valid DecisionImpact
 */
export function isDecisionImpact(value: unknown): value is DecisionImpact {
  return (
    typeof value === 'string' &&
    ['high', 'medium', 'low'].includes(value)
  );
}

/**
 * Type guard to check if a value is a SemanticPhaseMeta
 */
export function isSemanticPhaseMeta(value: unknown): value is SemanticPhaseMeta {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    obj.version === 2 &&
    typeof obj.sessionId === 'string' &&
    isPhase(obj.phase) &&
    typeof obj.completedAt === 'string' &&
    typeof obj.semantics === 'object' &&
    typeof obj.handoff === 'object' &&
    typeof obj.metrics === 'object'
  );
}

/**
 * Utility: Create empty PhaseMetrics
 */
export function createEmptyMetrics(): PhaseMetrics {
  return {
    durationMs: 0,
    toolCalls: 0,
    delegations: 0,
    parallelTasks: 0,
  };
}

/**
 * Utility: Create empty SemanticExtractions
 */
export function createEmptySemantics(): SemanticExtractions {
  return {
    accomplishment: '',
    keyInsight: '',
    decisions: [],
    challenges: [],
    risks: [],
    approaches: [],
    toolsUsed: [],
    sequentialDeps: [],
    parallelSuccesses: [],
  };
}

/**
 * Utility: Create empty PhaseHandoff
 */
export function createEmptyHandoff(): PhaseHandoff {
  return {
    readyFor: '',
    blockers: [],
    context: '',
  };
}

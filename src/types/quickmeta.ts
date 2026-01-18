/**
 * QuickMeta Types - Lightweight per-phase meta-analysis
 *
 * Designed for < 100ms extraction, < 2KB per phase storage
 */

import type { Phase } from './pattern.js';

/**
 * QuickPattern - Lightweight pattern extracted via regex/keyword matching
 * Size budget: ~200 bytes each, max 5 = ~1000 bytes
 */
export interface QuickPattern {
  /** Short identifier (max 50 chars) */
  id: string;

  /** Pattern category for quick classification */
  category: 'approach' | 'tool-usage' | 'decision' | 'optimization' | 'error-recovery';

  /** Brief description (max 100 chars) */
  summary: string;

  /** Keywords that triggered this pattern */
  keywords: string[];

  /** Confidence score 0.0-1.0 based on keyword density */
  confidence: number;
}

/**
 * QuickDecision - Key decision captured during a phase
 * Size budget: ~300 bytes each, max 3 = ~900 bytes
 */
export interface QuickDecision {
  /** What was decided (max 80 chars) */
  topic: string;

  /** Chosen option (max 50 chars) */
  choice: string;

  /** Why this was chosen (max 100 chars) */
  rationale: string;

  /** Alternatives considered (max 3) */
  alternatives: string[];
}

/**
 * QuickRisk - Identified risk with severity
 * Size budget: ~200 bytes each, max 3 = ~600 bytes
 */
export interface QuickRisk {
  /** Risk severity */
  severity: 'P0' | 'P1' | 'P2' | 'P3';

  /** Risk description (max 100 chars) */
  description: string;

  /** Mitigation status */
  status: 'identified' | 'mitigated' | 'accepted';

  /** Brief mitigation note (max 80 chars) */
  mitigation?: string;
}

/**
 * PhaseMetrics - Quantitative metrics for the phase
 * Size budget: ~100 bytes
 */
export interface PhaseMetrics {
  /** Duration in milliseconds */
  durationMs: number;

  /** Number of tool calls */
  toolCalls: number;

  /** Number of agent delegations (for Harmony) */
  delegations: number;

  /** Parallel tasks launched */
  parallelTasks: number;
}

/**
 * QuickMeta - Complete phase summary (< 2KB total)
 */
export interface QuickMeta {
  /** Schema version for future compatibility */
  version: 1;

  /** Session identifier */
  sessionId: string;

  /** Phase this meta covers */
  phase: Phase;

  /** ISO timestamp of phase completion */
  completedAt: string;

  /** One-line phase summary (max 150 chars) */
  summary: string;

  /** Extracted patterns (max 5) */
  patterns: QuickPattern[];

  /** Key decisions (max 3) */
  decisions: QuickDecision[];

  /** Identified risks (max 3) */
  risks: QuickRisk[];

  /** Quantitative metrics */
  metrics: PhaseMetrics;

  /** Free-form notes for next phase (max 200 chars) */
  handoffNote: string;
}

/**
 * PhaseInsight - Context injected at phase start
 * Synthesized from previous phase QuickMeta files
 */
export interface PhaseInsight {
  /** Session being continued */
  sessionId: string;

  /** Target phase */
  targetPhase: Phase;

  /** Summary of completed phases */
  completedPhases: Array<{
    phase: Phase;
    summary: string;
    handoffNote: string;
  }>;

  /** Accumulated patterns (deduplicated, max 10) */
  accumulatedPatterns: QuickPattern[];

  /** Active risks (P0/P1 only) */
  activeRisks: QuickRisk[];

  /** Key decisions for reference */
  keyDecisions: QuickDecision[];

  /** Formatted injection string */
  formatted: string;
}

/**
 * QuickMetaStorage - All QuickMeta files for a session
 */
export interface QuickMetaStorage {
  sessionId: string;
  phases: Partial<Record<Phase, QuickMeta>>;
  created: string;
  lastUpdated: string;
}

/**
 * ExtractionContext - Input for pattern extraction
 */
export interface ExtractionContext {
  /** Raw text from the phase (agent output, tool results, etc.) */
  content: string;

  /** Phase being analyzed */
  phase: Phase;

  /** Tool usage counts */
  toolUsage?: Record<string, number>;

  /** Duration of the phase */
  durationMs?: number;
}

/**
 * ExtractionResult - Output from pattern extraction
 */
export interface ExtractionResult {
  patterns: QuickPattern[];
  decisions: QuickDecision[];
  risks: QuickRisk[];
  summary: string;
}

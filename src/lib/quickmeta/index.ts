/**
 * QuickMeta - Fast, file-based meta-analysis for 4-phase workflow
 *
 * Captures lightweight insights after each phase (< 100ms)
 * and injects context into subsequent phases.
 */

// Types
export type {
  QuickMeta,
  QuickPattern,
  QuickDecision,
  QuickRisk,
  PhaseMetrics,
  PhaseInsight,
  QuickMetaStorage,
  ExtractionContext,
  ExtractionResult,
} from '../../types/quickmeta.js';

// Extractor
export { extractQuickPatterns } from './extractor.js';

// Storage
export {
  generateSessionId,
  saveQuickMeta,
  loadQuickMeta,
  loadSessionQuickMeta,
  buildPhaseInsight,
  listSessions,
  cleanupOldSessions,
  getStorageStats,
} from './storage.js';

// Orchestration
export {
  onPhaseComplete,
  startPhase,
  initSession,
  createSessionState,
  enterPhase,
  completePhase,
  getPhaseDuration,
  isSessionComplete,
  getSessionSummary,
} from './orchestration.js';
export type { PhaseCompletionContext, HarmonySessionState } from './orchestration.js';

// Background
export {
  shouldTriggerBackgroundAnalysis,
  buildBackgroundAnalysisPrompt,
  getSessionDuration,
  getQuickMetaSummary,
  formatQuickMetaAsMarkdown,
} from './background.js';
export type { BackgroundAnalysisConfig } from './background.js';

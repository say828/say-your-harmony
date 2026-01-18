/**
 * Semantic Meta - File-based meta-analysis for 4-phase workflow
 *
 * Storage: ~/.claude/meta/{phase}/recent/{sessionId}.json (recent 10)
 *          ~/.claude/meta/{phase}/patterns.json (cumulative)
 */

// Storage
export {
  generateSessionId,
  saveSemanticMeta,
  loadSemanticMeta,
  loadPatterns,
  savePatterns,
  listRecentSessions,
  getStorageStats,
  mergeSequentialDeps,
  mergeParallelSuccesses,
} from './storage.js';

export type {
  SequentialDepPattern,
  ParallelSuccessPattern,
  AccomplishmentPattern,
  RiskPattern,
  PhasePatterns,
} from './storage.js';

// Validator
export {
  validateDependencies,
  defaultDependencyChecker,
  getAllDependencies,
  formatValidationResult,
} from './validator.js';

export type {
  DependencyValidationResult,
  DependencyChecker,
} from './validator.js';

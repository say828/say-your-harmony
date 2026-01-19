/**
 * Meta Pattern Management Library - v2.0
 *
 * Unified API for meta-analysis pattern storage and evolution.
 * All exports from src/lib/meta/api/index.ts
 */

// Re-export everything from v2.0 unified API
export * from './meta/api/index.js';

// Additional exports from evolution module
export { recalculateConfidence } from './meta/evolution/confidence.js';
export { applyDecay, applyDecayToAll } from './meta/evolution/decay.js';
export { deduplicatePatterns } from './meta/evolution/deduplication.js';
export { clusterPatterns } from './meta/evolution/clustering.js';
export { evictLowScorePatterns } from './meta/evolution/eviction.js';

// Storage utilities
export {
  loadPatternStore,
  savePatternStore,
  loadAllPatterns,
  loadPatternsByPhase,
  loadPatternsByType,
  loadPatternById,
  savePattern,
  savePatterns,
  deletePattern,
  loadPhaseIndex,
  updatePhaseIndex,
} from './meta/core/storage.js';

// Schema types and utilities
export {
  createEmptyPatternStore,
} from './meta/core/schema.js';

// Session management
export {
  saveSession,
  loadSession,
  listSessions,
} from './meta/sessions/session-store.js';

// Export utilities
export { exportPatternsJson, exportStoreJson, exportPatternsToFile } from './meta/export/json.js';

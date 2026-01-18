/**
 * Unified Meta API - Main entry point
 */

export { generateSessionId } from '../core/generator.js';
export { saveMetaPatterns, saveMetaPatternsFromSemanticMeta } from './save.js';
export { loadPatterns, loadHighConfidencePatterns } from './load.js';
export { evolvePatterns, evolveAllPhases } from './evolve.js';
export { aggregateSession } from './aggregate.js';
export { validateDependencies } from '../query/validator-deps.js';
export { generatePatternsMd } from '../export/markdown.js';
export { getStorageStats } from '../core/storage.js';

// Re-export types
export type { MetaPattern, Phase, PatternType } from '../core/schema.js';
export type { DependencyValidationResult } from '../query/validator-deps.js';

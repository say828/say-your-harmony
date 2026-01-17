/**
 * Pattern Management Library - Central Export
 */

export { SemanticHasher, semanticHasher } from './semantic-hasher.js';
export { computeDecayScore, recomputeScores } from './decay-scorer.js';
export { PatternClusterer, patternClusterer } from './pattern-clusterer.js';
export { PatternEvictor, patternEvictor } from './pattern-evictor.js';
export { ConfigManager, configManager } from './config-manager.js';
export { PatternAggregator, patternAggregator } from './pattern-aggregator.js';

export {
  loadPatterns,
  savePatterns,
  loadClusters,
  saveClusters,
  loadIndex,
  saveIndex,
  loadAllPatterns,
  listSessionFiles,
  deleteFile,
  getFileModTime
} from './storage.js';

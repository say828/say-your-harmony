/**
 * Pattern Management Types - Central Export
 */

export type {
  Phase,
  Pattern,
  Cluster,
  PatternStorage,
  AggregationStats,
  EvictionResult
} from './pattern.js';

export type {
  DecayAlgorithm,
  EvictionStrategy,
  ClusteringAlgorithm,
  DeduplicationAlgorithm,
  CapacityConfig,
  DecayConfig,
  ClusteringConfig,
  DeduplicationConfig,
  EvictionConfig,
  ExportConfig,
  PatternConfig
} from './config.js';

export { getDefaultConfig } from './config.js';

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

export type {
  DecisionImpact,
  RiskSeverity,
  RiskStatus,
  SemanticDecision,
  SemanticChallenge,
  SemanticRisk,
  SemanticExtractions,
  PhaseHandoff,
  PhaseMetrics,
  SemanticPhaseMeta,
  PhaseSummary,
  CrossPhasePattern,
  SessionInsights,
  SessionAggregatedMeta,
  BackgroundMetaContext,
  MetaInjectionResult
} from './semantic-meta.js';

export {
  isPhase,
  isRiskSeverity,
  isRiskStatus,
  isDecisionImpact,
  isSemanticPhaseMeta,
  createEmptyMetrics,
  createEmptySemantics,
  createEmptyHandoff
} from './semantic-meta.js';

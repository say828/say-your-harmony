/**
 * Pattern Management Types - v2.0 Central Export
 */

// v2.0 Core Schema Types
export type {
  Phase,
  PatternType,
  SequentialDepData,
  ParallelSuccessData,
  RiskData,
  DecisionData,
  ApproachData,
  ToolUsageData,
  PatternData,
  MetaPattern,
  Cluster,
  PatternStore,
  PhaseIndex,
  SessionSummary,
} from '../lib/meta/core/schema.js';

export { createEmptyPatternStore } from '../lib/meta/core/schema.js';

// Config Types
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

// Semantic Meta Types (for agent extraction)
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

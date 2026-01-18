/**
 * Metrics Types
 *
 * Defines the structure for all metrics collected during experiment runs.
 */

/**
 * Complete metrics record for an experiment run
 */
export interface MetricsRecord {
  /** Run this metrics belong to */
  runId: string;

  /** Collection timestamp */
  collectedAt: string;

  /** Efficiency metrics */
  efficiency: EfficiencyMetrics;

  /** Quality metrics */
  quality: QualityMetrics;

  /** Learning indicators */
  learning: LearningMetrics;

  /** Resource usage */
  resources: ResourceMetrics;

  /** Raw data for custom analysis */
  raw: RawMetrics;
}

/**
 * Efficiency-related metrics
 */
export interface EfficiencyMetrics {
  /** Total conversation turns */
  totalTurns: number;

  /** Turns per phase */
  turnsPerPhase: PhaseMetrics;

  /** Wall-clock duration in seconds */
  durationSeconds: number;

  /** Duration per phase in seconds */
  durationPerPhase: PhaseMetrics;

  /** Total tool calls */
  totalToolCalls: number;

  /** Tool calls by type */
  toolCallsByType: Record<string, number>;

  /** Web searches performed */
  webSearches: number;

  /** Decisions made */
  decisionsCount: number;

  /** Parallel execution instances */
  parallelExecutions: number;

  /** Parallel speedup factor (if applicable) */
  parallelSpeedup?: number;
}

/**
 * Metrics broken down by phase
 */
export interface PhaseMetrics {
  planning: number;
  design: number;
  implementation: number;
  operation: number;
}

/**
 * Quality-related metrics
 */
export interface QualityMetrics {
  /** Test pass rate (0-100) */
  testPassRate: number;

  /** Total tests */
  totalTests: number;

  /** TypeScript errors */
  typeErrors: number;

  /** Lint errors */
  lintErrors: number;

  /** Documentation coverage (0-100) */
  docCoverage: number;

  /** Code complexity (cyclomatic) */
  codeComplexity: number;

  /** Lines of code produced */
  linesOfCode: number;

  /** Production readiness score (0-100) */
  productionReadiness: number;
}

/**
 * Learning-related metrics
 */
export interface LearningMetrics {
  /** Patterns reused from meta-analysis */
  patternsReused: number;

  /** New patterns discovered */
  patternsDiscovered: number;

  /** Decisions referenced from previous sessions */
  decisionsReferenced: number;

  /** Web searches avoided (compared to baseline) */
  searchesAvoided: number;

  /** Meta-analysis sections referenced */
  metaSectionsReferenced: string[];

  /** Evidence of meta-analysis usage */
  metaUsageEvidence: MetaUsageEvidence[];
}

/**
 * Evidence of meta-analysis being used
 */
export interface MetaUsageEvidence {
  /** Type of evidence */
  type: 'explicit_reference' | 'pattern_match' | 'decision_reuse' | 'search_skip';

  /** Description of evidence */
  description: string;

  /** Source location in transcript */
  transcriptLocation?: string;

  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Resource usage metrics
 */
export interface ResourceMetrics {
  /** API tokens used (input) */
  tokensInput: number;

  /** API tokens used (output) */
  tokensOutput: number;

  /** Total API cost (estimated USD) */
  estimatedCostUsd: number;

  /** Subagent invocations */
  subagentCalls: number;

  /** File reads */
  fileReads: number;

  /** File writes */
  fileWrites: number;
}

/**
 * Raw metrics data for custom analysis
 */
export interface RawMetrics {
  /** Full tool call log */
  toolCallLog: ToolCallEntry[];

  /** Phase transition timestamps */
  phaseTransitions: PhaseTransition[];

  /** Decision log */
  decisions: DecisionEntry[];

  /** Error log */
  errors: ErrorEntry[];
}

/**
 * Single tool call entry
 */
export interface ToolCallEntry {
  /** Timestamp */
  timestamp: string;

  /** Tool name */
  tool: string;

  /** Input summary */
  inputSummary: string;

  /** Success status */
  success: boolean;

  /** Duration in milliseconds */
  durationMs: number;
}

/**
 * Phase transition record
 */
export interface PhaseTransition {
  /** From phase */
  from: string;

  /** To phase */
  to: string;

  /** Timestamp */
  timestamp: string;

  /** Trigger for transition */
  trigger: string;
}

/**
 * Decision log entry
 */
export interface DecisionEntry {
  /** Decision topic */
  topic: string;

  /** Options considered */
  options: string[];

  /** Selected option */
  selected: string;

  /** Rationale for selection */
  rationale: string;

  /** Phase when decision was made */
  phase: string;

  /** Timestamp */
  timestamp: string;
}

/**
 * Error log entry
 */
export interface ErrorEntry {
  /** Error message */
  message: string;

  /** Severity level */
  severity: 'warning' | 'error' | 'fatal';

  /** Phase when error occurred */
  phase: string;

  /** Timestamp */
  timestamp: string;

  /** Whether error was recovered from */
  recovered: boolean;
}

/**
 * Aggregated metrics across multiple runs
 */
export interface AggregatedMetrics {
  /** Scenario ID */
  scenarioId: string;

  /** Number of runs aggregated */
  runCount: number;

  /** Efficiency statistics */
  efficiency: MetricStatistics<EfficiencyMetrics>;

  /** Quality statistics */
  quality: MetricStatistics<QualityMetrics>;

  /** Learning statistics */
  learning: MetricStatistics<LearningMetrics>;
}

/**
 * Statistical summary for a metric type
 */
export interface MetricStatistics<T> {
  /** Mean values */
  mean: Partial<T>;

  /** Standard deviation */
  stdDev: Partial<T>;

  /** Minimum values */
  min: Partial<T>;

  /** Maximum values */
  max: Partial<T>;

  /** Median values */
  median: Partial<T>;
}

/**
 * Experiment Configuration Types
 *
 * Defines the structure for experiment configuration and run tracking.
 */

import type { TaskResult } from './task.js';
import type { MetricsRecord } from './metrics.js';

/**
 * Main experiment configuration
 * Defines the overall experiment parameters and scenarios to run
 */
export interface ExperimentConfig {
  /** Unique experiment identifier */
  experimentId: string;

  /** Human-readable experiment name */
  name: string;

  /** Detailed description of hypothesis being tested */
  hypothesis: string;

  /** Success criteria for the experiment */
  successCriteria: SuccessCriteria;

  /** List of scenarios to execute */
  scenarios: ScenarioConfig[];

  /** Number of iterations per scenario (minimum 3 for statistical validity) */
  iterationsPerScenario: number;

  /** Random seed for reproducibility */
  randomSeed: number;

  /** Whether to clear meta-analysis between scenarios */
  isolateSessions: boolean;

  /** Timeout per task in minutes */
  taskTimeoutMinutes: number;

  /** Metadata for tracking */
  metadata: ExperimentMetadata;
}

/**
 * Success criteria that must be met for experiment validation
 */
export interface SuccessCriteria {
  /** Minimum efficiency improvement percentage (e.g., 15) */
  minEfficiencyImprovement: number;

  /** Maximum quality degradation allowed (e.g., 5%) */
  maxQualityDegradation: number;

  /** Minimum number of successful iterations */
  minSuccessfulIterations: number;

  /** Statistical significance threshold (p-value) */
  significanceThreshold: number;
}

/**
 * Configuration for a single experimental scenario
 */
export interface ScenarioConfig {
  /** Scenario identifier */
  scenarioId: string;

  /** Scenario type: baseline, repetition, or transfer */
  type: 'baseline' | 'repetition' | 'transfer';

  /** Task to execute */
  taskId: string;

  /** Whether meta-analysis is available */
  metaAnalysisAvailable: boolean;

  /** Source of meta-analysis (if available) */
  metaAnalysisSource?: string;

  /** Order in experiment sequence */
  executionOrder: number;
}

/**
 * Metadata for experiment tracking and reproducibility
 */
export interface ExperimentMetadata {
  /** Experiment author */
  author: string;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last modified timestamp */
  modifiedAt: string;

  /** Version of the experiment framework */
  frameworkVersion: string;

  /** Git commit hash for reproducibility */
  gitCommit?: string;

  /** Additional notes */
  notes?: string;
}

/**
 * Record of a single experiment run
 */
export interface ExperimentRun {
  /** Unique run identifier */
  runId: string;

  /** Reference to experiment config */
  experimentId: string;

  /** Scenario being executed */
  scenarioId: string;

  /** Iteration number (1-based) */
  iteration: number;

  /** Run status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';

  /** Start timestamp */
  startedAt: string;

  /** End timestamp */
  completedAt?: string;

  /** Task result */
  taskResult?: TaskResult;

  /** Collected metrics */
  metrics?: MetricsRecord;

  /** Error information if failed */
  error?: RunError;
}

/**
 * Error information for failed runs
 */
export interface RunError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Stack trace if available */
  stack?: string;

  /** Phase where error occurred */
  phase?: 'setup' | 'execution' | 'collection' | 'cleanup';
}

/**
 * Summary of experiment execution
 */
export interface ExperimentSummary {
  /** Experiment ID */
  experimentId: string;

  /** Total runs executed */
  totalRuns: number;

  /** Successful runs */
  successfulRuns: number;

  /** Failed runs */
  failedRuns: number;

  /** Timed out runs */
  timedOutRuns: number;

  /** Total duration in seconds */
  totalDurationSeconds: number;

  /** Runs by scenario */
  runsByScenario: Record<string, number>;

  /** Completion timestamp */
  completedAt: string;
}

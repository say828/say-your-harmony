/**
 * Task Specification Types
 *
 * Defines the structure for development tasks used in experiments.
 */

/**
 * Specification for a development task used in experiments
 */
export interface TaskSpecification {
  /** Unique task identifier */
  taskId: string;

  /** Human-readable task name */
  name: string;

  /** Task complexity level */
  complexity: 'simple' | 'medium' | 'complex';

  /** Task domain */
  domain: TaskDomain;

  /** The prompt to give to the agent */
  prompt: string;

  /** Expected deliverables */
  expectedDeliverables: Deliverable[];

  /** Quality criteria for evaluation */
  qualityCriteria: QualityCriteria;

  /** Estimated baseline metrics (for comparison) */
  baselineEstimates: BaselineEstimates;

  /** Tags for filtering/grouping */
  tags: string[];
}

/**
 * Supported task domains
 */
export type TaskDomain =
  | 'rest-api'
  | 'auth'
  | 'microservices'
  | 'calculator'
  | 'statistics'
  | 'cli'
  | 'database'
  | 'frontend';

/**
 * Expected deliverable from a task
 */
export interface Deliverable {
  /** Deliverable type */
  type: 'file' | 'test' | 'documentation' | 'config';

  /** Path pattern to check (glob) */
  pathPattern: string;

  /** Whether this deliverable is required */
  required: boolean;

  /** Validation function name */
  validator?: string;
}

/**
 * Quality criteria for task evaluation
 */
export interface QualityCriteria {
  /** Minimum test pass rate (0-100) */
  minTestPassRate: number;

  /** Whether TypeScript strict mode required */
  requireTypeScriptStrict: boolean;

  /** Minimum documentation coverage (0-100) */
  minDocCoverage: number;

  /** Maximum allowed linting errors */
  maxLintErrors: number;

  /** Custom quality checks */
  customChecks?: CustomCheck[];
}

/**
 * Custom quality check definition
 */
export interface CustomCheck {
  /** Check name */
  name: string;

  /** Command to run */
  command: string;

  /** Expected exit code (0 for success) */
  expectedExitCode: number;
}

/**
 * Baseline estimates for task metrics
 */
export interface BaselineEstimates {
  /** Expected turns for baseline (no meta) */
  expectedTurns: number;

  /** Expected duration in minutes */
  expectedDurationMinutes: number;

  /** Expected tool calls */
  expectedToolCalls: number;

  /** Expected web searches */
  expectedWebSearches: number;
}

/**
 * Result of executing a task
 */
export interface TaskResult {
  /** Task that was executed */
  taskId: string;

  /** Whether task completed successfully */
  success: boolean;

  /** Deliverables produced */
  deliverables: DeliverableResult[];

  /** Quality assessment */
  qualityAssessment: QualityAssessment;

  /** Files created/modified */
  filesAffected: string[];

  /** Session transcript path (for analysis) */
  transcriptPath?: string;

  /** Meta-analysis generated (if any) */
  metaAnalysisPath?: string;
}

/**
 * Result for a single deliverable
 */
export interface DeliverableResult {
  /** Deliverable specification */
  deliverable: Deliverable;

  /** Whether deliverable was produced */
  produced: boolean;

  /** Actual path(s) found */
  actualPaths: string[];

  /** Validation result */
  valid: boolean;

  /** Validation message */
  validationMessage?: string;
}

/**
 * Quality assessment of task output
 */
export interface QualityAssessment {
  /** Overall quality score (0-100) */
  overallScore: number;

  /** Test results */
  tests: TestResults;

  /** Type safety results */
  typeSafety: TypeSafetyResults;

  /** Documentation results */
  documentation: DocumentationResults;

  /** Linting results */
  linting: LintingResults;
}

/**
 * Test execution results
 */
export interface TestResults {
  /** Total tests */
  total: number;

  /** Passed tests */
  passed: number;

  /** Failed tests */
  failed: number;

  /** Skipped tests */
  skipped: number;

  /** Pass rate (0-100) */
  passRate: number;
}

/**
 * TypeScript type safety results
 */
export interface TypeSafetyResults {
  /** TypeScript errors */
  errors: number;

  /** TypeScript warnings */
  warnings: number;

  /** Strict mode enabled */
  strictMode: boolean;
}

/**
 * Documentation coverage results
 */
export interface DocumentationResults {
  /** Total documentable items */
  totalItems: number;

  /** Documented items */
  documentedItems: number;

  /** Coverage percentage */
  coverage: number;
}

/**
 * Linting results
 */
export interface LintingResults {
  /** Total errors */
  errors: number;

  /** Total warnings */
  warnings: number;

  /** Rules violated */
  rulesViolated: string[];
}

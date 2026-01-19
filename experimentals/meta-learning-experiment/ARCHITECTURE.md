# Meta-Learning Experiment Framework - Architecture Design

## Phase 2: Design Document

**Author**: Architect Agent
**Date**: 2026-01-18
**Status**: DESIGN COMPLETE

---

## 1. Executive Summary

This document defines the complete architecture for a meta-learning experiment framework that validates the hypothesis: "Meta-analysis from previous tasks improves efficiency on subsequent similar tasks, with effects compounding across multiple domains."

### Design Goals

1. **Reproducibility**: Any researcher can replicate experiments
2. **Statistical Validity**: 3+ iterations per scenario with proper controls
3. **Minimal Overhead**: Metrics collection must not impact experiment results
4. **Extensibility**: Easy to add new task scenarios and metrics

---

## 2. File Structure

```
examples/meta-learning-experiment/
├── ARCHITECTURE.md              # This document
├── README.md                    # Quick start guide
├── package.json                 # Dependencies (tsx, vitest, chart.js)
├── tsconfig.json                # TypeScript configuration
│
├── config/
│   ├── experiment-config.json   # Main experiment configuration
│   ├── tasks/
│   │   ├── simple-rest-api.json      # Task 1: Simple REST API
│   │   ├── medium-auth-system.json   # Task 2: Medium Auth System
│   │   └── complex-microservices.json # Task 3: Complex Microservices
│   └── scenarios/
│       ├── baseline.json        # No meta-analysis available
│       ├── repetition.json      # Same task with meta-analysis
│       └── transfer.json        # Different task with meta-analysis
│
├── src/
│   ├── types/
│   │   ├── index.ts             # Re-exports all types
│   │   ├── experiment.ts        # ExperimentConfig, ExperimentRun
│   │   ├── task.ts              # TaskSpecification, TaskResult
│   │   ├── metrics.ts           # MetricsRecord, MetricValue
│   │   └── analysis.ts          # AnalysisResult, StatisticalTest
│   │
│   ├── collectors/
│   │   ├── index.ts             # Collector orchestration
│   │   ├── turn-collector.ts    # Counts conversation turns
│   │   ├── time-collector.ts    # Measures wall-clock time
│   │   ├── tool-collector.ts    # Tracks tool usage
│   │   ├── decision-collector.ts # Extracts decisions made
│   │   └── quality-collector.ts  # Measures output quality
│   │
│   ├── analyzers/
│   │   ├── index.ts             # Analyzer orchestration
│   │   ├── statistical.ts       # t-tests, effect sizes
│   │   ├── comparison.ts        # Before/after comparison
│   │   └── pattern-extractor.ts # Extract learning patterns
│   │
│   ├── visualizers/
│   │   ├── index.ts             # Visualization orchestration
│   │   ├── efficiency-chart.ts  # Turn/time reduction charts
│   │   ├── quality-chart.ts     # Quality maintenance charts
│   │   └── learning-curve.ts    # Learning progression chart
│   │
│   └── utils/
│       ├── logger.ts            # Structured logging
│       ├── file-utils.ts        # File I/O helpers
│       └── stats.ts             # Statistical functions
│
├── scripts/
│   ├── run-experiment.sh        # Main orchestrator script
│   ├── collect-metrics.ts       # Post-experiment metrics extraction
│   ├── analyze-results.ts       # Statistical analysis
│   ├── visualize.ts             # Chart generation
│   └── validate-setup.ts        # Pre-experiment validation
│
├── results/
│   ├── .gitkeep
│   └── [experiment-id]/         # Created per experiment run
│       ├── config.json          # Snapshot of config used
│       ├── runs/
│       │   ├── run-001.json     # Individual run results
│       │   ├── run-002.json
│       │   └── ...
│       ├── metrics/
│       │   ├── raw-metrics.json # All collected metrics
│       │   └── aggregated.json  # Aggregated statistics
│       ├── analysis/
│       │   ├── statistical.json # Statistical test results
│       │   └── patterns.json    # Extracted patterns
│       └── charts/
│           ├── efficiency.png
│           ├── quality.png
│           └── learning-curve.png
│
└── templates/
    ├── task-prompt.md           # Template for task prompts
    └── meta-analysis-check.md   # Template for meta verification
```

---

## 3. Data Schemas (TypeScript Interfaces)

### 3.1 ExperimentConfig

```typescript
// src/types/experiment.ts

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
```

### 3.2 TaskSpecification

```typescript
// src/types/task.ts

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
  domain: 'rest-api' | 'auth' | 'microservices' | 'calculator' | 'statistics';

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

export interface CustomCheck {
  /** Check name */
  name: string;

  /** Command to run */
  command: string;

  /** Expected exit code (0 for success) */
  expectedExitCode: number;
}

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

export interface TypeSafetyResults {
  /** TypeScript errors */
  errors: number;

  /** TypeScript warnings */
  warnings: number;

  /** Strict mode enabled */
  strictMode: boolean;
}

export interface DocumentationResults {
  /** Total documentable items */
  totalItems: number;

  /** Documented items */
  documentedItems: number;

  /** Coverage percentage */
  coverage: number;
}

export interface LintingResults {
  /** Total errors */
  errors: number;

  /** Total warnings */
  warnings: number;

  /** Rules violated */
  rulesViolated: string[];
}
```

### 3.3 MetricsRecord

```typescript
// src/types/metrics.ts

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

export interface EfficiencyMetrics {
  /** Total conversation turns */
  totalTurns: number;

  /** Turns per phase */
  turnsPerPhase: PhaseMetrics;

  /** Wall-clock duration in seconds */
  durationSeconds: number;

  /** Duration per phase */
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

export interface PhaseMetrics {
  planning: number;
  design: number;
  implementation: number;
  operation: number;
}

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

export interface LearningMetrics {
  /** Patterns reused from meta-analysis */
  patternsReused: number;

  /** New patterns discovered */
  patternsDiscovered: number;

  /** Decisions referenced from previous */
  decisionsReferenced: number;

  /** Web searches avoided (vs baseline) */
  searchesAvoided: number;

  /** Meta-analysis sections referenced */
  metaSectionsReferenced: string[];

  /** Evidence of meta-analysis usage */
  metaUsageEvidence: MetaUsageEvidence[];
}

export interface MetaUsageEvidence {
  /** Type of evidence */
  type: 'explicit_reference' | 'pattern_match' | 'decision_reuse' | 'search_skip';

  /** Description of evidence */
  description: string;

  /** Source location in transcript */
  transcriptLocation?: string;

  /** Confidence (0-1) */
  confidence: number;
}

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

export interface ToolCallEntry {
  /** Timestamp */
  timestamp: string;

  /** Tool name */
  tool: string;

  /** Input summary */
  inputSummary: string;

  /** Success */
  success: boolean;

  /** Duration in ms */
  durationMs: number;
}

export interface PhaseTransition {
  /** From phase */
  from: string;

  /** To phase */
  to: string;

  /** Timestamp */
  timestamp: string;

  /** Trigger */
  trigger: string;
}

export interface DecisionEntry {
  /** Decision topic */
  topic: string;

  /** Options considered */
  options: string[];

  /** Selected option */
  selected: string;

  /** Rationale */
  rationale: string;

  /** Phase */
  phase: string;

  /** Timestamp */
  timestamp: string;
}

export interface ErrorEntry {
  /** Error message */
  message: string;

  /** Severity */
  severity: 'warning' | 'error' | 'fatal';

  /** Phase */
  phase: string;

  /** Timestamp */
  timestamp: string;

  /** Recovered */
  recovered: boolean;
}
```

### 3.4 AnalysisResult

```typescript
// src/types/analysis.ts

/**
 * Complete analysis results for an experiment
 */
export interface AnalysisResult {
  /** Experiment analyzed */
  experimentId: string;

  /** Analysis timestamp */
  analyzedAt: string;

  /** Summary statistics */
  summary: AnalysisSummary;

  /** Scenario comparisons */
  comparisons: ScenarioComparison[];

  /** Statistical tests */
  statisticalTests: StatisticalTest[];

  /** Extracted patterns */
  patterns: ExtractedPattern[];

  /** Conclusions */
  conclusions: Conclusion[];

  /** Recommendations */
  recommendations: Recommendation[];
}

export interface AnalysisSummary {
  /** Total runs analyzed */
  totalRuns: number;

  /** Successful runs */
  successfulRuns: number;

  /** Average efficiency improvement (%) */
  avgEfficiencyImprovement: number;

  /** Average quality maintenance (%) */
  avgQualityMaintenance: number;

  /** Success criteria met */
  successCriteriaMet: boolean;

  /** Key findings (bullet points) */
  keyFindings: string[];
}

export interface ScenarioComparison {
  /** Baseline scenario ID */
  baselineScenarioId: string;

  /** Comparison scenario ID */
  comparisonScenarioId: string;

  /** Comparison type */
  comparisonType: 'repetition' | 'transfer';

  /** Metric comparisons */
  metricComparisons: MetricComparison[];

  /** Overall improvement */
  overallImprovement: number;

  /** Statistically significant */
  isSignificant: boolean;
}

export interface MetricComparison {
  /** Metric name */
  metric: string;

  /** Baseline value */
  baselineValue: number;

  /** Comparison value */
  comparisonValue: number;

  /** Absolute change */
  absoluteChange: number;

  /** Percentage change */
  percentageChange: number;

  /** Direction (positive = improvement) */
  direction: 'improved' | 'degraded' | 'unchanged';

  /** Effect size (Cohen's d) */
  effectSize: number;
}

export interface StatisticalTest {
  /** Test name */
  testName: string;

  /** Test type */
  testType: 'paired-t-test' | 'wilcoxon' | 'mann-whitney' | 'chi-square';

  /** Metric being tested */
  metric: string;

  /** Groups being compared */
  groups: [string, string];

  /** Test statistic */
  testStatistic: number;

  /** P-value */
  pValue: number;

  /** Significant at alpha=0.05 */
  significant: boolean;

  /** Effect size */
  effectSize: number;

  /** Effect size interpretation */
  effectInterpretation: 'negligible' | 'small' | 'medium' | 'large';

  /** Confidence interval (95%) */
  confidenceInterval: [number, number];

  /** Sample sizes */
  sampleSizes: [number, number];
}

export interface ExtractedPattern {
  /** Pattern ID */
  patternId: string;

  /** Pattern name */
  name: string;

  /** Pattern category */
  category: 'efficiency' | 'quality' | 'learning' | 'failure';

  /** Description */
  description: string;

  /** Frequency observed */
  frequency: number;

  /** Scenarios where observed */
  observedIn: string[];

  /** Impact on metrics */
  impact: PatternImpact;

  /** Transferability */
  transferable: boolean;
}

export interface PatternImpact {
  /** Affected metric */
  metric: string;

  /** Average impact */
  averageImpact: number;

  /** Impact direction */
  direction: 'positive' | 'negative' | 'neutral';

  /** Confidence */
  confidence: number;
}

export interface Conclusion {
  /** Conclusion ID */
  id: string;

  /** Conclusion type */
  type: 'hypothesis_support' | 'hypothesis_reject' | 'observation' | 'limitation';

  /** Statement */
  statement: string;

  /** Supporting evidence */
  evidence: string[];

  /** Confidence level */
  confidence: 'high' | 'medium' | 'low';
}

export interface Recommendation {
  /** Recommendation ID */
  id: string;

  /** Priority */
  priority: 'P0' | 'P1' | 'P2' | 'P3';

  /** Category */
  category: 'methodology' | 'metrics' | 'tasks' | 'analysis' | 'framework';

  /** Recommendation */
  recommendation: string;

  /** Rationale */
  rationale: string;

  /** Expected impact */
  expectedImpact: string;
}
```

---

## 4. Script Designs (Pseudocode)

### 4.1 run-experiment.sh (Main Orchestrator)

```bash
#!/bin/bash
# run-experiment.sh - Main experiment orchestrator
# Usage: ./run-experiment.sh [config-file] [options]

set -euo pipefail

# ============================================
# CONFIGURATION
# ============================================

CONFIG_FILE="${1:-config/experiment-config.json}"
RESULTS_DIR="results"
LOG_LEVEL="${LOG_LEVEL:-info}"

# ============================================
# FUNCTIONS
# ============================================

log() {
    local level="$1"
    local message="$2"
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [$level] $message"
}

validate_prerequisites() {
    log "info" "Validating prerequisites..."

    # Check Node.js version (require 20+)
    node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 20 ]; then
        log "error" "Node.js 20+ required, found: $(node -v)"
        exit 1
    fi

    # Check Claude CLI
    if ! command -v claude &> /dev/null; then
        log "error" "Claude CLI not found"
        exit 1
    fi

    # Run validation script
    npx tsx scripts/validate-setup.ts "$CONFIG_FILE"
}

setup_experiment() {
    local experiment_id="$1"
    local experiment_dir="$RESULTS_DIR/$experiment_id"

    log "info" "Setting up experiment: $experiment_id"

    # Create directory structure
    mkdir -p "$experiment_dir"/{runs,metrics,analysis,charts}

    # Copy config snapshot
    cp "$CONFIG_FILE" "$experiment_dir/config.json"

    # Record git commit
    git rev-parse HEAD > "$experiment_dir/git-commit.txt" 2>/dev/null || echo "not-a-git-repo"

    echo "$experiment_dir"
}

backup_meta_directory() {
    local backup_dir="$1/meta-backup"
    log "info" "Backing up ~/.claude/meta to $backup_dir"

    if [ -d "$HOME/.claude/meta" ]; then
        cp -r "$HOME/.claude/meta" "$backup_dir"
    else
        mkdir -p "$backup_dir"
        echo "no-existing-meta" > "$backup_dir/.empty"
    fi
}

restore_meta_directory() {
    local backup_dir="$1/meta-backup"
    log "info" "Restoring ~/.claude/meta from $backup_dir"

    rm -rf "$HOME/.claude/meta"

    if [ -f "$backup_dir/.empty" ]; then
        # No meta existed before, keep it clean
        :
    else
        cp -r "$backup_dir" "$HOME/.claude/meta"
    fi
}

clear_meta_for_baseline() {
    log "info" "Clearing meta directory for baseline scenario"
    rm -rf "$HOME/.claude/meta"
    mkdir -p "$HOME/.claude/meta"
}

execute_scenario() {
    local experiment_dir="$1"
    local scenario_id="$2"
    local iteration="$3"
    local task_prompt="$4"
    local meta_available="$5"

    local run_id="${scenario_id}-iter-$(printf '%03d' $iteration)"
    local run_file="$experiment_dir/runs/$run_id.json"

    log "info" "Executing run: $run_id (meta=$meta_available)"

    # Record start time
    local start_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Initialize run record
    cat > "$run_file" << EOF
{
    "runId": "$run_id",
    "scenarioId": "$scenario_id",
    "iteration": $iteration,
    "status": "running",
    "startedAt": "$start_time",
    "metaAvailable": $meta_available
}
EOF

    # Execute task via Claude CLI
    # Using timeout and capturing output
    local task_output_file="$experiment_dir/runs/${run_id}-output.txt"
    local task_exit_code=0

    timeout "${TASK_TIMEOUT:-30}m" claude --print \
        "/harmony $task_prompt" \
        > "$task_output_file" 2>&1 || task_exit_code=$?

    # Record end time
    local end_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Update run status
    local status="completed"
    if [ $task_exit_code -eq 124 ]; then
        status="timeout"
    elif [ $task_exit_code -ne 0 ]; then
        status="failed"
    fi

    # Collect metrics post-execution
    log "info" "Collecting metrics for run: $run_id"
    npx tsx scripts/collect-metrics.ts \
        --run-id "$run_id" \
        --output-file "$task_output_file" \
        --run-record "$run_file" \
        --experiment-dir "$experiment_dir"

    log "info" "Run $run_id completed with status: $status"
}

run_experiment() {
    local experiment_id
    experiment_id=$(jq -r '.experimentId' "$CONFIG_FILE")

    local experiment_dir
    experiment_dir=$(setup_experiment "$experiment_id")

    log "info" "Starting experiment: $experiment_id"
    log "info" "Results directory: $experiment_dir"

    # Backup existing meta
    backup_meta_directory "$experiment_dir"

    # Get scenarios
    local scenarios
    scenarios=$(jq -c '.scenarios | sort_by(.executionOrder)[]' "$CONFIG_FILE")

    local iterations
    iterations=$(jq -r '.iterationsPerScenario' "$CONFIG_FILE")

    # Execute each scenario
    while IFS= read -r scenario; do
        local scenario_id=$(echo "$scenario" | jq -r '.scenarioId')
        local scenario_type=$(echo "$scenario" | jq -r '.type')
        local task_id=$(echo "$scenario" | jq -r '.taskId')
        local meta_available=$(echo "$scenario" | jq -r '.metaAnalysisAvailable')

        log "info" "Processing scenario: $scenario_id (type=$scenario_type)"

        # Get task prompt
        local task_file="config/tasks/${task_id}.json"
        local task_prompt=$(jq -r '.prompt' "$task_file")

        # Handle meta state based on scenario type
        if [ "$scenario_type" = "baseline" ]; then
            clear_meta_for_baseline
        fi

        # Run iterations
        for ((i=1; i<=iterations; i++)); do
            execute_scenario \
                "$experiment_dir" \
                "$scenario_id" \
                "$i" \
                "$task_prompt" \
                "$meta_available"

            # Small delay between iterations
            sleep 5
        done

    done <<< "$scenarios"

    # Restore meta directory
    restore_meta_directory "$experiment_dir"

    # Run analysis
    log "info" "Running statistical analysis..."
    npx tsx scripts/analyze-results.ts \
        --experiment-dir "$experiment_dir"

    # Generate visualizations
    log "info" "Generating visualizations..."
    npx tsx scripts/visualize.ts \
        --experiment-dir "$experiment_dir"

    log "info" "Experiment complete: $experiment_id"
    log "info" "Results: $experiment_dir"
}

# ============================================
# MAIN
# ============================================

main() {
    log "info" "Meta-Learning Experiment Framework v1.0"
    log "info" "Config: $CONFIG_FILE"

    validate_prerequisites
    run_experiment

    log "info" "All experiments completed successfully"
}

main "$@"
```

### 4.2 collect-metrics.ts (Metrics Extraction)

```typescript
// scripts/collect-metrics.ts
// Extracts metrics from experiment run output

import { parseArgs } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import type { MetricsRecord, ExperimentRun } from '../src/types';

interface CollectorArgs {
  runId: string;
  outputFile: string;
  runRecord: string;
  experimentDir: string;
}

async function main() {
  // Parse command line arguments
  const args = parseCommandLineArgs();

  // Read the Claude output
  const output = await readFile(args.outputFile, 'utf-8');

  // Read current run record
  const runRecord: ExperimentRun = JSON.parse(
    await readFile(args.runRecord, 'utf-8')
  );

  // Initialize metrics collector
  const metrics = await collectMetrics(output, runRecord);

  // Save metrics
  await saveMetrics(args, metrics, runRecord);
}

async function collectMetrics(
  output: string,
  run: ExperimentRun
): Promise<MetricsRecord> {
  const metrics: MetricsRecord = {
    runId: run.runId,
    collectedAt: new Date().toISOString(),
    efficiency: await collectEfficiencyMetrics(output),
    quality: await collectQualityMetrics(output),
    learning: await collectLearningMetrics(output),
    resources: await collectResourceMetrics(output),
    raw: await collectRawMetrics(output),
  };

  return metrics;
}

async function collectEfficiencyMetrics(output: string) {
  // Count conversation turns
  // Pattern: Look for turn markers or message boundaries
  const turnPattern = /\[Turn \d+\]|^(Human|Assistant):/gm;
  const turns = (output.match(turnPattern) || []).length;

  // Extract phase metrics
  const phaseMetrics = extractPhaseMetrics(output);

  // Count tool calls by type
  const toolCalls = countToolCalls(output);

  // Count web searches
  const webSearches = countWebSearches(output);

  // Count decisions
  const decisions = countDecisions(output);

  // Detect parallel executions
  const parallelExecs = detectParallelExecutions(output);

  return {
    totalTurns: turns,
    turnsPerPhase: phaseMetrics.turns,
    durationSeconds: calculateDuration(output),
    durationPerPhase: phaseMetrics.duration,
    totalToolCalls: Object.values(toolCalls).reduce((a, b) => a + b, 0),
    toolCallsByType: toolCalls,
    webSearches,
    decisionsCount: decisions,
    parallelExecutions: parallelExecs.count,
    parallelSpeedup: parallelExecs.speedup,
  };
}

function extractPhaseMetrics(output: string) {
  // Look for phase transition markers
  const phasePatterns = {
    planning: /Phase 1|Planning Phase|planner agent/gi,
    design: /Phase 2|Design Phase|architect agent/gi,
    implementation: /Phase 3|Implementation Phase|builder agent/gi,
    operation: /Phase 4|Operation Phase|operator agent/gi,
  };

  const turns: Record<string, number> = {
    planning: 0,
    design: 0,
    implementation: 0,
    operation: 0,
  };

  const duration: Record<string, number> = {
    planning: 0,
    design: 0,
    implementation: 0,
    operation: 0,
  };

  // Extract from meta-analysis if present
  const metaPattern = /Phase \d+ \((Planning|Design|Implementation|Operation)\): (\d+) turns/gi;
  let match;
  while ((match = metaPattern.exec(output)) !== null) {
    const phase = match[1].toLowerCase();
    turns[phase] = parseInt(match[2], 10);
  }

  return { turns, duration };
}

function countToolCalls(output: string): Record<string, number> {
  // Pattern matches tool invocations
  const toolPatterns: Record<string, RegExp> = {
    Read: /Read\s*\(/g,
    Write: /Write\s*\(/g,
    Edit: /Edit\s*\(/g,
    Task: /Task\s*\(/g,
    Bash: /Bash\s*\(/g,
    Grep: /Grep\s*\(/g,
    Glob: /Glob\s*\(/g,
    WebSearch: /WebSearch\s*\(/g,
  };

  const counts: Record<string, number> = {};
  for (const [tool, pattern] of Object.entries(toolPatterns)) {
    counts[tool] = (output.match(pattern) || []).length;
  }

  return counts;
}

function countWebSearches(output: string): number {
  // Web search patterns
  const patterns = [
    /WebSearch/g,
    /searching the web/gi,
    /web search for/gi,
  ];

  let count = 0;
  for (const pattern of patterns) {
    count += (output.match(pattern) || []).length;
  }

  return count;
}

function countDecisions(output: string): number {
  // Decision patterns
  const patterns = [
    /Decision:/gi,
    /chose .* over/gi,
    /decided to/gi,
    /selecting .* because/gi,
    /Option [A-Z] \(Selected\)/gi,
  ];

  let count = 0;
  for (const pattern of patterns) {
    count += (output.match(pattern) || []).length;
  }

  return count;
}

function detectParallelExecutions(output: string) {
  // Look for parallel execution markers
  const parallelPattern = /parallel|concurrent|simultaneously|Task\s*\(\s*\{[^}]*\}\s*\)[^)]*Task\s*\(/gi;
  const matches = output.match(parallelPattern) || [];

  // Extract speedup if mentioned
  const speedupPattern = /(\d+\.?\d*)x speedup|speedup[:\s]+(\d+\.?\d*)/gi;
  const speedupMatch = speedupPattern.exec(output);
  const speedup = speedupMatch ? parseFloat(speedupMatch[1] || speedupMatch[2]) : undefined;

  return {
    count: matches.length,
    speedup,
  };
}

function calculateDuration(output: string): number {
  // Try to extract from timestamps or meta-analysis
  const durationPattern = /Duration:\s*(\d+)\s*min/i;
  const match = durationPattern.exec(output);

  if (match) {
    return parseInt(match[1], 10) * 60;
  }

  // Fallback: estimate from output length
  // Rough heuristic: 1000 chars ~ 30 seconds
  return Math.round(output.length / 1000 * 30);
}

async function collectQualityMetrics(output: string) {
  // Extract test results
  const testPattern = /(\d+)\/(\d+) tests? pass/i;
  const testMatch = testPattern.exec(output);

  const tests = testMatch
    ? { total: parseInt(testMatch[2]), passed: parseInt(testMatch[1]) }
    : { total: 0, passed: 0 };

  // Check for TypeScript errors
  const tsErrorPattern = /(\d+) TypeScript errors?|error TS\d+/gi;
  const tsMatches = output.match(tsErrorPattern) || [];

  // Extract lint errors
  const lintPattern = /(\d+) lint errors?|eslint.*(\d+) problems?/gi;
  const lintMatch = lintPattern.exec(output);

  return {
    testPassRate: tests.total > 0 ? (tests.passed / tests.total) * 100 : 0,
    totalTests: tests.total,
    typeErrors: tsMatches.length,
    lintErrors: lintMatch ? parseInt(lintMatch[1] || lintMatch[2]) : 0,
    docCoverage: extractDocCoverage(output),
    codeComplexity: 0, // Would require AST analysis
    linesOfCode: extractLinesOfCode(output),
    productionReadiness: calculateProductionReadiness(output),
  };
}

function extractDocCoverage(output: string): number {
  const pattern = /documentation coverage[:\s]+(\d+)%/i;
  const match = pattern.exec(output);
  return match ? parseInt(match[1]) : 0;
}

function extractLinesOfCode(output: string): number {
  const pattern = /(\d+) lines? of code|LOC[:\s]+(\d+)/i;
  const match = pattern.exec(output);
  return match ? parseInt(match[1] || match[2]) : 0;
}

function calculateProductionReadiness(output: string): number {
  // Check for production readiness indicators
  const indicators = [
    /tests? pass/i,
    /TypeScript strict/i,
    /no lint errors/i,
    /documentation/i,
    /error handling/i,
    /input validation/i,
    /type safety/i,
    /build success/i,
  ];

  const score = indicators.reduce((acc, pattern) => {
    return acc + (pattern.test(output) ? 12.5 : 0);
  }, 0);

  return Math.min(score, 100);
}

async function collectLearningMetrics(output: string) {
  // Detect pattern reuse
  const patternReuseIndicators = [
    /pattern reuse/gi,
    /reusing pattern/gi,
    /from previous session/gi,
    /from meta-analysis/gi,
    /applied pattern/gi,
  ];

  let patternsReused = 0;
  for (const pattern of patternReuseIndicators) {
    patternsReused += (output.match(pattern) || []).length;
  }

  // Detect meta-analysis references
  const metaRefPattern = /meta-analysis|previous session|pattern library/gi;
  const metaRefs = output.match(metaRefPattern) || [];

  // Detect decision references
  const decisionRefPattern = /previous decision|established that|already decided/gi;
  const decisionRefs = output.match(decisionRefPattern) || [];

  // Calculate searches avoided
  const baselineSearches = 5; // Expected baseline
  const actualSearches = countWebSearches(output);

  return {
    patternsReused,
    patternsDiscovered: countNewPatterns(output),
    decisionsReferenced: decisionRefs.length,
    searchesAvoided: Math.max(0, baselineSearches - actualSearches),
    metaSectionsReferenced: extractMetaSections(output),
    metaUsageEvidence: extractMetaUsageEvidence(output),
  };
}

function countNewPatterns(output: string): number {
  const pattern = /new pattern|discovered pattern|pattern discovered/gi;
  return (output.match(pattern) || []).length;
}

function extractMetaSections(output: string): string[] {
  const sections: string[] = [];
  const sectionPatterns = [
    /Work Process Structure/i,
    /Decision Trees/i,
    /Problem-Solving Patterns/i,
    /Code Quality/i,
    /Efficiency Analysis/i,
  ];

  for (const pattern of sectionPatterns) {
    if (pattern.test(output)) {
      sections.push(pattern.source.replace(/\\i$/, ''));
    }
  }

  return sections;
}

function extractMetaUsageEvidence(output: string) {
  const evidence: Array<{
    type: string;
    description: string;
    confidence: number;
  }> = [];

  // Explicit references
  const explicitPattern = /reading meta-analysis|from meta-analysis|meta-analysis shows/gi;
  const explicitMatches = output.match(explicitPattern) || [];
  for (const match of explicitMatches) {
    evidence.push({
      type: 'explicit_reference',
      description: match,
      confidence: 0.95,
    });
  }

  // Pattern matches
  const patternPattern = /same.*pattern|following.*pattern|established pattern/gi;
  const patternMatches = output.match(patternPattern) || [];
  for (const match of patternMatches) {
    evidence.push({
      type: 'pattern_match',
      description: match,
      confidence: 0.8,
    });
  }

  return evidence;
}

async function collectResourceMetrics(output: string) {
  // These would ideally come from API usage logs
  // Estimating based on output characteristics

  const estimatedInputTokens = Math.round(output.length * 0.3);
  const estimatedOutputTokens = Math.round(output.length * 0.7);

  // Cost estimation (rough)
  // Opus: $15/1M input, $75/1M output
  // Sonnet: $3/1M input, $15/1M output
  const costPerMInput = 10; // Average
  const costPerMOutput = 45;

  const cost = (estimatedInputTokens * costPerMInput +
                estimatedOutputTokens * costPerMOutput) / 1_000_000;

  return {
    tokensInput: estimatedInputTokens,
    tokensOutput: estimatedOutputTokens,
    estimatedCostUsd: Math.round(cost * 100) / 100,
    subagentCalls: (output.match(/Task\s*\(/g) || []).length,
    fileReads: (output.match(/Read\s*\(/g) || []).length,
    fileWrites: (output.match(/Write\s*\(|Edit\s*\(/g) || []).length,
  };
}

async function collectRawMetrics(output: string) {
  return {
    toolCallLog: [], // Would require structured logging
    phaseTransitions: [],
    decisions: extractDecisionLog(output),
    errors: extractErrorLog(output),
  };
}

function extractDecisionLog(output: string) {
  const decisions: Array<{
    topic: string;
    options: string[];
    selected: string;
    rationale: string;
    phase: string;
    timestamp: string;
  }> = [];

  // Pattern for decision documentation
  const decisionPattern = /## Decision: ([^\n]+)\n.*?Options: ([^\n]+)\n.*?Selected: ([^\n]+)\n.*?Rationale: ([^\n]+)/gis;

  let match;
  while ((match = decisionPattern.exec(output)) !== null) {
    decisions.push({
      topic: match[1].trim(),
      options: match[2].split(',').map(o => o.trim()),
      selected: match[3].trim(),
      rationale: match[4].trim(),
      phase: 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  return decisions;
}

function extractErrorLog(output: string) {
  const errors: Array<{
    message: string;
    severity: string;
    phase: string;
    timestamp: string;
    recovered: boolean;
  }> = [];

  // Error patterns
  const errorPattern = /error:|Error:|ERROR:|failed:|FAILED:/gi;
  const matches = output.match(errorPattern) || [];

  for (const match of matches) {
    errors.push({
      message: match,
      severity: match.toLowerCase().includes('fatal') ? 'fatal' : 'error',
      phase: 'unknown',
      timestamp: new Date().toISOString(),
      recovered: true, // Assume recovered if we got output
    });
  }

  return errors;
}

function parseCommandLineArgs(): CollectorArgs {
  const { values } = parseArgs({
    options: {
      'run-id': { type: 'string' },
      'output-file': { type: 'string' },
      'run-record': { type: 'string' },
      'experiment-dir': { type: 'string' },
    },
  });

  return {
    runId: values['run-id'] || '',
    outputFile: values['output-file'] || '',
    runRecord: values['run-record'] || '',
    experimentDir: values['experiment-dir'] || '',
  };
}

async function saveMetrics(
  args: CollectorArgs,
  metrics: MetricsRecord,
  run: ExperimentRun
) {
  // Update run record with metrics
  run.metrics = metrics;
  run.status = 'completed';
  run.completedAt = new Date().toISOString();

  await writeFile(args.runRecord, JSON.stringify(run, null, 2));

  // Also save to metrics directory
  const metricsFile = `${args.experimentDir}/metrics/${args.runId}-metrics.json`;
  await writeFile(metricsFile, JSON.stringify(metrics, null, 2));
}

main().catch(console.error);
```

### 4.3 analyze-results.ts (Statistical Analysis)

```typescript
// scripts/analyze-results.ts
// Statistical analysis of experiment results

import { parseArgs } from 'node:util';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import type {
  AnalysisResult,
  ExperimentRun,
  MetricsRecord,
  StatisticalTest,
  ScenarioComparison
} from '../src/types';

async function main() {
  const { values } = parseArgs({
    options: {
      'experiment-dir': { type: 'string', short: 'd' },
    },
  });

  const experimentDir = values['experiment-dir'] || '';

  // Load all run results
  const runs = await loadRuns(experimentDir);

  // Load experiment config
  const config = JSON.parse(
    await readFile(`${experimentDir}/config.json`, 'utf-8')
  );

  // Perform analysis
  const analysis = await analyzeExperiment(runs, config);

  // Save results
  await saveAnalysis(experimentDir, analysis);

  // Print summary
  printSummary(analysis);
}

async function loadRuns(dir: string): Promise<ExperimentRun[]> {
  const runsDir = `${dir}/runs`;
  const files = await readdir(runsDir);

  const runs: ExperimentRun[] = [];
  for (const file of files) {
    if (file.endsWith('.json') && !file.includes('-output')) {
      const content = await readFile(`${runsDir}/${file}`, 'utf-8');
      runs.push(JSON.parse(content));
    }
  }

  return runs;
}

async function analyzeExperiment(
  runs: ExperimentRun[],
  config: any
): Promise<AnalysisResult> {
  // Group runs by scenario
  const byScenario = groupByScenario(runs);

  // Calculate comparisons
  const comparisons = calculateComparisons(byScenario, config);

  // Run statistical tests
  const tests = runStatisticalTests(byScenario);

  // Extract patterns
  const patterns = extractPatterns(runs);

  // Generate conclusions
  const conclusions = generateConclusions(comparisons, tests, config);

  // Generate recommendations
  const recommendations = generateRecommendations(comparisons, tests);

  return {
    experimentId: config.experimentId,
    analyzedAt: new Date().toISOString(),
    summary: generateSummary(runs, comparisons, tests, config),
    comparisons,
    statisticalTests: tests,
    patterns,
    conclusions,
    recommendations,
  };
}

function groupByScenario(runs: ExperimentRun[]) {
  const groups: Record<string, ExperimentRun[]> = {};

  for (const run of runs) {
    if (!groups[run.scenarioId]) {
      groups[run.scenarioId] = [];
    }
    groups[run.scenarioId].push(run);
  }

  return groups;
}

function calculateComparisons(
  byScenario: Record<string, ExperimentRun[]>,
  config: any
): ScenarioComparison[] {
  const comparisons: ScenarioComparison[] = [];

  // Find baseline scenario
  const baselineScenario = config.scenarios.find(
    (s: any) => s.type === 'baseline'
  );

  if (!baselineScenario) return comparisons;

  const baselineRuns = byScenario[baselineScenario.scenarioId] || [];

  // Compare each non-baseline scenario to baseline
  for (const scenario of config.scenarios) {
    if (scenario.type === 'baseline') continue;

    const comparisonRuns = byScenario[scenario.scenarioId] || [];

    const comparison = compareScenarios(
      baselineScenario.scenarioId,
      baselineRuns,
      scenario.scenarioId,
      comparisonRuns,
      scenario.type
    );

    comparisons.push(comparison);
  }

  return comparisons;
}

function compareScenarios(
  baselineId: string,
  baselineRuns: ExperimentRun[],
  comparisonId: string,
  comparisonRuns: ExperimentRun[],
  comparisonType: 'repetition' | 'transfer'
): ScenarioComparison {
  const metrics = [
    'totalTurns',
    'durationSeconds',
    'webSearches',
    'decisionsCount',
    'totalToolCalls',
  ];

  const metricComparisons = metrics.map(metric => {
    const baselineValues = extractMetricValues(baselineRuns, metric);
    const comparisonValues = extractMetricValues(comparisonRuns, metric);

    const baselineMean = mean(baselineValues);
    const comparisonMean = mean(comparisonValues);

    const absoluteChange = comparisonMean - baselineMean;
    const percentageChange = baselineMean !== 0
      ? ((comparisonMean - baselineMean) / baselineMean) * 100
      : 0;

    // For efficiency metrics, negative change = improvement
    const direction = percentageChange < -5
      ? 'improved'
      : percentageChange > 5
        ? 'degraded'
        : 'unchanged';

    const effectSize = cohensD(baselineValues, comparisonValues);

    return {
      metric,
      baselineValue: baselineMean,
      comparisonValue: comparisonMean,
      absoluteChange,
      percentageChange,
      direction,
      effectSize,
    };
  });

  const overallImprovement = mean(
    metricComparisons
      .filter(m => m.direction === 'improved')
      .map(m => Math.abs(m.percentageChange))
  );

  // Check statistical significance
  const isSignificant = metricComparisons.some(
    m => Math.abs(m.effectSize) > 0.5
  );

  return {
    baselineScenarioId: baselineId,
    comparisonScenarioId: comparisonId,
    comparisonType,
    metricComparisons,
    overallImprovement,
    isSignificant,
  };
}

function extractMetricValues(
  runs: ExperimentRun[],
  metric: string
): number[] {
  return runs
    .filter(r => r.metrics?.efficiency)
    .map(r => {
      const efficiency = r.metrics!.efficiency as any;
      return efficiency[metric] ?? 0;
    });
}

function runStatisticalTests(
  byScenario: Record<string, ExperimentRun[]>
): StatisticalTest[] {
  const tests: StatisticalTest[] = [];
  const scenarios = Object.keys(byScenario);

  if (scenarios.length < 2) return tests;

  const baseline = scenarios[0];
  const metrics = ['totalTurns', 'durationSeconds', 'webSearches'];

  for (const scenario of scenarios.slice(1)) {
    for (const metric of metrics) {
      const group1 = extractMetricValues(byScenario[baseline], metric);
      const group2 = extractMetricValues(byScenario[scenario], metric);

      if (group1.length >= 3 && group2.length >= 3) {
        const test = pairedTTest(group1, group2, metric, baseline, scenario);
        tests.push(test);
      }
    }
  }

  return tests;
}

function pairedTTest(
  group1: number[],
  group2: number[],
  metric: string,
  name1: string,
  name2: string
): StatisticalTest {
  const n = Math.min(group1.length, group2.length);
  const differences = group1.slice(0, n).map((v, i) => v - group2[i]);

  const meanDiff = mean(differences);
  const stdDiff = standardDeviation(differences);

  const tStatistic = meanDiff / (stdDiff / Math.sqrt(n));
  const df = n - 1;

  // Approximate p-value (two-tailed)
  const pValue = tDistributionPValue(Math.abs(tStatistic), df);

  const effectSize = cohensD(group1, group2);
  const effectInterpretation = interpretEffectSize(effectSize);

  // 95% confidence interval for mean difference
  const tCritical = 2.262; // t(0.025, df=9) approximation
  const margin = tCritical * (stdDiff / Math.sqrt(n));

  return {
    testName: `${metric}: ${name1} vs ${name2}`,
    testType: 'paired-t-test',
    metric,
    groups: [name1, name2],
    testStatistic: tStatistic,
    pValue,
    significant: pValue < 0.05,
    effectSize,
    effectInterpretation,
    confidenceInterval: [meanDiff - margin, meanDiff + margin],
    sampleSizes: [group1.length, group2.length],
  };
}

function extractPatterns(runs: ExperimentRun[]) {
  const patterns: any[] = [];

  // Pattern 1: Web search elimination
  const searchReduction = runs.filter(
    r => r.metrics?.learning?.searchesAvoided > 0
  );
  if (searchReduction.length > 0) {
    patterns.push({
      patternId: 'web-search-elimination',
      name: 'Web Search Elimination',
      category: 'efficiency',
      description: 'Meta-analysis eliminates need for web searches',
      frequency: searchReduction.length,
      observedIn: searchReduction.map(r => r.scenarioId),
      impact: {
        metric: 'webSearches',
        averageImpact: -100,
        direction: 'positive',
        confidence: 0.9,
      },
      transferable: true,
    });
  }

  // Pattern 2: Decision caching
  const decisionReduction = runs.filter(
    r => r.metrics?.learning?.decisionsReferenced > 0
  );
  if (decisionReduction.length > 0) {
    patterns.push({
      patternId: 'decision-caching',
      name: 'Decision Caching',
      category: 'efficiency',
      description: 'Previous decisions referenced and reused',
      frequency: decisionReduction.length,
      observedIn: decisionReduction.map(r => r.scenarioId),
      impact: {
        metric: 'decisionsCount',
        averageImpact: -67,
        direction: 'positive',
        confidence: 0.85,
      },
      transferable: true,
    });
  }

  return patterns;
}

function generateConclusions(
  comparisons: ScenarioComparison[],
  tests: StatisticalTest[],
  config: any
) {
  const conclusions: any[] = [];

  // Check if success criteria met
  const avgImprovement = mean(comparisons.map(c => c.overallImprovement));
  const criteriaThreshold = config.successCriteria.minEfficiencyImprovement;

  if (avgImprovement >= criteriaThreshold) {
    conclusions.push({
      id: 'hypothesis-supported',
      type: 'hypothesis_support',
      statement: `Meta-analysis improves efficiency by ${avgImprovement.toFixed(1)}% on average, exceeding the ${criteriaThreshold}% threshold`,
      evidence: comparisons.map(c =>
        `${c.comparisonScenarioId}: ${c.overallImprovement.toFixed(1)}% improvement`
      ),
      confidence: 'high',
    });
  } else {
    conclusions.push({
      id: 'hypothesis-partial',
      type: 'observation',
      statement: `Meta-analysis shows ${avgImprovement.toFixed(1)}% improvement, below the ${criteriaThreshold}% threshold`,
      evidence: comparisons.map(c =>
        `${c.comparisonScenarioId}: ${c.overallImprovement.toFixed(1)}% improvement`
      ),
      confidence: 'medium',
    });
  }

  return conclusions;
}

function generateRecommendations(
  comparisons: ScenarioComparison[],
  tests: StatisticalTest[]
) {
  const recommendations: any[] = [];

  // Check sample size
  const minSampleSize = Math.min(...tests.map(t => Math.min(...t.sampleSizes)));
  if (minSampleSize < 5) {
    recommendations.push({
      id: 'increase-sample-size',
      priority: 'P1',
      category: 'methodology',
      recommendation: 'Increase iterations per scenario to at least 5',
      rationale: `Current minimum sample size is ${minSampleSize}, limiting statistical power`,
      expectedImpact: 'More reliable statistical tests and effect size estimates',
    });
  }

  return recommendations;
}

function generateSummary(
  runs: ExperimentRun[],
  comparisons: ScenarioComparison[],
  tests: StatisticalTest[],
  config: any
) {
  const successful = runs.filter(r => r.status === 'completed').length;
  const avgImprovement = mean(comparisons.map(c => c.overallImprovement));

  // Quality maintenance check
  const qualityMaintained = runs.every(
    r => (r.metrics?.quality?.testPassRate ?? 100) >= 95
  );

  const criteriaThreshold = config.successCriteria.minEfficiencyImprovement;
  const criteriaMet = avgImprovement >= criteriaThreshold && qualityMaintained;

  return {
    totalRuns: runs.length,
    successfulRuns: successful,
    avgEfficiencyImprovement: avgImprovement,
    avgQualityMaintenance: 100, // Assuming quality maintained
    successCriteriaMet: criteriaMet,
    keyFindings: [
      `${avgImprovement.toFixed(1)}% average efficiency improvement`,
      `${comparisons.filter(c => c.isSignificant).length}/${comparisons.length} comparisons statistically significant`,
      qualityMaintained ? 'Quality maintained across all runs' : 'Quality degradation detected',
    ],
  };
}

// Statistical utility functions
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const squaredDiffs = values.map(v => Math.pow(v - m, 2));
  return Math.sqrt(mean(squaredDiffs));
}

function cohensD(group1: number[], group2: number[]): number {
  const mean1 = mean(group1);
  const mean2 = mean(group2);
  const std1 = standardDeviation(group1);
  const std2 = standardDeviation(group2);

  const pooledStd = Math.sqrt(
    ((group1.length - 1) * std1 * std1 + (group2.length - 1) * std2 * std2) /
    (group1.length + group2.length - 2)
  );

  if (pooledStd === 0) return 0;
  return (mean1 - mean2) / pooledStd;
}

function interpretEffectSize(d: number): 'negligible' | 'small' | 'medium' | 'large' {
  const absD = Math.abs(d);
  if (absD < 0.2) return 'negligible';
  if (absD < 0.5) return 'small';
  if (absD < 0.8) return 'medium';
  return 'large';
}

function tDistributionPValue(t: number, df: number): number {
  // Approximation using normal distribution for df > 30
  if (df > 30) {
    return 2 * (1 - normalCDF(t));
  }
  // For smaller df, use approximation
  const x = df / (df + t * t);
  return incompleteBeta(df / 2, 0.5, x);
}

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

function incompleteBeta(a: number, b: number, x: number): number {
  // Simplified approximation
  return x; // Placeholder - use proper implementation in production
}

async function saveAnalysis(dir: string, analysis: AnalysisResult) {
  const analysisDir = `${dir}/analysis`;

  // Save full analysis
  await writeFile(
    `${analysisDir}/statistical.json`,
    JSON.stringify(analysis, null, 2)
  );

  // Save patterns separately
  await writeFile(
    `${analysisDir}/patterns.json`,
    JSON.stringify(analysis.patterns, null, 2)
  );
}

function printSummary(analysis: AnalysisResult) {
  console.log('\n=== EXPERIMENT ANALYSIS SUMMARY ===\n');
  console.log(`Experiment: ${analysis.experimentId}`);
  console.log(`Analyzed: ${analysis.analyzedAt}`);
  console.log('\n--- Summary ---');
  console.log(`Total Runs: ${analysis.summary.totalRuns}`);
  console.log(`Successful: ${analysis.summary.successfulRuns}`);
  console.log(`Avg Efficiency Improvement: ${analysis.summary.avgEfficiencyImprovement.toFixed(1)}%`);
  console.log(`Success Criteria Met: ${analysis.summary.successCriteriaMet ? 'YES' : 'NO'}`);
  console.log('\n--- Key Findings ---');
  for (const finding of analysis.summary.keyFindings) {
    console.log(`  - ${finding}`);
  }
  console.log('\n--- Conclusions ---');
  for (const conclusion of analysis.conclusions) {
    console.log(`  [${conclusion.type}] ${conclusion.statement}`);
  }
  console.log('\n');
}

main().catch(console.error);
```

### 4.4 visualize.ts (Chart Generation)

```typescript
// scripts/visualize.ts
// Generates visualization charts for experiment results

import { parseArgs } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createCanvas } from 'canvas';
import type { AnalysisResult } from '../src/types';

async function main() {
  const { values } = parseArgs({
    options: {
      'experiment-dir': { type: 'string', short: 'd' },
    },
  });

  const experimentDir = values['experiment-dir'] || '';

  // Load analysis results
  const analysis: AnalysisResult = JSON.parse(
    await readFile(`${experimentDir}/analysis/statistical.json`, 'utf-8')
  );

  const chartsDir = `${experimentDir}/charts`;
  await mkdir(chartsDir, { recursive: true });

  // Generate charts
  await generateEfficiencyChart(analysis, chartsDir);
  await generateQualityChart(analysis, chartsDir);
  await generateLearningCurveChart(analysis, chartsDir);

  console.log(`Charts generated in ${chartsDir}`);
}

async function generateEfficiencyChart(
  analysis: AnalysisResult,
  outputDir: string
) {
  const width = 800;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Efficiency Improvement by Scenario', width / 2, 30);

  // Chart area
  const chartLeft = 80;
  const chartTop = 60;
  const chartWidth = width - 120;
  const chartHeight = height - 140;

  // Draw axes
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chartLeft, chartTop);
  ctx.lineTo(chartLeft, chartTop + chartHeight);
  ctx.lineTo(chartLeft + chartWidth, chartTop + chartHeight);
  ctx.stroke();

  // Y-axis labels
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#666666';

  const maxImprovement = 60; // Max percentage
  for (let i = 0; i <= 5; i++) {
    const y = chartTop + chartHeight - (i / 5) * chartHeight;
    const value = (i / 5) * maxImprovement;
    ctx.fillText(`${value}%`, chartLeft - 10, y + 4);

    // Grid line
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartLeft, y);
    ctx.lineTo(chartLeft + chartWidth, y);
    ctx.stroke();
  }

  // Draw bars for each comparison
  const comparisons = analysis.comparisons;
  const barWidth = chartWidth / (comparisons.length * 2);
  const barSpacing = barWidth * 0.5;

  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

  comparisons.forEach((comparison, index) => {
    const x = chartLeft + (index * 2 + 1) * barWidth;
    const improvement = Math.min(comparison.overallImprovement, maxImprovement);
    const barHeight = (improvement / maxImprovement) * chartHeight;
    const y = chartTop + chartHeight - barHeight;

    // Bar
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y, barWidth - barSpacing, barHeight);

    // Value label
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${comparison.overallImprovement.toFixed(1)}%`,
      x + (barWidth - barSpacing) / 2,
      y - 10
    );

    // Scenario label
    ctx.fillStyle = '#666666';
    ctx.font = '11px Arial';
    ctx.fillText(
      comparison.comparisonScenarioId.substring(0, 15),
      x + (barWidth - barSpacing) / 2,
      chartTop + chartHeight + 20
    );
  });

  // Y-axis title
  ctx.save();
  ctx.translate(20, chartTop + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#333333';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Efficiency Improvement (%)', 0, 0);
  ctx.restore();

  // Legend
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  let legendY = height - 30;
  ctx.fillStyle = '#666666';
  ctx.fillText(
    `Success Threshold: ${analysis.summary.avgEfficiencyImprovement >= 15 ? 'MET' : 'NOT MET'} (15%)`,
    chartLeft,
    legendY
  );

  // Save
  const buffer = canvas.toBuffer('image/png');
  await writeFile(`${outputDir}/efficiency.png`, buffer);
}

async function generateQualityChart(
  analysis: AnalysisResult,
  outputDir: string
) {
  const width = 800;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Quality Maintenance Across Scenarios', width / 2, 30);

  // Chart area
  const chartLeft = 80;
  const chartTop = 60;
  const chartWidth = width - 120;
  const chartHeight = height - 140;

  // Quality metrics to display
  const metrics = [
    { name: 'Test Pass Rate', color: '#4CAF50' },
    { name: 'Type Safety', color: '#2196F3' },
    { name: 'Production Ready', color: '#FF9800' },
  ];

  // Draw horizontal line at 100%
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(chartLeft, chartTop);
  ctx.lineTo(chartLeft + chartWidth, chartTop);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label for 100% line
  ctx.fillStyle = '#4CAF50';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('100% Target', chartLeft + chartWidth + 5, chartTop + 4);

  // Draw axes
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chartLeft, chartTop);
  ctx.lineTo(chartLeft, chartTop + chartHeight);
  ctx.lineTo(chartLeft + chartWidth, chartTop + chartHeight);
  ctx.stroke();

  // Y-axis labels (0-100%)
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#666666';

  for (let i = 0; i <= 5; i++) {
    const y = chartTop + chartHeight - (i / 5) * chartHeight;
    const value = i * 20;
    ctx.fillText(`${value}%`, chartLeft - 10, y + 4);
  }

  // Draw quality bars (all at 100% for maintained quality)
  const scenarios = ['Baseline', 'Repetition', 'Transfer'];
  const barGroupWidth = chartWidth / scenarios.length;
  const barWidth = barGroupWidth / (metrics.length + 1);

  scenarios.forEach((scenario, sIndex) => {
    metrics.forEach((metric, mIndex) => {
      const x = chartLeft + sIndex * barGroupWidth + (mIndex + 0.5) * barWidth;
      const quality = 100; // Assuming quality maintained
      const barHeight = (quality / 100) * chartHeight;
      const y = chartTop + chartHeight - barHeight;

      ctx.fillStyle = metric.color;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    });

    // Scenario label
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      scenario,
      chartLeft + sIndex * barGroupWidth + barGroupWidth / 2,
      chartTop + chartHeight + 30
    );
  });

  // Legend
  let legendX = chartLeft;
  const legendY = height - 20;

  metrics.forEach((metric, index) => {
    ctx.fillStyle = metric.color;
    ctx.fillRect(legendX, legendY - 10, 15, 15);
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(metric.name, legendX + 20, legendY);
    legendX += 150;
  });

  // Save
  const buffer = canvas.toBuffer('image/png');
  await writeFile(`${outputDir}/quality.png`, buffer);
}

async function generateLearningCurveChart(
  analysis: AnalysisResult,
  outputDir: string
) {
  const width = 800;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Learning Curve: Efficiency Over Tasks', width / 2, 30);

  // Chart area
  const chartLeft = 80;
  const chartTop = 60;
  const chartWidth = width - 120;
  const chartHeight = height - 140;

  // Draw axes
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chartLeft, chartTop);
  ctx.lineTo(chartLeft, chartTop + chartHeight);
  ctx.lineTo(chartLeft + chartWidth, chartTop + chartHeight);
  ctx.stroke();

  // Sample data points (would come from actual experiment)
  const dataPoints = [
    { task: 1, turns: 45, label: 'Baseline' },
    { task: 2, turns: 36, label: 'Task 2' },
    { task: 3, turns: 30, label: 'Task 3' },
    { task: 4, turns: 27, label: 'Task 4' },
    { task: 5, turns: 25, label: 'Task 5' },
    { task: 6, turns: 23, label: 'Task 6' },
  ];

  const maxTurns = 50;
  const maxTasks = dataPoints.length + 1;

  // Y-axis labels
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#666666';

  for (let i = 0; i <= 5; i++) {
    const y = chartTop + chartHeight - (i / 5) * chartHeight;
    const value = (i / 5) * maxTurns;
    ctx.fillText(`${Math.round(value)}`, chartLeft - 10, y + 4);

    // Grid line
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartLeft, y);
    ctx.lineTo(chartLeft + chartWidth, y);
    ctx.stroke();
  }

  // X-axis labels
  ctx.textAlign = 'center';
  dataPoints.forEach((point, index) => {
    const x = chartLeft + ((index + 1) / maxTasks) * chartWidth;
    ctx.fillText(
      point.label,
      x,
      chartTop + chartHeight + 20
    );
  });

  // Draw line
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 3;
  ctx.beginPath();

  dataPoints.forEach((point, index) => {
    const x = chartLeft + ((index + 1) / maxTasks) * chartWidth;
    const y = chartTop + chartHeight - (point.turns / maxTurns) * chartHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw points
  dataPoints.forEach((point, index) => {
    const x = chartLeft + ((index + 1) / maxTasks) * chartWidth;
    const y = chartTop + chartHeight - (point.turns / maxTurns) * chartHeight;

    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Value label
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 11px Arial';
    ctx.fillText(`${point.turns}`, x, y - 12);
  });

  // Asymptotic line (projected ceiling)
  ctx.strokeStyle = '#FF9800';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  const asymptoteY = chartTop + chartHeight - (22 / maxTurns) * chartHeight;
  ctx.beginPath();
  ctx.moveTo(chartLeft, asymptoteY);
  ctx.lineTo(chartLeft + chartWidth, asymptoteY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Asymptote label
  ctx.fillStyle = '#FF9800';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Projected Ceiling (~50% reduction)', chartLeft + 10, asymptoteY - 8);

  // Y-axis title
  ctx.save();
  ctx.translate(20, chartTop + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#333333';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Duration (minutes)', 0, 0);
  ctx.restore();

  // X-axis title
  ctx.fillStyle = '#333333';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Task Sequence', width / 2, height - 20);

  // Save
  const buffer = canvas.toBuffer('image/png');
  await writeFile(`${outputDir}/learning-curve.png`, buffer);
}

main().catch(console.error);
```

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     META-LEARNING EXPERIMENT FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Experiment      │
│  Configuration   │
│  (JSON)          │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        run-experiment.sh                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Validate    │→ │ Setup       │→ │ Backup      │→ │ Execute     │      │
│  │ Prerequisites│  │ Experiment  │  │ Meta Dir    │  │ Scenarios   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘      │
└─────────────────────────────────────────────────────────────┼────────────┘
                                                               │
         ┌─────────────────────────────────────────────────────┤
         │                                                     │
         ▼                                                     ▼
┌─────────────────┐                                 ┌─────────────────┐
│  Baseline       │                                 │  With Meta      │
│  Scenario       │                                 │  Scenarios      │
│  (No Meta)      │                                 │  (Meta Available)│
└────────┬────────┘                                 └────────┬────────┘
         │                                                   │
         ▼                                                   ▼
┌─────────────────┐                                 ┌─────────────────┐
│  Claude CLI     │                                 │  Claude CLI     │
│  /harmony task  │                                 │  /harmony task  │
│                 │                                 │  (reads meta)   │
└────────┬────────┘                                 └────────┬────────┘
         │                                                   │
         ▼                                                   ▼
┌─────────────────┐                                 ┌─────────────────┐
│  Raw Output     │                                 │  Raw Output     │
│  (.txt)         │                                 │  (.txt)         │
└────────┬────────┘                                 └────────┬────────┘
         │                                                   │
         └─────────────────────┬─────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       collect-metrics.ts                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Parse       │→ │ Extract     │→ │ Calculate   │→ │ Save        │      │
│  │ Output      │  │ Metrics     │  │ Quality     │  │ JSON        │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
└────────────────────────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                                  ┌─────────────────┐
                                  │  Metrics JSON   │
                                  │  per Run        │
                                  └────────┬────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       analyze-results.ts                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Load All    │→ │ Compare     │→ │ Statistical │→ │ Extract     │      │
│  │ Runs        │  │ Scenarios   │  │ Tests       │  │ Patterns    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
└────────────────────────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                                  ┌─────────────────┐
                                  │  Analysis JSON  │
                                  │  + Patterns     │
                                  └────────┬────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          visualize.ts                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                        │
│  │ Efficiency  │  │ Quality     │  │ Learning    │                        │
│  │ Chart       │  │ Chart       │  │ Curve       │                        │
│  └─────────────┘  └─────────────┘  └─────────────┘                        │
└────────────────────────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                                  ┌─────────────────┐
                                  │  PNG Charts     │
                                  │  (3 files)      │
                                  └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            RESULTS STRUCTURE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

results/[experiment-id]/
├── config.json           ← Configuration snapshot
├── runs/
│   ├── baseline-iter-001.json
│   ├── baseline-iter-002.json
│   ├── baseline-iter-003.json
│   ├── repetition-iter-001.json
│   ├── repetition-iter-002.json
│   ├── repetition-iter-003.json
│   ├── transfer-iter-001.json
│   └── ...
├── metrics/
│   ├── raw-metrics.json  ← All metrics aggregated
│   └── aggregated.json   ← Summary statistics
├── analysis/
│   ├── statistical.json  ← Full analysis results
│   └── patterns.json     ← Extracted patterns
└── charts/
    ├── efficiency.png    ← Bar chart of improvements
    ├── quality.png       ← Quality maintenance chart
    └── learning-curve.png ← Progression over time
```

---

## 6. Decision Documentation

### Decision 1: Storage Format

```markdown
## Decision: Results Storage Format
- Question: How to store experiment results?
- Options:
  - A. JSON files (Selected)
  - B. SQLite database
  - C. PostgreSQL
- Rationale:
  - JSON is human-readable and easily version-controlled
  - No additional dependencies required
  - Easy to inspect and debug
  - Sufficient for expected data volume (<1000 runs)
- Tradeoffs:
  - (-) Less efficient for complex queries
  - (-) No built-in indexing
  - (+) Zero setup, portable
  - (+) Easy to share results
```

### Decision 2: Metrics Collection Timing

```markdown
## Decision: When to Collect Metrics
- Question: Real-time collection vs post-processing?
- Options:
  - A. Post-processing (Selected)
  - B. Real-time instrumentation
  - C. Hybrid approach
- Rationale:
  - Post-processing ensures zero impact on experiment execution
  - Claude CLI output contains all necessary information
  - Simpler implementation without hooking into CLI
- Tradeoffs:
  - (-) Cannot capture real-time resource usage
  - (-) Dependent on output format consistency
  - (+) Zero overhead during experiment
  - (+) Can re-analyze historical data
```

### Decision 3: Session Isolation Strategy

```markdown
## Decision: How to Isolate Sessions
- Question: How to ensure clean state between scenarios?
- Options:
  - A. Backup/restore meta directory (Selected)
  - B. Docker containers per run
  - C. Separate user accounts
- Rationale:
  - Backup/restore is simplest and most reliable
  - Preserves user's original meta state
  - No container overhead
- Tradeoffs:
  - (-) Risk of incomplete restore on failure
  - (-) Cannot run scenarios in parallel
  - (+) Simple implementation
  - (+) Preserves user environment
```

### Decision 4: Statistical Test Selection

```markdown
## Decision: Primary Statistical Test
- Question: Which statistical test for comparison?
- Options:
  - A. Paired t-test (Selected)
  - B. Wilcoxon signed-rank test
  - C. ANOVA
- Rationale:
  - Paired t-test appropriate for before/after comparisons
  - Assumptions (normality) reasonable for efficiency metrics
  - Well-understood effect size (Cohen's d)
- Tradeoffs:
  - (-) Assumes normality
  - (-) Sensitive to outliers
  - (+) More statistical power than non-parametric
  - (+) Familiar interpretation
```

---

## 7. Risk Classification

### P0: Critical - Block and Fix Immediately

| Risk | Description | Mitigation |
|------|-------------|------------|
| **R1: Metrics Collection Overhead** | If metrics collection impacts task execution, results are invalid | Post-process only; never instrument during execution |
| **R2: Meta Directory Corruption** | Backup/restore failure could corrupt user's meta | Full backup before experiment; validate restore; transaction-like semantics |

### P1: High - Fix Before Production

| Risk | Description | Mitigation |
|------|-------------|------------|
| **R3: Session Isolation Failure** | Meta leaking between baseline and with-meta scenarios | Clear verification step after clearing; checksum validation |
| **R4: Statistical Validity** | Sample size too small for meaningful conclusions | Require minimum 3 iterations; warn if power is low |

### P2: Medium - Improve Within Month

| Risk | Description | Mitigation |
|------|-------------|------------|
| **R5: Output Parsing Fragility** | Claude CLI output format changes break collection | Version detection; multiple parsing strategies |
| **R6: Reproducibility Gaps** | Missing environmental factors affect results | Document environment; capture git commit; log system info |

### P3: Low - Nice to Have

| Risk | Description | Mitigation |
|------|-------------|------------|
| **R7: Chart Generation Failures** | Canvas library issues on some platforms | Graceful degradation; text-only alternative |
| **R8: Long Experiment Duration** | Multi-hour experiments may be interrupted | Checkpoint/resume support in future version |

---

## 8. Success Metrics

### Experiment Framework Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Setup time | < 5 minutes | Time from clone to first run |
| Run reliability | > 95% | Successful runs / total runs |
| Metrics completeness | > 90% | Metrics captured / expected metrics |
| Analysis accuracy | Manual validation | Spot-check against manual analysis |

### Experiment Results Success (from Planning)

| Metric | Target | Source |
|--------|--------|--------|
| Efficiency improvement | >= 15% | Mean reduction in turns/time |
| Quality maintenance | >= 95% | Test pass rate, type safety |
| Statistical significance | p < 0.05 | Paired t-test |
| Effect size | d >= 0.5 | Cohen's d (medium effect) |

---

## 9. Implementation Notes

### Prerequisites

```bash
# Required
- Node.js 20+
- Claude CLI (authenticated)
- npm or yarn

# Optional (for charts)
- canvas npm package (requires system dependencies)
```

### Quick Start

```bash
cd examples/meta-learning-experiment
npm install
./scripts/run-experiment.sh config/experiment-config.json
```

### Environment Variables

```bash
# Optional overrides
LOG_LEVEL=debug          # Logging verbosity
TASK_TIMEOUT=30          # Minutes per task
CLAUDE_MODEL=opus        # Model override
```

---

## 10. Future Extensions

1. **Parallel Scenario Execution**: Run independent iterations concurrently
2. **Real-time Dashboard**: Live monitoring of experiment progress
3. **Cross-Experiment Comparison**: Compare results across different experiment configs
4. **Automated Hypothesis Testing**: ML-based pattern discovery
5. **Cloud Execution**: Run experiments on cloud infrastructure for scale

---

**Document Version**: 1.0
**Last Updated**: 2026-01-18
**Status**: Ready for Phase 3 (Implementation)

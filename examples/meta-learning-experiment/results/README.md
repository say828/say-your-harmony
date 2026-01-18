# Experiment Results Documentation

This directory contains the results from meta-learning experiments. Each experiment run creates a timestamped subdirectory with comprehensive data, metrics, analysis, and visualizations.

## Directory Structure

```
results/
└── [experiment-id]/          # Created per experiment run
    ├── config.json           # Snapshot of experiment configuration
    ├── git-commit.txt        # Git commit hash for reproducibility
    ├── runs/                 # Individual run results
    │   ├── run-001.json      # Run data with metrics
    │   ├── run-001-output.txt # Raw Claude CLI output
    │   ├── run-002.json
    │   └── ...
    ├── metrics/              # Aggregated metrics
    │   ├── raw-metrics.json  # All collected metrics
    │   └── aggregated.json   # Summary statistics
    ├── analysis/             # Statistical analysis
    │   ├── statistical.json  # Full statistical test results
    │   └── patterns.json     # Extracted patterns
    └── charts/               # Generated visualizations
        ├── efficiency.png
        ├── quality.png
        └── learning-curve.png
```

## File Formats

### Run Record Format (runs/*.json)

Each run produces a JSON file with the following structure:

```json
{
  "runId": "baseline-iter-001",
  "experimentId": "meta-learning-exp-001",
  "scenarioId": "baseline-simple-api",
  "iteration": 1,
  "status": "completed",
  "startedAt": "2026-01-18T10:00:00Z",
  "completedAt": "2026-01-18T10:15:30Z",
  "metaAvailable": false,
  "taskResult": {
    "taskId": "simple-rest-api",
    "success": true,
    "deliverables": [...],
    "qualityAssessment": {...}
  },
  "metrics": {
    "efficiency": {
      "totalTurns": 12,
      "durationSeconds": 930,
      "totalToolCalls": 45,
      "webSearches": 2,
      "decisionsCount": 8,
      "turnsPerPhase": {
        "planning": 3,
        "design": 2,
        "implementation": 5,
        "operation": 2
      }
    },
    "quality": {
      "testPassRate": 100,
      "totalTests": 15,
      "typeErrors": 0,
      "lintErrors": 0,
      "docCoverage": 85,
      "productionReadiness": 95
    },
    "learning": {
      "patternsReused": 0,
      "decisionsReferenced": 0,
      "searchesAvoided": 0,
      "metaSectionsReferenced": []
    },
    "resources": {
      "tokensInput": 15000,
      "tokensOutput": 8000,
      "estimatedCostUsd": 0.45,
      "subagentCalls": 4
    }
  }
}
```

### Metrics Format (metrics/*.json)

Aggregated metrics across all runs:

```json
{
  "experimentId": "meta-learning-exp-001",
  "totalRuns": 9,
  "successfulRuns": 9,
  "byScenario": {
    "baseline-simple-api": {
      "runs": 3,
      "avgTurns": 12.3,
      "avgDuration": 945,
      "avgWebSearches": 2.0
    },
    "repetition-simple-api": {
      "runs": 3,
      "avgTurns": 8.7,
      "avgDuration": 678,
      "avgWebSearches": 0.3,
      "improvement": {
        "turnsReduction": "29.3%",
        "durationReduction": "28.2%",
        "searchesReduction": "85.0%"
      }
    }
  }
}
```

### Analysis Format (analysis/statistical.json)

Statistical analysis results:

```json
{
  "experimentId": "meta-learning-exp-001",
  "analyzedAt": "2026-01-18T12:00:00Z",
  "summary": {
    "totalRuns": 9,
    "successfulRuns": 9,
    "avgEfficiencyImprovement": 28.7,
    "avgQualityMaintenance": 100,
    "successCriteriaMet": true,
    "keyFindings": [
      "28.7% average efficiency improvement",
      "2/2 comparisons statistically significant",
      "Quality maintained across all runs"
    ]
  },
  "comparisons": [
    {
      "baselineScenarioId": "baseline-simple-api",
      "comparisonScenarioId": "repetition-simple-api",
      "comparisonType": "repetition",
      "overallImprovement": 29.3,
      "isSignificant": true,
      "metricComparisons": [...]
    }
  ],
  "statisticalTests": [
    {
      "testName": "totalTurns: baseline vs repetition",
      "testType": "paired-t-test",
      "metric": "totalTurns",
      "pValue": 0.023,
      "significant": true,
      "effectSize": 0.85,
      "effectInterpretation": "large",
      "confidenceInterval": [-5.2, -2.1]
    }
  ],
  "patterns": [
    {
      "patternId": "web-search-elimination",
      "name": "Web Search Elimination",
      "category": "efficiency",
      "description": "Meta-analysis eliminates need for web searches",
      "frequency": 6,
      "transferable": true
    }
  ],
  "conclusions": [
    {
      "type": "hypothesis_support",
      "statement": "Meta-analysis improves efficiency by 28.7% on average",
      "confidence": "high",
      "evidence": [...]
    }
  ]
}
```

## Interpreting Results

### Efficiency Metrics

| Metric | Description | Interpretation |
|--------|-------------|----------------|
| `totalTurns` | Number of conversation turns | Lower = more efficient |
| `durationSeconds` | Wall-clock time | Lower = faster execution |
| `totalToolCalls` | Total tool invocations | Lower = more direct approach |
| `webSearches` | External searches needed | Lower = better knowledge reuse |
| `decisionsCount` | Decisions made | Lower if using cached decisions |
| `parallelExecutions` | Parallel task instances | Higher = better utilization |

### Quality Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `testPassRate` | Percentage of tests passing | >= 95% |
| `typeErrors` | TypeScript errors | 0 |
| `lintErrors` | Linting errors | 0 |
| `docCoverage` | Documentation coverage | >= 80% |
| `productionReadiness` | Overall readiness score | >= 90% |

### Learning Metrics

| Metric | Description | Interpretation |
|--------|-------------|----------------|
| `patternsReused` | Patterns from meta-analysis | Higher = better transfer |
| `decisionsReferenced` | Cached decisions used | Higher = less redundancy |
| `searchesAvoided` | Searches not needed | Higher = better knowledge |
| `metaSectionsReferenced` | Meta sections accessed | Indicates which sections help |

### Statistical Significance

Results are considered statistically significant if:
- p-value < 0.05 (default threshold)
- Effect size (Cohen's d) >= 0.5 (medium effect)
- Confidence interval doesn't include 0

Effect size interpretation:
- `d < 0.2`: Negligible
- `0.2 <= d < 0.5`: Small
- `0.5 <= d < 0.8`: Medium
- `d >= 0.8`: Large

## Success Criteria

An experiment is considered successful if ALL criteria are met:

1. **Efficiency Improvement**: >= 15% average reduction in turns/time
2. **Quality Maintenance**: >= 95% quality metrics maintained
3. **Statistical Significance**: p < 0.05 for primary comparisons
4. **Effect Size**: Cohen's d >= 0.5 (medium effect or larger)
5. **Minimum Iterations**: At least 3 successful runs per scenario

## Example Analysis Workflow

1. **Locate Results**:
   ```bash
   cd results/meta-learning-exp-001
   ```

2. **Review Summary**:
   ```bash
   cat analysis/statistical.json | jq '.summary'
   ```

3. **Check Success Criteria**:
   ```bash
   cat analysis/statistical.json | jq '.summary.successCriteriaMet'
   ```

4. **View Charts**:
   ```bash
   open charts/efficiency.png
   open charts/quality.png
   open charts/learning-curve.png
   ```

5. **Examine Patterns**:
   ```bash
   cat analysis/patterns.json | jq '.'
   ```

6. **Compare Scenarios**:
   ```bash
   cat analysis/statistical.json | jq '.comparisons[]'
   ```

## Troubleshooting

### Missing Data

If metrics are missing or incomplete:
- Check `runs/*-output.txt` for raw output
- Verify metrics collection didn't fail (check for error messages)
- Re-run metrics collection: `npx tsx scripts/collect-metrics.ts --run-id <id>`

### Unexpected Results

If results don't match expectations:
- Verify meta directory was properly isolated (check `meta-backup/`)
- Check git commit hash matches expected version
- Review individual run outputs for anomalies
- Ensure no external interference during experiment

### Statistical Issues

If statistical tests show low power or non-significance:
- Increase `iterationsPerScenario` in config (5-10 recommended)
- Check for high variance in metrics (may need more controlled environment)
- Consider removing outlier runs (document reasoning)

## Reproducibility

To reproduce results:

1. **Use Same Config**:
   ```bash
   cp results/[experiment-id]/config.json config/experiment-config.json
   ```

2. **Check Git Version**:
   ```bash
   git checkout $(cat results/[experiment-id]/git-commit.txt)
   ```

3. **Run Experiment**:
   ```bash
   ./scripts/run-experiment.sh
   ```

4. **Compare Results**:
   ```bash
   diff <(jq -S . results/old/analysis/statistical.json) \
        <(jq -S . results/new/analysis/statistical.json)
   ```

## Data Privacy

Experiment results may contain:
- Task descriptions and code snippets
- Agent conversation transcripts
- Meta-analysis content
- System paths and configurations

Before sharing results publicly:
- Review all JSON files for sensitive information
- Sanitize file paths if needed
- Remove any API keys or credentials (should not be present)
- Consider aggregating data vs sharing raw transcripts

## Archiving

For long-term storage:

```bash
# Create archive
tar -czf meta-learning-exp-001.tar.gz results/meta-learning-exp-001/

# Verify archive
tar -tzf meta-learning-exp-001.tar.gz | head -20

# Extract later
tar -xzf meta-learning-exp-001.tar.gz -C results/
```

## Questions?

For issues or questions about results:
1. Check the main [README.md](../README.md) for experiment setup
2. Review [ARCHITECTURE.md](../ARCHITECTURE.md) for design details
3. Open an issue in the repository with results attached

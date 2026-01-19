# Meta-Learning Experiment Framework

Experimental framework for validating the hypothesis: **"Meta-analysis from previous tasks improves efficiency on subsequent similar tasks."**

## Quick Start

```bash
# Install dependencies
npm install

# Validate setup
npm run validate

# Run experiment
npm run run-experiment

# Or with custom config
./scripts/run-experiment.sh config/experiment-config.json
```

## What This Does

This framework runs controlled experiments to measure the impact of meta-analysis on development task efficiency:

1. **Baseline**: Runs tasks without any meta-analysis context
2. **Repetition**: Runs the same task again with meta-analysis available
3. **Transfer**: Runs a different task with meta-analysis from previous work

Each scenario runs multiple iterations, collecting detailed metrics on efficiency, quality, and learning indicators. Statistical analysis determines if improvements are significant.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete design documentation including:

- File structure
- TypeScript interfaces
- Script pseudocode
- Data flow diagrams
- Decision rationale
- Risk classification

## Directory Structure

```
meta-learning-experiment/
├── ARCHITECTURE.md          # Design document
├── README.md                # This file
├── package.json
├── tsconfig.json
├── config/
│   ├── experiment-config.json   # Main config (JSON format)
│   ├── experiment-config.yaml   # Main config (YAML format)
│   └── tasks/
│       ├── simple-rest-api.json
│       └── medium-auth-system.json
├── src/
│   └── types/              # TypeScript interfaces
│       ├── index.ts
│       ├── experiment.ts
│       ├── task.ts
│       ├── metrics.ts
│       └── analysis.ts
├── scripts/                 # Automation scripts
│   ├── run-experiment.sh
│   ├── collect-metrics.ts
│   ├── analyze-results.ts
│   └── visualize.ts
└── results/                 # Experiment outputs
    ├── README.md           # Results documentation
    └── [experiment-id]/
```

## Configuration

### Main Configuration File

Choose either JSON or YAML format for your experiment configuration:

**JSON Format** (`config/experiment-config.json`):
```json
{
  "experimentId": "meta-learning-exp-001",
  "name": "Meta-Learning Validation Experiment",
  "iterationsPerScenario": 3,
  "taskTimeoutMinutes": 30,
  "scenarios": [...]
}
```

**YAML Format** (`config/experiment-config.yaml`):
```yaml
experimentId: meta-learning-exp-001
name: Meta-Learning Validation Experiment
iterationsPerScenario: 3
taskTimeoutMinutes: 30
scenarios: [...]
```

### Key Configuration Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `iterationsPerScenario` | number | Runs per scenario (min 3 for stats) | 3 |
| `taskTimeoutMinutes` | number | Max time per task | 30 |
| `isolateSessions` | boolean | Clear meta between scenarios | true |
| `randomSeed` | number | For reproducibility | 42 |
| `successCriteria.minEfficiencyImprovement` | number | Required improvement % | 15 |
| `successCriteria.significanceThreshold` | number | P-value threshold | 0.05 |

See `config/experiment-config.yaml` for full configuration with comments.

## Experiment Scenarios

| Scenario | Type | Description | Meta Available |
|----------|------|-------------|----------------|
| **Baseline** | baseline | No meta-analysis available | No |
| **Repetition** | repetition | Same task with meta-analysis | Yes |
| **Transfer** | transfer | Different task with meta-analysis | Yes |

### How Scenarios Work

1. **Baseline**: Tests the task "cold" with no prior meta-analysis
   - Establishes baseline metrics
   - Generates meta-analysis for subsequent runs

2. **Repetition**: Tests same-task learning
   - Uses meta-analysis from baseline
   - Measures improvement on identical task

3. **Transfer**: Tests cross-task learning
   - Uses meta-analysis from different task
   - Measures knowledge transfer effectiveness

## Success Criteria

An experiment succeeds if ALL criteria are met:

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Efficiency improvement | >= 15% | Mean reduction in turns/duration |
| Quality maintenance | >= 95% | Test pass rate, type safety |
| Statistical significance | p < 0.05 | Paired t-test |
| Effect size | d >= 0.5 | Cohen's d (medium effect) |
| Successful iterations | >= 3 | Per scenario |

## Metrics Collected

### Efficiency Metrics
- **Total turns**: Number of conversation turns
- **Duration**: Wall-clock time in seconds
- **Tool calls**: By type (Read, Write, Edit, Task, etc.)
- **Web searches**: External knowledge lookups
- **Decisions**: Documented decisions made
- **Parallel executions**: Concurrent task instances

### Quality Metrics
- **Test pass rate**: Percentage of tests passing
- **TypeScript errors**: Type checking errors
- **Lint errors**: Code style violations
- **Documentation coverage**: Documented items percentage
- **Production readiness**: Overall quality score

### Learning Metrics
- **Patterns reused**: Patterns applied from meta-analysis
- **Decisions referenced**: Cached decisions used
- **Searches avoided**: Web searches not needed due to meta
- **Meta sections referenced**: Which meta-analysis sections were accessed
- **Meta usage evidence**: Explicit and implicit references

### Resource Metrics
- **Tokens used**: Input/output token counts
- **Estimated cost**: USD based on token usage
- **Subagent calls**: Task tool invocations
- **File operations**: Read/write counts

## Output Structure

Results are saved to `results/[experiment-id]/`:

```
results/meta-learning-exp-001/
├── config.json                 # Configuration snapshot
├── git-commit.txt              # Git commit for reproducibility
├── runs/
│   ├── baseline-iter-001.json  # Run data + metrics
│   ├── baseline-iter-001-output.txt  # Raw Claude output
│   └── ...
├── metrics/
│   ├── raw-metrics.json        # All metrics
│   └── aggregated.json         # Summary statistics
├── analysis/
│   ├── statistical.json        # Statistical test results
│   └── patterns.json           # Extracted patterns
└── charts/
    ├── efficiency.png          # Efficiency improvement chart
    ├── quality.png             # Quality maintenance chart
    └── learning-curve.png      # Learning progression
```

See [results/README.md](./results/README.md) for detailed format documentation.

## Usage Examples

### Run Default Experiment

```bash
# Install and validate
npm install
npm run validate

# Run with default config
npm run run-experiment
```

### Custom Configuration

```bash
# Edit configuration
cp config/experiment-config.yaml config/my-experiment.yaml
# ... edit my-experiment.yaml ...

# Run with custom config
./scripts/run-experiment.sh config/my-experiment.yaml
```

### View Results

```bash
# Latest experiment
cd results/$(ls -t results/ | head -1)

# View summary
cat analysis/statistical.json | jq '.summary'

# Check success
cat analysis/statistical.json | jq '.summary.successCriteriaMet'

# Open charts
open charts/*.png
```

### Re-analyze Existing Results

```bash
# Re-run analysis only
npx tsx scripts/analyze-results.ts --experiment-dir results/meta-learning-exp-001

# Re-generate charts
npx tsx scripts/visualize.ts --experiment-dir results/meta-learning-exp-001
```

### Compare Experiments

```bash
# Compare efficiency improvements
jq '.summary.avgEfficiencyImprovement' results/*/analysis/statistical.json

# Compare by scenario
jq '.comparisons[] | {scenario: .comparisonScenarioId, improvement: .overallImprovement}' \
  results/*/analysis/statistical.json
```

## Environment Variables

Optional overrides:

```bash
# Logging verbosity (debug, info, warn, error)
LOG_LEVEL=debug npm run run-experiment

# Task timeout in minutes
TASK_TIMEOUT=60 ./scripts/run-experiment.sh config/experiment-config.yaml

# Claude model override
CLAUDE_MODEL=opus ./scripts/run-experiment.sh config/experiment-config.yaml
```

## Requirements

### Required
- **Node.js**: Version 20 or higher
- **Claude CLI**: Installed and authenticated (`claude --version`)
- **npm** or **yarn**: Package manager

### Optional
- **Git**: For commit tracking (recommended)
- **jq**: For JSON parsing in examples (helpful)
- **canvas**: For chart generation (auto-installed with npm)

### System Requirements
- **OS**: macOS, Linux, or WSL2 on Windows
- **Memory**: 2GB+ recommended
- **Disk**: 500MB+ free space for results

## Troubleshooting

### Setup Issues

**Claude CLI not found**:
```bash
# Install Claude CLI
npm install -g @anthropic-ai/claude-cli
claude auth login
```

**Node version too old**:
```bash
# Check version
node --version  # Should be v20.0.0 or higher

# Upgrade with nvm
nvm install 20
nvm use 20
```

### Experiment Failures

**Task timeout**:
```bash
# Increase timeout
TASK_TIMEOUT=60 ./scripts/run-experiment.sh config/experiment-config.yaml
```

**Metrics collection fails**:
- Check `runs/*-output.txt` for raw output
- Verify output format hasn't changed
- Re-run collection: `npx tsx scripts/collect-metrics.ts --run-id <id>`

**Statistical tests show low power**:
- Increase `iterationsPerScenario` to 5-10
- Check for high variance in metrics
- Review individual runs for anomalies

### Meta-analysis Isolation

**Meta bleeding between scenarios**:
- Verify `isolateSessions: true` in config
- Check `meta-backup/` directory was created
- Review script logs for backup/restore operations

## Expected Results

Based on initial hypothesis testing:

| Metric | Baseline | Repetition | Transfer |
|--------|----------|------------|----------|
| Avg Turns | 12-15 | 8-10 | 9-11 |
| Avg Duration (min) | 15-20 | 10-13 | 11-14 |
| Web Searches | 2-3 | 0-1 | 0-1 |
| Test Pass Rate | 95-100% | 95-100% | 95-100% |

Expected improvements:
- **Repetition**: 25-35% efficiency gain
- **Transfer**: 15-25% efficiency gain
- **Quality**: Maintained at 95%+

## Contributing

To add new tasks or scenarios:

1. **Create task specification**: `config/tasks/my-task.json`
2. **Add to scenarios**: Update `experiment-config.yaml`
3. **Define quality criteria**: Specify tests, deliverables
4. **Document expected baseline**: Estimated turns, duration

See [ARCHITECTURE.md](./ARCHITECTURE.md) for schema documentation.

## License

MIT

## Citation

If you use this framework in research:

```bibtex
@software{meta_learning_experiment,
  title={Meta-Learning Experiment Framework},
  author={Say-Your-Harmony Team},
  year={2026},
  version={1.0.0},
  url={https://github.com/say828/say-your-harmony}
}
```

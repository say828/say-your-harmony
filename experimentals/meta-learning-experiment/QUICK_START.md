# Meta-Learning Experiment Framework - Quick Start

## Overview

This framework measures the effectiveness of **File-based Fast Meta** (QuickMeta) system across three experimental scenarios:

1. **Baseline**: Measure initial performance without prior meta-learning
2. **Repetition**: Measure improvement when repeating the same task
3. **Transfer**: Measure pattern reuse across different tasks

## Prerequisites

- Node.js 20+
- Claude Code CLI
- TypeScript
- say-your-harmony plugin installed

## Quick Start

### 1. Run an Experiment

```bash
cd examples/meta-learning-experiment/scripts

# Baseline - Simple Task
./run-experiment.sh -s baseline -t simple

# Follow instructions in the generated INSTRUCTIONS.md
# Execute task with: claude /harmony "$(cat ../tasks/simple/TASK.md)"
```

### 2. Collect Metrics

After task completion, extract metrics from QuickMeta:

```bash
# Replace SESSION_ID with actual ID from Claude output
npm run collect-metrics -- --session 2026-01-18-143052-x7k9 --output ../results/exp-001/
```

### 3. Analyze Results

After running multiple experiments:

```bash
npm run analyze-results -- --results ../results --scenario repetition
```

### 4. Visualize

Generate ASCII charts:

```bash
npm run visualize -- --results ../results --scenario repetition
```

## Experiment Scenarios

### Scenario 1: Baseline (Single Project)

**Purpose**: Establish baseline metrics without prior context

**Steps**:
1. Clear QuickMeta: `rm -rf ~/.claude/meta/quickmeta`
2. Run task: `./run-experiment.sh -s baseline -t simple`
3. Execute with Claude CLI
4. Collect metrics

**Expected**:
- Duration: 25-45 min (task dependent)
- Patterns: 8-15 extracted
- Decisions: 3-8 documented
- Risks: 2-6 identified

### Scenario 2: Repetition (Same Project)

**Purpose**: Measure improvement from repeating same task

**Steps**:
1. Run baseline (iteration 1)
2. Keep QuickMeta intact
3. Run iteration 2: `./run-experiment.sh -s repetition -t simple -i 2`
4. Run iteration 3: `./run-experiment.sh -s repetition -t simple -i 3`
5. Analyze improvement

**Hypothesis**: 20-30% improvement by iteration 2

### Scenario 3: Transfer (Cross-Project)

**Purpose**: Measure pattern reuse across different tasks

**Steps**:
1. Run simple task (establishes base patterns)
2. Run medium task (reuses structural patterns)
3. Run complex task (reuses architectural patterns)
4. Analyze which patterns transferred

**Hypothesis**: 15-25% improvement from transferred patterns

## Task Descriptions

### Simple: REST API with CRUD
- **Complexity**: Low
- **Duration**: 25-35 min baseline
- **Components**: 4 files, in-memory storage
- **Tests**: >80% coverage

### Medium: Authentication System
- **Complexity**: Medium
- **Duration**: 45-75 min baseline
- **Components**: 8 files, JWT, RBAC
- **Tests**: >80% coverage

### Complex: Microservices + Event Sourcing
- **Complexity**: High
- **Duration**: 60-90 min baseline
- **Components**: 37 files, 4 services, saga pattern
- **Tests**: >80% coverage

## Success Criteria

| Metric | Threshold | Evidence |
|--------|-----------|----------|
| Repetition Improvement | ≥15% | Duration reduction Run 2 vs Run 1 |
| Pattern Reuse | ≥60% | Patterns from Run 1 appear in Run 2 |
| Quality Maintained | 100% | Test pass rate unchanged |
| Statistical Significance | p < 0.05 | t-test on duration |

## Metrics Captured

### Phase-Level
- Duration (ms)
- Tool calls
- Patterns extracted (with confidence)
- Decisions documented (with alternatives)
- Risks identified (P0/P1/P2/P3)

### Session-Level
- Total duration
- Aggregated tool usage
- Pattern accumulation
- Decision quality
- Risk mitigation rate

### Insight Injection
- PhaseInsight size (chars)
- Patterns reused from prior phases
- Active P0/P1 risks carried forward

## Directory Structure

```
examples/meta-learning-experiment/
├── README.md              # Full documentation
├── QUICK_START.md        # This file
├── ARCHITECTURE.md       # Design decisions
│
├── config/
│   └── experiment-config.yaml
│
├── tasks/
│   ├── simple/
│   │   ├── TASK.md
│   │   └── validation-checklist.md
│   ├── medium/
│   └── complex/
│
├── scripts/
│   ├── run-experiment.sh
│   ├── collect-metrics.ts
│   ├── analyze-results.ts
│   └── visualize.ts
│
└── results/
    ├── exp-001/
    │   ├── metadata.json
    │   ├── metrics.json
    │   └── summary.md
    └── ...
```

## Troubleshooting

### "Session directory not found"
- Verify session ID is correct
- Check `~/.claude/meta/quickmeta/{sessionId}/` exists
- Ensure all 4 phases completed

### "Need at least 2 experiments"
- Run baseline first
- Then run iteration 2 before analyzing

### "QuickMeta files missing"
- Verify File-based Fast Meta is enabled in harmony.ts
- Check for TypeScript compilation errors
- Ensure onPhaseComplete() is being called

## Next Steps

1. Run baseline for all 3 tasks
2. Run repetition scenario (3 iterations each)
3. Run transfer scenario (simple → medium → complex)
4. Analyze and compare results
5. Generate final report with visualizations

## Expected Timeline

- Setup: 10 minutes
- Baseline experiments (3 tasks): 3-4 hours
- Repetition experiments (3 tasks × 3 iterations): 8-10 hours
- Transfer experiments: 3-4 hours
- Analysis: 1 hour
- **Total**: ~15-20 hours of experiment time

## References

- [Full Documentation](./README.md)
- [Architecture Design](./ARCHITECTURE.md)
- [Results Format](./results/README.md)
- [QuickMeta Implementation](../../src/lib/quickmeta/)

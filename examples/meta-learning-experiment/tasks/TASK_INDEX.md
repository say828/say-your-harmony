# Incremental Experiment Task Index

This document provides an index of all tasks organized by experiment step.

## Step 1: Baseline (0 meta → 1 task)

| Task ID | Complexity | Duration (Baseline) | Duration (With Meta) | Path |
|---------|------------|---------------------|---------------------|------|
| shopping-cart | Simple-Medium | 40-50 min | 25-32 min | tasks/shopping-cart/TASK.md |

**Purpose**: Establish baseline metrics. This task generates the first meta-analysis file.

**Key Patterns**: CRUD, Rule Engine, Session Management, State Machine, Validation

---

## Step 2: Initial Transfer (1 meta → 2 tasks parallel)

| Task ID | Complexity | Duration (Baseline) | Duration (With Meta) | Path |
|---------|------------|---------------------|---------------------|------|
| stats-library | Simple-Medium | 35-45 min | 22-28 min | tasks/stats-library/TASK.md |
| fraud-detection | Medium | 50-65 min | 30-40 min | tasks/fraud-detection/TASK.md |

**Purpose**: Test initial meta-learning transfer (1 meta file available from shopping-cart).

**Expected Transfer**:
- stats-library: Pure functions, validation patterns, testing strategies
- fraud-detection: Rule engine from shopping-cart, state machine patterns

**Expected Improvement**: 20-25% efficiency gain

---

## Step 3: Accumulation (3 meta → 3 tasks parallel)

| Task ID | Complexity | Duration (Baseline) | Duration (With Meta) | Path |
|---------|------------|---------------------|---------------------|------|
| etl-data-pipeline | Medium | 45-60 min | 28-38 min | tasks/etl-data-pipeline/TASK.md |
| twitter-timeline | Medium | 50-65 min | 32-40 min | tasks/twitter-timeline/TASK.md |
| inventory-sync | Medium | 50-65 min | 30-40 min | tasks/inventory-sync/TASK.md |

**Purpose**: Test accumulation effect (3 meta files: shopping-cart, stats-library, fraud-detection).

**Expected Transfer**:
- etl-data-pipeline: Validation patterns, error handling, pipeline architecture
- twitter-timeline: Caching from shopping-cart, rate limiting patterns
- inventory-sync: Reservation patterns, alert systems from fraud-detection

**Expected Improvement**: 32-38% efficiency gain

---

## Step 4: Saturation Test (6 meta → 4 tasks parallel)

| Task ID | Complexity | Duration (Baseline) | Duration (With Meta) | Path |
|---------|------------|---------------------|---------------------|------|
| airbnb-search | Complex | 70-85 min | 42-52 min | tasks/airbnb-search/TASK.md |
| order-book | Complex | 70-85 min | 42-52 min | tasks/order-book/TASK.md |
| risk-calculator | Medium-High | 55-70 min | 35-45 min | tasks/risk-calculator/TASK.md |
| monte-carlo-simulator | Complex | 65-80 min | 40-50 min | tasks/monte-carlo-simulator/TASK.md |

**Purpose**: Detect saturation point (6 meta files available).

**Expected Transfer**:
- airbnb-search: Geospatial queries, filter composition, pricing algorithms
- order-book: State machine, priority handling, event emission
- risk-calculator: Statistical functions from stats-library, scenario testing
- monte-carlo-simulator: Statistical analysis, convergence detection

**Expected Improvement**: 40-45% efficiency gain

**Saturation Analysis**: Compare marginal improvement rate vs Step 3

---

## Step 5: Large Scale (10+ meta → 5 tasks parallel)

| Task ID | Complexity | Duration (Baseline) | Duration (With Meta) | Path |
|---------|------------|---------------------|---------------------|------|
| uber-ride-matching | Complex | 75-90 min | 45-55 min | tasks/uber-ride-matching/TASK.md |
| stripe-payment-processor | Complex | 70-85 min | 40-50 min | tasks/stripe-payment-processor/TASK.md |
| netflix-streaming | Medium-High | 55-70 min | 35-45 min | tasks/netflix-streaming/TASK.md |
| fulfillment-orchestrator | Complex | 70-85 min | 42-52 min | tasks/fulfillment-orchestrator/TASK.md |
| ml-experiment-tracker | Medium | 50-65 min | 30-40 min | tasks/ml-experiment-tracker/TASK.md |

**Purpose**: Validate large-scale meta-learning benefit (10 meta files).

**Expected Transfer**:
- uber-ride-matching: Geospatial from airbnb, matching from order-book, state machine
- stripe-payment-processor: Idempotency (new), retry logic, state machine, webhooks
- netflix-streaming: Caching from twitter, state machine, ABR algorithms
- fulfillment-orchestrator: Saga pattern, workflow orchestration, warehouse selection
- ml-experiment-tracker: CRUD patterns mastery, versioning, comparison logic

**Expected Improvement**: 42-50% efficiency gain (approaching ceiling)

**Final Analysis**: Determine maximum practical benefit and optimal meta accumulation

---

## Pattern Transfer Matrix

| Pattern | Source Tasks | Target Tasks | Transferability |
|---------|-------------|--------------|-----------------|
| CRUD Operations | shopping-cart | ALL tasks | Very High |
| State Machine | shopping-cart, fraud-detection | order-book, stripe, uber, netflix, fulfillment | Very High |
| Rule Engine | shopping-cart | fraud-detection, inventory-sync | High |
| Caching | shopping-cart | twitter-timeline, airbnb, netflix | Very High |
| Validation | shopping-cart, stats-library | etl-pipeline, ALL tasks | Very High |
| Geospatial | fraud-detection (distance) | airbnb-search, uber-ride-matching | High |
| Statistical Functions | stats-library | risk-calculator, monte-carlo | Very High |
| Scoring Systems | fraud-detection | order-book, recommendations | High |
| Real-time Events | fraud-detection | twitter, uber, netflix | High |
| Idempotency | stripe-payment-processor | fulfillment (NEW) | Very High |
| Saga/Workflow | fulfillment-orchestrator | distributed systems (NEW) | High |
| Versioning | ml-experiment-tracker | artifact management (NEW) | High |

---

## Complexity Distribution

| Complexity | Count | Tasks |
|------------|-------|-------|
| Simple-Medium | 2 | shopping-cart, stats-library |
| Medium | 4 | fraud-detection, etl-data-pipeline, twitter-timeline, inventory-sync, ml-experiment-tracker |
| Medium-High | 2 | risk-calculator, netflix-streaming |
| Complex | 7 | airbnb-search, order-book, monte-carlo-simulator, uber-ride-matching, stripe-payment-processor, fulfillment-orchestrator |

**Total**: 15 tasks

---

## Expected Learning Curve

```
Meta Count:  0      1      3      6     10+
             |      |      |      |      |
Improvement: 0%   22%    35%    42%    47%   (Expected)
             |      |      |      |      |
Tasks:       1      2      3      4      5   (Parallel count)
```

**Hypothesis**: Logarithmic growth with saturation around 10-12 meta files.

**Formula**: `improvement ≈ 25 * ln(meta_count + 1) - 5`

---

## Usage Instructions

### Running a Single Task

```bash
cd examples/meta-learning-experiment/tasks/<task-id>
cat TASK.md  # Read task requirements
# Implement according to specifications
```

### Running Full Incremental Experiment

```bash
# Step 1: Clear all meta
rm -rf ~/.claude/meta/*

# Step 1: Run baseline (shopping-cart) x3
# Generate meta-1

# Step 2: Run with 1 meta (stats-library, fraud-detection) x3 parallel
# Generate meta-2, meta-3

# Step 3: Run with 3 meta (etl, twitter, inventory) x3 parallel
# Generate meta-4, meta-5, meta-6

# Step 4: Run with 6 meta (airbnb, order-book, risk, monte-carlo) x3 parallel
# Generate meta-7, meta-8, meta-9, meta-10

# Step 5: Run with 10 meta (uber, stripe, netflix, fulfillment, ml-tracker) x3 parallel
# Final measurement

# Analyze results
npm run analyze-incremental
```

---

## Success Criteria

### Per-Task Criteria

Each task must achieve:
- [ ] All P0 success criteria met
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 80% (85% for financial tasks)
- [ ] All tests passing
- [ ] Build succeeds

### Experiment-Level Criteria

- [ ] Efficiency improvement >= 15% by Step 5
- [ ] Quality maintained >= 95% across all tasks
- [ ] Statistical significance p < 0.05
- [ ] Effect size d >= 0.5 (medium or larger)
- [ ] Saturation point detected (if exists)

---

## File Locations

All task specifications are located at:
```
examples/meta-learning-experiment/tasks/<task-id>/TASK.md
```

Example:
```
tasks/shopping-cart/TASK.md
tasks/stats-library/TASK.md
tasks/fraud-detection/TASK.md
...
```

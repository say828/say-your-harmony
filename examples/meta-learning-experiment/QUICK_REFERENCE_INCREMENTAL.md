# Incremental Experiment - Quick Reference Card

## One-Line Summary
5-step experiment testing meta-learning accumulation effects: 0→1→3→6→10→15 meta sessions

## Quick Start

```bash
cd examples/meta-learning-experiment/scripts
./run-incremental-experiment.sh 1  # Start with Step 1
```

## Steps Overview

| Step | Meta | Tasks | Duration | Focus |
|------|------|-------|----------|-------|
| 1 | 0→1 | 1 task | 1-2h | Baseline |
| 2 | 1→3 | 2 parallel | 1-2h | Initial Transfer |
| 3 | 3→6 | 3 parallel | 2-3h | Accumulation |
| 4 | 6→10 | 4 parallel | 2-4h | Saturation Test |
| 5 | 10→15 | 5 parallel | 2-4h | Large Scale |

**Total:** 8-15 hours

## Commands

```bash
# Run individual steps
./run-incremental-experiment.sh 1
./run-incremental-experiment.sh 2
./run-incremental-experiment.sh 3
./run-incremental-experiment.sh 4
./run-incremental-experiment.sh 5

# Run all steps
./run-incremental-experiment.sh all

# Check meta count
ls -1 ~/.claude/meta/quickmeta | wc -l

# Collect metrics (after task completion)
npm run collect-metrics -- --session SESSION_ID --output ../results/incremental/EXPERIMENT_DIR/

# Final analysis (after Step 5)
npm run analyze-incremental -- --results-dir ../results/incremental
```

## Task List by Step

**Step 1:** shopping-cart
**Step 2:** stats-library, fraud-detection
**Step 3:** etl-pipeline, twitter-timeline, inventory-sync
**Step 4:** airbnb-search, order-book, risk-calculator, monte-carlo
**Step 5:** uber, stripe, netflix, fulfillment, ml-tracker

## Expected Results

| Metric | Step 2 | Step 3 | Step 4 | Step 5 |
|--------|--------|--------|--------|--------|
| Improvement | 30-40% | 33-40% | 35-40% | 35-42% |
| Turns Saved | 5-8 | 6-10 | 7-12 | 8-15 |
| Time Saved | 15-25min | 17-24min | 20-30min | 20-35min |

## Critical Success Factors

- ✓ Execute parallel tasks SIMULTANEOUSLY (not sequentially)
- ✓ Collect metrics immediately after each task
- ✓ Verify meta count before each step
- ✓ Don't clear QuickMeta after Step 1
- ✓ Maintain 80%+ test coverage
- ✓ Meet all P0 requirements

## File Locations

```
scripts/run-incremental-experiment.sh    # Runner script
config/incremental-experiment.yaml       # Configuration
docs/INCREMENTAL_EXPERIMENT.md           # Full documentation
INCREMENTAL_EXPERIMENT_SUMMARY.md        # Implementation details
results/incremental/                     # Generated data
```

## Troubleshooting

**Meta count wrong?**
```bash
# Check backup location (printed during Step 1)
ls /tmp/claude-meta-incremental-backup-*

# Restore if needed
cp -r /tmp/claude-meta-incremental-backup-TIMESTAMP ~/.claude/meta/quickmeta
```

**Task failed?**
- Check P0 requirements met
- Verify test coverage ≥ 80%
- Review build/lint errors
- Consult TASK_DESIGNS.md

## Research Questions

1. Do efficiency gains scale logarithmically? → Measure across steps
2. Where is the saturation point? → Compare marginal gains Step 4 vs 5
3. Do complex tasks benefit more? → Correlation analysis
4. Which patterns transfer best? → Pattern reuse tracking

## Publication Outputs

After Step 5 + analysis:
- Meta-learning curve (300 DPI PNG)
- Pattern transfer heatmap (300 DPI PNG)
- Saturation analysis (300 DPI PNG)
- Efficiency summary (Markdown table)
- Full research report (Markdown)

## Timeline

```
Day 1: Steps 1-2 (2-4 hours)
Day 2: Steps 3-4 (4-7 hours)
Day 3: Step 5 + Analysis (3-6 hours)
Total: 9-17 hours
```

## Support

- Full docs: `docs/INCREMENTAL_EXPERIMENT.md`
- Config: `config/incremental-experiment.yaml`
- Summary: `INCREMENTAL_EXPERIMENT_SUMMARY.md`
- Architecture: `ARCHITECTURE.md`

---

**Ready to start?** Run: `./scripts/run-incremental-experiment.sh 1`

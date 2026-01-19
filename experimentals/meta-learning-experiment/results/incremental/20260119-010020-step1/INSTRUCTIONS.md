# Step 1: Experiment Instructions

## Meta State
- Accumulated Meta Sessions: **0**
- Meta Directory: `/Users/say/.claude/meta/quickmeta`

## Tasks to Execute
- **shopping-cart** (Simple-Medium): Shopping cart with discount engine

## Execution Steps

### For Single Task:
```bash
cd /path/to/workspace
claude /harmony "$(cat task-description.md)"
```

### For Parallel Tasks:
Execute each task in a separate terminal:

```bash
# Terminal 1
claude /harmony "$(cat task1-description.md)"

# Terminal 2 (simultaneously)
claude /harmony "$(cat task2-description.md)"

# Terminal 3 (simultaneously)
claude /harmony "$(cat task3-description.md)"
```

## After Completion

Collect metrics for each session:

```bash
cd /Users/say/Documents/GitHub/say-your-harmony/examples/meta-learning-experiment/scripts
npm run collect-metrics -- --session SESSION_ID_1 --output /Users/say/Documents/GitHub/say-your-harmony/examples/meta-learning-experiment/results/incremental/20260119-010020-step1/task1/
npm run collect-metrics -- --session SESSION_ID_2 --output /Users/say/Documents/GitHub/say-your-harmony/examples/meta-learning-experiment/results/incremental/20260119-010020-step1/task2/
# ... repeat for all tasks
```

## Analysis

After all tasks complete:

```bash
cd /Users/say/Documents/GitHub/say-your-harmony/examples/meta-learning-experiment/scripts
npm run analyze-results -- --experiment-dir /Users/say/Documents/GitHub/say-your-harmony/examples/meta-learning-experiment/results/incremental/20260119-010020-step1
```

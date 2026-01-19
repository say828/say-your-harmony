#!/bin/bash
#
# Meta-Learning Experiment Runner
#
# Orchestrates experiment execution with QuickMeta isolation
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SCENARIO=""
TASK=""
ITERATION=1
CONFIG_FILE="../config/experiment-config.yaml"
RESULTS_DIR="../results"
META_DIR="$HOME/.claude/meta/quickmeta"
BACKUP_DIR="/tmp/claude-meta-backup-$$"

# Usage information
usage() {
  cat << EOF
Usage: $0 -s SCENARIO -t TASK [-i ITERATION] [-c CONFIG]

Run meta-learning experiment with QuickMeta isolation.

Options:
  -s SCENARIO   Experiment scenario (baseline|repetition|transfer)
  -t TASK       Task to run (simple|medium|complex)
  -i ITERATION  Iteration number (default: 1)
  -c CONFIG     Config file path (default: ../config/experiment-config.yaml)
  -h            Show this help message

Examples:
  # Run baseline for simple task
  $0 -s baseline -t simple

  # Run 2nd iteration of repetition scenario
  $0 -s repetition -t simple -i 2

  # Run transfer scenario with medium task
  $0 -s transfer -t medium
EOF
  exit 1
}

# Parse arguments
while getopts "s:t:i:c:h" opt; do
  case $opt in
    s) SCENARIO="$OPTARG" ;;
    t) TASK="$OPTARG" ;;
    i) ITERATION="$OPTARG" ;;
    c) CONFIG_FILE="$OPTARG" ;;
    h) usage ;;
    *) usage ;;
  esac
done

# Validate required arguments
if [[ -z "$SCENARIO" || -z "$TASK" ]]; then
  echo -e "${RED}Error: -s SCENARIO and -t TASK are required${NC}"
  usage
fi

# Validate scenario
if [[ ! "$SCENARIO" =~ ^(baseline|repetition|transfer)$ ]]; then
  echo -e "${RED}Error: Invalid scenario '$SCENARIO'. Must be: baseline, repetition, or transfer${NC}"
  exit 1
fi

# Validate task
if [[ ! "$TASK" =~ ^(simple|medium|complex)$ ]]; then
  echo -e "${RED}Error: Invalid task '$TASK'. Must be: simple, medium, or complex${NC}"
  exit 1
fi

# Validate iteration
if ! [[ "$ITERATION" =~ ^[0-9]+$ ]]; then
  echo -e "${RED}Error: Iteration must be a number${NC}"
  exit 1
fi

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Meta-Learning Experiment Runner${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "Scenario:   ${GREEN}$SCENARIO${NC}"
echo -e "Task:       ${GREEN}$TASK${NC}"
echo -e "Iteration:  ${GREEN}$ITERATION${NC}"
echo ""

# Create results directory
EXPERIMENT_ID="$(date +%Y%m%d-%H%M%S)-${SCENARIO}-${TASK}-iter${ITERATION}"
EXPERIMENT_DIR="${RESULTS_DIR}/${EXPERIMENT_ID}"
mkdir -p "$EXPERIMENT_DIR"

echo -e "${YELLOW}[1/6] Creating experiment directory${NC}"
echo "  → $EXPERIMENT_DIR"

# Backup existing QuickMeta if needed
if [[ "$SCENARIO" == "baseline" ]]; then
  echo -e "${YELLOW}[2/6] Clearing QuickMeta (baseline scenario)${NC}"
  if [[ -d "$META_DIR" ]]; then
    echo "  → Backing up to: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    cp -r "$META_DIR" "$BACKUP_DIR/"
    rm -rf "$META_DIR"
  else
    echo "  → No existing QuickMeta found (clean start)"
  fi
elif [[ "$SCENARIO" == "repetition" && "$ITERATION" -eq 1 ]]; then
  echo -e "${YELLOW}[2/6] Clearing QuickMeta (first repetition)${NC}"
  if [[ -d "$META_DIR" ]]; then
    echo "  → Backing up to: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    cp -r "$META_DIR" "$BACKUP_DIR/"
    rm -rf "$META_DIR"
  fi
else
  echo -e "${YELLOW}[2/6] Preserving QuickMeta (reuse scenario)${NC}"
  if [[ -d "$META_DIR" ]]; then
    SESSION_COUNT=$(find "$META_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l)
    echo "  → Found $SESSION_COUNT existing session(s)"
  else
    echo "  → No existing QuickMeta (will be created)"
  fi
fi

# Load task specification
TASK_FILE="../tasks/${TASK}/TASK.md"
if [[ ! -f "$TASK_FILE" ]]; then
  echo -e "${RED}Error: Task file not found: $TASK_FILE${NC}"
  exit 1
fi

echo -e "${YELLOW}[3/6] Loading task specification${NC}"
echo "  → $TASK_FILE"

# Prepare experiment metadata
cat > "$EXPERIMENT_DIR/metadata.json" << EOF
{
  "experimentId": "$EXPERIMENT_ID",
  "scenario": "$SCENARIO",
  "task": "$TASK",
  "iteration": $ITERATION,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "taskFile": "$TASK_FILE",
  "metaBackup": "$BACKUP_DIR"
}
EOF

echo -e "${YELLOW}[4/6] Executing task with /harmony${NC}"
echo "  → This may take 30-90 minutes depending on task complexity"
echo ""

# Execute task with Claude CLI
START_TIME=$(date +%s)

# Capture output and extract session ID
OUTPUT_FILE="$EXPERIMENT_DIR/claude-output.txt"

echo -e "${GREEN}Starting Claude CLI...${NC}"
echo ""

# Note: Actual execution would use Claude CLI
# For now, create a placeholder that explains the manual step
cat > "$EXPERIMENT_DIR/INSTRUCTIONS.md" << 'EOF'
# Manual Execution Required

This experiment framework requires manual execution of the Claude CLI.

## Steps:

1. Open a new terminal session

2. Run the following command:
   ```bash
   claude /harmony "$(cat ../tasks/TASK_TYPE/TASK.md)"
   ```
   Replace TASK_TYPE with: simple, medium, or complex

3. Wait for all 4 phases to complete

4. The session will automatically save QuickMeta to:
   ~/.claude/meta/quickmeta/{sessionId}/

5. Note the session ID from the output

6. After completion, run:
   ```bash
   ./collect-metrics.sh -s SESSION_ID -o results/EXPERIMENT_ID/
   ```

## Expected Output

- Phase 1 QuickMeta: ~/.claude/meta/quickmeta/{sessionId}/planning.json
- Phase 2 QuickMeta: ~/.claude/meta/quickmeta/{sessionId}/design.json
- Phase 3 QuickMeta: ~/.claude/meta/quickmeta/{sessionId}/implementation.json
- Phase 4 QuickMeta: ~/.claude/meta/quickmeta/{sessionId}/operation.json

## Metrics Collection

After task completion, run:
```bash
cd scripts
npm run collect-metrics -- --session SESSION_ID --output ../results/EXPERIMENT_ID/
```

This will extract metrics and create:
- metrics.json
- summary.md
EOF

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Manual Execution Required${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Please follow the instructions in:"
echo "  → $EXPERIMENT_DIR/INSTRUCTIONS.md"
echo ""
echo -e "${YELLOW}After task completion, collect metrics with:${NC}"
echo "  cd scripts"
echo "  npm run collect-metrics -- --session SESSION_ID --output $EXPERIMENT_DIR/"
echo ""
echo -e "${GREEN}Experiment directory created:${NC}"
echo "  → $EXPERIMENT_DIR"

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo -e "${GREEN}Setup complete in ${ELAPSED}s${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Execute task manually (see INSTRUCTIONS.md)"
echo "  2. Run collect-metrics script"
echo "  3. Run analyze-results script"
echo "  4. Run visualize script"

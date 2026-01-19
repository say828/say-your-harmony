#!/bin/bash
#
# Incremental Meta-Accumulation Experiment Runner
#
# Orchestrates a 5-step experiment to measure meta-learning accumulation effects
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/config/incremental-experiment.yaml"
RESULTS_DIR="$PROJECT_ROOT/results/incremental"
META_DIR="$HOME/.claude/meta/quickmeta"
BACKUP_DIR="/tmp/claude-meta-incremental-backup-$(date +%s)"

# Step argument
STEP="${1:-}"

# Usage information
usage() {
  cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════╗
║         Incremental Meta-Accumulation Experiment Runner                  ║
╚══════════════════════════════════════════════════════════════════════════╝

Usage: ./run-incremental-experiment.sh [STEP]

STEP can be:
  1     - Baseline: Clear meta, run 1 task (shopping-cart)
  2     - Initial Transfer: 1 meta → 2 parallel tasks (stats-library, fraud-detection)
  3     - Accumulation: 3 meta → 3 parallel tasks (etl-pipeline, twitter-timeline, inventory-sync)
  4     - Scaling Test: 6 meta → N parallel tasks (8+) (airbnb-search, order-book, risk-calculator, monte-carlo, ...)
  5     - Large Scale: 10+ meta → 5 complex tasks (uber, stripe, netflix, fulfillment, ml-tracker)
  all   - Run all steps sequentially (full experiment)

Examples:
  ./run-incremental-experiment.sh 1      # Run Step 1 (baseline)
  ./run-incremental-experiment.sh all    # Run full experiment

EOF
  exit 1
}

# Validate step argument
if [[ -z "$STEP" ]]; then
  echo -e "${RED}Error: STEP argument required${NC}"
  usage
fi

# Banner
print_banner() {
  local title="$1"
  local subtitle="$2"
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC} ${CYAN}$title${NC}"
  echo -e "${BLUE}║${NC} ${YELLOW}$subtitle${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# Print section
print_section() {
  local title="$1"
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}$title${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Count QuickMeta sessions
count_meta_sessions() {
  if [[ -d "$META_DIR" ]]; then
    find "$META_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' '
  else
    echo "0"
  fi
}

# Backup QuickMeta
backup_meta() {
  if [[ -d "$META_DIR" ]]; then
    echo -e "${YELLOW}Backing up existing QuickMeta...${NC}"
    mkdir -p "$BACKUP_DIR"
    cp -r "$META_DIR" "$BACKUP_DIR/"
    echo -e "${GREEN}✓ Backed up to: $BACKUP_DIR${NC}"
  else
    echo -e "${CYAN}No existing QuickMeta to backup${NC}"
  fi
}

# Clear QuickMeta
clear_meta() {
  if [[ -d "$META_DIR" ]]; then
    echo -e "${YELLOW}Clearing QuickMeta...${NC}"
    rm -rf "$META_DIR"
    echo -e "${GREEN}✓ QuickMeta cleared${NC}"
  else
    echo -e "${CYAN}QuickMeta directory already empty${NC}"
  fi
}

# Create experiment directory
create_experiment_dir() {
  local step="$1"
  local experiment_id="$(date +%Y%m%d-%H%M%S)-step${step}"
  local experiment_dir="$RESULTS_DIR/$experiment_id"

  mkdir -p "$experiment_dir"
  echo "$experiment_dir"
}

# Generate task instructions
generate_instructions() {
  local experiment_dir="$1"
  local step="$2"
  local tasks="$3"
  local meta_count="$4"

  cat > "$experiment_dir/INSTRUCTIONS.md" << EOF
# Step $step: Experiment Instructions

## Meta State
- Accumulated Meta Sessions: **$meta_count**
- Meta Directory: \`$META_DIR\`

## Tasks to Execute
$tasks

## Execution Steps

### For Single Task:
\`\`\`bash
cd /path/to/workspace
claude /harmony "\$(cat task-description.md)"
\`\`\`

### For Parallel Tasks:
Execute each task in a separate terminal:

\`\`\`bash
# Terminal 1
claude /harmony "\$(cat task1-description.md)"

# Terminal 2 (simultaneously)
claude /harmony "\$(cat task2-description.md)"

# Terminal 3 (simultaneously)
claude /harmony "\$(cat task3-description.md)"
\`\`\`

## After Completion

Collect metrics for each session:

\`\`\`bash
cd $SCRIPT_DIR
npm run collect-metrics -- --session SESSION_ID_1 --output $experiment_dir/task1/
npm run collect-metrics -- --session SESSION_ID_2 --output $experiment_dir/task2/
# ... repeat for all tasks
\`\`\`

## Analysis

After all tasks complete:

\`\`\`bash
cd $SCRIPT_DIR
npm run analyze-results -- --experiment-dir $experiment_dir
\`\`\`
EOF

  echo -e "${GREEN}✓ Instructions generated: $experiment_dir/INSTRUCTIONS.md${NC}"
}

# Save experiment metadata
save_metadata() {
  local experiment_dir="$1"
  local step="$2"
  local tasks="$3"
  local meta_count="$4"

  cat > "$experiment_dir/metadata.json" << EOF
{
  "experimentType": "incremental-meta-accumulation",
  "step": $step,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "metaSessionsAtStart": $meta_count,
  "metaBackupLocation": "$BACKUP_DIR",
  "tasks": $tasks,
  "resultsDirectory": "$experiment_dir"
}
EOF

  echo -e "${GREEN}✓ Metadata saved: $experiment_dir/metadata.json${NC}"
}

# ============================================================================
# STEP 1: Baseline (0 meta → 1 task)
# ============================================================================
run_step_1() {
  print_banner "STEP 1: Baseline" "0 Meta Sessions → 1 Task (shopping-cart)"

  print_section "1. Pre-Experiment Setup"

  # Backup existing meta
  backup_meta

  # Clear meta for clean baseline
  clear_meta

  # Count meta (should be 0)
  local meta_count=$(count_meta_sessions)
  echo -e "${CYAN}Meta Sessions: $meta_count${NC}"

  # Create experiment directory
  local experiment_dir=$(create_experiment_dir "1")
  echo -e "${GREEN}Experiment Directory: $experiment_dir${NC}"

  print_section "2. Task Configuration"

  local tasks='[
    {"taskId": "shopping-cart", "complexity": "simple-medium", "parallel": false}
  ]'

  echo -e "${CYAN}Task: shopping-cart (Simple-Medium)${NC}"
  echo -e "${CYAN}Expected Baseline Time: 40-50 minutes${NC}"
  echo -e "${CYAN}Expected Baseline Turns: 10-12${NC}"

  # Generate instructions
  local task_list="- **shopping-cart** (Simple-Medium): Shopping cart with discount engine"
  generate_instructions "$experiment_dir" "1" "$task_list" "$meta_count"

  # Save metadata
  save_metadata "$experiment_dir" "1" "$tasks" "$meta_count"

  print_section "3. Execution"

  echo -e "${YELLOW}MANUAL STEP REQUIRED:${NC}"
  echo -e "1. Execute the shopping-cart task following: ${CYAN}$experiment_dir/INSTRUCTIONS.md${NC}"
  echo -e "2. Note the session ID after completion"
  echo -e "3. Run metrics collection as described in INSTRUCTIONS.md"
  echo ""
  echo -e "${MAGENTA}Expected Outcome:${NC}"
  echo -e "  - 1 new QuickMeta session created"
  echo -e "  - Baseline metrics established"
  echo -e "  - No meta-learning benefits (clean start)"
  echo ""

  print_section "4. Verification"

  echo -e "${YELLOW}After task completion, verify:${NC}"
  echo -e "  ☐ QuickMeta session created in: $META_DIR"
  echo -e "  ☐ Metrics collected in: $experiment_dir"
  echo -e "  ☐ Task completed with all P0 requirements met"
  echo ""

  echo -e "${GREEN}✓ Step 1 setup complete${NC}"
  echo -e "${CYAN}Proceed with task execution, then run Step 2${NC}"
}

# ============================================================================
# STEP 2: Initial Transfer (1 meta → 2 tasks)
# ============================================================================
run_step_2() {
  print_banner "STEP 2: Initial Transfer" "1 Meta Session → 2 Parallel Tasks"

  print_section "1. Pre-Experiment Setup"

  # Count existing meta
  local meta_count=$(count_meta_sessions)
  echo -e "${CYAN}Meta Sessions Available: $meta_count${NC}"

  if [[ "$meta_count" -ne 1 ]]; then
    echo -e "${RED}Warning: Expected 1 meta session from Step 1, found $meta_count${NC}"
    echo -e "${YELLOW}This may affect results. Continue? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
      echo -e "${RED}Aborted${NC}"
      exit 1
    fi
  fi

  # Create experiment directory
  local experiment_dir=$(create_experiment_dir "2")
  echo -e "${GREEN}Experiment Directory: $experiment_dir${NC}"

  print_section "2. Task Configuration"

  local tasks='[
    {"taskId": "stats-library", "complexity": "simple-medium", "parallel": true},
    {"taskId": "fraud-detection", "complexity": "medium", "parallel": true}
  ]'

  echo -e "${CYAN}Tasks (Parallel Execution):${NC}"
  echo -e "  1. stats-library (Simple-Medium): Statistical functions library"
  echo -e "  2. fraud-detection (Medium): Rule-based fraud detection"
  echo ""
  echo -e "${CYAN}Expected Time:${NC}"
  echo -e "  - Baseline: 35-45 min (stats), 50-65 min (fraud)"
  echo -e "  - With 1 Meta: 22-28 min (stats), 30-40 min (fraud)"
  echo -e "  - Expected Reduction: ~35-38%"
  echo ""

  # Generate instructions
  local task_list="- **stats-library** (Simple-Medium): Statistical functions with hypothesis testing
- **fraud-detection** (Medium): Rule engine with scoring and alerts

**IMPORTANT**: Execute these tasks in PARALLEL (separate terminals simultaneously)"

  generate_instructions "$experiment_dir" "2" "$task_list" "$meta_count"

  # Save metadata
  save_metadata "$experiment_dir" "2" "$tasks" "$meta_count"

  print_section "3. Execution"

  echo -e "${YELLOW}MANUAL STEP REQUIRED:${NC}"
  echo -e "1. Open TWO terminal windows"
  echo -e "2. Execute both tasks SIMULTANEOUSLY (see INSTRUCTIONS.md)"
  echo -e "3. Note both session IDs after completion"
  echo -e "4. Collect metrics for both sessions"
  echo ""
  echo -e "${MAGENTA}Expected Outcome:${NC}"
  echo -e "  - 2 new QuickMeta sessions (total: 3)"
  echo -e "  - First evidence of meta-learning transfer"
  echo -e "  - Reduced turns/time compared to baseline"
  echo ""

  print_section "4. Verification"

  echo -e "${YELLOW}After tasks completion, verify:${NC}"
  echo -e "  ☐ 2 new QuickMeta sessions created (total 3)"
  echo -e "  ☐ Metrics collected for both tasks"
  echo -e "  ☐ Efficiency improvement vs Step 1 baseline"
  echo ""

  echo -e "${GREEN}✓ Step 2 setup complete${NC}"
  echo -e "${CYAN}Proceed with parallel task execution, then run Step 3${NC}"
}

# ============================================================================
# STEP 3: Accumulation (3 meta → 3 tasks)
# ============================================================================
run_step_3() {
  print_banner "STEP 3: Accumulation" "3 Meta Sessions → 3 Parallel Tasks"

  print_section "1. Pre-Experiment Setup"

  # Count existing meta
  local meta_count=$(count_meta_sessions)
  echo -e "${CYAN}Meta Sessions Available: $meta_count${NC}"

  if [[ "$meta_count" -ne 3 ]]; then
    echo -e "${RED}Warning: Expected 3 meta sessions from Steps 1-2, found $meta_count${NC}"
    echo -e "${YELLOW}This may affect results. Continue? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
      echo -e "${RED}Aborted${NC}"
      exit 1
    fi
  fi

  # Create experiment directory
  local experiment_dir=$(create_experiment_dir "3")
  echo -e "${GREEN}Experiment Directory: $experiment_dir${NC}"

  print_section "2. Task Configuration"

  local tasks='[
    {"taskId": "etl-data-pipeline", "complexity": "medium", "parallel": true},
    {"taskId": "twitter-timeline", "complexity": "medium", "parallel": true},
    {"taskId": "inventory-sync", "complexity": "medium", "parallel": true}
  ]'

  echo -e "${CYAN}Tasks (Parallel Execution):${NC}"
  echo -e "  1. etl-data-pipeline (Medium): ETL with validation and error recovery"
  echo -e "  2. twitter-timeline (Medium): Fan-out timeline with caching"
  echo -e "  3. inventory-sync (Medium): Multi-warehouse inventory management"
  echo ""
  echo -e "${CYAN}Expected Time:${NC}"
  echo -e "  - Baseline: 45-65 min each"
  echo -e "  - With 3 Meta: 28-40 min each"
  echo -e "  - Expected Reduction: 35-40%"
  echo ""

  # Generate instructions
  local task_list="- **etl-data-pipeline** (Medium): Composable pipeline with validation
- **twitter-timeline** (Medium): Fan-out system with rate limiting
- **inventory-sync** (Medium): Multi-location stock with reservations

**IMPORTANT**: Execute these tasks in PARALLEL (3 separate terminals simultaneously)"

  generate_instructions "$experiment_dir" "3" "$task_list" "$meta_count"

  # Save metadata
  save_metadata "$experiment_dir" "3" "$tasks" "$meta_count"

  print_section "3. Execution"

  echo -e "${YELLOW}MANUAL STEP REQUIRED:${NC}"
  echo -e "1. Open THREE terminal windows"
  echo -e "2. Execute all tasks SIMULTANEOUSLY (see INSTRUCTIONS.md)"
  echo -e "3. Note all session IDs after completion"
  echo -e "4. Collect metrics for all sessions"
  echo ""
  echo -e "${MAGENTA}Expected Outcome:${NC}"
  echo -e "  - 3 new QuickMeta sessions (total: 6)"
  echo -e "  - Compound meta-learning effects visible"
  echo -e "  - Pattern reuse acceleration"
  echo ""

  print_section "4. Verification"

  echo -e "${YELLOW}After tasks completion, verify:${NC}"
  echo -e "  ☐ 3 new QuickMeta sessions created (total 6)"
  echo -e "  ☐ Metrics collected for all 3 tasks"
  echo -e "  ☐ Continued efficiency improvement"
  echo ""

  echo -e "${GREEN}✓ Step 3 setup complete${NC}"
  echo -e "${CYAN}Proceed with parallel task execution, then run Step 4${NC}"
}

# ============================================================================
# STEP 4: Saturation Test (6 meta → 4 tasks)
# ============================================================================
run_step_4() {
  print_banner "STEP 4: Saturation Test" "6 Meta Sessions → 4 Parallel Tasks"

  print_section "1. Pre-Experiment Setup"

  # Count existing meta
  local meta_count=$(count_meta_sessions)
  echo -e "${CYAN}Meta Sessions Available: $meta_count${NC}"

  if [[ "$meta_count" -ne 6 ]]; then
    echo -e "${RED}Warning: Expected 6 meta sessions from Steps 1-3, found $meta_count${NC}"
    echo -e "${YELLOW}This may affect results. Continue? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
      echo -e "${RED}Aborted${NC}"
      exit 1
    fi
  fi

  # Create experiment directory
  local experiment_dir=$(create_experiment_dir "4")
  echo -e "${GREEN}Experiment Directory: $experiment_dir${NC}"

  print_section "2. Task Configuration"

  local tasks='[
    {"taskId": "airbnb-search", "complexity": "complex", "parallel": true},
    {"taskId": "order-book", "complexity": "complex", "parallel": true},
    {"taskId": "risk-calculator", "complexity": "medium-high", "parallel": true},
    {"taskId": "monte-carlo-simulator", "complexity": "complex", "parallel": true}
  ]'

  echo -e "${CYAN}Tasks (Parallel Execution):${NC}"
  echo -e "  1. airbnb-search (Complex): Multi-filter search with geospatial"
  echo -e "  2. order-book (Complex): Matching engine with price-time priority"
  echo -e "  3. risk-calculator (Medium-High): VaR calculation with stress testing"
  echo -e "  4. monte-carlo-simulator (Complex): Parallel simulation engine"
  echo ""
  echo -e "${CYAN}Expected Time:${NC}"
  echo -e "  - Baseline: 55-85 min each"
  echo -e "  - With 6 Meta: 35-52 min each"
  echo -e "  - Expected Reduction: 36-40%"
  echo -e "  - Hypothesis: Check for saturation (diminishing returns)"
  echo ""

  # Generate instructions
  local task_list="- **airbnb-search** (Complex): Search engine with availability calendar
- **order-book** (Complex): Trading order matching with multiple types
- **risk-calculator** (Medium-High): Portfolio VaR with Monte Carlo
- **monte-carlo-simulator** (Complex): Statistical simulation with convergence

**IMPORTANT**: Execute these tasks in PARALLEL (4 separate terminals simultaneously)
**RESEARCH QUESTION**: Does improvement rate slow down (saturation)?"

  generate_instructions "$experiment_dir" "4" "$task_list" "$meta_count"

  # Save metadata
  save_metadata "$experiment_dir" "4" "$tasks" "$meta_count"

  print_section "3. Execution"

  echo -e "${YELLOW}MANUAL STEP REQUIRED:${NC}"
  echo -e "1. Open FOUR terminal windows"
  echo -e "2. Execute all tasks SIMULTANEOUSLY (see INSTRUCTIONS.md)"
  echo -e "3. Note all session IDs after completion"
  echo -e "4. Collect metrics for all sessions"
  echo ""
  echo -e "${MAGENTA}Expected Outcome:${NC}"
  echo -e "  - 4 new QuickMeta sessions (total: 10)"
  echo -e "  - Test for saturation effect"
  echo -e "  - Measure if improvement rate decreases"
  echo ""

  print_section "4. Verification"

  echo -e "${YELLOW}After tasks completion, verify:${NC}"
  echo -e "  ☐ 4 new QuickMeta sessions created (total 10)"
  echo -e "  ☐ Metrics collected for all 4 tasks"
  echo -e "  ☐ Analyze if improvement rate changes"
  echo ""

  echo -e "${GREEN}✓ Step 4 setup complete${NC}"
  echo -e "${CYAN}Proceed with parallel task execution, then run Step 5${NC}"
}

# ============================================================================
# STEP 5: Large Scale (10+ meta → 5 tasks)
# ============================================================================
run_step_5() {
  print_banner "STEP 5: Large Scale" "10+ Meta Sessions → 5 Complex Tasks"

  print_section "1. Pre-Experiment Setup"

  # Count existing meta
  local meta_count=$(count_meta_sessions)
  echo -e "${CYAN}Meta Sessions Available: $meta_count${NC}"

  if [[ "$meta_count" -lt 10 ]]; then
    echo -e "${RED}Warning: Expected 10+ meta sessions from Steps 1-4, found $meta_count${NC}"
    echo -e "${YELLOW}This may affect results. Continue? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
      echo -e "${RED}Aborted${NC}"
      exit 1
    fi
  fi

  # Create experiment directory
  local experiment_dir=$(create_experiment_dir "5")
  echo -e "${GREEN}Experiment Directory: $experiment_dir${NC}"

  print_section "2. Task Configuration"

  local tasks='[
    {"taskId": "uber-ride-matching", "complexity": "complex", "parallel": true},
    {"taskId": "stripe-payment-processor", "complexity": "complex", "parallel": true},
    {"taskId": "netflix-streaming", "complexity": "medium-high", "parallel": true},
    {"taskId": "fulfillment-orchestrator", "complexity": "complex", "parallel": true},
    {"taskId": "ml-experiment-tracker", "complexity": "medium", "parallel": true}
  ]'

  echo -e "${CYAN}Tasks (Parallel Execution):${NC}"
  echo -e "  1. uber-ride-matching (Complex): Geospatial matching with surge pricing"
  echo -e "  2. stripe-payment-processor (Complex): Idempotent payments with webhooks"
  echo -e "  3. netflix-streaming (Medium-High): Adaptive bitrate with CDN"
  echo -e "  4. fulfillment-orchestrator (Complex): Saga workflow with compensation"
  echo -e "  5. ml-experiment-tracker (Medium): Experiment tracking with versioning"
  echo ""
  echo -e "${CYAN}Expected Time:${NC}"
  echo -e "  - Baseline: 50-90 min each"
  echo -e "  - With 10+ Meta: 30-55 min each"
  echo -e "  - Expected Reduction: 38-42%"
  echo -e "  - Hypothesis: Peak meta-learning efficiency"
  echo ""

  # Generate instructions
  local task_list="- **uber-ride-matching** (Complex): Real-time geospatial with optimization
- **stripe-payment-processor** (Complex): Payment pipeline with reliability patterns
- **netflix-streaming** (Medium-High): Video streaming with ABR and caching
- **fulfillment-orchestrator** (Complex): Multi-step workflow orchestration
- **ml-experiment-tracker** (Medium): ML lifecycle with model versioning

**IMPORTANT**: Execute these tasks in PARALLEL (5 separate terminals simultaneously)
**RESEARCH QUESTION**: Does large meta corpus maintain or increase efficiency?"

  generate_instructions "$experiment_dir" "5" "$task_list" "$meta_count"

  # Save metadata
  save_metadata "$experiment_dir" "5" "$tasks" "$meta_count"

  print_section "3. Execution"

  echo -e "${YELLOW}MANUAL STEP REQUIRED:${NC}"
  echo -e "1. Open FIVE terminal windows"
  echo -e "2. Execute all tasks SIMULTANEOUSLY (see INSTRUCTIONS.md)"
  echo -e "3. Note all session IDs after completion"
  echo -e "4. Collect metrics for all sessions"
  echo ""
  echo -e "${MAGENTA}Expected Outcome:${NC}"
  echo -e "  - 5 new QuickMeta sessions (total: 15)"
  echo -e "  - Demonstrate peak meta-learning performance"
  echo -e "  - Validate compound learning effects at scale"
  echo ""

  print_section "4. Verification"

  echo -e "${YELLOW}After tasks completion, verify:${NC}"
  echo -e "  ☐ 5 new QuickMeta sessions created (total 15)"
  echo -e "  ☐ Metrics collected for all 5 tasks"
  echo -e "  ☐ Final analysis of meta-learning curve"
  echo ""

  print_section "5. Final Analysis"

  echo -e "${CYAN}After Step 5 completion, run comprehensive analysis:${NC}"
  echo ""
  echo -e "  cd $SCRIPT_DIR"
  echo -e "  npm run analyze-incremental -- --results-dir $RESULTS_DIR"
  echo ""
  echo -e "${MAGENTA}Analysis will generate:${NC}"
  echo -e "  - Meta-learning accumulation curve"
  echo -e "  - Efficiency improvement by step"
  echo -e "  - Saturation point detection"
  echo -e "  - Pattern transfer matrix"
  echo -e "  - Publication-ready visualizations"
  echo ""

  echo -e "${GREEN}✓ Step 5 setup complete${NC}"
  echo -e "${CYAN}Proceed with parallel task execution${NC}"
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║ FINAL STEP - After completion, run full analysis for research paper     ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
}

# ============================================================================
# RUN ALL STEPS
# ============================================================================
run_all_steps() {
  print_banner "FULL INCREMENTAL EXPERIMENT" "All 5 Steps Sequential Execution"

  echo -e "${YELLOW}This will run all 5 steps in sequence.${NC}"
  echo -e "${YELLOW}Each step requires manual task execution and metric collection.${NC}"
  echo ""
  echo -e "${CYAN}Estimated Total Time: 8-12 hours (with manual execution)${NC}"
  echo ""
  echo -e "${RED}Warning: This is a long-running experiment.${NC}"
  echo -e "${YELLOW}Continue? (y/N)${NC}"
  read -r response

  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted${NC}"
    exit 0
  fi

  # Run each step
  run_step_1
  echo ""
  echo -e "${YELLOW}Press ENTER after completing Step 1 tasks and metrics collection...${NC}"
  read -r

  run_step_2
  echo ""
  echo -e "${YELLOW}Press ENTER after completing Step 2 tasks and metrics collection...${NC}"
  read -r

  run_step_3
  echo ""
  echo -e "${YELLOW}Press ENTER after completing Step 3 tasks and metrics collection...${NC}"
  read -r

  run_step_4
  echo ""
  echo -e "${YELLOW}Press ENTER after completing Step 4 tasks and metrics collection...${NC}"
  read -r

  run_step_5

  echo ""
  print_banner "EXPERIMENT COMPLETE" "All 5 steps finished - Ready for analysis"

  echo -e "${GREEN}Total QuickMeta Sessions: $(count_meta_sessions)${NC}"
  echo -e "${GREEN}Results Directory: $RESULTS_DIR${NC}"
  echo ""
  echo -e "${CYAN}Next: Run comprehensive analysis${NC}"
  echo -e "  cd $SCRIPT_DIR"
  echo -e "  npm run analyze-incremental -- --results-dir $RESULTS_DIR"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

case "$STEP" in
  1)
    run_step_1
    ;;
  2)
    run_step_2
    ;;
  3)
    run_step_3
    ;;
  4)
    run_step_4
    ;;
  5)
    run_step_5
    ;;
  all)
    run_all_steps
    ;;
  *)
    echo -e "${RED}Error: Invalid step '$STEP'${NC}"
    echo -e "${YELLOW}Valid steps: 1, 2, 3, 4, 5, all${NC}"
    usage
    ;;
esac

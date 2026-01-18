---
description: View pattern library dashboard with phase-by-phase statistics
argument-hint: [--top <N> | --phase <name>]
model: sonnet
---

# /metaview - Pattern Library Dashboard

View pattern library dashboard with comprehensive statistics and insights.

---

## Usage

```bash
/metaview                    # Full pattern library dashboard
/metaview --top 10           # Top 10 patterns by frequency
/metaview --phase planning   # Patterns from specific phase
```

---

## What It Shows

### Default Dashboard (no args)

Comprehensive pattern library overview presented as a dashboard:

1. **Overview Statistics**
   - Total patterns across all phases
   - Pattern distribution by phase
   - Average frequency and success rates
   - Last updated timestamp

2. **Phase-by-Phase Breakdown**
   - Planning phase: pattern count, top patterns
   - Design phase: pattern count, top patterns
   - Implementation phase: pattern count, top patterns
   - Operation phase: pattern count, top patterns

3. **Top Patterns by Frequency**
   - Top 5-10 most used patterns
   - Each pattern's problem, solution, learning, success rate
   - Usage frequency and decay score

### Dashboard Format

```markdown
# 📊 Pattern Library Dashboard

## Overview
**Total Patterns**: 15 patterns
**Last Updated**: 2026-01-18 14:30
**Average Frequency**: 4.2x per pattern
**Average Success Rate**: 92%

---

## By Phase

| Phase | Patterns | Top Pattern | Frequency |
|-------|----------|-------------|-----------|
| **Planning** | 4 | Verify Primary Source First | 5x |
| **Design** | 3 | Decision Documentation | 4x |
| **Implementation** | 5 | Parallel Task Execution | 8x |
| **Operation** | 3 | P0 Risk Classification | 4x |

---

## Top 5 Patterns

### 1. [Implementation] Parallel Task Execution [8x] 🔥
- **Problem**: Sequential tasks waste time
- **Solution**: Fire all independent tasks in parallel
- **Learning**: Always check for parallelizable work
- **Success Rate**: 95%
- **Decay Score**: 8.7

### 2. [Planning] Verify Primary Source First [5x]
- **Problem**: Wrong document leads to wasted work
- **Solution**: Ask user to confirm primary source
- **Learning**: Clarification upfront saves time
- **Success Rate**: 100%
- **Decay Score**: 5.2

### 3. [Design] Decision Documentation [4x]
- **Problem**: Decisions lost to memory
- **Solution**: Document rationale with alternatives
- **Learning**: Why matters more than what
- **Success Rate**: 90%
- **Decay Score**: 4.1

[... more patterns ...]
```

### With `--top N`

Shows top N patterns by frequency:

```bash
/metaview --top 5      # Top 5 patterns
/metaview --top 10     # Top 10 patterns
```

**Output**: Focused list of most-used patterns with full details (problem, solution, learning, success rate, decay score)

### With `--phase <name>`

Shows patterns from specific phase:

```bash
/metaview --phase planning
/metaview --phase design
/metaview --phase implementation
/metaview --phase operation
```

**Output**: All patterns from the selected phase with phase-specific statistics

---

## Dashboard Sections

### 1. Overview Statistics
```markdown
**Total Patterns**: 15 patterns
**Last Updated**: 2026-01-18 14:30
**Average Frequency**: 4.2x per pattern
**Average Success Rate**: 92%
```

### 2. Phase Distribution Table
| Phase | Patterns | Top Pattern | Frequency |
|-------|----------|-------------|-----------|
| Planning | 4 | Pattern name | 5x |
| Design | 3 | Pattern name | 4x |
| Implementation | 5 | Pattern name | 8x |
| Operation | 3 | Pattern name | 4x |

### 3. Efficiency Metrics (Time Savings)
```markdown
## ⚡ Efficiency Impact

**Total Time Saved**: 142 minutes (2.4 hours)
**Average Efficiency Gain**: 49% faster per task
**Tasks with Meta-Analysis**: 5 tasks
**Tasks without Meta-Analysis**: 1 task (baseline)

### Breakdown
| Metric | Baseline | With Meta | Improvement |
|--------|----------|-----------|-------------|
| Avg Task Duration | 45 min | 23 min | **-49%** |
| Avg Turns | 9 turns | 5 turns | **-44%** |
| Web Searches | 5 searches | 0 searches | **-100%** |
| Decisions Required | 6 decisions | 2 decisions | **-67%** |

### ROI
- **Investment**: 5 min per meta-analysis
- **Return**: ~22 min saved per task
- **ROI**: **4.4x return** on time invested
```

### 4. Top Patterns List
Each pattern includes:
- **Phase tag** (Planning/Design/Implementation/Operation)
- **Frequency** (usage count with visual indicator 🔥)
- **Problem**: What challenge this addresses
- **Solution**: How to solve it
- **Learning**: Key insight or principle
- **Success Rate**: Percentage of successful applications
- **Decay Score**: Current relevance score

---

## When to Use

### ✅ Use /metaview:
- **Before starting new work**: Learn from past patterns
- **To review pattern library**: See what solutions exist
- **To check efficiency metrics**: Track time savings over time
- **To find reusable solutions**: Apply proven approaches
- **To understand phase patterns**: See what works in each phase

### 💡 Workflow:
```
/metaview                # See pattern library dashboard
→ Start work with patterns in mind
→ Complete work
→ /meta                  # Generate meta-analysis
→ /aggregate             # Consolidate patterns into library
→ /metaview              # Review updated patterns and metrics
```

---

## Storage Locations

### Patterns Library
```
~/.claude/meta/PATTERNS.md              # Human-readable summary
~/.claude/meta/{phase}/patterns.json    # Machine-readable data
```

### Configuration
```
~/.claude/meta/config.json              # Aggregation settings
```

---

## Examples

### Example 1: Full Dashboard View
```bash
User: /metaview
```
```markdown
# 📊 Pattern Library Dashboard

## Overview
**Total Patterns**: 15 patterns
**Last Updated**: 2026-01-18 14:30
**Average Frequency**: 4.2x per pattern
**Average Success Rate**: 92%

## By Phase
| Phase | Patterns | Top Pattern | Frequency |
|-------|----------|-------------|-----------|
| Planning | 4 | Verify Primary Source First | 5x |
| Design | 3 | Decision Documentation | 4x |
| Implementation | 5 | Parallel Task Execution | 8x |
| Operation | 3 | P0 Risk Classification | 4x |

## ⚡ Efficiency Impact
**Total Time Saved**: 142 minutes (2.4 hours)
**Average Efficiency Gain**: 49% faster per task
**ROI**: 4.4x return on time invested

## Top 5 Patterns
1. [Implementation] Parallel Task Execution [8x] 🔥
2. [Planning] Verify Primary Source First [5x]
3. [Design] Decision Documentation [4x]
[...]
```

### Example 2: Quick Pattern Check
```bash
User: /metaview --top 5
```
```
Top 5 Patterns by Frequency:

1. [Implementation] Parallel Task Execution [8x] 🔥
   - Always fire independent tasks together
   - Success Rate: 95%

2. [Planning] Verify Primary Source First [5x]
   - Clarify main document upfront
   - Success Rate: 100%

3. [Design] Decision Documentation [4x]
   - Record why choices were made
   - Success Rate: 90%

4. [Operation] P0 Risk Classification [4x]
   - Block on critical issues immediately
   - Success Rate: 88%

5. [Implementation] Test-First Implementation [3x]
   - Write tests before code
   - Success Rate: 92%
```

### Example 3: Phase-Specific Patterns
```bash
User: /metaview --phase implementation
```
```
# Implementation Phase Patterns

**Total**: 5 patterns
**Average Frequency**: 4.8x
**Average Success Rate**: 91%

## All Patterns

1. Parallel Task Execution [8x]
   - Problem: Sequential tasks waste time
   - Solution: Fire all independent tasks in parallel
   - Learning: Always check for parallelizable work
   - Success Rate: 95%

2. Test-First Implementation [3x]
   - Problem: Tests added as afterthought
   - Solution: Write tests before implementation
   - Learning: Tests guide better design
   - Success Rate: 92%

[... 3 more patterns ...]
```

---

## Benefits

1. **Learning from Past**: See what patterns worked before
2. **Pattern Reuse**: Apply proven solutions immediately
3. **Efficiency Tracking**: Monitor time savings and ROI over time
4. **Quick Reference**: Fast access to pattern library
5. **Data-Driven Decisions**: Choose approaches based on success rates
6. **Phase-Specific Guidance**: See what works in each phase
7. **Visual Dashboard**: Tables and metrics for easy scanning

---

## Integration with Other Commands

```
/meta        → Generate session meta-analysis
/aggregate   → Consolidate patterns into library
/metaview    → View pattern library dashboard  ← YOU ARE HERE
```

**Continuous Improvement Loop**:
```
/metaview              # Check pattern library
→ Work with patterns in mind
→ /meta                # Generate meta-analysis
→ /aggregate           # Update pattern library
→ /metaview            # Review updated dashboard
```

**Key Difference**:
- `/meta`: Generates meta-analysis for current session
- `/aggregate`: Consolidates meta-analyses into pattern library
- `/metaview`: Views the pattern library dashboard

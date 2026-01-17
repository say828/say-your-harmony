---
description: View and brief stored meta-analysis and patterns library
argument-hint: [--recent | --patterns | --session <id> | --top <N>]
model: sonnet
---

# /metaview - View Meta-Analysis & Patterns Library

View, brief, and summarize stored meta-analyses and pattern library.

---

## Usage

```bash
/metaview                    # Full briefing (patterns + recent sessions)
/metaview --recent           # Only recent session meta-analysis
/metaview --patterns         # Only patterns library summary
/metaview --session <id>     # Specific session (e.g., 2026-01-18)
/metaview --top 10           # Top 10 patterns by frequency
/metaview --phase planning   # Patterns from specific phase
```

---

## What It Shows

### Default Briefing (no args)

1. **Pattern Library Summary**
   - Total patterns across all phases
   - Top 5 most frequent patterns
   - Recent pattern additions

2. **Recent Sessions**
   - Latest 3 session meta-analyses
   - Key insights from each
   - Efficiency trends

3. **Quick Stats**
   - Total sessions analyzed
   - Average efficiency gain
   - Common problem-solving patterns

### With `--patterns`

Detailed view of the patterns library:

```markdown
## Master Patterns Library

**Total Patterns**: 15
**By Phase**:
- Planning: 4 patterns
- Design: 3 patterns
- Implementation: 5 patterns
- Operation: 3 patterns

### Top Patterns by Frequency

1. [Implementation] Parallel Task Execution [8x]
   - Problem: Sequential tasks waste time
   - Solution: Fire all independent tasks in parallel
   - Learning: Always check for parallelizable work
   - Success Rate: 95%

2. [Planning] Verify Primary Source First [5x]
   - Problem: Wrong document leads to wasted work
   - Solution: Ask user to confirm primary source
   - Learning: Clarification upfront saves time
   - Success Rate: 100%

...
```

### With `--recent`

Shows the most recent session meta-analysis:

```markdown
## Latest Session: 2026-01-18-14-30

### Summary
- Task: Add authentication feature
- Duration: 2.5 hours
- Outcome: SUCCESS

### Tool Usage
- Read: 16x
- Task: 12x (100% success)
- Edit: 8x
- Write: 4x

### Efficiency
- Parallel execution: 4.2x speedup
- Total turns: 43

### Key Patterns Applied
1. Parallel document creation
2. Risk classification (P0/P1)
3. Decision documentation

### Improvements Suggested
- Add performance baseline
- Increase test coverage to 90%
```

### With `--session <id>`

View specific session by date/ID:

```bash
/metaview --session 2026-01-17
```

### With `--top N`

Top N most frequent patterns:

```bash
/metaview --top 5      # Top 5 patterns
/metaview --top 10     # Top 10 patterns
```

### With `--phase <name>`

Patterns from specific phase:

```bash
/metaview --phase planning
/metaview --phase implementation
```

---

## Output Format

### Briefing Structure

```markdown
# 📊 Meta-Analysis Briefing

## Pattern Library Overview
- Total patterns: X
- Most recent: YYYY-MM-DD
- Avg pattern frequency: X.X

## Top Patterns (by frequency)
[Top 5 patterns with quick summary]

## Recent Sessions (last 3)
[Session summaries with key metrics]

## Efficiency Trends
- Average parallel speedup: X.Xx
- Average tool usage per session: X
- Success rate: XX%

## Recommendations
[Actionable insights based on patterns]
```

---

## When to Use

### ✅ Use /metaview:
- Before starting new work (learn from past)
- To review accumulated patterns
- To check efficiency trends
- To find reusable solutions
- To see recent session insights

### 💡 Workflow:
```
/metaview --patterns     # See what patterns exist
→ Start work with patterns in mind
→ Complete work
→ /meta                  # Generate meta-analysis
→ /aggregate             # Consolidate patterns
→ /metaview --recent     # Review what was learned
```

---

## Storage Locations

### Patterns Library
```
~/.claude/meta/PATTERNS.md              # Human-readable summary
~/.claude/meta/{phase}/patterns.json    # Machine-readable data
```

### Session Meta-Analyses
```
~/.claude/meta/session-*.md             # Individual session analyses
```

### Configuration
```
~/.claude/meta/config.json              # Aggregation settings
```

---

## Examples

### Example 1: Quick Check Before Starting Work
```bash
User: /metaview --top 5
```
```
Top 5 Patterns:
1. [8x] Parallel Task Execution - Always fire independent tasks together
2. [5x] Verify Primary Source - Clarify main document upfront
3. [4x] P0 Risk Classification - Block on critical issues immediately
4. [3x] Decision Documentation - Record why choices were made
5. [3x] Test-First Implementation - Write tests before code
```

### Example 2: Review Last Session
```bash
User: /metaview --recent
```
```
Latest Session: 2026-01-18-14-30
Task: Refactor authentication system
Efficiency: 4.2x parallel speedup
Key Learning: Always check for circular dependencies early
```

### Example 3: Full Briefing
```bash
User: /metaview
```
```
📊 Meta-Analysis Briefing

Pattern Library: 15 total patterns
Recent Sessions: 7 analyzed (max 10 stored)
Avg Efficiency: 3.8x speedup

Top Patterns:
1. Parallel execution (8x)
2. Primary source verification (5x)
3. Risk classification (4x)

Recent Insights:
- Last 3 sessions all used parallel execution
- Test coverage trending up (75% → 85% → 90%)
- Decision documentation becoming standard

Recommendation: Continue parallel-first mindset
```

---

## Benefits

1. **Learning from Past**: See what worked before
2. **Pattern Reuse**: Apply proven solutions
3. **Efficiency Tracking**: Monitor improvement over time
4. **Quick Reference**: Fast access to insights
5. **Trend Analysis**: Spot patterns in patterns

---

## Integration with Other Commands

```
/meta        → Generate new meta-analysis
/aggregate   → Consolidate patterns
/metaview    → View and brief patterns  ← YOU ARE HERE
```

**Continuous Improvement Loop**:
```
Work → /meta → /aggregate → /metaview → Apply Learnings → Work
```

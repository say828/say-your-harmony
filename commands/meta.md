---
description: Generate comprehensive meta-analysis for current session
model: opus
---

# /meta - Generate Meta-Analysis

Generate comprehensive meta-analysis document for the current session.

---

## Usage

```bash
/meta
```

Analyzes the current development session and generates a structured meta-analysis document.

---

## What Gets Generated

### 8-Section Meta-Analysis Document

#### 1. Work Process Structure
- Phase breakdown (turns per phase)
- Tool usage frequency
- Subagent execution statistics
- Time distribution

#### 2. Decision Trees
- All key decisions made
- Options considered for each
- Rationale documented
- Tradeoffs analyzed

#### 3. Problem-Solving Patterns
- Approaches that worked
- Approaches that didn't
- Reusable patterns identified
- Lessons learned

#### 4. Code Quality Metrics
- Lines of code written
- Test coverage percentage
- Complexity measures
- Build/test status

#### 5. Efficiency Analysis
- Parallel execution gains
- Sequential vs parallel time
- Subagent success rate
- Speedup calculations

#### 6. Communication Analysis
- Effective user requests
- Ineffective requests
- What worked in collaboration
- Improvement suggestions

#### 7. Best Practices Extracted
- Patterns to continue using
- Techniques that were effective
- Standards established

#### 8. Continuous Improvement Suggestions
- What to improve next time
- Specific actionable items
- Target metrics

---

## Output Location

```
docs/meta/session-YYYY-MM-DD-HH-MM-meta-analysis.md
```

Example:
```
docs/meta/session-2026-01-17-14-30-meta-analysis.md
```

---

## When to Use

### ✅ Use /meta After:
- Completing Phase 4 (Operation)
- Finishing a major feature
- Complex problem-solving session
- End of sprint/iteration

### ❌ Skip For:
- Simple tasks (< 5 turns)
- Trivial changes
- Quick fixes
- Documentation-only updates

---

## Philosophy

> **"Every session is a learning opportunity. Document it systematically."**

From development philosophy:
- Meta-analysis as **standard practice**
- Capture **tool usage patterns**
- Extract **reusable patterns**
- Enable **continuous improvement**

---

## Real-World Example

**Phase 1 Security Implementation Meta-Analysis**:

```markdown
## 1. Work Process Structure
Total: 43 turns
- Phase 1 (Planning): 5 turns
- Phase 2 (Design): 8 turns
- Phase 3 (Implementation): 10 turns
- Phase 4 (Operation): 12 turns

Tool Usage:
| Tool | Count |
|------|-------|
| Read | 16 |
| Task | 12 |
| Edit | 6 |
| Write | 4 |

## 2. Decision Trees
### Decision: Rate Limiting Storage
✅ In-memory (Caffeine) - SELECTED
❌ Redis - Rejected (over-engineering)
❌ Spring Cloud Gateway - Rejected (too complex)

## 3. Problem-Solving Patterns
### Pattern 1: "Wrong Document Reference"
- Problem: Read wrong doc first
- Solution: User specified correct doc → pivot
- Learning: Always verify PRIMARY source

## 4. Code Quality
- 315 lines production code
- 39% comments
- Build: SUCCESS
- Tests: 100% pass

## 5. Efficiency
- Parallel execution: 4.25x speedup
- Subagent success: 11/11 = 100%

## 6. Communication
✅ Effective: "parallel execution, ultrathink"
❌ Ineffective: "make it better"

## 7. Best Practices
- Plan Mode first
- Parallel execution
- P0/P1 classification

## 8. Improvements
- Add test coverage targets
- Configuration externalization
- Grafana dashboard
```

---

## Benefits of Meta-Analysis

### 1. Learning
- Mistakes documented → not repeated
- Successes documented → replicated
- Patterns extracted → reusable

### 2. Metrics
- Efficiency quantified (4.25x speedup)
- Success rates tracked (100% subagents)
- Progress measurable

### 3. Documentation
- Decisions preserved for future
- Context available months later
- Onboarding resource for team

### 4. Continuous Improvement
- Specific action items
- Measurable targets
- Systematic enhancement

---

## How It Works

### Step 1: Session Data Collection
```typescript
// Automatically tracked during session:
- Tool calls (Read, Write, Edit, Task, Bash)
- Decision points (AskUserQuestion, alternatives)
- Phase transitions (Planning → Design → Implementation → Operation)
- Subagent invocations (success/failure)
- Build/test results
```

### Step 2: Pattern Analysis
```typescript
// Meta-analyzer identifies:
- Problem-solving patterns
- Communication effectiveness
- Tool usage efficiency
- Decision quality
```

### Step 3: Metrics Calculation
```typescript
// Quantitative analysis:
- Parallel speedup = Sequential time / Parallel time
- Success rate = Successful tasks / Total tasks
- Tool distribution = Tool count / Total calls
- Phase distribution = Phase turns / Total turns
```

### Step 4: Document Generation
```markdown
// 8-section structured document with:
- Quantitative metrics
- Qualitative insights
- Actionable improvements
- Reusable patterns
```

---

## Reading Meta-Analysis

After generation:

```bash
# View the meta-analysis
cat docs/meta/session-2026-01-17-14-30-meta-analysis.md

# Or open in editor
code docs/meta/session-2026-01-17-14-30-meta-analysis.md
```

### Focus Areas When Reading

1. **Efficiency Analysis**: Where did time go? Can we improve?
2. **Problem-Solving Patterns**: What patterns worked? Reusable?
3. **Best Practices**: What should we keep doing?
4. **Improvements**: What specific actions for next time?

---

## Integration with 4-Phase Workflow

Meta-analysis is **mandatory at end of Phase 4**:

```
Phase 1 (Planning) →
Phase 2 (Design) →
Phase 3 (Implementation) →
Phase 4 (Operation)
  ├─ Deployment
  ├─ Verification
  └─ Meta-Analysis ← Automatic with /harmony, manual with /meta
```

---

## Tips

1. **Generate immediately**: Don't wait, details fade
2. **Be quantitative**: Specific numbers > vague statements
3. **Extract patterns**: Look for reusable approaches
4. **Be honest**: Document failures, not just successes
5. **Make actionable**: Specific improvements, not wishes
6. **Actually read it**: Don't generate and ignore
7. **Apply learnings**: Use insights in next session

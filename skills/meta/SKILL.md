# Meta-Analysis Skill

## What It Does

Automatically generates **comprehensive meta-analysis documents** after task completion.

Captures:
- Tool usage patterns
- Decision trees
- Problem-solving patterns
- Efficiency metrics
- Continuous improvement suggestions

**Philosophy**: **"Every session is a learning opportunity. Document it systematically."**

---

## When to Use

- After completing **Phase 4 (Operation)**
- After **major feature implementation**
- After **complex problem-solving sessions**
- End of **sprint/iteration**

**Never** for:
- Simple single-phase tasks
- Quick fixes (< 5 turns)
- Trivial changes

---

## How It Changes Behavior

When meta is active:

1. **Track all tool usage** during session
   - Count Read, Write, Edit, Task, Bash calls
   - Measure time per phase

2. **Document decision rationale** as you go
   - Why this approach?
   - What alternatives rejected?
   - What tradeoffs made?

3. **Note problem-solving patterns**
   - What worked?
   - What didn't?
   - Reusable approaches

4. **At completion → Generate comprehensive meta-analysis**
   - 8-section document
   - Quantitative metrics
   - Actionable insights

---

## Activation

### Automatic (Recommended)
```
After Phase 4 completion:
→ System automatically triggers meta-analysis
```

### Manual Command
```bash
/meta
```

### In Workflow
```
> "Generate meta-analysis for this session"
> "메타 분석 생성해"
> "/meta"
```

---

## What Gets Generated

### 8-Section Meta-Analysis Document

#### 1. Work Process Structure
- Phase breakdown (turns per phase)
- Tool usage frequency
- Subagent execution stats

#### 2. Decision Trees
- Key decisions with rationale
- Options considered
- Tradeoffs analyzed

#### 3. Problem-Solving Patterns
- Reusable approaches
- What worked / what didn't
- Lessons learned

#### 4. Code Quality Metrics
- Lines of code
- Test coverage
- Complexity measures

#### 5. Efficiency Analysis
- Parallel execution gains
- Sequential vs parallel time
- Subagent success rate

#### 6. Communication Analysis
- Effective user requests
- Ineffective requests
- Improvement suggestions

#### 7. Best Practices
- Patterns to continue
- Techniques that worked
- Standards established

#### 8. Continuous Improvement
- What to improve next time
- Target metrics
- Action items

---

## Output Location

```
docs/meta/session-YYYY-MM-DD-HH-MM-meta-analysis.md
```

Example:
```
docs/meta/session-2026-01-17-02-30-meta-analysis.md
```

---

## Real-World Example

**Phase 1 Security Implementation Meta-Analysis**:

```markdown
## 1. Work Process Structure
- **43 turns total**
- Phase 1 (Planning): 5 turns
- Phase 2 (Design): 8 turns
- Phase 3 (Implementation): 10 turns
- Phase 4 (Operation): 12 turns

### Tool Usage
| Tool | Count |
|------|-------|
| Read | 16 |
| Task | 12 |
| Edit | 6 |
| Write | 4 |

## 2. Decision Trees
### Decision: Rate Limiting Storage
- ✅ In-memory (Caffeine)
- ❌ Redis (rejected: over-engineering)

## 3. Problem-Solving Patterns
### Pattern 1: "Wrong Document Reference"
- Problem: Read wrong doc
- Solution: Re-read correct doc
- Learning: Verify PRIMARY source

## 4. Code Quality
- 315 lines code
- 39% comments
- Build: SUCCESS

## 5. Efficiency
- Parallel: 4.25x speedup
- Subagents: 11/11 success (100%)

## 6. Communication
✅ Effective: "parallel execution, ultrathink"
❌ Ineffective: "make it better"

## 7. Best Practices
- Plan Mode first
- Parallel execution
- P0/P1 classification

## 8. Improvements
- Add test coverage
- Configuration externalization
- Monitoring dashboard
```

---

## Benefits

### 1. Learning
- Each session improves the next
- Patterns become reusable
- Mistakes aren't repeated

### 2. Metrics
- Quantify efficiency improvements
- Track success rates
- Measure parallel gains

### 3. Documentation
- Decisions preserved
- Context available months later
- Onboarding resource

### 4. Continuous Improvement
- Specific action items
- Measurable targets
- Systematic enhancement

---

## Integration with 4-Phase Workflow

Meta-analysis is the **final step of Phase 4 (Operation)**:

```
Phase 1 (Planning) →
Phase 2 (Design) →
Phase 3 (Implementation) →
Phase 4 (Operation)
  ├─ Deployment
  ├─ Verification
  └─ Meta-Analysis ← HERE
```

**Required**: Cannot complete Phase 4 without meta-analysis.

---

## Meta-Analysis Generation Process

### Step 1: Gather Session Data
```typescript
// Read session transcript
// Count tool usage
// Extract decisions
// Identify patterns
```

### Step 2: Analyze Metrics
```typescript
// Calculate efficiency (parallel speedup)
// Measure quality (LOC, coverage, errors)
// Assess success rate (subagents, tests)
```

### Step 3: Extract Patterns
```typescript
// What problem-solving approaches worked?
// What communication patterns were effective?
// What decisions had good/bad outcomes?
```

### Step 4: Generate Document
```typescript
// Write 8-section meta-analysis
// Include quantitative metrics
// Provide actionable suggestions
```

### Step 5: Store for Future Reference
```
Save to: docs/meta/session-[timestamp]-meta-analysis.md
```

---

## Success Metrics

When meta-analysis succeeds:
- ✅ **Comprehensive**: All 8 sections complete
- ✅ **Actionable**: Specific improvement suggestions
- ✅ **Measurable**: Quantitative metrics included
- ✅ **Reusable**: Patterns extracted for future use
- ✅ **Insightful**: Non-obvious discoveries

---

## Common Pitfalls

### ❌ Pitfall 1: Skipping Meta-Analysis
```
Wrong: Task done → Move to next task
Right: Task done → Meta-analysis → Learn → Improve
```

### ❌ Pitfall 2: Surface-Level Analysis
```
Wrong: "Tools used: Read (10x), Write (5x)" ← Just counts
Right: "Read (10x): Heavy context gathering indicates complex problem; next time consider using Explorer agent to reduce Read calls"
```

### ❌ Pitfall 3: No Actionable Improvements
```
Wrong: "Could be better"
Right: "Improvement: Add test coverage target (current 70%, target 85%)"
```

---

## Tips

1. **Generate immediately**: Don't wait, details fade
2. **Be quantitative**: Numbers > vague impressions
3. **Extract patterns**: Reusable > one-time observations
4. **Be honest**: Document failures, not just successes
5. **Make actionable**: Specific improvements, not general wishes

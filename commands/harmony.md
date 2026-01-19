---
description: Execute complete 4-phase development workflow
argument-hint: <task description>
model: opus
---

# /harmony - Complete 4-Phase Workflow

Execute a task through the complete 4-phase development workflow:

```
PLANNING → DESIGN → IMPLEMENTATION → OPERATION
```

---

## Usage

```bash
/harmony <task description>
```

## Examples

```bash
/harmony "implement user authentication"
/harmony "add rate limiting to API"
/harmony "refactor database layer"
```

---

## What Happens

### Phase 1: PLANNING (Automatic)
The `planner` agent will:
1. Define the problem clearly
2. Gather all context
3. Validate requirements
4. Research latest information

**Output**: Problem definition document

---

### Phase 2: DESIGN (Automatic)
The `architect` agent will:
1. Design system architecture
2. Document all decisions with rationale
3. Analyze tradeoffs
4. Classify risks (P0/P1/P2/P3)

**Output**: Design document with architecture

---

### Phase 3: IMPLEMENTATION (Automatic)
The `builder` agent will:
1. Implement code in parallel (N-way efficiency)
2. Write tests alongside implementation
3. Run build verification
4. Identify implementation risks

**Output**: Working code + passing tests

---

### Phase 4: OPERATION (Automatic)
The `operator` agent will:
1. Deploy and verify
2. Run end-to-end tests
3. Validate P0/P1 fixes
4. Generate meta-analysis

**Output**: Production-ready system + meta-analysis

---

## Phase Progression

You'll see updates like:

```
[Phase 1/4] PLANNING
→ Defining problem...
→ Gathering context...
✓ Planning complete

[Phase 2/4] DESIGN
→ Designing architecture...
→ Documenting decisions...
✓ Design complete

[Phase 3/4] IMPLEMENTATION
→ Implementing in parallel...
→ Running tests...
✓ Implementation complete

[Phase 4/4] OPERATION
→ Deploying...
→ Verifying...
→ Generating meta-analysis...
✓ Operation complete

✅ HARMONY ACHIEVED - Production Ready
```

---

## CRITICAL: Background Meta Extraction

**MANDATORY**: After EVERY phase completion, you MUST immediately spawn a background meta extraction task:

```typescript
Task({
  subagent_type: "say-your-harmony:phase-meta-extractor",
  run_in_background: true,
  model: "haiku",
  prompt: "Session: {sessionId}\nPhase: {phase}\n\nExtract patterns from phase output..."
})
```

### Correct Workflow

```
Phase 1 (Planning) completes
  ↓
spawn phase-meta-extractor (background) ← DO NOT SKIP
  ↓
Phase 2 (Design) starts
  ↓
Phase 2 completes
  ↓
spawn phase-meta-extractor (background) ← DO NOT SKIP
  ↓
Phase 3 (Implementation) starts
  ↓
Phase 3 completes
  ↓
spawn phase-meta-extractor (background) ← DO NOT SKIP
  ↓
Phase 4 (Operation) starts
  ↓
Phase 4 completes
  ↓
spawn phase-meta-extractor (background) ← DO NOT SKIP
  ↓
Complete
```

### Why This Matters

- **Meta-learning**: Each phase extraction feeds the pattern library
- **Continuous improvement**: Future harmony runs get smarter
- **Non-blocking**: Background execution (doesn't slow you down)
- **Automatic**: No manual intervention needed

### Violation = Protocol Breach

**If you skip phase-meta-extractor after ANY phase, you have violated the harmony protocol.**

This is NOT optional. This is NOT a suggestion. This is a REQUIREMENT.

---

## Success Criteria

The workflow completes successfully when:

- ✅ All 4 phases completed
- ✅ All tests pass
- ✅ Build successful
- ✅ P0/P1 issues resolved
- ✅ Meta-analysis generated
- ✅ Production-ready

---

## Benefits

### vs Ad-Hoc Development

| Approach | Time Upfront | Time Total | Quality | Rework |
|----------|--------------|------------|---------|--------|
| Ad-hoc | Low | High | Low | High |
| /harmony | Medium | Medium | High | Low |

**Real Results**:
- 50% success from correct problem definition (Phase 1)
- N-way efficiency from parallel execution (Phase 3)
- Continuous improvement from meta-analysis (Phase 4)

---

## Options

### Ultrathink Mode
```bash
/harmony --ultrathink "complex architectural change"
```
Enables deep analysis mode for complex problems.

### Parallel Mode (Default)
```bash
/harmony --parallel "implement 4 microservices"
```
Maximizes parallel execution (default in Phase 3).

### With Meta-Analysis (Default)
Meta-analysis is always generated at the end.

---

## When to Use

### ✅ Use /harmony For:
- New features
- Significant refactoring
- Architecture changes
- Complex bug fixes
- Multi-component changes

### ❌ Don't Use For:
- Typo fixes
- One-line changes
- Documentation-only updates
- Simple config changes

---

## Related Commands

- `/plan` - Start from Phase 1 only
- `/design` - Start from Phase 2 (assumes Phase 1 done)
- `/build` - Start from Phase 3 (assumes Phase 1-2 done)
- `/operate` - Start from Phase 4 (assumes Phase 1-3 done)
- `/meta` - Generate meta-analysis manually
- `/ultrathink` - Enable deep analysis mode

---

## Tips

1. **Be specific**: Clear task descriptions → better results
2. **Trust the process**: All 4 phases have value
3. **Don't skip phases**: Tempting but costs more later
4. **Review meta-analysis**: Learnings for next time
5. **Expect ~35 turns**: Quality takes time (but faster than rework)

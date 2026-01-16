# 4-Phase Workflow Skill

## What It Does

Enforces **structured development** through 4 mandatory phases:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│  PLANNING   │ →  │   DESIGN    │ →  │ IMPLEMENTATION  │ →  │  OPERATION  │
└─────────────┘    └─────────────┘    └─────────────────┘    └─────────────┘
```

**Core Rule**: **No phase skipping allowed.**

---

## The 4 Phases

### Phase 1: PLANNING

**Goal**: Define problem correctly (50% of success)

**Activities**:
- Problem definition
- Requirements gathering
- Information research
- Context collection

**Agent**: `planner` (opus)

**Completion Criteria**:
- [ ] Problem definition documented
- [ ] Requirements clear and validated
- [ ] Information gathered and verified

**Time**: ~5 turns

---

### Phase 2: DESIGN

**Goal**: Design architecture with documented decisions

**Activities**:
- Architecture design
- Decision documentation (Why/What/Alternatives)
- Tradeoff analysis
- Risk identification (P0/P1/P2/P3)

**Agent**: `architect` (opus)

**Completion Criteria**:
- [ ] Architecture documented
- [ ] All decisions have rationale
- [ ] Tradeoffs analyzed
- [ ] Risks classified

**Time**: ~8 turns

---

### Phase 3: IMPLEMENTATION

**Goal**: Parallel implementation with testing (4x efficiency)

**Activities**:
- Parallel coding
- Testing alongside implementation
- Risk analysis
- Build verification

**Agent**: `builder` (sonnet)

**Completion Criteria**:
- [ ] Code implemented following design
- [ ] Tests written and passing
- [ ] Build successful
- [ ] Risks identified and documented

**Time**: ~10 turns

---

### Phase 4: OPERATION

**Goal**: Deploy, verify, and improve

**Activities**:
- Deployment verification
- End-to-end testing
- Meta-analysis generation
- Production-ready validation

**Agent**: `operator` (sonnet)

**Completion Criteria**:
- [ ] Deployment successful
- [ ] All tests pass (unit + integration + E2E)
- [ ] P0/P1 issues resolved
- [ ] Meta-analysis generated

**Time**: ~12 turns

---

## When to Use

**ALWAYS** - This is the **default workflow** for all development tasks.

Exceptions (can skip phases):
- Trivial changes (1-line fixes)
- Documentation-only updates
- Simple config changes

For everything else: **All 4 phases required**

---

## How It Changes Behavior

When phase skill is active:

1. **No skipping phases**
   - All 4 phases required sequentially
   - No jumping from Planning → Implementation

2. **Phase completion verified**
   - Check completion criteria before advancing
   - User approval at phase boundaries

3. **Appropriate agent for each phase**
   - Planner for Phase 1
   - Architect for Phase 2
   - Builder for Phase 3
   - Operator for Phase 4

4. **Meta-analysis generated at end**
   - Mandatory after Phase 4
   - Captures learnings for improvement

---

## Activation

### Primary Command
```bash
/harmony <task>
```

This activates the full 4-phase workflow with orchestrator.

### Phase-Specific Commands
```bash
/plan <task>      # Start from Phase 1
/design           # Start from Phase 2 (assumes Phase 1 done)
/build            # Start from Phase 3 (assumes Phase 1-2 done)
/operate          # Start from Phase 4 (assumes Phase 1-3 done)
```

---

## Phase Enforcement Rules

### ❌ WRONG: Skip phases

```
Planning → Implementation (skip Design)
= Missing architecture decisions
= No documented rationale
= Higher risk of rework
= Security issues missed
```

### ✅ RIGHT: All phases

```
Planning → Design → Implementation → Operation
= Clear architecture
= Documented decisions
= Lower risk
= Production-ready result
```

---

## Phase Transition Process

### Transition from Phase 1 → Phase 2

**Check**:
- [ ] Problem defined clearly
- [ ] Requirements validated with user
- [ ] Context fully gathered

**Action**: Invoke `architect` agent with planning results

---

### Transition from Phase 2 → Phase 3

**Check**:
- [ ] Architecture designed
- [ ] All decisions documented with rationale
- [ ] Tradeoffs analyzed
- [ ] Risks classified (P0/P1/P2/P3)

**Action**: Invoke `builder` agent with design document

---

### Transition from Phase 3 → Phase 4

**Check**:
- [ ] Code complete and follows design
- [ ] Tests written and passing
- [ ] Build successful
- [ ] No unresolved P0 issues

**Action**: Invoke `operator` agent with implementation results

---

### Completion of Phase 4

**Check**:
- [ ] Deployed successfully
- [ ] End-to-end tests pass
- [ ] P0/P1 issues resolved
- [ ] Meta-analysis generated

**Action**: Task complete, production-ready

---

## Real-World Example

**Without 4-Phase Workflow**:
```
User request →
Quick implementation (10 turns) →
Discover design issues →
Rework (15 turns) →
Discover security issues →
Rework (10 turns) →
Total: 35 turns + stress
```

**With 4-Phase Workflow**:
```
Phase 1: Planning (5 turns)
→ Clear problem definition

Phase 2: Design (8 turns)
→ Architecture solid, risks identified

Phase 3: Implementation (10 turns)
→ Follow design, no surprises

Phase 4: Operation (7 turns)
→ Verify, no major issues

Total: 30 turns, production-ready
```

---

## Verification Checklist

Use this at each phase boundary:

```markdown
### Phase 1 (Planning) Complete?
- [ ] Problem clearly defined
- [ ] Requirements validated
- [ ] Context gathered
- [ ] User confirms understanding

### Phase 2 (Design) Complete?
- [ ] Architecture documented
- [ ] Decisions have "Why/What/Alternatives"
- [ ] Tradeoffs analyzed explicitly
- [ ] Risks classified (P0/P1/P2/P3)

### Phase 3 (Implementation) Complete?
- [ ] Code implemented per design
- [ ] Tests pass (unit + integration)
- [ ] Build successful
- [ ] Risks mitigated

### Phase 4 (Operation) Complete?
- [ ] Deployment verified
- [ ] E2E tests pass
- [ ] P0/P1 resolved
- [ ] Meta-analysis generated
```

---

## Success Metrics

When 4-phase workflow succeeds:
- ✅ **All 4 phases completed**
- ✅ **No phase skipping**
- ✅ **Each phase meets completion criteria**
- ✅ **Production-ready result** (not just "works")
- ✅ **Meta-analysis generated** (continuous improvement)

---

## Common Pitfalls

### ❌ Pitfall 1: "Planning is waste of time"
```
Wrong: Skip to implementation for speed
Reality: Rework costs more than planning

From philosophy: "Correct problem definition is 50% of success"
```

### ❌ Pitfall 2: "Design is just documentation"
```
Wrong: Skip design, figure it out while coding
Reality: Undocumented decisions = technical debt

From philosophy: "Every decision must have rationale"
```

### ❌ Pitfall 3: "Tests can wait"
```
Wrong: Implement everything, add tests later
Reality: Tests after = bugs shipped

From philosophy: "Tests alongside implementation"
```

### ❌ Pitfall 4: "Works = Done"
```
Wrong: Tests pass → Ship it
Reality: Production-ready ≠ Works

From philosophy: "Never stop at 'works'"
```

---

## Integration with Other Skills

### + Ultrathink
```
4-Phase + Ultrathink
= Deep analysis at each phase
= Better decisions, fewer surprises
```

### + Parallel
```
4-Phase + Parallel
= Phase 3 (Implementation) at 4x speed
= Efficiency without sacrificing quality
```

### + Meta
```
4-Phase + Meta
= Continuous improvement
= Each workflow improves the next
```

---

## Tips

1. **Trust the process**: All 4 phases have value
2. **Don't rush**: Time in Phase 1-2 saves time in Phase 3-4
3. **Document decisions**: Future-you will thank present-you
4. **Verify transitions**: Check completion criteria
5. **Generate meta-analysis**: Learn from every session

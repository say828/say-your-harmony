---
description: Deep structured analysis mode for complex problems
argument-hint: <task description>
model: opus
---

# /ultrathink - Deep Analysis Mode

Activate deep, structured analysis mode for complex problems.

---

## Usage

```bash
/ultrathink <task description>
```

## Examples

```bash
/ultrathink "design scalable authentication system"
/ultrathink "investigate mysterious performance degradation"
/ultrathink "architect microservices migration strategy"
```

---

## What It Does

Activates **ultrathink mode** where:

1. **Maximum context gathering** before decisions
2. **Structured 6-phase workflow** thinking
3. **Meta-cognitive reflection** on process
4. **Decision documentation** with full rationale
5. **Multiple alternatives** considered explicitly

---

## Philosophy

> **"최대한 깊게 생각해야 됨 (Think as deeply as possible)"**

From development philosophy:
- **Deep structured analysis** > Quick assumptions
- **Problem understanding** > Rushing to solutions
- **Meta-cognitive reflection** > Autopilot execution

---

## How It Changes Behavior

### Normal Mode
```
Read 1 doc → Make decision → Implement
Time: Fast
Quality: Variable
Rework: Common
```

### Ultrathink Mode
```
Read ALL docs → Consider 3+ alternatives → Document rationale →
Analyze tradeoffs → Identify risks → Get validation → Implement
Time: Slower upfront
Quality: High
Rework: Rare
```

**Result**: More time upfront, less time overall (no rework)

---

## When to Use

### ✅ Use /ultrathink For:
- Complex architectural decisions
- Ambiguous requirements
- Strategic planning
- Multiple valid approaches exist
- High stakes (security, performance)
- Unfamiliar territory

### ❌ Don't Use For:
- Simple well-understood tasks
- Clear requirements
- One obvious solution
- Low stakes changes
- Time-critical hot fixes

---

## Real-World Example

**Without Ultrathink**:
```
User: "Add authentication"
Agent: Assume JWT → Implement quickly
→ Discover requirements need OAuth
→ Rework (20 turns wasted)
```

**With Ultrathink**:
```
User: "Add authentication"
Agent (ultrathink):
1. Read ALL docs (5 turns)
2. Ask clarifying questions:
   - OAuth or JWT?
   - Session-based or token-based?
   - SSO integration needed?
3. Consider 3 alternatives:
   - JWT (simple)
   - OAuth2 (flexible)
   - SAML (enterprise)
4. Document rationale for each
5. Analyze tradeoffs
6. Get user validation
7. Implement with confidence

Total: 30 turns, no rework
```

---

## Ultrathink Process

### Phase 1: Deep Context Gathering (5-10 turns)
```
- Read ALL relevant documents
- Search for existing implementations
- Research latest best practices
- Clarify ambiguities with user
- Gather maximum context
```

**Rule**: Never assume, always verify

---

### Phase 2: Multiple Alternatives (5-8 turns)
```
For each major decision:
- List 3+ alternatives
- Document pros/cons for each
- Analyze tradeoffs
- Explain rejection rationale
```

**Rule**: Consider alternatives explicitly, don't default to first idea

---

### Phase 3: Decision Documentation (3-5 turns)
```
For every decision:
- Why this approach?
- What alternatives considered?
- What tradeoffs made?
- What risks identified?
```

**Rule**: Every decision must have rationale

---

### Phase 4: Risk Analysis (3-5 turns)
```
Identify and classify risks:
- P0 (CRITICAL): Block deployment
- P1 (HIGH): Fix before production
- P2 (MEDIUM): Quality improvement
- P3 (LOW): Nice-to-have
```

**Rule**: Proactive risk identification > reactive firefighting

---

### Phase 5: Validation (2-3 turns)
```
Before implementing:
- Validate with user
- Confirm understanding
- Get approval on approach
```

**Rule**: Alignment before execution

---

### Phase 6: Meta-Cognitive Reflection (1-2 turns)
```
Reflect on approach:
- Is this the best method?
- What patterns am I using?
- What could go wrong?
- How will I verify success?
```

**Rule**: Think about thinking

---

## Integration with 4-Phase Workflow

Ultrathink **enhances each phase**:

### Phase 1 (Planning) + Ultrathink
```
Normal: Read main doc → Plan
Ultrathink: Read ALL docs → Research latest → Clarify → Plan
```

### Phase 2 (Design) + Ultrathink
```
Normal: Design architecture → Document
Ultrathink: Consider 3+ architectures → Analyze deeply → Document rationale
```

### Phase 3 (Implementation) + Ultrathink
```
Normal: Implement quickly
Ultrathink: Verify design understanding → Identify edge cases → Implement robustly
```

### Phase 4 (Operation) + Ultrathink
```
Normal: Basic verification
Ultrathink: Comprehensive verification → Deep risk validation → Thorough meta-analysis
```

---

## Success Metrics

When ultrathink succeeds:
- ✅ **Correct problem identified** (0 pivots)
- ✅ **All alternatives considered** (3+ options)
- ✅ **Decisions documented** (full rationale)
- ✅ **Risks identified early** (P0/P1 before implementation)
- ✅ **No surprises** (thorough planning prevents issues)
- ✅ **Better outcomes** (quality > speed)

---

## Comparison

| Metric | Normal Mode | Ultrathink Mode |
|--------|-------------|----------------|
| Context gathering | 1-2 docs | ALL docs |
| Alternatives considered | 1 (default) | 3+ explicitly |
| Decision documentation | Minimal | Comprehensive |
| Risk analysis | Reactive | Proactive |
| Pivots/rework | Common | Rare |
| Time upfront | Low | High |
| Time total | High (rework) | Medium (no rework) |
| Quality | Variable | High |

---

## Combining with Other Commands

### /ultrathink + /harmony
```bash
/ultrathink "complex feature requiring all 4 phases"
```
Deep analysis through entire workflow.

### /ultrathink + /plan
```bash
/ultrathink /plan "ambiguous requirements"
```
Extra-deep planning phase.

### /ultrathink + /design
```bash
/ultrathink /design
```
Thorough architecture exploration.

---

## Tips

1. **Don't rush**: Ultrathink takes MORE time upfront
2. **Be thorough**: Read EVERYTHING relevant
3. **Ask questions**: Use AskUserQuestion liberally
4. **Consider alternatives**: 3+ options minimum
5. **Document rationale**: Future-you needs context
6. **Reflect meta-cognitively**: Think about your thinking
7. **Validate early**: Get user buy-in before implementing
8. **Trust the process**: Slower start → Faster finish (no rework)

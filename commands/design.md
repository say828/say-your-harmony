---
description: Phase 2 - Design (architecture & decision documentation)
model: opus
---

# /design - Phase 2: Design

Execute Phase 2 (Design) - architecture design and decision documentation.

**Prerequisite**: Phase 1 (Planning) must be complete.

---

## Usage

```bash
/design
```

Assumes Phase 1 planning results are available.

---

## What Happens

The `architect` agent will:

### Step 1: Architecture Design
- Design system components
- Define component interactions
- Plan data flow
- Create diagrams (ASCII or descriptions)

### Step 2: Technology Selection
- Choose technologies with rationale
- Document why each technology
- List alternatives considered
- Explain rejection reasons

### Step 3: Tradeoff Analysis
- Analyze key tradeoffs:
  - Security vs UX
  - Performance vs Maintainability
  - Cost vs Scalability
  - Flexibility vs Simplicity
- Document decisions explicitly

### Step 4: Risk Classification
- Identify risks (P0/P1/P2/P3)
- **P0 (CRITICAL)**: Block deployment
- **P1 (HIGH)**: Fix before production
- **P2 (MEDIUM)**: Quality improvement
- **P3 (LOW)**: Nice-to-have

### Step 5: Design Document
- Comprehensive documentation
- All decisions with rationale
- Future maintainers can understand why

---

## Output

**Design Document**:
```markdown
# [Feature] Design Document

## 1. Problem Statement
[From Phase 1]

## 2. Architecture
### Components
- Component A: [Responsibility]
- Component B: [Responsibility]

### Interactions
[How components communicate]

## 3. Technology Decisions
### Technology: [Name]
**Options**:
- ✅ Option A (SELECTED)
  - Pros: ...
  - Cons: ...
  - Rationale: ...
- ❌ Option B (REJECTED)
  - Why rejected: ...

## 4. Tradeoff Analysis
### Security vs UX
- Decision: [Choice]
- Rationale: [Why]

## 5. Risk Assessment
### P0 (CRITICAL)
- Risk 1: [Description]
- Mitigation: [How to prevent]

### P1 (HIGH)
- Risk 2: [Description]

## 6. Implementation Plan
[High-level approach]

## 7. Verification Strategy
[How to test end-to-end]
```

---

## Success Criteria

Phase 2 complete when:
- [ ] Architecture designed and documented
- [ ] All technology decisions have rationale
- [ ] Tradeoffs explicitly analyzed
- [ ] Risks classified (P0/P1/P2/P3)
- [ ] Design reviewed and approved

---

## Philosophy

> **"Every decision must have documented rationale"**

From development philosophy:
- Undocumented decisions = Technical debt
- Hidden tradeoffs = Surprises in production
- Unclassified risks = Late discoveries

**Document now → Understand later**

---

## Real-World Example

**Without Design**:
```
Planning → Jump to coding
→ Realize architecture issue mid-implementation
→ Rework (15 turns)
→ Discover security risk
→ Rework again (10 turns)
```

**With Design**:
```
Planning → /design
→ Architecture reviewed upfront
→ P0 security risk identified early
→ Mitigation planned before coding
→ Implementation smooth (no surprises)
```

Result: 25 turns saved, better outcome

---

## Decision Documentation Template

For every significant decision:

```markdown
### Decision: [Title]

**Question**: What are we deciding?

**Options**:
- ✅ **Option A** - SELECTED
  - Pros: [Advantages]
  - Cons: [Disadvantages]
  - Rationale: [Why we chose this]

- ❌ **Option B** - REJECTED
  - Pros: [Advantages]
  - Cons: [Disadvantages]
  - Rejected: [Why we didn't choose this]

**Tradeoffs**: [What we're trading off]

**Result**: [Final decision + future review point]
```

---

## Next Steps

After `/design` completes:

### Continue with /build
```bash
/build
```
Proceeds to Phase 3 with design document.

### Or complete workflow
Continue with Phase 3 → Phase 4 for full completion.

---

## When to Use

### ✅ Use /design For:
- Complex architectures
- Technology choices
- Tradeoff analysis
- Risk identification

### ❌ Don't Use For:
- Trivial changes
- Design already exists and unchanged
- Simple one-component tasks

---

## Tips

1. **Consider alternatives**: List 2-3 options minimum
2. **Document rejection**: Why NOT chosen is important
3. **Be explicit**: Tradeoffs should be obvious to anyone
4. **Classify risks**: P0 must be addressed before deployment
5. **Get review**: Design mistakes cost more than planning

---
description: Phase 1 - Planning (problem definition & requirements)
argument-hint: <task description>
model: opus
---

# /plan - Phase 1: Planning

Execute Phase 1 (Planning) only - problem definition and requirements gathering.

---

## Usage

```bash
/plan <task description>
```

## Examples

```bash
/plan "implement user authentication"
/plan "investigate performance bottleneck"
/plan "design new microservice architecture"
```

---

## What Happens

The `planner` agent will:

### Step 1: Document Discovery
- Read ALL relevant documents
- Search codebase for existing implementations
- Gather complete context

### Step 2: Requirements Clarification
- Ask clarifying questions (AskUserQuestion)
- Validate understanding with user
- Identify constraints and scope

### Step 3: Information Gathering
- WebSearch for latest versions
- Research best practices
- Verify compatibility

### Step 4: Problem Definition
- Document clear problem statement
- List validated requirements
- Define what's in/out of scope

### Step 5: Structured Plan
- Create phase-by-phase plan
- Identify dependencies
- Estimate complexity

---

## Output

**Problem Definition Document**:
```markdown
## Problem Definition
[Clear statement of the problem]

## Requirements
- Requirement 1
- Requirement 2
- ...

## Constraints
- Technical constraints
- Resource constraints
- Time constraints

## Out of Scope
- Explicitly excluded items

## Structured Plan
Phase 1: ✓ Complete
Phase 2: [Next steps for design]
Phase 3: [Next steps for implementation]
Phase 4: [Next steps for operation]
```

---

## Success Criteria

Phase 1 complete when:
- [ ] Problem clearly defined
- [ ] Requirements validated with user
- [ ] All relevant context gathered
- [ ] Information researched (latest versions)
- [ ] Structured plan created

---

## Philosophy

> **"Correct problem definition is 50% of success"**

From development philosophy:
- Wrong problem = Wasted effort
- Incomplete context = Surprises later
- Outdated info = Bad decisions

**Invest time upfront → Save time overall**

---

## Real-World Example

**Without Planning**:
```
Read 1 doc → Assume requirements → Start coding
→ Discover wrong problem (5 turns wasted)
→ Rework everything
```

**With Planning**:
```
/plan "security vulnerability fix"
→ Read 5 documents (find correct one)
→ Clarify with user
→ Research latest security patches
→ Create comprehensive plan
→ Proceed with confidence
```

Result: 0 pivots, clear direction

---

## Next Steps

After `/plan` completes:

### Continue with /design
```bash
/design
```
Proceeds to Phase 2 with planning results.

### Or use full workflow
```bash
/harmony
```
Executes all 4 phases automatically.

---

## Options

### Ultrathink Mode
```bash
/plan --ultrathink "complex ambiguous problem"
```
Even deeper analysis, more alternatives considered.

---

## When to Use

### ✅ Use /plan For:
- Unclear requirements
- Complex problems
- Need to gather context
- Before committing to approach

### ❌ Don't Use For:
- Requirements already crystal clear
- Simple well-understood tasks
- Just want to start coding

---

## Tips

1. **Read everything**: Don't assume, verify
2. **Ask questions**: Use AskUserQuestion liberally
3. **Research**: WebSearch for latest info
4. **Document clearly**: Future-you needs context
5. **Get validation**: Confirm with user before advancing

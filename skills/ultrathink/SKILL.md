# Ultrathink Skill

## What It Does

Activates **deep, structured analysis mode** where:
- Maximum context gathering before decisions
- Structured 6-phase workflow thinking
- Meta-cognitive reflection on process
- Decision documentation with rationale

Based on the development philosophy: **"최대한 깊게 생각해야 됨 (ultrathink)"**

---

## When to Use

- Complex problems requiring deep analysis
- Strategic planning sessions
- Architecture design decisions
- Any task where "think deeply" is needed
- When facing ambiguous requirements

---

## How It Changes Behavior

When ultrathink is active:

1. **Spend MORE time on problem definition** (Phase 1)
   - Read ALL relevant documents
   - Gather maximum context before conclusions
   - Never assume - always verify

2. **Document ALL decision rationale**
   - Why this approach?
   - What alternatives were considered?
   - What are the tradeoffs?

3. **Consider multiple alternatives explicitly**
   - List 3+ options for major decisions
   - Analyze pros/cons for each
   - Document rejection rationale

4. **Analyze tradeoffs systematically**
   - Security vs UX
   - Performance vs Maintainability
   - Cost vs Scalability

5. **Reflect meta-cognitively on approach**
   - How am I approaching this problem?
   - Is this the best method?
   - What patterns am I using?

---

## Activation

### Command Line
```bash
/ultrathink <task>
```

### In Conversation
```
> "ultrathink mode: design the authentication system"
> "use ultrathink to solve this complex problem"
> "깊게 생각해서 최선의 방법 찾아 (ultrathink)"
```

---

## Example Session

### Without Ultrathink (Rushed)
```
1. Read 1 document → Make assumption
2. Quick decision → Start coding
3. Discover missed requirements
4. Rework needed
Total: 20 turns (with rework)
```

### With Ultrathink (Systematic)
```
Phase 1: Planning (5 turns)
- Read ALL 5 relevant documents
- Gather complete context
- Clarify ambiguities with user
- Research latest versions

Phase 2: Design (8 turns)
- Consider 3 architectural options
- Document decision rationale
- Analyze tradeoffs explicitly
- Classify risks (P0/P1/P2/P3)

Phase 3: Implementation (10 turns)
- Implement with clear design
- No surprises (requirements clear)

Phase 4: Operation (5 turns)
- Verify, no major issues found

Total: 28 turns (no rework)
Result: Better outcome, fewer surprises
```

---

## Real-World Example

From development philosophy (Phase 1 Security Implementation):

**Without ultrathink thinking**:
```
Wrong: Read exchange-endpoint document first
→ 5 turns wasted on wrong problem
```

**With ultrathink**:
```
Right: User specified main document
→ Read correct document carefully
→ Gather ALL context (16 Read calls)
→ Make informed decisions
→ 100% subagent success rate
→ 4.25x efficiency via planning
```

---

## Success Metrics

When ultrathink succeeds:
- ✅ **Correct problem identified** (0 pivots needed)
- ✅ **Complete context gathered** (no surprises later)
- ✅ **All decisions documented** (rationale clear)
- ✅ **Alternatives considered** (tradeoffs explicit)
- ✅ **Better outcomes** (fewer issues found)

---

## Integration with 4-Phase Workflow

Ultrathink enhances each phase:

**Phase 1 (Planning)**: More thorough context gathering
**Phase 2 (Design)**: Deeper architectural analysis
**Phase 3 (Implementation)**: Better understanding reduces rework
**Phase 4 (Operation)**: Comprehensive verification

---

## Tips

1. **Don't rush**: Ultrathink takes MORE time upfront for BETTER results
2. **Document everything**: Decisions, rationale, alternatives
3. **Ask questions**: Use AskUserQuestion liberally
4. **Research thoroughly**: WebSearch for latest info
5. **Think meta-cognitively**: Reflect on your approach

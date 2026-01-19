---
name: harmony
description: Execute complete 4-phase development workflow (Planning → Design → Implementation → Operation) with automatic meta-analysis
context: fork
agent: say-your-harmony:harmony
---

# /harmony - Complete 4-Phase Workflow

Execute a task through the complete 4-phase development workflow with automatic background meta-analysis after each phase.

## Usage

```bash
/harmony <task description>
```

## What Happens

When you invoke `/harmony`, the following occurs:

### Automatic 4-Phase Execution

```
Task({
  subagent_type: "say-your-harmony:harmony",
  prompt: "<user's task description>",
  model: "opus"
})
```

The harmony agent will:
1. **Phase 1: PLANNING** - Define problem, gather requirements
2. **Phase 2: DESIGN** - Design architecture, document decisions
3. **Phase 3: IMPLEMENTATION** - Build with parallel execution
4. **Phase 4: OPERATION** - Deploy, verify, generate meta-analysis

### Automatic Background Meta Extraction

**CRITICAL**: After EACH phase completes, harmony agent automatically spawns:

```typescript
Task({
  subagent_type: "phase-meta-extractor",
  run_in_background: true,
  model: "haiku",
  prompt: `
    Session: {sessionId}
    Phase: {phase}

    Extract semantic patterns and save to:
    ~/.claude/meta/sessions/{sessionId}.json
  `
})
```

This happens **automatically in the background** without blocking the workflow.

## Benefits

- ✅ **No phase skipping**: Enforces all 4 phases
- ✅ **Auto meta-learning**: Background pattern extraction
- ✅ **Parallel execution**: N-way concurrency in Phase 3
- ✅ **Production-ready**: Guarantees deployment verification

## Examples

```bash
# Implement new feature
/harmony "implement user authentication with JWT"

# Complex refactoring
/harmony "refactor database layer to use connection pooling"

# Full stack feature
/harmony "add real-time notifications using WebSockets"
```

## Expected Timeline

- Phase 1 (Planning): ~5-10 turns
- Phase 2 (Design): ~8-12 turns
- Phase 3 (Implementation): ~15-20 turns
- Phase 4 (Operation): ~8-12 turns

**Total**: ~35-50 turns for production-ready delivery

## Success Criteria

The workflow completes when:

- [x] All 4 phases completed
- [x] All tests pass
- [x] Build successful
- [x] P0/P1 issues resolved
- [x] Meta-analysis generated
- [x] Production-ready

## Meta-Analysis Output

After completion, check:

```bash
# View session metas
ls ~/.claude/meta/sessions/

# View accumulated patterns
cat ~/.claude/meta/patterns.json | jq '.totalPatterns'

# View pattern library
cat ~/.claude/meta/PATTERNS.md
```

## Related Commands

- `/plan` - Start Phase 1 only
- `/design` - Start Phase 2 only (assumes Phase 1 done)
- `/build` - Start Phase 3 only (assumes Phase 1-2 done)
- `/operate` - Start Phase 4 only (assumes Phase 1-3 done)
- `/meta` - Generate meta-analysis manually
- `/metaview` - View pattern statistics

---

**Note**: This skill invokes the `say-your-harmony:harmony` agent with full 4-phase orchestration and automatic background meta-learning.

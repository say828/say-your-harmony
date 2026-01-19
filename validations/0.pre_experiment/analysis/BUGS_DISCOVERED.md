# Meta Mechanism Bugs Discovered

**Date**: 2026-01-19
**Test Phase**: Phase 1 - 소규모 프로젝트 (Todo CLI)
**Harmony Version**: 1.4.0

---

## Bug #1: Auto-Invocation Mechanism Missing

### Description
`phase-meta-extractor` is not automatically invoked after each phase completion.

### Expected Behavior
Per `harmony.ts:227-271`:
```typescript
// After EACH phase, immediately spawn:
Task({
  subagent_type: "phase-meta-extractor",
  run_in_background: true,
  model: "haiku"
})
```

### Actual Behavior
- `/harmony` skill only displays help documentation
- Manual phase delegation (planner → architect → builder → operator)
- `phase-meta-extractor` never called
- `~/.claude/meta/` remains empty

### Impact
- **Severity**: P0 (Critical)
- No automatic meta learning occurs
- Pattern accumulation doesn't happen
- Meta reuse impossible

### Root Cause
`/harmony` skill is a documentation-only command, not an orchestrator invocation.

---

## Bug #2: Schema Mismatch in approaches Field

### Description
`phase-meta-extractor` generates `approaches` in wrong format.

### Schema Definition (`semantic-meta.ts:143`)
```typescript
/** Approach patterns used (max 3 keywords) */
approaches: string[];
```

### Actual Output
```json
{
  "approaches": [
    {
      "what": "Defensive file I/O pattern",
      "rationale": "Try-catch + existence checks..."
    }
  ]
}
```

### Impact
- **Severity**: P1 (High)
- Pattern extraction fails at runtime
- `TypeError: Cannot hash object`

### Root Cause
`phase-meta-extractor.ts` prompt asks for detailed approach objects, not simple strings.

---

## Bug #3: Missing Type Validation in Extractor

### Description
`extractor.ts` passes data to hash function without type checking.

### Error Location
```
extractor.ts:90 (createPattern)
  → generator.ts:56 (Hash.update)
```

### Error Message
```
TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument must be
of type string or an instance of Buffer, TypedArray, or DataView.
Received an instance of Object
```

### Impact
- **Severity**: P1 (High)
- Pattern extraction crashes
- No graceful error handling
- User sees raw stack trace

### Root Cause
No runtime type validation before `generatePatternId()` call.

---

## Summary Table

| Bug | Severity | Component | Status |
|-----|----------|-----------|--------|
| #1 Auto-invocation missing | P0 | harmony.ts / skill | Open |
| #2 Schema mismatch | P1 | phase-meta-extractor.ts | Open |
| #3 Type validation missing | P1 | extractor.ts | Open |

---

## Recommended Fixes

### Bug #1 Fix
Option A: Make `/harmony` skill invoke actual harmony agent
Option B: Add auto-invocation hook after each phase in main orchestrator

### Bug #2 Fix
Update `phase-meta-extractor.ts` prompt to output `approaches` as `string[]`:
```
"approaches": ["keyword1", "keyword2", "keyword3"]
```

### Bug #3 Fix
Add type guard in `extractor.ts`:
```typescript
for (const approach of meta.semantics.approaches) {
  const content = typeof approach === 'string'
    ? approach
    : approach.what || JSON.stringify(approach);
  // ...
}
```

---

## Test Evidence

### Session Meta Created
```
~/.claude/meta/sessions/2026-01-19-phase1-todo-cli.json (4.6KB)
```

### Pattern Extraction Failed
```bash
$ node -e "api.saveMetaPatternsFromSemanticMeta(...)"
✗ Error: Cannot read properties of undefined (reading 'sequentialDeps')
```

### Meta Store State
```
~/.claude/meta/
├── sessions/
│   └── 2026-01-19-phase1-todo-cli.json  ✓
└── patterns.json  ✗ (not created)
```

---
description: Phase 3 - Implementation (parallel coding with testing)
model: sonnet
---

# /build - Phase 3: Implementation

Execute Phase 3 (Implementation) - parallel coding with testing.

**Prerequisite**: Phase 1-2 (Planning + Design) must be complete.

---

## Usage

```bash
/build
```

Assumes planning and design documents are available.

---

## What Happens

The `builder` agent will:

### Step 1: Implementation Plan Breakdown
- Identify independent tasks
- Map dependencies
- Plan for parallelization

### Step 2: Parallel Implementation
- Launch multiple builders concurrently
- Target: **Unlimited parallel scaling** (meta-learning optimizes over time)
- Independent files built simultaneously

Example:
```typescript
Parallel:
- Implement ComponentA.ts
- Implement ComponentB.ts
- Implement ServiceC.ts
- Implement UtilD.ts

Sequential: 40 minutes
Parallel: 10 minutes (4 tasks) → 2 minutes (40 tasks with meta-learning)
Speedup: Scales linearly with independent tasks
```

### Step 3: Testing Alongside Implementation
- Unit tests written WITH code (not after)
- Integration tests for component interactions
- Build verification at each step

### Step 4: Risk Analysis
- Identify implementation-level risks
- Classify as P0/P1/P2/P3
- Document mitigation strategies

### Step 5: Build Verification
- Run full build
- Execute all tests
- Verify no errors

---

## Output

**Working Code + Passing Tests**:
```
src/
├── component-a.ts ✓
├── component-b.ts ✓
├── service-c.ts ✓
└── util-d.ts ✓

tests/
├── component-a.test.ts ✓ (100% pass)
├── component-b.test.ts ✓ (100% pass)
├── service-c.test.ts ✓ (100% pass)
└── util-d.test.ts ✓ (100% pass)

Build: ✓ SUCCESS
Tests: ✓ 100% pass
```

---

## Success Criteria

Phase 3 complete when:
- [ ] All code implemented per design
- [ ] Tests written and passing
- [ ] Build successful (no errors)
- [ ] Implementation risks documented
- [ ] Code follows existing patterns

---

## Philosophy

> **"Parallel execution is the key to N-way efficiency"**

From development philosophy:
- Sequential = Slow
- Parallel = Fast (if tasks independent)
- Tests after = Bugs shipped
- Tests during = Bugs caught early

**Real results: N-way efficiency via parallel execution**

---

## Parallel Execution Rules

### ✅ Parallelize When:
- Tasks are **independent** (no dependencies)
- Each task **>30 seconds**
- **2+ tasks** exist

### ❌ Don't Parallelize:
- Sequential dependencies
- Shared mutable state
- Quick tasks (<10 seconds)

---

## Real-World Example

**Without Parallel**:
```
Implement A (10 min)
→ Test A (5 min)
→ Implement B (10 min)
→ Test B (5 min)
→ Implement C (10 min)
→ Test C (5 min)
→ Implement D (10 min)
→ Test D (5 min)

Total: 60 minutes
```

**With Parallel**:
```
Parallel:
- Implement A + Test A
- Implement B + Test B
- Implement C + Test C
- Implement D + Test D

Longest task: 15 minutes
Total: 15 minutes

Speedup: N-way
```

---

## Code Quality Standards

From development philosophy:

### 1. Production-Ready
```typescript
❌ DRAFT:
// TODO: Add error handling
function process(data: string) { ... }

✅ PRODUCTION:
function process(data: string): Result<Output> {
  if (!data) throw new Error("Data required");
  // ... robust implementation
}
```

### 2. Appropriate Complexity
```typescript
❌ OVER-ENGINEERED:
class ConfigManager {
  // 200 lines of abstraction for simple config
}

✅ APPROPRIATE:
const config = { apiKey: process.env.API_KEY };
```

### 3. Follow Existing Patterns
```typescript
// Read similar code first
Read("src/existing-feature.ts");

// Match the pattern
// Don't invent new patterns unnecessarily
```

---

## Next Steps

After `/build` completes:

### Continue with /operate
```bash
/operate
```
Proceeds to Phase 4 for deployment and verification.

---

## Build Commands by Project Type

### TypeScript
```bash
npm run build
npm test
npm run lint
```

### Kotlin
```bash
./gradlew build
./gradlew test
./gradlew ktlintCheck
```

### Rust
```bash
cargo build
cargo test
cargo clippy
```

### Python
```bash
python -m build
pytest
mypy .
```

---

## When to Use

### ✅ Use /build For:
- Multi-file implementations
- Complex features
- Need parallel execution
- Testing required

### ❌ Don't Use For:
- Single-file changes
- Documentation updates
- Trivial changes

---

## Tips

1. **Identify independence**: What can run in parallel?
2. **Test alongside**: Not after implementation
3. **Follow patterns**: Read existing code first
4. **Verify early**: Build + test frequently
5. **Document risks**: Implementation-level P0/P1 issues

# Parallel Execution Skill

## What It Does

Maximizes **parallel execution** of independent tasks to achieve **unlimited scalability**.

From development philosophy real-world results:
- **Documents (N parallel)**: Linear scaling with task count
- **Code (N parallel)**: Proven up to 40x in production (say-your-harmony-youtube)
- **Analysis (N parallel)**: Concurrent execution of all independent tasks
- **Meta-learning**: sequentialDeps + parallelSuccesses enable safe scaling

---

## When to Use

- Implementation phase with multiple independent files
- Documentation writing (multiple docs)
- Analysis tasks (risk analysis + UX analysis)
- Any time **2+ independent tasks** exist

---

## How It Changes Behavior

When parallel is active:

1. **Identify ALL independent tasks upfront**
   - Break work into atomic, non-dependent tasks
   - Map dependencies clearly

2. **Launch subagents concurrently**
   - Single message with multiple Task calls
   - Use `run_in_background: true` for long tasks

3. **Wait for all to complete**
   - Monitor progress
   - No blocking waits

4. **Integrate results**
   - Combine outputs
   - Verify no conflicts

---

## Activation

### Command Line
```bash
/parallel <task>
```

### In Workflow
```
> "Implement these 4 features in parallel"
> "병렬 실행으로 최대 효율"
> "parallel mode: create all documentation"
```

---

## Rules

### ✅ Parallelize When:
- Tasks are **independent** (no dependencies)
- Each task takes **>30 seconds**
- **2 or more** tasks exist
- Tasks don't share mutable state

### ❌ Don't Parallelize When:
- Tasks have **sequential dependencies**
- Tasks share **mutable state**
- **Quick tasks** (<10 seconds each)
- Integration is more complex than parallel gain

---

## Example: Code Implementation

### Without Parallel (Sequential)
```typescript
// Turn 1: Implement RateLimitFilter.kt (10 min)
Write("RateLimitFilter.kt", ...)

// Turn 2: Implement BruteForceFilter.kt (10 min)
Write("BruteForceFilter.kt", ...)

// Turn 3: Implement JwtHandler.kt (10 min)
Edit("JwtHandler.kt", ...)

// Turn 4: Implement AuthRoute.kt (10 min)
Edit("AuthRoute.kt", ...)

Total: 40 minutes
```

### With Parallel
```typescript
// Single turn: Launch N parallel tasks (scale as needed)
Task({ subagent: "builder", prompt: "Implement RateLimitFilter.kt", run_in_background: true })
Task({ subagent: "builder", prompt: "Implement BruteForceFilter.kt", run_in_background: true })
Task({ subagent: "builder", prompt: "Modify JwtHandler.kt", run_in_background: true })
Task({ subagent: "builder", prompt: "Modify AuthRoute.kt", run_in_background: true })

// Wait for longest task (10 min)
// Integrate results (2 min)

Total: 12 minutes = 3.3x speedup
```

---

## Example: Documentation

### Without Parallel (Sequential)
```
Write Phase1 doc (5 min)
→ Write Phase2 doc (5 min)
→ Write Phase3 doc (5 min)
→ Write Phase4 doc (5 min)
→ Write Phase5 doc (5 min)
= 25 minutes
```

### With Parallel
```
Parallel:
- Write Phase1 doc
- Write Phase2 doc
- Write Phase3 doc
- Write Phase4 doc
- Write Phase5 doc

= 5 minutes (longest doc)
= 5x speedup
```

---

## Real-World Success

From Phase 1 Security Implementation:

```markdown
### Parallel Execution Results

| Task Type | Sequential | Parallel | Speedup |
|-----------|-----------|----------|---------|
| Documents (5) | 25 min | 5 min | **5x** |
| Code (4) | 40 min | 10 min | **4x** |
| Analysis (2) | 20 min | 5 min | **4x** |
| **Total** | **85 min** | **20 min** | **4.25x** |

**Subagent Success Rate**: 11/11 = **100%**
```

---

## Implementation Pattern

```typescript
// Step 1: Identify independent tasks
const tasks = [
  { name: "Task A", file: "a.ts", deps: [] },
  { name: "Task B", file: "b.ts", deps: [] },
  { name: "Task C", file: "c.ts", deps: ["A"] },  // Depends on A
  { name: "Task D", file: "d.ts", deps: [] }
];

// Step 2: Group by dependency level
const wave1 = [A, B, D];  // No dependencies
const wave2 = [C];        // Depends on wave1

// Step 3: Execute wave 1 in parallel
await Promise.all([
  Task({ prompt: "Task A" }),
  Task({ prompt: "Task B" }),
  Task({ prompt: "Task D" })
]);

// Step 4: Execute wave 2
await Task({ prompt: "Task C" });
```

---

## Success Metrics

When parallel succeeds:
- ✅ **4x minimum speedup** (compared to sequential)
- ✅ **100% subagent success rate** (no failures)
- ✅ **No integration conflicts** (tasks truly independent)
- ✅ **Reduced total time** (measured and verified)

---

## Common Pitfalls

### ❌ Pitfall 1: Hidden Dependencies
```
Wrong: Parallel(A, B) where B depends on A's output
→ B fails, wasted time
```

### ❌ Pitfall 2: Shared State
```
Wrong: Parallel(editFile, editFile) on same file
→ Conflicts, manual merge needed
```

### ❌ Pitfall 3: Over-Parallelization
```
Wrong: Parallel 20 tiny tasks (<5 sec each)
→ Overhead > benefit
```

---

## Integration with 4-Phase Workflow

Parallel execution is **most valuable in Phase 3 (Implementation)**:

- **Phase 1 (Planning)**: Limited parallelization (mostly sequential info gathering)
- **Phase 2 (Design)**: Some parallel (architecture + risk analysis)
- **Phase 3 (Implementation)**: **Maximum parallel** (independent code files)
- **Phase 4 (Operation)**: Some parallel (deployment + analysis)

---

## Tips

1. **Plan for parallel**: Identify independent tasks upfront
2. **Use background tasks**: Long-running operations
3. **Monitor progress**: Check TaskOutput periodically
4. **Verify integration**: Test combined results
5. **Measure gains**: Track actual speedup achieved

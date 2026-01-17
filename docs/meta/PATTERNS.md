# Master Patterns Library

**Generated**: 2026-01-17T05:57:11.862Z
**Total patterns**: 10
**Top patterns per phase**: 20

---

## Planning Phase

## Design Phase

## Implementation Phase

### 1. Verify Primary Source First [1x]

**Problem**: Reading wrong documents wastes development time

**Solution**: Always confirm which document is the main source before reading

**Learning**: One question saves hours of work

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-18

---

### 2. Parallel Execution for Independent Tasks [1x]

**Problem**: Sequential implementation is slow

**Solution**: Identify independent tasks and execute concurrently

**Learning**: 4+ tasks = must parallelize for efficiency

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-18

---

### 3. Use TODO Lists for Complex Tasks [1x]

**Problem**: Forgetting steps in multi-step workflows

**Solution**: Create TODO list before starting, update as you go

**Learning**: External memory prevents context loss

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-18

---

### 4. Test-Driven Development [1x]

**Problem**: Writing tests after code leads to low coverage

**Solution**: Write tests first, then implement to pass them

**Learning**: TDD finds edge cases early

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-18

---

### 5. Configuration Over Code [1x]

**Problem**: Hardcoded values make tuning difficult

**Solution**: Extract all tuneable parameters to config file

**Learning**: Users can adjust without touching code

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-18

---

### 6. Verify Primary Source First [1x]

**Problem**: Started with wrong document, wasted 5 turns

**Solution**: Always ask user to confirm primary source document before reading

**Learning**: "Which is the main document?" saves more time than reading everything

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-17

---

### 7. Parallel Execution for Independent Tasks [1x]

**Problem**: Sequential file creation took 25 turns

**Solution**: Identified 8 independent files, created in parallel (3 groups)

**Learning**: 8 sequential turns → 3 parallel groups = 2.7x speedup

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-17

---

### 8. Hybrid Scoring Algorithm [1x]

**Problem**: Simple frequency scoring favored old, unused patterns

**Solution**: Combined recency (0.4) + frequency (0.4) + success rate (0.2)

**Learning**: Logarithmic frequency prevents high-count domination

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-17

---

### 9. Semantic Deduplication [1x]

**Problem**: Manual pattern comparison is error-prone

**Solution**: TF-IDF embeddings + cosine similarity (90% threshold)

**Learning**: Hash for exact match (O(1)), similarity for fuzzy match (O(n))

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-17

---

### 10. Protection Rules for Eviction [1x]

**Problem**: Important patterns getting deleted due to low recent activity

**Solution**: Multi-criteria protection (freq ≥ 5, recent < 7 days, cluster rep)

**Learning**: Never rely on single metric for deletion decisions

**Stats**: Freq=1, Success=100%, Score=1.00

**Sessions**: 2026-01-17

---

## Operation Phase


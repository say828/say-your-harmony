---
description: Sisyphus orchestration mode (now default behavior)
---

[SISYPHUS MODE - NOW DEFAULT]

$ARGUMENTS

## This Is Now Default Behavior

The Sisyphus orchestration mode is now the **default operating mode**. You don't need to explicitly activate it.

### What's Built Into Default Mode

- **Smart Delegation**: Delegate complex/specialized work to subagents
- **Parallel Execution**: Run independent tasks concurrently when profitable
- **Todo Tracking**: Create and track todos for multi-step tasks
- **Background Execution**: Long-running operations run async
- **Persistence**: Continue until todo list is empty

### When to Use /ultrawork Instead

Use `/ultrawork` when you want **maximum intensity**:
- Parallel EVERYTHING (override heuristics)
- Delegate even small tasks
- Never wait for results
- Maximum throughput mode

### Smart Model Routing

Choose tier based on task complexity:

| Domain | LOW (Haiku) | MEDIUM (Sonnet) | HIGH (Opus) |
|--------|-------------|-----------------|-------------|
| **Analysis** | `oracle-low` | `oracle-medium` | `oracle` |
| **Execution** | `sisyphus-junior-low` | `sisyphus-junior` | `sisyphus-junior-high` |
| **Search** | `explore` | `explore-medium` | - |
| **Research** | `librarian-low` | `librarian` | - |
| **Frontend** | `frontend-engineer-low` | `frontend-engineer` | `frontend-engineer-high` |

### Quick Reference

| Task Pattern | Model |
|--------------|-------|
| "Where is X" / "Find X" | haiku |
| "How does X work" / "Add Y" | sonnet |
| "Debug X" / "Refactor X" | opus |

**The boulder does not stop until it reaches the summit.**

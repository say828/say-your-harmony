# Complex Task: E-commerce Microservices with Event Sourcing

This directory contains the complete specification for the complex-level meta-learning experiment task.

## Files

### TASK.md
Complete task specification including:
- Requirements (architecture, technical, service specs)
- Deliverables (file structure, configuration)
- Success criteria (functional, quality, performance, architecture)
- Validation commands
- Expected baseline vs with-meta metrics
- Complexity drivers and meta-analysis opportunities

### expected-structure.txt
Detailed file structure showing:
- All expected files and directories
- Key interfaces to implement
- Expected events and API endpoints
- Expected test scenarios
- Minimum viable deliverables

### validation-checklist.md
10-phase validation process:
1. Structure validation
2. TypeScript validation
3. Core implementation validation
4. Service implementation validation
5. Integration testing validation
6. Test coverage validation
7. Code quality validation
8. Functional validation
9. Architecture validation
10. Performance validation

## Quick Reference

**Complexity**: Complex (4 microservices + event sourcing + saga pattern)

**Estimated Time**:
- Baseline (no meta): 60-90 minutes
- With meta: 35-50 minutes (40%+ reduction target)

**Key Requirements**:
- 4 microservices (Order, Inventory, Payment, Notification)
- Event sourcing with event store
- Saga pattern with compensating transactions
- Monorepo with workspaces
- TypeScript strict mode
- Test coverage >= 80%

**Success Criteria**:
- All services implemented
- Event sourcing working (event replay passes)
- Saga with compensation working
- All tests passing
- No TypeScript/ESLint errors

## Usage

This task is designed for the meta-learning experiment to test whether meta-analysis from previous sessions improves efficiency on complex development tasks.

See `TASK.md` for full details.

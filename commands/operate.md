---
description: Phase 4 - Operation (deployment, verification & meta-analysis)
model: sonnet
---

# /operate - Phase 4: Operation

Execute Phase 4 (Operation) - deployment, verification, and meta-analysis.

**Prerequisite**: Phase 1-3 (Planning + Design + Implementation) must be complete.

---

## Usage

```bash
/operate
```

Assumes implementation is complete with passing tests.

---

## What Happens

The `operator` agent will:

### Step 1: Deployment Verification
- Verify build succeeds
- Check package structure
- Test deployment process
- Validate entry points

### Step 2: End-to-End Testing
- Run full workflow tests
- Test happy path scenarios
- Test error handling
- Verify integration

### Step 3: Risk Validation
- **P0 validation** (CRITICAL issues resolved?)
- **P1 validation** (HIGH issues resolved?)
- **P2/P3 tracking** (Documented for future)

### Step 4: Meta-Analysis Generation
- Invoke `meta-analyzer` agent
- Generate comprehensive session analysis
- Extract patterns and learnings
- Provide improvement suggestions

### Step 5: Production-Ready Validation
- All criteria met?
- Documentation complete?
- Security validated?
- Performance acceptable?

---

## Output

### 1. Deployment Status
```bash
✓ Build: SUCCESS
✓ Package: Valid
✓ Deployment: SUCCESS
✓ Entry points: Accessible
```

### 2. Test Results
```bash
✓ Unit tests: 45/45 pass
✓ Integration tests: 12/12 pass
✓ E2E tests: 8/8 pass
✓ Coverage: 85%
```

### 3. Risk Validation
```markdown
## P0 (CRITICAL) - All Resolved ✓
- ✓ X-Forwarded-For validation implemented
- ✓ Memory leak fixed (Caffeine cache)

## P1 (HIGH) - All Resolved ✓
- ✓ Monitoring added (Prometheus metrics)
- ✓ Configuration externalized

## P2 (MEDIUM) - Tracked
- Documented for Phase 2
- User-friendly error messages

## P3 (LOW) - Backlog
- Grafana dashboard
- Admin API
```

### 4. Meta-Analysis
```
Generated: docs/meta/session-2026-01-17-meta-analysis.md

Highlights:
- 35 turns total
- 4.25x efficiency (parallel execution)
- 100% subagent success rate
- 8 patterns extracted
- 5 improvements suggested
```

---

## Success Criteria

Phase 4 complete when:
- [ ] Deployment successful
- [ ] All tests pass (unit + integration + E2E)
- [ ] P0 issues resolved (verified)
- [ ] P1 issues resolved (verified)
- [ ] Meta-analysis generated
- [ ] Production-ready checklist complete

---

## Philosophy

> **"Never stop at 'works' - push to production-ready"**

From development philosophy:
```
❌ WRONG: Tests pass → Done!
✅ RIGHT: Tests pass → Risk validation → Meta-analysis → Production-ready
```

---

## Production-Ready Checklist

### Functional
- [ ] All features work as specified
- [ ] All tests pass
- [ ] Build successful
- [ ] No unresolved errors

### Quality
- [ ] Code follows existing patterns
- [ ] Documentation complete
- [ ] Error messages clear
- [ ] Logging appropriate

### Security
- [ ] No P0 vulnerabilities
- [ ] Input validation present
- [ ] Authentication/authorization correct
- [ ] No secrets in code

### Operational
- [ ] Configuration externalized
- [ ] Monitoring/metrics available
- [ ] Error handling robust
- [ ] Performance acceptable

---

## Real-World Example

**Without Operation Phase**:
```
Implementation complete → Ship it!
→ Discover P0 security issue in production
→ Emergency hotfix
→ Discover monitoring missing
→ Another hotfix
→ Learn nothing for next time
```

**With Operation Phase**:
```
Implementation complete → /operate
→ P0 issues found and fixed (before deploy)
→ Monitoring validated
→ Meta-analysis generated
→ Ship with confidence
→ Apply learnings to next task

Result: Production-ready, continuous improvement
```

---

## Meta-Analysis Benefits

**What It Captures**:
1. Tool usage patterns
2. Decision trees
3. Problem-solving patterns
4. Efficiency metrics (4.25x speedup)
5. Subagent success rates
6. Best practices
7. Improvement suggestions

**Why It Matters**:
- Each session improves the next
- Patterns become reusable
- Mistakes aren't repeated
- Efficiency compounds over time

---

## Deployment Verification Commands

### TypeScript/Node.js
```bash
npm run build
npm pack --dry-run
npm link  # Local testing
npm test
```

### Docker
```bash
docker build -t app:latest .
docker run --rm app:latest --version
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f deployment.yaml --dry-run=client
kubectl get pods -n namespace
kubectl logs pod-name
```

---

## When to Use

### ✅ Always Use /operate After:
- Phase 3 (Implementation) completes
- Major feature completion
- Before any deployment

### ❌ Don't Skip Because:
- "Tests already pass" ← Not enough
- "Looks good" ← Verify objectively
- "In a hurry" ← Technical debt compounds

---

## Next Steps

After `/operate` completes:

### Task Complete
System is **production-ready**.

### Read Meta-Analysis
```bash
cat docs/meta/session-YYYY-MM-DD-meta-analysis.md
```

Review learnings for next task.

### Apply Improvements
Implement suggestions from meta-analysis in next session.

---

## Tips

1. **Verify objectively**: Don't trust "looks good"
2. **Fix P0 before deploy**: CRITICAL issues block deployment
3. **Fix P1 before production**: HIGH issues should be resolved
4. **Generate meta-analysis**: Every session is a learning opportunity
5. **Read meta-analysis**: Actually apply the learnings
6. **Continuous improvement**: Each task should be better than the last

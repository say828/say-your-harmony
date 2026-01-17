---
description: Consolidate meta-analyses into master patterns library
argument-hint: [--force | --dry-run]
model: opus
---

# /aggregate - Consolidate Meta-Analyses into Master Patterns Library

## Description

Analyzes all existing meta-analysis documents and consolidates them into a unified **Master Patterns Library** (`docs/meta/PATTERNS.md`). Enforces **maximum 10 session files** retention policy.

## Usage

```bash
/aggregate              # Incremental aggregation + cleanup
/aggregate --force      # Full regeneration of PATTERNS.md
/aggregate --dry-run    # Show what would happen without changes
```

## What It Does

1. **Scans** `~/.claude/meta/session-*.md` for all meta-analyses
2. **Extracts** patterns, decisions, metrics from each
3. **Deduplicates** similar patterns (merge with frequency count)
4. **Incremental merge** - Only adds NEW unique patterns to PATTERNS.md
5. **Ranks** patterns by occurrence frequency
6. **Analyzes** trends over time
7. **Identifies** anti-patterns (failures)
8. **Generates/Updates** `docs/meta/PATTERNS.md` master library
9. **Enforces retention** - Keeps only latest 10 sessions, deletes oldest

## Output

```
docs/meta/
├── session-2026-01-08-meta.md  ← 최근 10개만 유지
├── session-2026-01-09-meta.md
├── ...
├── session-2026-01-17-meta.md
└── PATTERNS.md                 ← 마스터 패턴 라이브러리

# Master Patterns Library

**Generated**: 2026-01-17 14:30
**Sessions analyzed**: 10 (max retention)
**Total patterns**: 12 (incremental merge)

## Quick Reference
- [Planning] Verify primary source first [5x]
- [Implementation] Parallel execution for 4+ tasks [4x]
...

## Detailed Patterns
...

## Anti-Patterns
...

## Metrics Summary
...

## Improvement Backlog
...
```

## Session Retention Policy

| Rule | Description |
|------|-------------|
| **MAX 10** | 최대 10개 세션 파일만 유지 |
| **FIFO** | 가장 오래된 세션부터 삭제 |
| **PATTERNS.md** | 마스터 라이브러리는 항상 보존 |
| **Incremental** | 중복 패턴은 빈도만 증가, 새 패턴만 추가 |

## When to Use

| Scenario | Recommendation |
|----------|----------------|
| After 3+ sessions completed | ✅ Good time to aggregate |
| After 5+ sessions | ✅ Highly recommended |
| Only 1-2 sessions exist | ⚠️ Wait for more data |
| Before major new project | ✅ Review past learnings |
| Mid-implementation | ❌ Finish current work first |

## Example Session

```
User: /aggregate

Claude: 메타 분석 통합을 시작합니다.

📊 스캔 결과:
- 발견된 메타 분석: 5개
- 기간: 2026-01-15 ~ 2026-01-17

🔍 패턴 분석 중...
- 원본 패턴: 23개
- 중복 제거 후: 12개 (48% 통합)

📈 트렌드 분석:
- 병렬 실행 효율: 3.2x → 4.5x (↑40%)
- 서브에이전트 성공률: 85% → 100% (↑15%)

✅ 마스터 패턴 라이브러리 생성 완료:
   docs/meta/PATTERNS.md

주요 패턴 (상위 5):
1. [5회] 주요 문서 먼저 확인
2. [4회] 4+ 작업 병렬 실행
3. [4회] P0/P1/P2/P3 리스크 분류
4. [3회] 모든 결정 문서화
5. [3회] 코드와 테스트 동시 작성

다음 통합 권장: 5 세션 후
```

## Options

| Option | Description |
|--------|-------------|
| (none) | Normal aggregation, skip if recent PATTERNS.md exists |
| `--force` | Regenerate PATTERNS.md even if it exists |
| `--dry-run` | Show what would be aggregated without writing |

## Related Commands

- `/meta` - Generate meta-analysis for current session
- `/harmony` - Execute full 4-phase workflow (includes meta at end)

## Multilingual Keywords

Detected keywords that trigger this command:
- `aggregate`, `aggregation`, `consolidate`
- `통합`, `패턴 통합`, `메타 통합`
- `統合`, `パターン統合`
- `consolidar`, `agregar`

## Notes

- Requires at least 1 meta-analysis file to run
- Recommends 3+ files for meaningful aggregation
- Existing PATTERNS.md will be backed up before regeneration
- All source sessions are referenced for traceability

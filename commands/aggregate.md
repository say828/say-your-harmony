# /aggregate - Consolidate Meta-Analyses into Master Patterns Library

## Description

Analyzes all existing meta-analysis documents and consolidates them into a unified **Master Patterns Library** (`docs/meta/PATTERNS.md`).

## Usage

```bash
/aggregate
/aggregate --force    # Regenerate even if PATTERNS.md exists
```

## What It Does

1. **Scans** `docs/meta/session-*.md` for all meta-analyses
2. **Extracts** patterns, decisions, metrics from each
3. **Deduplicates** similar patterns (merge with frequency count)
4. **Ranks** patterns by occurrence frequency
5. **Analyzes** trends over time
6. **Identifies** anti-patterns (failures)
7. **Generates** `docs/meta/PATTERNS.md` master library

## Output

```
docs/meta/PATTERNS.md

# Master Patterns Library

**Generated**: 2026-01-17 14:30
**Sessions analyzed**: 5
**Total patterns**: 12 (from 23 raw - 48% deduplication)

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

# Step 1 실험 가이드 - Baseline (0 meta → 1 task)

## 실험 목표
- 메타 없는 상태에서 shopping-cart task 수행
- Baseline 메트릭 수집
- **QuickMeta 플로우 검증** (1스텝 완료 후 확인)

---

## 사전 준비 ✅

- [x] 메타 데이터 삭제 완료
- [x] 백업 위치: `~/.claude/meta-backup/2026-01-18-15-59/`
- [x] config.json 보존됨

---

## 실험 실행

### 1. 새 Claude 세션에서 실행

```bash
# 새 터미널에서
cd /Users/say/Documents/GitHub/say-your-harmony/examples/meta-learning-experiment

# Harmony 워크플로우로 shopping-cart task 실행
claude /harmony "$(cat tasks/shopping-cart/TASK.md)"
```

### 2. 실험 중 기록할 항목

| 메트릭 | 값 |
|--------|-----|
| 시작 시간 | |
| 종료 시간 | |
| 총 턴 수 | |
| Phase 1 (Planning) 턴 | |
| Phase 2 (Design) 턴 | |
| Phase 3 (Implementation) 턴 | |
| Phase 4 (Operation) 턴 | |
| 웹 검색 횟수 | |
| 에러 발생 횟수 | |

---

## 메타 플로우 검증 (1스텝 완료 후)

### 검증 체크리스트

```bash
# 1. QuickMeta 디렉토리 확인
ls -la ~/.claude/meta/quickmeta/

# 예상 결과: 세션 ID 디렉토리 생성됨
# 예: 2026-01-18-160523-a1b2
```

```bash
# 2. Phase별 JSON 파일 확인
SESSION_ID=$(ls ~/.claude/meta/quickmeta/ | head -1)
ls -la ~/.claude/meta/quickmeta/$SESSION_ID/

# 예상 결과:
# - planning.json
# - design.json
# - implementation.json
# - operation.json
```

```bash
# 3. JSON 내용 검증
cat ~/.claude/meta/quickmeta/$SESSION_ID/planning.json | jq .

# 예상 필드:
# - version: 1
# - sessionId: "2026-01-18-..."
# - phase: "planning"
# - patterns: [...]
# - decisions: [...]
# - risks: [...]
# - metrics: { durationMs, toolCalls, ... }
# - handoffNote: "..."
```

### 검증 결과 체크리스트

- [ ] QuickMeta 디렉토리 생성됨
- [ ] 4개 phase JSON 파일 모두 존재
- [ ] planning.json에 patterns 배열 존재
- [ ] design.json에 decisions 배열 존재
- [ ] implementation.json에 metrics 존재
- [ ] operation.json에 handoffNote 존재
- [ ] 모든 파일 크기 < 2KB (성능 목표)

---

## 메타 플로우 실패 시 조치

### 문제 1: QuickMeta 디렉토리 미생성

**원인**: Harmony 에이전트가 QuickMeta 호출을 놓침

**조치**:
1. harmony.ts 프롬프트 확인
2. QuickMeta_Integration 섹션 검증
3. 수동 QuickMeta 생성 테스트

```typescript
import { onPhaseComplete, initSession } from './src/lib/quickmeta';

const sessionId = initSession();
await onPhaseComplete({
  sessionId,
  phase: 'planning',
  agentOutput: 'Test output...',
  startTime: Date.now() - 60000,
  endTime: Date.now(),
  delegationCount: 0,
  parallelTaskCount: 0,
});
```

### 문제 2: JSON 파일 내용 비어있음

**원인**: 패턴 추출기가 내용을 찾지 못함

**조치**:
1. extractor.ts 키워드 패턴 확인
2. 테스트 케이스로 추출 검증

---

## 성공 기준

### Baseline 메트릭 목표

| 메트릭 | 예상 범위 |
|--------|-----------|
| 총 시간 | 40-50분 |
| 총 턴 수 | 25-35 |
| 도구 호출 | 60-80 |
| 웹 검색 | 4-6 |

### 메타 플로우 성공 조건

- ✅ 4개 phase JSON 모두 생성
- ✅ 각 파일에 유효한 patterns/decisions/risks
- ✅ 파일당 처리 시간 < 100ms (로그로 확인)

---

## 다음 단계

Step 1 완료 및 메타 플로우 검증 후:

1. **메타 1개 축적 확인**
2. **Step 2로 진행**: 2개 task 병렬 실행
   - stats-library
   - fraud-detection

```bash
# Step 2 실행
./scripts/run-incremental-experiment.sh 2
```

---

## 기록용 템플릿

### Step 1 실험 결과

```yaml
experiment:
  step: 1
  task: shopping-cart
  date: 2026-01-18

timing:
  start:
  end:
  duration_min:

metrics:
  total_turns:
  tool_calls:
  web_searches:
  errors:

phases:
  planning:
    turns:
    duration_min:
  design:
    turns:
    duration_min:
  implementation:
    turns:
    duration_min:
  operation:
    turns:
    duration_min:

meta_flow_validation:
  quickmeta_dir_created: true/false
  planning_json: true/false
  design_json: true/false
  implementation_json: true/false
  operation_json: true/false
  patterns_extracted: count
  decisions_recorded: count
  risks_identified: count

notes: |

```

# say-your-harmony 개발 계획

> **목표**: 4단계 개발 철학(Planning → Design → Implementation → Operation)을 강제하는 Claude Code 에이전트 오케스트레이션 플러그인

---

## 1. 핵심 철학

### 1.1 4단계 개발 체계
모든 개발은 반드시 이 4단계로 진행:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│  PLANNING   │ →  │   DESIGN    │ →  │ IMPLEMENTATION  │ →  │  OPERATION  │
└─────────────┘    └─────────────┘    └─────────────────┘    └─────────────┘
     │                  │                    │                     │
     ▼                  ▼                    ▼                     ▼
 • 문제 정의         • 아키텍처 설계      • 병렬 구현            • 배포/검증
 • 요구사항 수집     • 의사결정 문서화    • 테스트               • 모니터링
 • 정보 수집        • 트레이드오프 분석   • 리스크 분석          • 지속 개선
```

### 1.2 6-Phase → 4단계 매핑
```
Planning     : Problem Definition + Information Gathering
Design       : Plan Mode + Architecture Decision
Implementation: Parallel Coding + Testing + Risk Analysis
Operation    : Deployment + Verification + Continuous Improvement
```

### 1.3 Meta-Analysis 피드백 루프
```
┌─────────────────────────────────────────────────────────────┐
│                    META-ANALYSIS LOOP                        │
│                                                              │
│  Execute → Analyze → Document Meta → Improve → Re-Execute   │
│     ↑                                              │        │
│     └──────────────────────────────────────────────┘        │
│                                                              │
│  메타 파일: 도구 사용 패턴, 의사결정 트리, 문제해결 패턴      │
│  → 지속적으로 에이전트 성능 개선                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 에이전트 체계 (완전 새로 설계)

### 2.1 4단계별 전문 에이전트

| 단계 | 에이전트 | 역할 | 모델 |
|------|----------|------|------|
| **Planning** | `planner` | 문제 정의, 요구사항 수집, 정보 탐색 | opus |
| **Design** | `architect` | 아키텍처 설계, 의사결정 문서화, 트레이드오프 분석 | opus |
| **Implementation** | `builder` | 병렬 코딩, 테스트, 리스크 분석 | sonnet |
| **Operation** | `operator` | 배포, 검증, 모니터링, 지속 개선 | sonnet |

### 2.2 보조 에이전트

| 에이전트 | 역할 | 모델 |
|----------|------|------|
| `explorer` | 코드베이스 탐색 (기존 explore 계승) | haiku |
| `documenter` | 문서 작성 (기존 document-writer 계승) | haiku |
| `meta-analyzer` | 세션 메타 분석, 패턴 추출, 개선 제안 | opus |

### 2.3 오케스트레이터

| 에이전트 | 역할 | 모델 |
|----------|------|------|
| `harmony` | 4단계 워크플로우 강제, 병렬 실행 조율, 단계 전환 관리 | opus |

---

## 3. 삭제할 기존 파일

### 3.1 에이전트 (src/agents/)
- `oracle.ts` → `architect.ts`로 대체
- `prometheus.ts` → `planner.ts`로 대체
- `librarian.ts` → 삭제 (explorer에 통합)
- `sisyphus-junior.ts` → `builder.ts`로 대체
- `orchestrator-sisyphus.ts` → `harmony.ts`로 대체
- `metis.ts` → 삭제 (planner에 통합)
- `momus.ts` → 삭제 (meta-analyzer에 통합)
- `frontend-engineer.ts` → 삭제 (builder에 통합)
- `multimodal-looker.ts` → 삭제
- `qa-tester.ts` → 삭제 (operator에 통합)

### 3.2 에이전트 프롬프트 (agents/)
- 모든 기존 .md 파일 삭제 후 새로 작성

### 3.3 기타
- `HARMONY_PROMPT.md` - 삭제 (Symphony 메타포)
- `DEVELOPMENT_METHODOLOGY.md` - 삭제

---

## 4. 신규 생성 파일

### 4.1 에이전트 (src/agents/)
```
src/agents/
├── types.ts              # 유지 (타입 정의)
├── utils.ts              # 유지 (유틸리티)
├── index.ts              # 수정 (새 에이전트 export)
├── definitions.ts        # 수정 (새 에이전트 등록)
│
├── harmony.ts            # 신규: 메인 오케스트레이터
├── planner.ts            # 신규: Planning 단계
├── architect.ts          # 신규: Design 단계
├── builder.ts            # 신규: Implementation 단계
├── operator.ts           # 신규: Operation 단계
├── explorer.ts           # 수정: 코드 탐색 (기존 explore 기반)
├── documenter.ts         # 수정: 문서 작성 (기존 document-writer 기반)
└── meta-analyzer.ts      # 신규: 메타 분석
```

### 4.2 에이전트 프롬프트 (agents/)
```
agents/
├── harmony.md            # 4단계 워크플로우 오케스트레이터
├── planner.md            # Planning 전문
├── architect.md          # Design 전문
├── builder.md            # Implementation 전문
├── operator.md           # Operation 전문
├── explorer.md           # 코드 탐색
├── documenter.md         # 문서 작성
└── meta-analyzer.md      # 메타 분석
```

### 4.3 스킬 (skills/)
```
skills/
├── ultrathink/SKILL.md   # 깊은 분석 모드
├── parallel/SKILL.md     # 병렬 실행 강화
├── meta/SKILL.md         # 메타 분석 생성
└── phase/SKILL.md        # 4단계 워크플로우 강제
```

### 4.4 명령어 (commands/)
```
commands/
├── harmony.md            # /harmony - 메인 워크플로우 시작
├── plan.md               # /plan - Planning 단계 시작
├── design.md             # /design - Design 단계 시작
├── build.md              # /build - Implementation 단계 시작
├── operate.md            # /operate - Operation 단계 시작
├── meta.md               # /meta - 메타 분석 생성
└── ultrathink.md         # /ultrathink - 깊은 분석 모드
```

---

## 5. 수정할 파일

| 파일 | 수정 내용 |
|------|-----------|
| `package.json` | name: "say-your-harmony", description 업데이트 |
| `README.md` | 4단계 철학 설명, 새 에이전트 문서화 |
| `docs/CLAUDE.md` | 4단계 워크플로우 시스템 프롬프트 |
| `src/agents/types.ts` | 새 에이전트 카테고리 추가 |
| `src/agents/index.ts` | 새 에이전트 export |
| `hooks/hooks.json` | 4단계 강제 훅 추가 |

---

## 6. 구현 순서

### Phase 1: 정리
1. 불필요한 파일 삭제 (HARMONY_PROMPT.md, DEVELOPMENT_METHODOLOGY.md)
2. 기존 에이전트 파일 백업
3. `package.json` 업데이트

### Phase 2: 코어 에이전트 구현 (병렬)
1. `harmony.ts` - 오케스트레이터
2. `planner.ts` - Planning
3. `architect.ts` - Design
4. `builder.ts` - Implementation
5. `operator.ts` - Operation

### Phase 3: 보조 에이전트 구현 (병렬)
1. `explorer.ts` - 탐색
2. `documenter.ts` - 문서
3. `meta-analyzer.ts` - 메타 분석

### Phase 4: 스킬/명령어 구현 (병렬)
1. 스킬 4개 작성
2. 명령어 7개 작성

### Phase 5: 통합
1. `docs/CLAUDE.md` 업데이트
2. `README.md` 업데이트
3. 테스트 작성 및 실행

### Phase 6: 검증
1. `npm run build` 성공
2. `npm test` 통과
3. 실제 워크플로우 테스트

---

## 7. 검증 방법

### 7.1 빌드 검증
```bash
npm run build  # 컴파일 성공
npm test       # 테스트 통과
```

### 7.2 기능 검증
1. `/harmony "새 기능 구현"` 실행 → 4단계 순차 진행 확인
2. `/plan` → Planning 에이전트 활성화 확인
3. `/meta` → 메타 분석 문서 생성 확인
4. 병렬 실행 → 4x 이상 효율 확인

### 7.3 철학 검증
- [ ] 모든 작업이 4단계를 거치는지 확인
- [ ] 각 단계에서 적절한 에이전트가 호출되는지 확인
- [ ] 메타 분석이 자동 생성되는지 확인
- [ ] 병렬 실행이 적용되는지 확인

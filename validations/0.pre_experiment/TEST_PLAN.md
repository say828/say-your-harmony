# Meta Mechanism Test Plan

## 목적
say-your-harmony의 메타 메커니즘 전체 워크플로우 검증

## 테스트 범위
- 메타 데이터 수집 및 저장
- 패턴 병합 로직
- 메타 재활용 및 누적 학습
- 하이브리드 저장소 구조 (~/.claude/meta/)

## 실험 설계

### Phase 1: 소규모 프로젝트 (Baseline)
**목표**: 깨끗한 상태에서 첫 메타 데이터 수집 검증

**프로젝트**: Simple Todo CLI App
- **복잡도**: 소규모 (2-3 파일, 기본 CRUD)
- **기능**:
  - Task 추가/삭제/목록 조회
  - JSON 파일 저장
  - 기본 CLI 인터페이스
- **예상 메타 패턴**:
  - 파일 I/O 패턴
  - CLI argument parsing
  - 기본 error handling

**검증 항목**:
- [ ] `~/.claude/meta/sessions/` 에 세션 파일 생성
- [ ] `patterns.json` 초기 패턴 생성
- [ ] 각 phase별 메타 추출 확인
- [ ] 저장소 구조 정합성

### Phase 2: 중규모 프로젝트 (Meta Reuse)
**목표**: 기존 메타 패턴 재활용 및 누적 학습 검증

**프로젝트**: REST API Server with Database
- **복잡도**: 중규모 (5-8 파일, 다중 레이어)
- **기능**:
  - Express.js REST API
  - SQLite 데이터베이스 연동
  - CRUD endpoints
  - Validation middleware
  - Error handling
- **Phase 1과의 연관성**: 파일 I/O, error handling 패턴 재사용

**검증 항목**:
- [ ] 기존 패턴 재활용 확인 (특히 error handling)
- [ ] 새로운 패턴 병합 (API, DB patterns)
- [ ] `patterns.json` 누적 업데이트
- [ ] Confidence score 증가 확인
- [ ] 중복 패턴 병합 로직 검증

## 메트릭

### 정량적 지표
1. **패턴 수집률**: 생성된 패턴 개수
2. **재활용률**: Phase 2에서 Phase 1 패턴 재사용 비율
3. **Confidence 변화**: 동일 패턴의 confidence score 증가
4. **저장소 크기**: 메타 데이터 누적 용량

### 정성적 지표
1. **패턴 품질**: 추출된 패턴의 의미 있는 정도
2. **병합 정확도**: 유사 패턴 병합의 적절성
3. **재활용 적합성**: 재활용된 패턴이 실제로 도움이 되었는지

## 실험 절차

### 준비 단계
1. ✅ 현재 메타 스토어 백업
2. ⬜ 메타 스토어 완전 초기화
3. ⬜ 실험 폴더 구조 생성

### Phase 1: 소규모 프로젝트
1. ⬜ `/harmony` 명령으로 Todo CLI 구축
2. ⬜ 메타 스토어 스냅샷 저장
3. ⬜ 패턴 분석 및 문서화

### Phase 2: 중규모 프로젝트
1. ⬜ `/harmony` 명령으로 REST API 구축
2. ⬜ 메타 재활용 로그 확인
3. ⬜ 패턴 누적 분석

### 분석 단계
1. ⬜ 두 phase 비교 분석
2. ⬜ 메타 메커니즘 개선점 도출
3. ⬜ 최종 리포트 작성

## 예상 결과

### 성공 기준
- [ ] 모든 phase에서 메타 파일 정상 생성
- [ ] Phase 2에서 Phase 1 패턴 최소 30% 재활용
- [ ] Confidence score 논리적 증가 (frequency + recency)
- [ ] 중복 패턴 병합으로 `patterns.json` 크기 최적화

### 실패 시나리오
- 메타 파일 누락
- 패턴 병합 실패 (중복 증가)
- Confidence 계산 오류
- 저장소 구조 깨짐

## 결과 문서

실험 결과는 다음 파일에 기록:
- `RESULTS.md`: 실험 결과 요약
- `phase1_analysis.md`: Phase 1 상세 분석
- `phase2_analysis.md`: Phase 2 상세 분석
- `meta_snapshots/`: 각 단계별 메타 스토어 스냅샷

---

**실험 시작 시간**: 2026-01-19
**예상 소요 시간**: 2-3 hours
**실험자**: Harmony System v1.4.0

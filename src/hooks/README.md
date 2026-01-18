# Hooks System Documentation

## 개요

Say-Your-Harmony의 Hooks 시스템은 Claude Code의 네이티브 쉘 훅 시스템에 대한 TypeScript 브릿지를 제공합니다. 쉘 스크립트가 훅 이벤트(UserPromptSubmit, Stop, SessionStart 등)를 감지하면, 복잡한 로직 처리를 위해 이 TypeScript 함수들을 호출합니다.

### 아키텍처

```
Claude Code (Native)
    ↓
Shell Scripts (.sh)
    ↓
Hook Bridge (TypeScript)
    ↓
Specific Hook Handlers
    ↓
JSON Response (stdout)
```

각 훅은 다음과 같이 작동합니다:
1. Claude Code가 쉘 훅을 실행
2. 쉘 스크립트가 JSON 입력을 Node.js 프로세스로 전달
3. TypeScript 훅이 입력을 처리하고 JSON 응답 반환
4. 쉘이 응답을 Claude Code로 전달

---

## 훅 분류

Say-Your-Harmony의 21개 훅은 7가지 카테고리로 분류됩니다.

### 1. 컨텍스트 관리 (Context Management)

사용자의 의도를 감지하고 Claude의 동작 모드를 전환하는 훅들입니다.

| 훅 이름 | 설명 | 주요 기능 |
|--------|------|---------|
| **think-mode** | 사용자가 "think" 키워드 입력 시 Claude의 사고 모드 활성화 | 키워드 감지, 모델 업그레이드, 확장된 사고 설정 주입 |
| **auto-slash-command** | 커스텀 슬래시 명령어 감지 및 자동 확장 | 스킬 기반 명령어, 프로젝트 명령어 탐색, 템플릿 확장 |
| **keyword-detector** | 특수 키워드(ultrawork, ultrathink, search, analyze) 감지 | 키워드 타입 분류, 코드 블록 필터링 |

#### 사용 예시

```typescript
import { shouldActivateThinkMode, processThinkMode } from './hooks';

// Think mode 활성화 확인
if (shouldActivateThinkMode("think about this algorithm")) {
  console.log("Extended thinking activated");
}

// Auto slash command 처리
import { processSlashCommand } from './hooks';
const result = processSlashCommand("/read src/index.ts");
if (result.detected) {
  console.log("Command expanded:", result.injectedMessage);
}
```

---

### 2. 메시지 처리 (Message Processing)

사용자 메시지를 정규화하고 검증하는 훅들입니다.

| 훅 이름 | 설명 | 주요 기능 |
|--------|------|---------|
| **empty-message-sanitizer** | 빈 메시지나 불완전한 메시지 정리 | 텍스트 내용 검증, 도구 부분 필터링, 자동 플레이스홀더 삽입 |
| **comment-checker** | 코드의 주석 문제 검출 | BDD 키워드 확인, 타입 체커 오류 감지, 언어별 필터링 |
| **thinking-block-validator** | 사고 블록(thinking block) 검증 및 복구 | 순서 재정렬, 누락된 사고 블록 추가, 합성 사고 블록 생성 |

#### 사용 예시

```typescript
import { sanitizeMessages, hasValidContent } from './hooks';

// 메시지 정리
const cleaned = sanitizeMessages(messages);

// 유효한 콘텐츠 확인
if (hasValidContent(message)) {
  console.log("Message has valid content");
}

// 주석 확인
import { checkForComments } from './hooks';
const comments = checkForComments("./src/index.ts");
```

---

### 3. 자동화 (Automation)

반복적인 작업을 자동화하고 작업 흐름을 관리하는 훅들입니다.

| 훅 이름 | 설명 | 주요 기능 |
|--------|------|---------|
| **ralph-loop** | 작업 완료 루프를 자동으로 반복 (RALPH 알고리즘) | 반복 추적, 완료 감지, 최대 반복 제한 |
| **ralph-verifier** | 작업 완료를 Oracle로 검증 | 검증 상태 관리, 피드백 기록 |
| **todo-continuation** | 미완료 작업(TODO)을 세션 간 추적 | 불완료 작업 감지, 세션 복구 |
| **agent-usage-reminder** | 에이전트 사용 현황 추적 및 리마인더 | 사용 통계 저장, 임계값 기반 알림 |
| **persistent-mode** | 울트라워크 모드를 세션 간 유지 | 상태 복구, 모드 확인, 강화 메시지 |

#### 사용 예시

```typescript
import { createRalphLoopHook, readRalphState, writeRalphState } from './hooks';

// Ralph 루프 상태 읽기
const state = readRalphState(directory);
if (state && state.active) {
  console.log(`Iteration ${state.iteration}/${state.max_iterations}`);
}

// Ralph 루프 상태 저장
writeRalphState(directory, {
  active: true,
  iteration: 1,
  max_iterations: 5,
  completion_promise: "Task completed",
  prompt: "Original task",
  session_id: "session-123"
});

// 울트라워크 상태 확인
import { readUltraworkState } from './hooks';
const ultrawork = readUltraworkState(directory);
if (ultrawork?.active) {
  console.log("Ultrawork mode active");
}
```

---

### 4. 상태 유지 (Persistence)

세션 간에 상태를 저장하고 복구하는 훅들입니다.

| 훅 이름 | 설명 | 주요 기능 |
|--------|------|---------|
| **session-recovery** | Claude Code 재시작 또는 충돌 시 세션 상태 복구 | 오류 감지, 메시지 복구, 사고 블록 복구 |
| **ultrawork-state** | 울트라워크 모드 상태 저장/복구 | 활성화/비활성화, 강화 추적 |

#### 사용 예시

```typescript
import {
  handleSessionRecovery,
  detectErrorType,
  isRecoverableError
} from './hooks';

// 오류 타입 감지
const errorType = detectErrorType(errorMessage);
if (isRecoverableError(errorType)) {
  const recovery = await handleSessionRecovery(sessionData);
  console.log("Session recovered:", recovery.success);
}
```

---

### 5. 기능 향상 (Enhancement)

Claude의 기능을 확장하고 개선하는 훅들입니다.

| 훅 이름 | 설명 | 주요 기능 |
|--------|------|---------|
| **rules-injector** | 프로젝트 규칙 파일을 자동으로 주입 | 프로젝트 루트 감지, 규칙 파일 탐색, 중복 제거, 조건부 적용 |
| **directory-readme-injector** | 디렉토리의 README 파일을 자동으로 주입 | 관련 README 검색, 경로 캐싱 |
| **edit-error-recovery** | 파일 편집 오류 감지 및 복구 제안 | 오류 패턴 매칭, 회복 제안 주입 |
| **plugin-patterns** | 인기 있는 커뮤니티 패턴 지원 | 포맷팅, Linting, 커밋 메시지 검증, 타입 체크, 테스트 |

#### 사용 예시

```typescript
import {
  getRulesForPath,
  findProjectRoot,
  shouldApplyRule
} from './hooks';

// 프로젝트 루트 찾기
const root = findProjectRoot(currentPath);

// 경로에 적용할 규칙 가져오기
const rules = getRulesForPath(currentPath, projectRoot);

// 플러그인 패턴 사용
import { formatFile, lintFile, runTests } from './hooks';

await formatFile("./src/index.ts");
const lintResult = await lintFile("./src/index.ts");
const testResult = await runTests();
```

---

### 6. 환경 설정 (Environment)

런타임 환경을 감지하고 설정하는 훅들입니다.

| 훅 이름 | 설명 | 주요 기능 |
|--------|------|---------|
| **non-interactive-env** | 비대화형 환경 감지 (CI/CD, 배치 처리) | 환경 감지, 쉘 명령 패턴 분석 |
| **background-notification** | 백그라운드 이벤트 처리 | 알림 확인, 이벤트 핸들링 |

#### 사용 예시

```typescript
import { isNonInteractive, nonInteractiveEnvHook } from './hooks';

if (isNonInteractive()) {
  console.log("Running in non-interactive environment");
  // CI/CD에 맞는 처리
}

// 백그라운드 알림 처리
import { checkBackgroundNotifications } from './hooks';
const notifications = await checkBackgroundNotifications();
```

---

### 7. 유틸리티 (Utility)

구조적 처리와 모니터링을 담당하는 훅들입니다.

| 훅 이름 | 설명 | 주요 기능 |
|--------|------|---------|
| **context-window-limit-recovery** | 컨텍스트 윈도우 초과 오류 처리 | 오류 감지, 토큰 제한 파싱, 자동 잘라내기 |
| **preemptive-compaction** | 컨텍스트 사용량 모니터링 및 경고 | 토큰 추정, 사용량 분석, 임계값 기반 경고 |

#### 사용 예시

```typescript
import {
  detectContextLimitError,
  parseTokenLimitError
} from './hooks';

// 컨텍스트 제한 오류 감지
if (detectContextLimitError(errorMessage)) {
  const parsed = parseTokenLimitError(errorMessage);
  console.log(`Current tokens: ${parsed.current}/${parsed.limit}`);
}

// 컨텍스트 사용량 분석
import { estimateTokens, analyzeContextUsage } from './hooks';

const tokenCount = estimateTokens(content);
const usage = analyzeContextUsage(messages);
console.log(`Context usage: ${usage.percentage}%`);
```

---

## 훅 브릿지 (Hook Bridge)

### 주요 인터페이스

```typescript
// 입력 형식
export interface HookInput {
  sessionId?: string;           // 세션 식별자
  prompt?: string;              // 사용자 프롬프트
  message?: {
    content?: string;
  };
  parts?: Array<{               // 메시지 부분
    type: string;
    text?: string;
  }>;
  toolName?: string;            // 도구 이름
  toolInput?: unknown;          // 도구 입력
  toolOutput?: unknown;         // 도구 출력
  directory?: string;           // 작업 디렉토리
}

// 출력 형식
export interface HookOutput {
  continue: boolean;            // 계속 진행 여부
  message?: string;             // 주입할 메시지
  reason?: string;              // 차단 사유 (continue=false일 때)
  modifiedInput?: unknown;      // 수정된 입력 (pre-tool 훅)
}
```

### 훅 타입

```typescript
type HookType =
  | 'keyword-detector'          // 키워드 감지
  | 'stop-continuation'         // 중지 시 작업 검사
  | 'ralph-loop'                // 작업 완료 루프
  | 'persistent-mode'           // 울트라워크/TODO 체크
  | 'session-start'             // 세션 시작 시 상태 복구
  | 'pre-tool-use'              // 도구 실행 전
  | 'post-tool-use';            // 도구 실행 후
```

### 프로세싱 흐름

```typescript
export async function processHook(
  hookType: HookType,
  input: HookInput
): Promise<HookOutput>
```

---

## 설정 및 사용

### 전역 설정

훅들은 환경 변수로 제어할 수 있습니다:

```bash
# 디버그 로깅 활성화
export PREEMPTIVE_COMPACTION_DEBUG=1
export SESSION_RECOVERY_DEBUG=1

# 컨텍스트 임계값 설정
export PREEMPTIVE_COMPACTION_THRESHOLD=85
```

### 프로젝트 규칙 파일

```yaml
# .claude/rules/backend.md
---
applies:
  tools: ["Read", "Write"]
  filePatterns: ["src/**/*.ts", "src/**/*.js"]
---

# 이 영역의 규칙...
```

### 슬래시 명령어 정의

```bash
# ~/.claude/skills/my-command.sh
#!/bin/bash
# Usage: /my-command [arguments]
echo "Command output: $@"
```

---

## 실제 사용 예시

### 예시 1: Think Mode 자동 활성화

```bash
# 사용자 입력
"think deeply about this problem"

# hook: keyword-detector
-> 감지: "think" 키워드
-> think-mode 활성화 시그널

# hook: think-mode (내부)
-> 모델을 고급 변형으로 업그레이드
-> 확장된 사고 설정 주입
-> 응답: 메시지와 함께 계속
```

### 예시 2: 미완료 작업 추적

```bash
# 세션 1: 사용자가 몇 가지 작업 시작
- [ ] Task 1
- [ ] Task 2

# 사용자가 중지를 시도
# hook: persistent-mode (stop-continuation)
-> todo-continuation 확인
-> 2개의 미완료 작업 발견
-> continue: false
-> reason: "2 tasks remaining"

# 사용자가 작업 계속
# hook: session-start (next session)
-> ultrawork-state 확인
-> 복구 메시지 주입
```

### 예시 3: 규칙 자동 주입

```bash
# 사용자가 파일 읽음
/read src/index.ts

# hook: rules-injector (pre-tool)
-> 프로젝트 루트 찾기
-> .claude/rules, .github/instructions 검색
-> 매칭하는 규칙 파일 탐색
-> 중복 제거
-> 메시지로 규칙 주입
```

---

## 훅 체인 및 순서

훅들은 특정 순서로 실행됩니다:

```
1. Session Start
   └─ session-recovery
   └─ persistent-mode (복구)

2. User Prompt Submit
   ├─ keyword-detector (키워드 검사)
   ├─ auto-slash-command (슬래시 명령어)
   ├─ think-mode (사고 모드)
   └─ empty-message-sanitizer (메시지 정리)

3. Before Tool Use (for each tool)
   ├─ rules-injector (규칙 주입)
   └─ directory-readme-injector (README 주입)

4. After Tool Use
   └─ edit-error-recovery (오류 감지)

5. Message Processing
   ├─ comment-checker (주석 검사)
   ├─ thinking-block-validator (사고 블록 검증)
   └─ session-recovery (오류 복구)

6. Session Stop
   ├─ context-window-limit-recovery (컨텍스트 오류)
   └─ persistent-mode (작업 추적)

7. Idle Events
   ├─ ralph-loop (작업 완료 루프)
   └─ background-notification (백그라운드 이벤트)
```

---

## 개발 가이드

### 새 훅 추가

1. `/src/hooks/your-hook-name/` 디렉토리 생성
2. 다음 파일 구조 따르기:
   ```
   your-hook-name/
   ├── index.ts          # 메인 내보내기
   ├── types.ts          # TypeScript 타입
   ├── constants.ts      # 상수
   ├── logic.ts          # 구현 로직
   └── storage.ts        # (필요시) 상태 저장
   ```

3. `index.ts`에 내보내기 추가:
   ```typescript
   export { createYourHook } from './your-hook-name/index.js';
   export type { YourHookConfig } from './your-hook-name/types.js';
   ```

4. `bridge.ts`에 훅 처리 추가

### 테스트

각 훅은 다음을 테스트해야 합니다:
- 정상 입력 처리
- 엣지 케이스 처리
- 오류 복구
- 성능 (대용량 데이터)

---

## 디버깅

### 로그 확인

```bash
# 실시간 로그 확인
tail -f ~/.claude/logs/hooks.log

# 특정 훅 디버그 로깅
PREEMPTIVE_COMPACTION_DEBUG=1 node hook-bridge.mjs
SESSION_RECOVERY_DEBUG=1 node hook-bridge.mjs
```

### 상태 검사

```bash
# Ralph 루프 상태
cat ~/.claude/state/ralph-loop.json

# 울트라워크 상태
cat ~/.claude/state/ultrawork-state.json

# 세션 복구 상태
cat ~/.claude/state/session-recovery.json
```

---

## 성능 고려사항

1. **메모리**: 세션 상태는 메모리에 저장됨 (정리 필요)
2. **디스크**: 규칙과 README 캐싱으로 성능 향상
3. **토큰**: 컨텍스트 사용량 모니터링으로 오버헤드 최소화

---

## 라이선스

Say-Your-Harmony Hooks System - MIT License

## 참고

- [Claude Code Documentation](https://claude.ai/docs)
- [oh-my-opencode Repository](https://github.com/oh-my-opencode)
- [Say-Your-Harmony GitHub](https://github.com/say828/say-your-harmony)

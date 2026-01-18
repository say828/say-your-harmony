import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectThinkKeyword,
  detectUltrathinkKeyword,
  extractPromptText,
  removeCodeBlocks,
} from '../hooks/think-mode/detector.js';
import {
  getHighVariant,
  isAlreadyHighVariant,
  getThinkingConfig,
  getClaudeThinkingConfig,
} from '../hooks/think-mode/switcher.js';
import {
  createThinkModeHook,
  processThinkMode,
  clearThinkModeState,
  getThinkModeState,
  isThinkModeActive,
  shouldActivateThinkMode,
  shouldActivateUltrathink,
} from '../hooks/think-mode/index.js';
import type { ThinkModeInput, ThinkModeState } from '../hooks/think-mode/types.js';

describe('Think Mode Detector', () => {
  describe('extractPromptText', () => {
    it('텍스트 파트에서 텍스트를 추출해야 함', () => {
      const parts = [
        { type: 'text', text: 'Hello world' },
        { type: 'text', text: 'How are you?' },
      ];
      expect(extractPromptText(parts)).toBe('Hello worldHow are you?');
    });

    it('텍스트가 아닌 파트는 필터링해야 함', () => {
      const parts = [
        { type: 'text', text: 'Hello' },
        { type: 'image', url: 'test.jpg' },
        { type: 'text', text: 'world' },
      ];
      expect(extractPromptText(parts)).toBe('Helloworld');
    });

    it('빈 파트 배열을 처리해야 함', () => {
      expect(extractPromptText([])).toBe('');
    });

    it('텍스트가 없는 파트를 처리해야 함', () => {
      const parts = [
        { type: 'text' },
        { type: 'text', text: undefined },
      ];
      expect(extractPromptText(parts)).toBe('');
    });
  });

  describe('removeCodeBlocks', () => {
    it('삼중 백틱 코드 블록을 제거해야 함', () => {
      const text = 'Some text\n```javascript\nconst x = 1;\n```\nMore text';
      const result = removeCodeBlocks(text);
      expect(result).not.toContain('const x = 1');
      expect(result).toContain('Some text');
      expect(result).toContain('More text');
    });

    it('인라인 코드를 제거해야 함', () => {
      const text = 'Use `think` command here';
      const result = removeCodeBlocks(text);
      expect(result).not.toContain('`think`');
      expect(result).toContain('Use');
      expect(result).toContain('command here');
    });

    it('여러 코드 블록을 처리해야 함', () => {
      const text = '```js\ncode1\n```\ntext\n```ts\ncode2\n```';
      const result = removeCodeBlocks(text);
      expect(result).not.toContain('code1');
      expect(result).not.toContain('code2');
      expect(result).toContain('text');
    });

    it('코드 블록이 없는 텍스트를 처리해야 함', () => {
      const text = 'Just plain text here';
      expect(removeCodeBlocks(text)).toBe(text);
    });

    it('빈 문자열을 처리해야 함', () => {
      expect(removeCodeBlocks('')).toBe('');
    });
  });

  describe('detectThinkKeyword', () => {
    it('영어 think 키워드를 감지해야 함', () => {
      expect(detectThinkKeyword('Let me think about it')).toBe(true);
      expect(detectThinkKeyword('I need to think')).toBe(true);
      expect(detectThinkKeyword('Think carefully')).toBe(true);
    });

    it('ultrathink 키워드를 감지해야 함', () => {
      expect(detectThinkKeyword('Use ultrathink mode')).toBe(true);
      expect(detectThinkKeyword('ULTRATHINK this problem')).toBe(true);
    });

    it('한국어 think 키워드를 감지해야 함', () => {
      expect(detectThinkKeyword('이것에 대해 생각해봐')).toBe(true);
      expect(detectThinkKeyword('고민이 필요해')).toBe(true);
      expect(detectThinkKeyword('검토해주세요')).toBe(true);
      expect(detectThinkKeyword('제대로 분석해봐')).toBe(true);
    });

    it('중국어 think 키워드를 감지해야 함', () => {
      expect(detectThinkKeyword('请思考这个问题')).toBe(true);
      expect(detectThinkKeyword('考虑一下')).toBe(true);
    });

    it('일본어 think 키워드를 감지해야 함', () => {
      expect(detectThinkKeyword('考えてください')).toBe(true);
      expect(detectThinkKeyword('熟考が必要です')).toBe(true);
    });

    it('러시아어 think 키워드를 감지해야 함', () => {
      expect(detectThinkKeyword('думать об этом')).toBe(true);
      expect(detectThinkKeyword('размышлять над проблемой')).toBe(true);
    });

    it('스페인어 think 키워드를 감지해야 함', () => {
      expect(detectThinkKeyword('piensa en esto')).toBe(true);
      expect(detectThinkKeyword('reflexionar sobre el problema')).toBe(true);
    });

    it('프랑스어 think 키워드를 감지해야 함', () => {
      expect(detectThinkKeyword('penser à cela')).toBe(true);
      expect(detectThinkKeyword('réfléchir sur le problème')).toBe(true);
    });

    it('대소문자를 구분하지 않아야 함', () => {
      expect(detectThinkKeyword('THINK')).toBe(true);
      expect(detectThinkKeyword('Think')).toBe(true);
      expect(detectThinkKeyword('tHiNk')).toBe(true);
    });

    it('단어 경계를 존중해야 함', () => {
      // \b 단어 경계를 사용하므로 "rethink"는 "think"로 감지되지 않음
      expect(detectThinkKeyword('rethink this')).toBe(false);
      // 독립된 단어로 "think"가 있으면 감지됨
      expect(detectThinkKeyword('let me think about this')).toBe(true);
      expect(detectThinkKeyword('think')).toBe(true);
    });

    it('코드 블록 내 키워드는 무시해야 함', () => {
      const text = 'Normal text\n```\nthink in code\n```\nMore text';
      expect(detectThinkKeyword(text)).toBe(false);
    });

    it('코드 블록 외부의 키워드는 감지해야 함', () => {
      const text = 'Please think\n```\nsome code\n```\nabout this';
      expect(detectThinkKeyword(text)).toBe(true);
    });

    it('키워드가 없는 텍스트는 false를 반환해야 함', () => {
      expect(detectThinkKeyword('Just normal text')).toBe(false);
      expect(detectThinkKeyword('Hello world')).toBe(false);
    });

    it('빈 문자열은 false를 반환해야 함', () => {
      expect(detectThinkKeyword('')).toBe(false);
    });
  });

  describe('detectUltrathinkKeyword', () => {
    it('ultrathink 키워드를 감지해야 함', () => {
      expect(detectUltrathinkKeyword('Use ultrathink mode')).toBe(true);
      expect(detectUltrathinkKeyword('ULTRATHINK this')).toBe(true);
      expect(detectUltrathinkKeyword('ultrathink')).toBe(true);
    });

    it('일반 think 키워드는 감지하지 않아야 함', () => {
      expect(detectUltrathinkKeyword('think about it')).toBe(false);
      expect(detectUltrathinkKeyword('I need to think')).toBe(false);
    });

    it('코드 블록 내 ultrathink는 무시해야 함', () => {
      const text = '```\nultrathink code\n```';
      expect(detectUltrathinkKeyword(text)).toBe(false);
    });

    it('대소문자를 구분하지 않아야 함', () => {
      expect(detectUltrathinkKeyword('ULTRATHINK')).toBe(true);
      expect(detectUltrathinkKeyword('UltraThink')).toBe(true);
      expect(detectUltrathinkKeyword('uLtRaThInK')).toBe(true);
    });
  });
});

describe('Think Mode Switcher', () => {
  describe('getHighVariant', () => {
    it('Claude 모델의 high variant를 반환해야 함', () => {
      expect(getHighVariant('claude-sonnet-4-5')).toBe('claude-sonnet-4-5-high');
      expect(getHighVariant('claude-opus-4-5')).toBe('claude-opus-4-5-high');
      expect(getHighVariant('claude-3-5-sonnet')).toBe('claude-3-5-sonnet-high');
      expect(getHighVariant('claude-3-opus')).toBe('claude-3-opus-high');
    });

    it('GPT 모델의 high variant를 반환해야 함', () => {
      expect(getHighVariant('gpt-4')).toBe('gpt-4-high');
      expect(getHighVariant('gpt-4-turbo')).toBe('gpt-4-turbo-high');
      expect(getHighVariant('gpt-4o')).toBe('gpt-4o-high');
      expect(getHighVariant('gpt-5')).toBe('gpt-5-high');
    });

    it('Gemini 모델의 high variant를 반환해야 함', () => {
      expect(getHighVariant('gemini-2-pro')).toBe('gemini-2-pro-high');
      expect(getHighVariant('gemini-3-pro')).toBe('gemini-3-pro-high');
    });

    it('이미 high variant인 경우 null을 반환해야 함', () => {
      expect(getHighVariant('claude-sonnet-4-5-high')).toBeNull();
      expect(getHighVariant('gpt-4-high')).toBeNull();
      expect(getHighVariant('gemini-2-pro-high')).toBeNull();
    });

    it('매핑되지 않은 모델은 null을 반환해야 함', () => {
      expect(getHighVariant('unknown-model')).toBeNull();
      expect(getHighVariant('gpt-3.5-turbo')).toBeNull();
    });

    it('버전 번호 정규화를 처리해야 함', () => {
      expect(getHighVariant('claude-sonnet-4.5')).toBe('claude-sonnet-4-5-high');
      expect(getHighVariant('claude-3.5-sonnet')).toBe('claude-3-5-sonnet-high');
    });

    it('프리픽스가 있는 모델 ID를 처리해야 함', () => {
      expect(getHighVariant('vertex_ai/claude-sonnet-4-5')).toBe('vertex_ai/claude-sonnet-4-5-high');
      expect(getHighVariant('openai/gpt-4')).toBe('openai/gpt-4-high');
    });
  });

  describe('isAlreadyHighVariant', () => {
    it('high variant 모델은 true를 반환해야 함', () => {
      expect(isAlreadyHighVariant('claude-sonnet-4-5-high')).toBe(true);
      expect(isAlreadyHighVariant('gpt-4-high')).toBe(true);
      expect(isAlreadyHighVariant('gemini-2-pro-high')).toBe(true);
    });

    it('일반 모델은 false를 반환해야 함', () => {
      expect(isAlreadyHighVariant('claude-sonnet-4-5')).toBe(false);
      expect(isAlreadyHighVariant('gpt-4')).toBe(false);
      expect(isAlreadyHighVariant('gemini-2-pro')).toBe(false);
    });

    it('-high로 끝나는 모델은 true를 반환해야 함', () => {
      expect(isAlreadyHighVariant('custom-model-high')).toBe(true);
    });

    it('프리픽스가 있는 high variant를 처리해야 함', () => {
      expect(isAlreadyHighVariant('vertex_ai/claude-sonnet-4-5-high')).toBe(true);
    });
  });

  describe('getThinkingConfig', () => {
    it('Anthropic 프로바이더의 thinking config를 반환해야 함', () => {
      const config = getThinkingConfig('anthropic', 'claude-sonnet-4-5');
      expect(config).not.toBeNull();
      expect(config).toHaveProperty('thinking');
      expect(config?.thinking).toHaveProperty('type', 'enabled');
      expect(config?.thinking).toHaveProperty('budgetTokens', 64000);
      expect(config).toHaveProperty('maxTokens', 128000);
    });

    it('Claude 모델에 대한 thinking config를 반환해야 함', () => {
      const config = getThinkingConfig('anthropic', 'claude-opus-4-5');
      expect(config).not.toBeNull();
      expect(config?.thinking).toBeDefined();
    });

    it('Amazon Bedrock의 thinking config를 반환해야 함', () => {
      const config = getThinkingConfig('amazon-bedrock', 'claude-sonnet-4-5');
      expect(config).not.toBeNull();
      expect(config).toHaveProperty('reasoningConfig');
    });

    it('Google 프로바이더의 thinking config를 반환해야 함', () => {
      const config = getThinkingConfig('google', 'gemini-2-pro');
      expect(config).not.toBeNull();
      expect(config).toHaveProperty('providerOptions');
    });

    it('OpenAI 프로바이더의 thinking config를 반환해야 함', () => {
      const config = getThinkingConfig('openai', 'gpt-4');
      expect(config).not.toBeNull();
      expect(config).toHaveProperty('reasoning_effort', 'high');
    });

    it('이미 high variant인 경우 null을 반환해야 함', () => {
      const config = getThinkingConfig('anthropic', 'claude-sonnet-4-5-high');
      expect(config).toBeNull();
    });

    it('thinking을 지원하지 않는 프로바이더는 null을 반환해야 함', () => {
      const config = getThinkingConfig('unknown-provider', 'some-model');
      expect(config).toBeNull();
    });

    it('thinking을 지원하지 않는 모델은 null을 반환해야 함', () => {
      const config = getThinkingConfig('anthropic', 'claude-2');
      expect(config).toBeNull();
    });

    it('GitHub Copilot 프록시를 Anthropic으로 해석해야 함', () => {
      const config = getThinkingConfig('github-copilot', 'claude-sonnet-4-5');
      expect(config).not.toBeNull();
      expect(config?.thinking).toBeDefined();
    });

    it('GitHub Copilot 프록시를 OpenAI로 해석해야 함', () => {
      const config = getThinkingConfig('github-copilot', 'gpt-4');
      expect(config).not.toBeNull();
      expect(config).toHaveProperty('reasoning_effort');
    });

    it('GitHub Copilot 프록시를 Google로 해석해야 함', () => {
      const config = getThinkingConfig('github-copilot', 'gemini-2-pro');
      expect(config).not.toBeNull();
      expect(config).toHaveProperty('providerOptions');
    });
  });

  describe('getClaudeThinkingConfig', () => {
    it('기본 Claude thinking config를 반환해야 함', () => {
      const config = getClaudeThinkingConfig();
      expect(config).toHaveProperty('thinking');
      expect(config.thinking).toHaveProperty('type', 'enabled');
      expect(config.thinking).toHaveProperty('budgetTokens', 64000);
      expect(config).toHaveProperty('maxTokens', 128000);
    });

    it('커스텀 budgetTokens를 설정할 수 있어야 함', () => {
      const config = getClaudeThinkingConfig(32000);
      expect(config.thinking.budgetTokens).toBe(32000);
    });
  });
});

describe('Think Mode Core Functions', () => {
  beforeEach(() => {
    // 각 테스트 전에 상태 초기화
    clearThinkModeState('test-session');
  });

  describe('processThinkMode', () => {
    it('think 키워드가 있으면 requested: true를 반환해야 함', () => {
      const state = processThinkMode('test-session', 'Let me think about it');
      expect(state.requested).toBe(true);
      expect(state.modelSwitched).toBe(false);
      expect(state.thinkingConfigInjected).toBe(false);
    });

    it('think 키워드가 없으면 requested: false를 반환해야 함', () => {
      const state = processThinkMode('test-session', 'Just a normal prompt');
      expect(state.requested).toBe(false);
    });

    it('세션 상태를 저장해야 함', () => {
      processThinkMode('test-session', 'think about it');
      const savedState = getThinkModeState('test-session');
      expect(savedState).toBeDefined();
      expect(savedState?.requested).toBe(true);
    });
  });

  describe('clearThinkModeState', () => {
    it('세션 상태를 삭제해야 함', () => {
      processThinkMode('test-session', 'think');
      expect(getThinkModeState('test-session')).toBeDefined();

      clearThinkModeState('test-session');
      expect(getThinkModeState('test-session')).toBeUndefined();
    });
  });

  describe('getThinkModeState', () => {
    it('존재하는 세션의 상태를 반환해야 함', () => {
      processThinkMode('test-session', 'think');
      const state = getThinkModeState('test-session');
      expect(state).toBeDefined();
      expect(state?.requested).toBe(true);
    });

    it('존재하지 않는 세션은 undefined를 반환해야 함', () => {
      const state = getThinkModeState('non-existent');
      expect(state).toBeUndefined();
    });
  });

  describe('isThinkModeActive', () => {
    it('think 키워드가 감지되면 true를 반환해야 함', () => {
      processThinkMode('test-session', 'think about it');
      expect(isThinkModeActive('test-session')).toBe(true);
    });

    it('think 키워드가 없으면 false를 반환해야 함', () => {
      processThinkMode('test-session', 'normal text');
      expect(isThinkModeActive('test-session')).toBe(false);
    });

    it('세션이 없으면 false를 반환해야 함', () => {
      expect(isThinkModeActive('non-existent')).toBe(false);
    });
  });

  describe('shouldActivateThinkMode', () => {
    it('think 키워드가 있으면 true를 반환해야 함', () => {
      expect(shouldActivateThinkMode('think about it')).toBe(true);
      expect(shouldActivateThinkMode('생각해봐')).toBe(true);
    });

    it('think 키워드가 없으면 false를 반환해야 함', () => {
      expect(shouldActivateThinkMode('normal prompt')).toBe(false);
    });
  });

  describe('shouldActivateUltrathink', () => {
    it('ultrathink 키워드가 있으면 true를 반환해야 함', () => {
      expect(shouldActivateUltrathink('use ultrathink mode')).toBe(true);
    });

    it('일반 think는 false를 반환해야 함', () => {
      expect(shouldActivateUltrathink('just think about it')).toBe(false);
    });
  });
});

describe('Think Mode Hook', () => {
  let hook: ReturnType<typeof createThinkModeHook>;

  beforeEach(() => {
    hook = createThinkModeHook();
  });

  describe('createThinkModeHook', () => {
    it('hook 객체를 생성해야 함', () => {
      expect(hook).toBeDefined();
      expect(hook).toHaveProperty('processChatParams');
      expect(hook).toHaveProperty('onSessionDeleted');
      expect(hook).toHaveProperty('isRequested');
      expect(hook).toHaveProperty('getState');
      expect(hook).toHaveProperty('clear');
    });
  });

  describe('processChatParams', () => {
    it('think 키워드가 없으면 기본 상태를 반환해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'normal prompt' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      const state = hook.processChatParams('test-session', input);
      expect(state.requested).toBe(false);
      expect(state.modelSwitched).toBe(false);
      expect(state.thinkingConfigInjected).toBe(false);
    });

    it('think 키워드가 있고 모델 전환이 가능하면 모델을 전환해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think about it' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      const state = hook.processChatParams('test-session', input);
      expect(state.requested).toBe(true);
      expect(state.modelSwitched).toBe(true);
      expect(input.message.model?.modelId).toBe('claude-sonnet-4-5-high');
    });

    it('think 키워드가 있고 thinking config를 주입해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think about it' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      const state = hook.processChatParams('test-session', input);
      expect(state.requested).toBe(true);
      expect(state.thinkingConfigInjected).toBe(true);
      expect(input.message).toHaveProperty('thinking');
    });

    it('이미 high variant인 경우 모델 전환을 하지 않아야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think about it' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5-high',
          },
        },
      };

      const state = hook.processChatParams('test-session', input);
      expect(state.requested).toBe(true);
      expect(state.modelSwitched).toBe(false);
      expect(input.message.model?.modelId).toBe('claude-sonnet-4-5-high');
    });

    it('모델 정보가 없으면 상태만 업데이트해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think about it' }],
        message: {},
      };

      const state = hook.processChatParams('test-session', input);
      expect(state.requested).toBe(true);
      expect(state.modelSwitched).toBe(false);
      expect(state.thinkingConfigInjected).toBe(false);
    });

    it('여러 텍스트 파트를 처리해야 함', () => {
      const input: ThinkModeInput = {
        parts: [
          { type: 'text', text: 'Please ' },
          { type: 'text', text: 'think ' },
          { type: 'text', text: 'about this' },
        ],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      const state = hook.processChatParams('test-session', input);
      expect(state.requested).toBe(true);
    });

    it('한국어 키워드를 감지해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: '이것에 대해 생각해봐' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      const state = hook.processChatParams('test-session', input);
      expect(state.requested).toBe(true);
      expect(state.modelSwitched).toBe(true);
    });
  });

  describe('onSessionDeleted', () => {
    it('세션 삭제 시 상태를 제거해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      hook.processChatParams('test-session', input);
      expect(hook.getState('test-session')).toBeDefined();

      hook.onSessionDeleted('test-session');
      expect(hook.getState('test-session')).toBeUndefined();
    });
  });

  describe('isRequested', () => {
    it('think가 요청되었으면 true를 반환해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      hook.processChatParams('test-session', input);
      expect(hook.isRequested('test-session')).toBe(true);
    });

    it('think가 요청되지 않았으면 false를 반환해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'normal' }],
        message: {},
      };

      hook.processChatParams('test-session', input);
      expect(hook.isRequested('test-session')).toBe(false);
    });
  });

  describe('getState', () => {
    it('현재 상태를 반환해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      const state = hook.processChatParams('test-session', input);
      const retrievedState = hook.getState('test-session');
      expect(retrievedState).toEqual(state);
    });
  });

  describe('clear', () => {
    it('상태를 초기화해야 함', () => {
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      hook.processChatParams('test-session', input);
      expect(hook.getState('test-session')).toBeDefined();

      hook.clear('test-session');
      expect(hook.getState('test-session')).toBeUndefined();
    });
  });
});

describe('Think Mode Integration Tests', () => {
  describe('키워드 감지와 모델 전환 통합', () => {
    it('영어 think 키워드로 Claude 모델을 전환해야 함', () => {
      const hook = createThinkModeHook();
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'Please think carefully about this problem' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-opus-4-5',
          },
        },
      };

      const state = hook.processChatParams('session-1', input);
      expect(state.requested).toBe(true);
      expect(state.modelSwitched).toBe(true);
      expect(state.thinkingConfigInjected).toBe(true);
      expect(input.message.model?.modelId).toBe('claude-opus-4-5-high');
    });

    it('한국어 think 키워드로 GPT 모델을 전환해야 함', () => {
      const hook = createThinkModeHook();
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: '이 문제에 대해 깊이 생각해봐' }],
        message: {
          model: {
            providerId: 'openai',
            modelId: 'gpt-4',
          },
        },
      };

      const state = hook.processChatParams('session-2', input);
      expect(state.requested).toBe(true);
      expect(state.modelSwitched).toBe(true);
      expect(input.message.model?.modelId).toBe('gpt-4-high');
    });

    it('코드 블록 내 키워드는 무시하고 외부 키워드만 감지해야 함', () => {
      const hook = createThinkModeHook();
      const input: ThinkModeInput = {
        parts: [{
          type: 'text',
          text: '```javascript\n// think about it\n```\nPlease analyze this code',
        }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-sonnet-4-5',
          },
        },
      };

      const state = hook.processChatParams('session-3', input);
      expect(state.requested).toBe(false);
    });
  });

  describe('다양한 프로바이더 처리', () => {
    it('Anthropic 프로바이더의 thinking config를 올바르게 설정해야 함', () => {
      const hook = createThinkModeHook();
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think' }],
        message: {
          model: {
            providerId: 'anthropic',
            modelId: 'claude-3-opus',
          },
        },
      };

      hook.processChatParams('session', input);
      expect(input.message).toHaveProperty('thinking');
      expect(input.message.thinking).toHaveProperty('type', 'enabled');
      expect(input.message.thinking).toHaveProperty('budgetTokens', 64000);
    });

    it('OpenAI 프로바이더의 reasoning_effort를 설정해야 함', () => {
      const hook = createThinkModeHook();
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think' }],
        message: {
          model: {
            providerId: 'openai',
            modelId: 'gpt-5',
          },
        },
      };

      hook.processChatParams('session', input);
      expect(input.message).toHaveProperty('reasoning_effort', 'high');
    });

    it('Google 프로바이더의 thinkingConfig를 설정해야 함', () => {
      const hook = createThinkModeHook();
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think' }],
        message: {
          model: {
            providerId: 'google',
            modelId: 'gemini-3-pro',
          },
        },
      };

      hook.processChatParams('session', input);
      expect(input.message).toHaveProperty('providerOptions');
    });
  });

  describe('상태 전환 시나리오', () => {
    it('여러 세션을 독립적으로 관리해야 함', () => {
      const hook = createThinkModeHook();

      const input1: ThinkModeInput = {
        parts: [{ type: 'text', text: 'think' }],
        message: { model: { providerId: 'anthropic', modelId: 'claude-sonnet-4-5' } },
      };

      const input2: ThinkModeInput = {
        parts: [{ type: 'text', text: 'normal' }],
        message: { model: { providerId: 'anthropic', modelId: 'claude-sonnet-4-5' } },
      };

      hook.processChatParams('session-1', input1);
      hook.processChatParams('session-2', input2);

      expect(hook.isRequested('session-1')).toBe(true);
      expect(hook.isRequested('session-2')).toBe(false);
    });

    it('세션 상태를 업데이트할 수 있어야 함', () => {
      const hook = createThinkModeHook();
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: 'normal' }],
        message: { model: { providerId: 'anthropic', modelId: 'claude-sonnet-4-5' } },
      };

      hook.processChatParams('session', input);
      expect(hook.isRequested('session')).toBe(false);

      input.parts = [{ type: 'text', text: 'think' }];
      hook.processChatParams('session', input);
      expect(hook.isRequested('session')).toBe(true);
    });
  });
});

describe('Edge Cases', () => {
  describe('빈 입력 처리', () => {
    it('빈 parts 배열을 처리해야 함', () => {
      const hook = createThinkModeHook();
      const input: ThinkModeInput = {
        parts: [],
        message: { model: { providerId: 'anthropic', modelId: 'claude-sonnet-4-5' } },
      };

      const state = hook.processChatParams('session', input);
      expect(state.requested).toBe(false);
    });

    it('빈 텍스트를 처리해야 함', () => {
      const hook = createThinkModeHook();
      const input: ThinkModeInput = {
        parts: [{ type: 'text', text: '' }],
        message: { model: { providerId: 'anthropic', modelId: 'claude-sonnet-4-5' } },
      };

      const state = hook.processChatParams('session', input);
      expect(state.requested).toBe(false);
    });
  });

  describe('특수 문자 처리', () => {
    it('유니코드 문자가 포함된 텍스트를 처리해야 함', () => {
      expect(detectThinkKeyword('Please think 🤔 about it')).toBe(true);
      expect(detectThinkKeyword('생각해봐 😊')).toBe(true);
    });

    it('여러 줄 텍스트를 처리해야 함', () => {
      const text = `First line
      Second line with think keyword
      Third line`;
      expect(detectThinkKeyword(text)).toBe(true);
    });
  });

  describe('Type Validation', () => {
    it('ThinkModeState 타입이 올바른 구조를 가져야 함', () => {
      const state: ThinkModeState = {
        requested: true,
        modelSwitched: true,
        thinkingConfigInjected: true,
        providerId: 'anthropic',
        modelId: 'claude-sonnet-4-5',
      };

      expect(state.requested).toBe(true);
      expect(state.modelSwitched).toBe(true);
      expect(state.thinkingConfigInjected).toBe(true);
      expect(state.providerId).toBe('anthropic');
      expect(state.modelId).toBe('claude-sonnet-4-5');
    });

    it('최소 ThinkModeState를 생성할 수 있어야 함', () => {
      const state: ThinkModeState = {
        requested: false,
        modelSwitched: false,
        thinkingConfigInjected: false,
      };

      expect(state.providerId).toBeUndefined();
      expect(state.modelId).toBeUndefined();
    });
  });
});

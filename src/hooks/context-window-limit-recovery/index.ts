/**
 * Context Window Limit Recovery Hook
 *
 * Detects context window limit errors and injects recovery messages
 * to help Claude recover gracefully.
 *
 * Adapted from oh-my-opencode's anthropic-context-window-limit-recovery hook.
 *
 * Note: This is a simplified version for Claude Code's shell hook system.
 * The original uses OpenCode's plugin event system for more sophisticated
 * recovery like automatic summarization and truncation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

import {
  parseTokenLimitError,
  containsTokenLimitError,
} from './parser.js';
import {
  CONTEXT_LIMIT_RECOVERY_MESSAGE,
  CONTEXT_LIMIT_SHORT_MESSAGE,
  NON_EMPTY_CONTENT_RECOVERY_MESSAGE,
  RECOVERY_FAILED_MESSAGE,
} from './constants.js';
import type {
  ParsedTokenLimitError,
  RetryState,
  TruncateState,
  RecoveryResult,
} from './types.js';
import { RETRY_CONFIG } from './types.js';

const DEBUG = process.env.CONTEXT_LIMIT_RECOVERY_DEBUG === '1';
const DEBUG_FILE = path.join(tmpdir(), 'context-limit-recovery-debug.log');

function debugLog(...args: unknown[]): void {
  if (DEBUG) {
    const msg = `[${new Date().toISOString()}] [context-limit-recovery] ${args
      .map((a) =>
        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      )
      .join(' ')}\n`;
    fs.appendFileSync(DEBUG_FILE, msg);
  }
}

/**
 * Session recovery state tracking
 */
interface SessionState {
  retryState: RetryState;
  truncateState: TruncateState;
  lastErrorTime: number;
  errorCount: number;
}

const sessionStates = new Map<string, SessionState>();
const STATE_TTL = 300_000; // 5 minutes

/**
 * Get or create session state
 */
function getSessionState(sessionId: string): SessionState {
  let state = sessionStates.get(sessionId);
  const now = Date.now();

  // Reset stale state
  if (state && now - state.lastErrorTime > STATE_TTL) {
    state = undefined;
  }

  if (!state) {
    state = {
      retryState: { attempt: 0, lastAttemptTime: 0 },
      truncateState: { truncateAttempt: 0 },
      lastErrorTime: now,
      errorCount: 0,
    };
    sessionStates.set(sessionId, state);
  }

  return state;
}

/**
 * Clean up old session states
 */
function cleanupSessionStates(): void {
  const now = Date.now();
  for (const [sessionId, state] of sessionStates) {
    if (now - state.lastErrorTime > STATE_TTL) {
      sessionStates.delete(sessionId);
    }
  }
}

// Run cleanup periodically
let cleanupIntervalStarted = false;

/**
 * Configuration for context limit recovery hook
 */
export interface ContextLimitRecoveryConfig {
  /** Whether to show detailed recovery messages */
  detailed?: boolean;
  /** Custom recovery message */
  customMessage?: string;
  /** Whether to enable the hook */
  enabled?: boolean;
}

/**
 * Create context window limit recovery hook
 *
 * This hook monitors for token/context limit errors and injects
 * helpful recovery messages when detected.
 */
export function createContextLimitRecoveryHook(
  config?: ContextLimitRecoveryConfig
) {
  debugLog('createContextLimitRecoveryHook called', { config });

  if (!cleanupIntervalStarted) {
    cleanupIntervalStarted = true;
    setInterval(cleanupSessionStates, 60_000);
  }

  return {
    /**
     * PostToolUse - Check for context limit errors in tool responses
     */
    postToolUse: (input: {
      tool_name: string;
      session_id: string;
      tool_input: Record<string, unknown>;
      tool_response?: string;
    }): string | null => {
      if (!input.tool_response) {
        return null;
      }

      // Check if response contains token limit error
      const parsed = parseTokenLimitError(input.tool_response);
      if (!parsed && !containsTokenLimitError(input.tool_response)) {
        return null;
      }

      debugLog('detected token limit error', {
        tool: input.tool_name,
        sessionId: input.session_id,
        parsed,
      });

      const state = getSessionState(input.session_id);
      state.lastErrorTime = Date.now();
      state.errorCount++;

      // Generate appropriate recovery message
      const recovery = generateRecoveryMessage(parsed, state, config);

      if (recovery.message) {
        debugLog('injecting recovery message', {
          errorType: recovery.errorType,
          attempt: state.retryState.attempt,
        });
        return recovery.message;
      }

      return null;
    },

    /**
     * Notification - Check for error notifications
     * (Called when errors are passed through notification system)
     */
    onError: (input: {
      session_id: string;
      error: unknown;
    }): RecoveryResult => {
      const parsed = parseTokenLimitError(input.error);

      if (!parsed) {
        return {
          attempted: false,
          success: false,
        };
      }

      debugLog('error notification contains token limit error', {
        sessionId: input.session_id,
        parsed,
      });

      const state = getSessionState(input.session_id);
      state.lastErrorTime = Date.now();
      state.errorCount++;

      const recovery = generateRecoveryMessage(parsed, state, config);

      return {
        attempted: true,
        success: !!recovery.message,
        message: recovery.message,
        errorType: recovery.errorType,
      };
    },
  };
}

/**
 * Generate appropriate recovery message based on error and state
 */
function generateRecoveryMessage(
  parsed: ParsedTokenLimitError | null,
  state: SessionState,
  config?: ContextLimitRecoveryConfig
): { message?: string; errorType?: string } {
  // Use custom message if provided
  if (config?.customMessage) {
    return {
      message: config.customMessage,
      errorType: parsed?.errorType,
    };
  }

  // Handle non-empty content error
  if (parsed?.errorType?.includes('non-empty content')) {
    return {
      message: NON_EMPTY_CONTENT_RECOVERY_MESSAGE,
      errorType: 'non-empty content',
    };
  }

  // Check retry limits
  state.retryState.attempt++;
  state.retryState.lastAttemptTime = Date.now();

  if (state.retryState.attempt > RETRY_CONFIG.maxAttempts) {
    return {
      message: RECOVERY_FAILED_MESSAGE,
      errorType: 'recovery_exhausted',
    };
  }

  // Return detailed or short message based on config
  if (config?.detailed !== false) {
    let message = CONTEXT_LIMIT_RECOVERY_MESSAGE;

    // Add token info if available
    if (parsed?.currentTokens && parsed?.maxTokens) {
      message += `\nToken Details:
- Current: ${parsed.currentTokens.toLocaleString()} tokens
- Maximum: ${parsed.maxTokens.toLocaleString()} tokens
- Over limit by: ${(parsed.currentTokens - parsed.maxTokens).toLocaleString()} tokens
`;
    }

    return {
      message,
      errorType: parsed?.errorType || 'token_limit_exceeded',
    };
  }

  return {
    message: CONTEXT_LIMIT_SHORT_MESSAGE,
    errorType: parsed?.errorType || 'token_limit_exceeded',
  };
}

/**
 * Check if text contains a context limit error
 */
export function detectContextLimitError(text: string): boolean {
  return containsTokenLimitError(text);
}

/**
 * Parse error to get detailed token limit info
 */
export function parseContextLimitError(
  error: unknown
): ParsedTokenLimitError | null {
  return parseTokenLimitError(error);
}

// Re-export types and constants
export type {
  ParsedTokenLimitError,
  RetryState,
  TruncateState,
  RecoveryResult,
} from './types.js';

export { RETRY_CONFIG, TRUNCATE_CONFIG } from './types.js';

export {
  CONTEXT_LIMIT_RECOVERY_MESSAGE,
  CONTEXT_LIMIT_SHORT_MESSAGE,
  NON_EMPTY_CONTENT_RECOVERY_MESSAGE,
  TRUNCATION_APPLIED_MESSAGE,
  RECOVERY_FAILED_MESSAGE,
} from './constants.js';

export {
  parseTokenLimitError,
  containsTokenLimitError,
  TOKEN_LIMIT_PATTERNS,
  TOKEN_LIMIT_KEYWORDS,
} from './parser.js';

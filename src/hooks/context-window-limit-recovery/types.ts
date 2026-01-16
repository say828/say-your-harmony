/**
 * Context Window Limit Recovery Types
 *
 * Type definitions for detecting and recovering from context window limit errors.
 *
 * Adapted from oh-my-opencode's anthropic-context-window-limit-recovery hook.
 */

/**
 * Parsed token limit error information
 */
export interface ParsedTokenLimitError {
  /** Current number of tokens in the conversation */
  currentTokens: number;
  /** Maximum allowed tokens */
  maxTokens: number;
  /** Request ID from the API response */
  requestId?: string;
  /** Type of error detected */
  errorType: string;
  /** Provider ID (e.g., 'anthropic') */
  providerID?: string;
  /** Model ID (e.g., 'claude-3-opus-20240229') */
  modelID?: string;
  /** Index of the problematic message */
  messageIndex?: number;
}

/**
 * Retry state for recovery attempts
 */
export interface RetryState {
  /** Number of retry attempts made */
  attempt: number;
  /** Timestamp of last retry attempt */
  lastAttemptTime: number;
}

/**
 * Truncation state for progressive truncation
 */
export interface TruncateState {
  /** Number of truncation attempts made */
  truncateAttempt: number;
  /** ID of the last truncated part */
  lastTruncatedPartId?: string;
}

/**
 * Recovery result
 */
export interface RecoveryResult {
  /** Whether recovery was attempted */
  attempted: boolean;
  /** Whether recovery was successful */
  success: boolean;
  /** Recovery message to inject */
  message?: string;
  /** Error type detected */
  errorType?: string;
}

/**
 * Configuration for retry behavior
 */
export const RETRY_CONFIG = {
  /** Maximum retry attempts */
  maxAttempts: 2,
  /** Initial delay between retries in ms */
  initialDelayMs: 2000,
  /** Backoff factor for exponential backoff */
  backoffFactor: 2,
  /** Maximum delay between retries in ms */
  maxDelayMs: 30000,
} as const;

/**
 * Configuration for truncation behavior
 */
export const TRUNCATE_CONFIG = {
  /** Maximum truncation attempts */
  maxTruncateAttempts: 20,
  /** Minimum output size (chars) to attempt truncation */
  minOutputSizeToTruncate: 500,
  /** Target token ratio after truncation */
  targetTokenRatio: 0.5,
  /** Average characters per token estimate */
  charsPerToken: 4,
} as const;

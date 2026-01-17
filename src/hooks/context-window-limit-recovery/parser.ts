/**
 * Context Window Limit Error Parser
 *
 * Parses error responses to detect token/context limit errors.
 *
 * Adapted from oh-my-opencode's anthropic-context-window-limit-recovery hook.
 */

import type { ParsedTokenLimitError } from './types.js';

/**
 * Patterns to extract token counts from error messages
 */
const TOKEN_LIMIT_PATTERNS = [
  /(\d+)\s*tokens?\s*>\s*(\d+)\s*maximum/i,
  /prompt.*?(\d+).*?tokens.*?exceeds.*?(\d+)/i,
  /(\d+).*?tokens.*?limit.*?(\d+)/i,
  /context.*?length.*?(\d+).*?maximum.*?(\d+)/i,
  /max.*?context.*?(\d+).*?but.*?(\d+)/i,
];

/**
 * Keywords indicating token limit errors
 */
const TOKEN_LIMIT_KEYWORDS = [
  'prompt is too long',
  'is too long',
  'context_length_exceeded',
  'max_tokens',
  'token limit',
  'context length',
  'too many tokens',
  'non-empty content',
];

/**
 * Patterns indicating thinking block structure errors (NOT token limit)
 * These should be handled differently
 */
const THINKING_BLOCK_ERROR_PATTERNS = [
  /thinking.*first block/i,
  /first block.*thinking/i,
  /must.*start.*thinking/i,
  /thinking.*redacted_thinking/i,
  /expected.*thinking.*found/i,
  /thinking.*disabled.*cannot.*contain/i,
];

/**
 * Pattern to extract message index from error
 */
const MESSAGE_INDEX_PATTERN = /messages\.(\d+)/;

/**
 * Check if error is a thinking block structure error
 */
function isThinkingBlockError(text: string): boolean {
  return THINKING_BLOCK_ERROR_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Extract token counts from error message
 */
function extractTokensFromMessage(
  message: string
): { current: number; max: number } | null {
  for (const pattern of TOKEN_LIMIT_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const num1 = parseInt(match[1], 10);
      const num2 = parseInt(match[2], 10);
      return num1 > num2
        ? { current: num1, max: num2 }
        : { current: num2, max: num1 };
    }
  }
  return null;
}

/**
 * Extract message index from error text
 */
function extractMessageIndex(text: string): number | undefined {
  const match = text.match(MESSAGE_INDEX_PATTERN);
  if (match) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

/**
 * Check if text indicates a token limit error
 */
function isTokenLimitError(text: string): boolean {
  if (isThinkingBlockError(text)) {
    return false;
  }
  const lower = text.toLowerCase();
  return TOKEN_LIMIT_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Parse an error to detect if it's a token limit error
 */
export function parseTokenLimitError(
  err: unknown
): ParsedTokenLimitError | null {
  // Handle string errors
  if (typeof err === 'string') {
    if (err.toLowerCase().includes('non-empty content')) {
      return {
        currentTokens: 0,
        maxTokens: 0,
        errorType: 'non-empty content',
        messageIndex: extractMessageIndex(err),
      };
    }
    if (isTokenLimitError(err)) {
      const tokens = extractTokensFromMessage(err);
      return {
        currentTokens: tokens?.current ?? 0,
        maxTokens: tokens?.max ?? 0,
        errorType: 'token_limit_exceeded_string',
      };
    }
    return null;
  }

  // Handle non-object errors
  if (!err || typeof err !== 'object') return null;

  const errObj = err as Record<string, unknown>;

  // Collect all text sources from the error object
  const textSources: string[] = [];

  const dataObj = errObj.data as Record<string, unknown> | undefined;
  const responseBody = dataObj?.responseBody;
  const errorMessage = errObj.message as string | undefined;
  const errorData = errObj.error as Record<string, unknown> | undefined;
  const nestedError = errorData?.error as Record<string, unknown> | undefined;

  if (typeof responseBody === 'string') textSources.push(responseBody);
  if (typeof errorMessage === 'string') textSources.push(errorMessage);
  if (typeof errorData?.message === 'string')
    textSources.push(errorData.message as string);
  if (typeof errObj.body === 'string') textSources.push(errObj.body as string);
  if (typeof errObj.details === 'string')
    textSources.push(errObj.details as string);
  if (typeof errObj.reason === 'string')
    textSources.push(errObj.reason as string);
  if (typeof errObj.description === 'string')
    textSources.push(errObj.description as string);
  if (typeof nestedError?.message === 'string')
    textSources.push(nestedError.message as string);
  if (typeof dataObj?.message === 'string')
    textSources.push(dataObj.message as string);
  if (typeof dataObj?.error === 'string')
    textSources.push(dataObj.error as string);

  // Try JSON stringification if no text sources found
  if (textSources.length === 0) {
    try {
      const jsonStr = JSON.stringify(errObj);
      if (isTokenLimitError(jsonStr)) {
        textSources.push(jsonStr);
      }
    } catch {
      // Ignore JSON errors
    }
  }

  const combinedText = textSources.join(' ');
  if (!isTokenLimitError(combinedText)) return null;

  // Try to parse structured response body
  if (typeof responseBody === 'string') {
    try {
      interface AnthropicErrorData {
        type: 'error';
        error: {
          type: string;
          message: string;
        };
        request_id?: string;
      }

      const jsonPatterns = [
        /data:\s*(\{[\s\S]*\})\s*$/m,
        /(\{"type"\s*:\s*"error"[\s\S]*\})/,
        /(\{[\s\S]*"error"[\s\S]*\})/,
      ];

      for (const pattern of jsonPatterns) {
        const dataMatch = responseBody.match(pattern);
        if (dataMatch) {
          try {
            const jsonData: AnthropicErrorData = JSON.parse(dataMatch[1]);
            const message = jsonData.error?.message || '';
            const tokens = extractTokensFromMessage(message);

            if (tokens) {
              return {
                currentTokens: tokens.current,
                maxTokens: tokens.max,
                requestId: jsonData.request_id,
                errorType: jsonData.error?.type || 'token_limit_exceeded',
              };
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Check for Bedrock-style errors
      const bedrockJson = JSON.parse(responseBody);
      if (
        typeof bedrockJson.message === 'string' &&
        isTokenLimitError(bedrockJson.message)
      ) {
        return {
          currentTokens: 0,
          maxTokens: 0,
          errorType: 'bedrock_input_too_long',
        };
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Extract tokens from any text source
  for (const text of textSources) {
    const tokens = extractTokensFromMessage(text);
    if (tokens) {
      return {
        currentTokens: tokens.current,
        maxTokens: tokens.max,
        errorType: 'token_limit_exceeded',
      };
    }
  }

  // Check for non-empty content error
  if (combinedText.toLowerCase().includes('non-empty content')) {
    return {
      currentTokens: 0,
      maxTokens: 0,
      errorType: 'non-empty content',
      messageIndex: extractMessageIndex(combinedText),
    };
  }

  // Generic token limit error
  if (isTokenLimitError(combinedText)) {
    return {
      currentTokens: 0,
      maxTokens: 0,
      errorType: 'token_limit_exceeded_unknown',
    };
  }

  return null;
}

/**
 * Check if a string contains a token limit error indication
 */
export function containsTokenLimitError(text: string): boolean {
  return isTokenLimitError(text);
}

// Re-export patterns for testing
export {
  TOKEN_LIMIT_PATTERNS,
  TOKEN_LIMIT_KEYWORDS,
  THINKING_BLOCK_ERROR_PATTERNS,
};

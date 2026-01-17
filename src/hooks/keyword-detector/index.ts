/**
 * Keyword Detector Hook
 *
 * Detects magic keywords in user prompts and returns the appropriate
 * mode message to inject into context.
 *
 * Ported from oh-my-opencode's keyword-detector hook.
 */

export type KeywordType = 'ultrawork' | 'ultrathink' | 'search' | 'analyze';

export interface DetectedKeyword {
  type: KeywordType;
  keyword: string;
  position: number;
}

/**
 * Keyword patterns for each mode
 */
const KEYWORD_PATTERNS: Record<KeywordType, RegExp> = {
  ultrawork: /\b(ultrawork|ulw)\b/i,
  ultrathink: /\b(ultrathink|think)\b/i,
  search: /\b(search|find|locate|lookup|explore|discover|scan|grep|query|browse|detect|trace|seek|track|pinpoint|hunt)\b|where\s+is|show\s+me|list\s+all/i,
  analyze: /\b(analyze|analyse|investigate|examine|research|study|deep.?dive|inspect|audit|evaluate|assess|review|diagnose|scrutinize|dissect|debug|comprehend|interpret|breakdown|understand)\b|why\s+is|how\s+does|how\s+to/i
};

/**
 * Priority order for keyword detection
 * Higher priority keywords take precedence
 */
const KEYWORD_PRIORITY: KeywordType[] = ['ultrawork', 'ultrathink', 'search', 'analyze'];

/**
 * Remove code blocks from text to prevent false positives
 * Handles both fenced code blocks and inline code
 */
export function removeCodeBlocks(text: string): string {
  // Remove fenced code blocks (``` or ~~~)
  let result = text.replace(/```[\s\S]*?```/g, '');
  result = result.replace(/~~~[\s\S]*?~~~/g, '');

  // Remove inline code (single backticks)
  result = result.replace(/`[^`]+`/g, '');

  return result;
}

/**
 * Extract prompt text from message parts
 */
export function extractPromptText(
  parts: Array<{ type: string; text?: string; [key: string]: unknown }>
): string {
  return parts
    .filter(p => p.type === 'text' && p.text)
    .map(p => p.text!)
    .join(' ');
}

/**
 * Detect keywords in text and return matches with type info
 */
export function detectKeywordsWithType(
  text: string,
  _agentName?: string
): DetectedKeyword[] {
  const detected: DetectedKeyword[] = [];

  // Check each keyword type
  for (const type of KEYWORD_PRIORITY) {
    const pattern = KEYWORD_PATTERNS[type];
    const match = text.match(pattern);

    if (match && match.index !== undefined) {
      detected.push({
        type,
        keyword: match[0],
        position: match.index
      });
    }
  }

  return detected;
}

/**
 * Check if text contains any magic keyword
 */
export function hasKeyword(text: string): boolean {
  const cleanText = removeCodeBlocks(text);
  return detectKeywordsWithType(cleanText).length > 0;
}

/**
 * Get the highest priority keyword detected
 */
export function getPrimaryKeyword(text: string): DetectedKeyword | null {
  const cleanText = removeCodeBlocks(text);
  const detected = detectKeywordsWithType(cleanText);

  if (detected.length === 0) {
    return null;
  }

  // Return highest priority (first in KEYWORD_PRIORITY order)
  for (const type of KEYWORD_PRIORITY) {
    const match = detected.find(d => d.type === type);
    if (match) {
      return match;
    }
  }

  return detected[0];
}

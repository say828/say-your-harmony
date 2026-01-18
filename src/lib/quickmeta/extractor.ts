/**
 * QuickMeta Extractor - Rule-based pattern extraction
 *
 * Extracts patterns, decisions, and risks from text content
 * using keyword matching and regex patterns.
 *
 * Performance target: < 100ms for typical content (~10KB)
 */

import type {
  QuickPattern,
  QuickDecision,
  QuickRisk,
  ExtractionContext,
  ExtractionResult,
} from '../../types/quickmeta.js';
import type { Phase } from '../../types/pattern.js';

/**
 * Keyword dictionaries for pattern detection
 */
const PATTERN_KEYWORDS: Record<QuickPattern['category'], string[]> = {
  approach: [
    'parallel',
    'concurrent',
    'async',
    'batch',
    'incremental',
    'iterative',
    'recursive',
    'divide and conquer',
    'top-down',
    'bottom-up',
    'lazy',
    'eager',
    'cached',
    'memoized',
    'streaming',
  ],
  'tool-usage': [
    'Task',
    'Read',
    'Write',
    'Grep',
    'Glob',
    'Bash',
    'WebSearch',
    'TodoWrite',
    'parallel tasks',
    'subagent',
    'delegation',
  ],
  decision: [
    'chose',
    'selected',
    'decided',
    'rejected',
    'preferred',
    'because',
    'rationale',
    'reason',
    'tradeoff',
    'vs',
    'alternative',
  ],
  optimization: [
    'performance',
    'faster',
    'efficient',
    'optimized',
    'cached',
    'reduced',
    'improved',
    'simplified',
    'refactored',
    'speedup',
  ],
  'error-recovery': [
    'retry',
    'fallback',
    'error handling',
    'recovery',
    'fix',
    'workaround',
    'mitigation',
    'resolved',
    'debugged',
    'exception',
  ],
};

/**
 * Decision marker patterns (regex)
 */
const DECISION_PATTERNS = [
  /(?:chose|selected|decided on)\s+([^.]+)/gi,
  /(?:using|went with)\s+(\w+(?:\s+\w+)?)\s+(?:because|since|as)/gi,
  /(?:Option|Alternative)\s+([A-Z])[:\s]+([^.]+)/gi,
  /(?:rejected|avoided)\s+([^.]+?)\s+(?:because|due to)/gi,
];

/**
 * Risk indicator patterns
 */
const RISK_PATTERNS: Record<QuickRisk['severity'], RegExp[]> = {
  P0: [
    /\bP0\b/i,
    /\bcritical\b/i,
    /\bblocking\b/i,
    /\bsecurity\s+(?:vulnerability|risk|issue)\b/i,
    /\bdata\s+loss\b/i,
    /\bproduction\s+(?:down|outage)\b/i,
  ],
  P1: [
    /\bP1\b/i,
    /\bhigh\s+(?:priority|risk)\b/i,
    /\bmust\s+fix\s+before\b/i,
    /\bsevere\b/i,
    /\bbreaking\s+change\b/i,
  ],
  P2: [
    /\bP2\b/i,
    /\bmedium\s+(?:priority|risk)\b/i,
    /\bshould\s+(?:fix|address)\b/i,
    /\btech\s+debt\b/i,
  ],
  P3: [
    /\bP3\b/i,
    /\blow\s+(?:priority|risk)\b/i,
    /\bnice\s+to\s+have\b/i,
    /\bminor\s+(?:issue|improvement)\b/i,
  ],
};

/**
 * Extract patterns from content using keyword matching
 * Complexity: O(n * k) where n = content length, k = keyword count
 * Target: < 50ms for typical content
 */
function extractPatterns(content: string, phase: Phase): QuickPattern[] {
  const patterns: QuickPattern[] = [];
  const contentLower = content.toLowerCase();

  for (const [category, keywords] of Object.entries(PATTERN_KEYWORDS)) {
    const foundKeywords: string[] = [];

    for (const keyword of keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    }

    if (foundKeywords.length >= 2) {
      // Confidence based on keyword density
      const confidence = Math.min(foundKeywords.length / 5, 1.0);

      // Generate unique ID
      const id = `${phase}-${category}-${Date.now().toString(36)}`;

      patterns.push({
        id,
        category: category as QuickPattern['category'],
        summary: generatePatternSummary(category, foundKeywords, phase),
        keywords: foundKeywords.slice(0, 5),
        confidence,
      });
    }
  }

  // Sort by confidence and limit to 5
  return patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Generate a brief summary for a detected pattern
 */
function generatePatternSummary(category: string, keywords: string[], phase: Phase): string {
  const keywordStr = keywords.slice(0, 3).join(', ');

  const templates: Record<string, string> = {
    approach: `Used ${keywordStr} approach in ${phase}`,
    'tool-usage': `Heavy use of ${keywordStr}`,
    decision: `Key decisions involving ${keywordStr}`,
    optimization: `Optimized via ${keywordStr}`,
    'error-recovery': `Handled errors with ${keywordStr}`,
  };

  return templates[category] || `Pattern: ${keywordStr}`;
}

/**
 * Extract decisions using regex patterns
 */
function extractDecisions(content: string): QuickDecision[] {
  const decisions: QuickDecision[] = [];
  const seen = new Set<string>();

  for (const pattern of DECISION_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const topic = (match[1] || '').trim().slice(0, 80);

      if (topic && !seen.has(topic.toLowerCase())) {
        seen.add(topic.toLowerCase());

        // Extract surrounding context for rationale
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(content.length, match.index + 200);
        const context = content.slice(contextStart, contextEnd);

        const rationale = extractRationale(context);
        const alternatives = extractAlternatives(context);

        decisions.push({
          topic,
          choice: topic.split(/\s+/).slice(0, 5).join(' '),
          rationale: rationale.slice(0, 100),
          alternatives: alternatives.slice(0, 3),
        });
      }

      if (decisions.length >= 3) break;
    }

    if (decisions.length >= 3) break;
  }

  return decisions;
}

/**
 * Extract rationale from context around a decision
 */
function extractRationale(context: string): string {
  const rationaleMatch = context.match(/(?:because|since|as|due to|reason(?:s)?:?)\s+([^.]+)/i);

  if (rationaleMatch) {
    return rationaleMatch[1].trim();
  }

  return 'Rationale not explicitly stated';
}

/**
 * Extract alternatives mentioned near a decision
 */
function extractAlternatives(context: string): string[] {
  const alternatives: string[] = [];

  const altPatterns = [
    /(?:instead of|rather than|not|rejected)\s+(\w+(?:\s+\w+)?)/gi,
    /(?:alternative|option)[:\s]+(\w+(?:\s+\w+)?)/gi,
  ];

  for (const pattern of altPatterns) {
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(context)) !== null) {
      const alt = match[1].trim();
      if (alt && !alternatives.includes(alt)) {
        alternatives.push(alt.slice(0, 50));
      }
    }
  }

  return alternatives;
}

/**
 * Extract risks from content using severity patterns
 */
function extractRisks(content: string): QuickRisk[] {
  const risks: QuickRisk[] = [];
  const severities: QuickRisk['severity'][] = ['P0', 'P1', 'P2', 'P3'];

  for (const severity of severities) {
    const patterns = RISK_PATTERNS[severity];

    for (const pattern of patterns) {
      const match = content.match(pattern);

      if (match) {
        // Find surrounding context for description
        const index = content.search(pattern);
        const contextStart = Math.max(0, index - 50);
        const contextEnd = Math.min(content.length, index + 150);
        const context = content.slice(contextStart, contextEnd);

        // Extract description from context
        const description = extractRiskDescription(context, match[0]);

        // Check if mitigation is mentioned
        const mitigationMatch = context.match(
          /(?:mitigat|fix|resolv|address|handl)[ed]?\s*(?:by|via|with)?\s*:?\s*([^.]+)/i
        );

        const status = mitigationMatch ? 'mitigated' : 'identified';

        risks.push({
          severity,
          description: description.slice(0, 100),
          status,
          mitigation: mitigationMatch ? mitigationMatch[1].trim().slice(0, 80) : undefined,
        });

        break; // One risk per severity level max
      }
    }

    if (risks.length >= 3) break;
  }

  return risks;
}

/**
 * Extract risk description from surrounding context
 */
function extractRiskDescription(context: string, trigger: string): string {
  // Try to find a sentence containing the trigger
  const sentences = context.split(/[.!?]+/);

  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(trigger.toLowerCase())) {
      return sentence.trim();
    }
  }

  return `Risk indicator: ${trigger}`;
}

/**
 * Generate a one-line summary of the phase
 */
function generateSummary(content: string, phase: Phase, patterns: QuickPattern[]): string {
  const phaseVerbs: Record<Phase, string> = {
    planning: 'Planned',
    design: 'Designed',
    implementation: 'Implemented',
    operation: 'Deployed',
  };

  // Try to extract a summary from explicit markers
  const explicitSummary = content.match(/(?:summary|completed|finished|done):\s*([^.\n]+)/i);

  if (explicitSummary) {
    return explicitSummary[1].trim().slice(0, 150);
  }

  // Generate from patterns
  if (patterns.length > 0) {
    const topPatterns = patterns
      .slice(0, 2)
      .map((p) => p.summary)
      .join('; ');
    return `${phaseVerbs[phase]}: ${topPatterns}`.slice(0, 150);
  }

  return `${phaseVerbs[phase]} ${phase} phase`;
}

/**
 * Main extraction function
 * Target performance: < 100ms
 */
export function extractQuickPatterns(ctx: ExtractionContext): ExtractionResult {
  const startTime = Date.now();

  const patterns = extractPatterns(ctx.content, ctx.phase);
  const decisions = extractDecisions(ctx.content);
  const risks = extractRisks(ctx.content);
  const summary = generateSummary(ctx.content, ctx.phase, patterns);

  const elapsed = Date.now() - startTime;

  // Log if exceeding budget (should not happen)
  if (elapsed > 100) {
    console.warn(`[QuickMeta] Extraction took ${elapsed}ms (budget: 100ms)`);
  }

  return { patterns, decisions, risks, summary };
}

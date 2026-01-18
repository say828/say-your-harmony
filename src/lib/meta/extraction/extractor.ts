/**
 * Extractor - Convert SemanticPhaseMeta to MetaPattern[]
 */

import type { SemanticPhaseMeta } from '../../../types/semantic-meta.js';
import type { MetaPattern, Phase, PatternType } from '../core/schema.js';
import { generatePatternId } from '../core/generator.js';

/**
 * Extract meta patterns from semantic phase meta
 *
 * @param meta - Semantic phase meta
 * @param sessionId - Session ID
 * @returns Array of meta patterns
 */
export function extractPatterns(
  meta: SemanticPhaseMeta,
  sessionId: string
): MetaPattern[] {
  const patterns: MetaPattern[] = [];
  const phase = meta.phase;
  const timestamp = meta.completedAt;

  // Extract sequential dependencies
  for (const dep of meta.semantics.sequentialDeps) {
    patterns.push(
      createPattern({
        phase,
        type: 'sequential-dep',
        content: dep,
        sessionId,
        timestamp,
        data: {
          before: dep.split('→')[0]?.trim() || dep,
          after: phase,
          reasoning: `Required before ${phase} phase`,
        },
      })
    );
  }

  // Extract parallel successes
  if (meta.semantics.parallelSuccesses.length > 0) {
    patterns.push(
      createPattern({
        phase,
        type: 'parallel-success',
        content: `Parallel: ${meta.semantics.parallelSuccesses.join(', ')}`,
        sessionId,
        timestamp,
        data: {
          tasks: meta.semantics.parallelSuccesses,
          speedup: meta.metrics.parallelTasks || 1,
          groupSize: meta.semantics.parallelSuccesses.length,
        },
      })
    );
  }

  // Extract accomplishment
  if (meta.semantics.accomplishment) {
    patterns.push(
      createPattern({
        phase,
        type: 'accomplishment',
        content: meta.semantics.accomplishment,
        sessionId,
        timestamp,
        description: meta.semantics.keyInsight,
      })
    );
  }

  // Extract decisions
  for (const decision of meta.semantics.decisions) {
    patterns.push(
      createPattern({
        phase,
        type: 'decision',
        content: decision.what,
        sessionId,
        timestamp,
        description: decision.why,
        data: {
          what: decision.what,
          why: decision.why,
          alternatives: [], // Not provided in semantic meta
          impact: decision.impact,
        },
      })
    );
  }

  // Extract risks
  for (const risk of meta.semantics.risks) {
    patterns.push(
      createPattern({
        phase,
        type: 'risk',
        content: risk.description,
        sessionId,
        timestamp,
        data: {
          severity: risk.severity,
          status: risk.status,
        },
      })
    );
  }

  // Extract approaches
  for (const approach of meta.semantics.approaches) {
    patterns.push(
      createPattern({
        phase,
        type: 'approach',
        content: approach,
        sessionId,
        timestamp,
        data: {
          methodology: approach,
          context: `Used in ${phase} phase`,
          benefits: [],
        },
      })
    );
  }

  // Extract tool usage
  for (const tool of meta.semantics.toolsUsed) {
    patterns.push(
      createPattern({
        phase,
        type: 'tool-usage',
        content: `${tool} usage in ${phase}`,
        sessionId,
        timestamp,
        data: {
          tool,
          usage: `Used during ${phase} phase`,
          effectiveness: 1.0, // Assume effective if mentioned
        },
      })
    );
  }

  // Extract challenges as anti-patterns
  for (const challenge of meta.semantics.challenges) {
    patterns.push(
      createPattern({
        phase,
        type: 'anti-pattern',
        content: challenge.problem,
        sessionId,
        timestamp,
        description: `Resolution: ${challenge.resolution}`,
      })
    );
  }

  return patterns;
}

/**
 * Create pattern helper
 */
interface CreatePatternOptions {
  phase: Phase;
  type: PatternType;
  content: string;
  sessionId: string;
  timestamp: string;
  description?: string;
  data?: any;
}

function createPattern(options: CreatePatternOptions): MetaPattern {
  const { phase, type, content, sessionId, timestamp, description, data } = options;

  const id = generatePatternId(phase, type, content);

  return {
    id,
    type,
    phase,
    content,
    description,
    frequency: 1, // Initial frequency
    confidence: 0.5, // Initial confidence
    score: 0.5, // Will be updated by evolution
    firstSeen: timestamp,
    lastSeen: timestamp,
    examples: [sessionId],
    decayRate: 0.5,
    data,
  };
}

/**
 * Merge new patterns with existing patterns
 *
 * If pattern already exists (same ID), update frequency and confidence.
 * Otherwise, add as new pattern.
 *
 * @param existingPatterns - Existing patterns
 * @param newPatterns - New patterns from extraction
 * @returns Merged patterns
 */
export function mergePatterns(
  existingPatterns: MetaPattern[],
  newPatterns: MetaPattern[]
): MetaPattern[] {
  const patternMap = new Map<string, MetaPattern>();

  // Add existing patterns
  for (const pattern of existingPatterns) {
    patternMap.set(pattern.id, pattern);
  }

  // Merge new patterns
  for (const newPattern of newPatterns) {
    const existing = patternMap.get(newPattern.id);

    if (existing) {
      // Update existing
      existing.frequency += 1;
      existing.lastSeen = newPattern.lastSeen;

      // Add example if not already present
      if (!existing.examples.includes(newPattern.examples[0])) {
        existing.examples.push(newPattern.examples[0]);
        if (existing.examples.length > 5) {
          existing.examples.shift(); // Keep only 5 most recent
        }
      }

      // Update confidence (simple frequency-based)
      existing.confidence = Math.min(existing.frequency / 10.0, 1.0);
    } else {
      // Add new pattern
      patternMap.set(newPattern.id, newPattern);
    }
  }

  return Array.from(patternMap.values());
}

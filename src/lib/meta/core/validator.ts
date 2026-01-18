/**
 * Schema Validation using Zod
 */

import { z } from 'zod';
import type { MetaPattern, PatternStore } from './schema.js';

// === Schema Definitions ===

const PhaseSchema = z.enum(['planning', 'design', 'implementation', 'operation']);

const PatternTypeSchema = z.enum([
  'sequential-dep',
  'parallel-success',
  'accomplishment',
  'risk',
  'decision',
  'approach',
  'tool-usage',
  'anti-pattern',
]);

const SequentialDepDataSchema = z.object({
  before: z.string(),
  after: z.string(),
  reasoning: z.string(),
});

const ParallelSuccessDataSchema = z.object({
  tasks: z.array(z.string()),
  speedup: z.number(),
  groupSize: z.number(),
});

const RiskDataSchema = z.object({
  severity: z.enum(['P0', 'P1', 'P2', 'P3']),
  mitigation: z.string().optional(),
  status: z.enum(['new', 'mitigated', 'escalated', 'accepted']),
});

const DecisionDataSchema = z.object({
  what: z.string(),
  why: z.string(),
  alternatives: z.array(z.string()),
  impact: z.enum(['high', 'medium', 'low']),
});

const ApproachDataSchema = z.object({
  methodology: z.string(),
  context: z.string(),
  benefits: z.array(z.string()),
});

const ToolUsageDataSchema = z.object({
  tool: z.string(),
  usage: z.string(),
  effectiveness: z.number().min(0).max(1),
});

const PatternDataSchema = z.union([
  SequentialDepDataSchema,
  ParallelSuccessDataSchema,
  RiskDataSchema,
  DecisionDataSchema,
  ApproachDataSchema,
  ToolUsageDataSchema,
  z.record(z.unknown()), // Generic fallback
]);

const MetaPatternSchema = z.object({
  // Identity
  id: z.string(),
  type: PatternTypeSchema,
  phase: PhaseSchema,

  // Content
  content: z.string().min(10).max(200),
  description: z.string().optional(),

  // Metadata
  frequency: z.number().int().min(1),
  confidence: z.number().min(0).max(1),
  score: z.number().min(0).max(1),
  firstSeen: z.string().datetime(),
  lastSeen: z.string().datetime(),
  examples: z.array(z.string()).max(5),

  // Evolution
  embedding: z.array(z.number()).optional(),
  clusterId: z.string().optional(),
  decayRate: z.number().min(0).max(1),

  // Relations
  relatedPatterns: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  // Type-specific data
  data: PatternDataSchema.optional(),
});

const PatternStoreSchema = z.object({
  version: z.number(),
  lastUpdated: z.string().datetime(),
  totalPatterns: z.number().int().min(0),
  patterns: z.array(MetaPatternSchema),
  metadata: z.object({
    totalSessions: z.number().int().min(0),
    oldestPattern: z.string().datetime(),
    newestPattern: z.string().datetime(),
    avgConfidence: z.number().min(0).max(1),
    patternsByPhase: z.record(PhaseSchema, z.number()),
    patternsByType: z.record(PatternTypeSchema, z.number()),
  }),
});

// === Validation Functions ===

/**
 * Validate MetaPattern
 *
 * @param pattern - Pattern to validate
 * @returns Validation result
 */
export function validatePattern(pattern: unknown): {
  valid: boolean;
  errors?: string[];
  data?: MetaPattern;
} {
  try {
    const validated = MetaPatternSchema.parse(pattern);
    return { valid: true, data: validated as MetaPattern };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Validate PatternStore
 *
 * @param store - Store to validate
 * @returns Validation result
 */
export function validatePatternStore(store: unknown): {
  valid: boolean;
  errors?: string[];
  data?: PatternStore;
} {
  try {
    const validated = PatternStoreSchema.parse(store);
    return { valid: true, data: validated as PatternStore };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Safe parse pattern (no throw)
 *
 * @param pattern - Pattern to parse
 * @returns Pattern or null
 */
export function safeParsePattern(pattern: unknown): MetaPattern | null {
  const result = validatePattern(pattern);
  return result.valid ? result.data! : null;
}

/**
 * Safe parse pattern store (no throw)
 *
 * @param store - Store to parse
 * @returns Store or null
 */
export function safeParsePatternStore(store: unknown): PatternStore | null {
  const result = validatePatternStore(store);
  return result.valid ? result.data! : null;
}

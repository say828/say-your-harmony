/**
 * Meta Pattern Core Schema
 *
 * Unified schema for all meta patterns - sequential deps, parallel success,
 * accomplishments, risks, decisions, approaches, tool usage, anti-patterns.
 */

/**
 * Phase in 4-phase workflow
 */
export type Phase = 'planning' | 'design' | 'implementation' | 'operation';

/**
 * Pattern type discriminator
 */
export type PatternType =
  | 'sequential-dep'      // Sequential dependency (must run in order)
  | 'parallel-success'    // Parallel execution success pattern
  | 'accomplishment'      // Achievement pattern
  | 'risk'                // Risk pattern (P0-P3)
  | 'decision'            // Decision with rationale
  | 'approach'            // Approach/methodology pattern
  | 'tool-usage'          // Tool usage pattern
  | 'anti-pattern';       // Anti-pattern (failure mode)

/**
 * Sequential dependency data
 */
export interface SequentialDepData {
  before: string;         // Task that must complete first
  after: string;          // Task that depends on before
  reasoning: string;      // Why sequential order is required
}

/**
 * Parallel success data
 */
export interface ParallelSuccessData {
  tasks: string[];        // Tasks that ran in parallel successfully
  speedup: number;        // Speedup factor achieved (e.g., 4.0 means 4x, unlimited scaling possible)
  groupSize: number;      // Number of parallel tasks
}

/**
 * Risk data
 */
export interface RiskData {
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  mitigation?: string;
  status: 'new' | 'mitigated' | 'escalated' | 'accepted';
}

/**
 * Decision data
 */
export interface DecisionData {
  what: string;           // Decision made
  why: string;            // Rationale
  alternatives: string[]; // Alternatives considered
  impact: 'high' | 'medium' | 'low';
}

/**
 * Approach data
 */
export interface ApproachData {
  methodology: string;    // Approach name
  context: string;        // When to use
  benefits: string[];     // Benefits
}

/**
 * Tool usage data
 */
export interface ToolUsageData {
  tool: string;           // Tool name (Read, Write, Task, etc.)
  usage: string;          // How it was used
  effectiveness: number;  // 0-1 effectiveness score
}

/**
 * Type-specific pattern data
 */
export type PatternData =
  | SequentialDepData
  | ParallelSuccessData
  | RiskData
  | DecisionData
  | ApproachData
  | ToolUsageData
  | Record<string, unknown>;  // Generic fallback

/**
 * MetaPattern - Unified pattern representation
 *
 * All meta information (sequential deps, parallel success, accomplishments,
 * risks, decisions) uses this single unified schema. Pattern type is
 * distinguished by the `type` field.
 */
export interface MetaPattern {
  // === Identity ===
  id: string;                    // Unique: `{phase}:{type}:{hash}`
  type: PatternType;             // Pattern discriminator
  phase: Phase;                  // Phase where pattern occurs

  // === Content ===
  content: string;               // Pattern description (60-200 chars)
  description?: string;          // Optional detailed description

  // === Metadata ===
  frequency: number;             // Number of occurrences
  confidence: number;            // Confidence score [0, 1]
  score: number;                 // Final score (confidence × decay)
  firstSeen: string;             // ISO timestamp
  lastSeen: string;              // ISO timestamp
  examples: string[];            // Session IDs (max 5)

  // === Evolution ===
  embedding?: number[];          // Semantic embedding vector (optional)
  clusterId?: string;            // Cluster membership (optional)
  decayRate: number;             // Decay rate (default 0.5)

  // === Relations ===
  relatedPatterns?: string[];    // Related pattern IDs
  tags?: string[];               // Search tags

  // === Type-Specific Data ===
  data?: PatternData;            // Type-specific additional data
}

/**
 * Cluster of related patterns
 */
export interface Cluster {
  id: string;                    // Cluster ID
  patternIds: string[];          // Member pattern IDs
  centroid?: number[];           // Cluster centroid (embedding space)
  avgConfidence: number;         // Average confidence of members
  size: number;                  // Number of members
}

/**
 * Pattern store - Global storage format
 */
export interface PatternStore {
  version: number;               // Schema version (current: 1)
  lastUpdated: string;           // ISO timestamp
  totalPatterns: number;         // Total pattern count

  patterns: MetaPattern[];       // All patterns

  metadata: {
    totalSessions: number;
    oldestPattern: string;       // ISO timestamp
    newestPattern: string;       // ISO timestamp
    avgConfidence: number;
    patternsByPhase: Record<Phase, number>;
    patternsByType: Record<PatternType, number>;
  };
}

/**
 * Phase index - Fast lookup by phase
 */
export interface PhaseIndex {
  phase: Phase;
  patternIds: string[];          // Pattern IDs in this phase
  lastUpdated: string;           // ISO timestamp
}

/**
 * Session summary - Recent session for debugging
 */
export interface SessionSummary {
  sessionId: string;
  startTime: string;             // ISO timestamp
  endTime: string;               // ISO timestamp
  phases: Phase[];               // Phases completed
  patternIds: string[];          // Patterns generated
  totalPatterns: number;
}

/**
 * Create empty pattern store
 */
export function createEmptyPatternStore(): PatternStore {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    totalPatterns: 0,
    patterns: [],
    metadata: {
      totalSessions: 0,
      oldestPattern: new Date().toISOString(),
      newestPattern: new Date().toISOString(),
      avgConfidence: 0,
      patternsByPhase: {
        planning: 0,
        design: 0,
        implementation: 0,
        operation: 0,
      },
      patternsByType: {
        'sequential-dep': 0,
        'parallel-success': 0,
        'accomplishment': 0,
        'risk': 0,
        'decision': 0,
        'approach': 0,
        'tool-usage': 0,
        'anti-pattern': 0,
      },
    },
  };
}

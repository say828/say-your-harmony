/**
 * Pattern Management Types
 *
 * Unified schema for pattern storage, clustering, and aggregation
 */

export type Phase = 'planning' | 'design' | 'implementation' | 'operation';

/**
 * Pattern - Represents a reusable problem-solving pattern
 */
export interface Pattern {
  // === Identity ===
  id: string;                    // UUID v4
  semanticHash: string;          // SHA-256 hash of normalized content

  // === Classification ===
  phase: Phase;
  clusterId: string | null;      // null = not clustered yet

  // === Content ===
  name: string;                  // Short descriptive name
  problem: string;               // Problem description
  solution: string;              // Solution approach
  learning: string;              // Key takeaway
  tags: string[];                // ['parallel', 'risk-analysis', ...]

  // === Metadata ===
  frequency: number;             // Occurrence count
  successRate: number;           // 0.0 - 1.0
  firstSeen: string;             // ISO 8601 timestamp
  lastSeen: string;              // ISO 8601 timestamp
  sessions: string[];            // ['2026-01-15', '2026-01-17', ...]

  // === Scoring (computed) ===
  decayScore: number;            // Frequency × decay factor × success rate

  // === Relations ===
  relatedPatterns: string[];     // IDs of similar patterns
  supersededBy: string | null;   // ID if this pattern is deprecated

  // === Internal (not serialized to markdown) ===
  embedding?: Map<string, number>;  // TF-IDF embedding for similarity
}

/**
 * Cluster - Group of similar patterns
 */
export interface Cluster {
  id: string;                    // cluster-{uuid}
  phase: Phase;

  // Representative pattern (highest frequency in cluster)
  representativeId: string;

  // All patterns in this cluster
  patternIds: string[];

  // Cluster metadata
  centroid: Record<string, number>;  // Embedding vector (for distance calc)
  coherence: number;                 // 0.0 - 1.0 (how similar are members?)

  // Stats
  totalFrequency: number;        // Sum of all member frequencies
  avgSuccessRate: number;

  created: string;
  updated: string;
}

/**
 * Pattern Storage - Per-phase storage structure
 */
export interface PatternStorage {
  patterns: Pattern[];
  clusters: Cluster[];
  index: Record<string, string>;  // semanticHash -> patternId mapping
}

/**
 * Aggregation Statistics
 */
export interface AggregationStats {
  added: number;
  merged: number;
  updated: number;
  evicted: number;
  totalPatterns: number;
  totalClusters: number;
  avgScore: number;
}

/**
 * Eviction Result
 */
export interface EvictionResult {
  evictedCount: number;
  evictedPatterns: Array<{
    id: string;
    name: string;
    score: number;
    frequency: number;
  }>;
}

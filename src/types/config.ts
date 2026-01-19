/**
 * Pattern Management Configuration Types
 */

import type { Phase } from '../lib/meta/core/schema.js';

export type DecayAlgorithm = 'exponential' | 'linear' | 'hybrid';
export type EvictionStrategy = 'score' | 'lru' | 'hybrid';
export type ClusteringAlgorithm = 'agglomerative' | 'kmeans' | 'dbscan';
export type DeduplicationAlgorithm = 'tfidf' | 'minhash' | 'simple';

/**
 * Capacity Configuration
 */
export interface CapacityConfig {
  maxPatternsPerPhase: Record<Phase, number>;
  maxClustersPerPhase: number;
  maxSessionFiles: number;
}

/**
 * Decay Configuration
 */
export interface DecayConfig {
  algorithm: DecayAlgorithm;
  halfLifeDays: number;
  weights: {
    recency: number;      // 0.0 - 1.0
    frequency: number;    // 0.0 - 1.0
    successRate: number;  // 0.0 - 1.0
  };
}

/**
 * Clustering Configuration
 */
export interface ClusteringConfig {
  enabled: boolean;
  similarityThreshold: number;    // 0.0 - 1.0
  algorithm: ClusteringAlgorithm;
  minClusterSize: number;
  maxClusterSize: number;
  reClusterInterval: string;      // e.g., '7d', '30d'
}

/**
 * Deduplication Configuration
 */
export interface DeduplicationConfig {
  enabled: boolean;
  exactMatchThreshold: number;    // 1.0 for exact match
  fuzzyMatchThreshold: number;    // 0.0 - 1.0 for similarity
  algorithm: DeduplicationAlgorithm;
}

/**
 * Eviction Configuration
 */
export interface EvictionConfig {
  strategy: EvictionStrategy;
  protectHighFrequency: boolean;
  protectThreshold: number;        // Frequency threshold for protection
  protectRecent: boolean;
  protectRecentDays: number;
  protectClusterRepresentatives: boolean;
}

/**
 * Export Configuration
 */
export interface ExportConfig {
  autoGenerateMarkdown: boolean;
  markdownTopN: number;            // Top N patterns per phase
  includeMetrics: boolean;
}

/**
 * Main Pattern Configuration
 */
export interface PatternConfig {
  version: string;
  capacity: CapacityConfig;
  decay: DecayConfig;
  clustering: ClusteringConfig;
  deduplication: DeduplicationConfig;
  eviction: EvictionConfig;
  export: ExportConfig;
}

/**
 * Default configuration factory
 */
export function getDefaultConfig(): PatternConfig {
  return {
    version: '1.0.0',
    capacity: {
      maxPatternsPerPhase: {
        planning: 10000, // Increased for experimental data collection
        design: 10000,   // Increased for experimental data collection
        implementation: 10000, // Increased for experimental data collection
        operation: 10000 // Increased for experimental data collection
      },
      maxClustersPerPhase: 1000, // Increased proportionally
      maxSessionFiles: 10000 // Increased for experimental data collection
    },
    decay: {
      algorithm: 'hybrid',
      halfLifeDays: 90,
      weights: {
        recency: 0.4,
        frequency: 0.4,
        successRate: 0.2
      }
    },
    clustering: {
      enabled: true,
      similarityThreshold: 0.75,
      algorithm: 'agglomerative',
      minClusterSize: 2,
      maxClusterSize: 20,
      reClusterInterval: '7d'
    },
    deduplication: {
      enabled: true,
      exactMatchThreshold: 1.0,
      fuzzyMatchThreshold: 0.90,
      algorithm: 'tfidf'
    },
    eviction: {
      strategy: 'score',
      protectHighFrequency: true,
      protectThreshold: 5,
      protectRecent: true,
      protectRecentDays: 7,
      protectClusterRepresentatives: true
    },
    export: {
      autoGenerateMarkdown: true,
      markdownTopN: 20,
      includeMetrics: true
    }
  };
}

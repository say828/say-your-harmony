/**
 * Pattern Evictor - Smart deletion with protection rules
 *
 * Evicts low-scoring patterns while protecting important ones
 */

import type { Pattern, Phase, EvictionResult } from '../types/pattern.js';
import type { PatternConfig } from '../types/config.js';
import { loadPatterns, savePatterns, loadClusters } from './storage.js';
import { computeDecayScore } from './decay-scorer.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export class PatternEvictor {
  /**
   * Evict patterns if count exceeds maximum for a phase
   */
  async evictIfNeeded(phase: Phase, config: PatternConfig): Promise<EvictionResult> {
    const maxPatterns = config.capacity.maxPatternsPerPhase[phase];
    const patterns = await loadPatterns(phase);

    if (patterns.length <= maxPatterns) {
      return {
        evictedCount: 0,
        evictedPatterns: []
      };
    }

    // Compute scores for all patterns
    for (const p of patterns) {
      p.decayScore = computeDecayScore(p, config);
    }

    // Mark protected patterns
    const protectedSet = await this.markProtected(patterns, phase, config);

    // Find eviction candidates
    const candidates = patterns.filter(p => !protectedSet.has(p.id));

    // Sort by score (ascending - lowest first)
    candidates.sort((a, b) => a.decayScore - b.decayScore);

    // Calculate how many to evict
    const numToEvict = patterns.length - maxPatterns;
    const toEvict = candidates.slice(0, numToEvict);

    // Keep patterns not in eviction list
    const kept = patterns.filter(p => !toEvict.some(e => e.id === p.id));

    // Save updated patterns
    await savePatterns(phase, kept);

    // Return eviction result
    return {
      evictedCount: toEvict.length,
      evictedPatterns: toEvict.map(p => ({
        id: p.id,
        name: p.name,
        score: p.decayScore,
        frequency: p.frequency
      }))
    };
  }

  /**
   * Mark patterns that should be protected from eviction
   */
  private async markProtected(
    patterns: Pattern[],
    phase: Phase,
    config: PatternConfig
  ): Promise<Set<string>> {
    const protectedSet = new Set<string>();
    const clusters = await loadClusters(phase);

    for (const p of patterns) {
      // Rule 1: High frequency protection
      if (config.eviction.protectHighFrequency && p.frequency >= config.eviction.protectThreshold) {
        protectedSet.add(p.id);
        continue;
      }

      // Rule 2: Cluster representative protection
      if (config.eviction.protectClusterRepresentatives && this.isClusterRepresentative(p, clusters)) {
        protectedSet.add(p.id);
        continue;
      }

      // Rule 3: Recent pattern protection
      if (config.eviction.protectRecent) {
        const daysSinceLastSeen = this.getDaysSince(p.lastSeen);
        if (daysSinceLastSeen < config.eviction.protectRecentDays) {
          protectedSet.add(p.id);
          continue;
        }
      }

      // Rule 4: Perfect success + moderate frequency
      if (p.successRate === 1.0 && p.frequency >= 3) {
        protectedSet.add(p.id);
        continue;
      }
    }

    return protectedSet;
  }

  /**
   * Check if pattern is a cluster representative
   */
  private isClusterRepresentative(pattern: Pattern, clusters: any[]): boolean {
    if (!pattern.clusterId) {
      return false;
    }

    const cluster = clusters.find(c => c.id === pattern.clusterId);
    return cluster?.representativeId === pattern.id;
  }

  /**
   * Get days since a timestamp
   */
  private getDaysSince(isoTimestamp: string): number {
    const now = Date.now();
    const then = new Date(isoTimestamp).getTime();
    return (now - then) / MS_PER_DAY;
  }
}

/**
 * Export singleton instance
 */
export const patternEvictor = new PatternEvictor();

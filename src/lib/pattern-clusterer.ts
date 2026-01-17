/**
 * Pattern Clusterer - Hierarchical Agglomerative Clustering
 *
 * Groups similar patterns together to reduce duplication
 */

import { randomUUID } from 'crypto';
import type { Pattern, Cluster, Phase } from '../types/pattern.js';
import type { PatternConfig } from '../types/config.js';
import { semanticHasher } from './semantic-hasher.js';
import { loadPatterns, savePatterns, loadClusters, saveClusters } from './storage.js';

export class PatternClusterer {
  /**
   * Cluster patterns for a given phase
   */
  async clusterPatterns(phase: Phase, config: PatternConfig): Promise<Cluster[]> {
    const patterns = await loadPatterns(phase);

    if (patterns.length === 0) {
      return [];
    }

    // Update vocabulary for TF-IDF
    semanticHasher.updateVocabulary(patterns);

    // Compute embeddings for all patterns
    const embeddings = new Map<string, Map<string, number>>();
    for (const p of patterns) {
      const emb = semanticHasher.computeEmbedding(p);
      embeddings.set(p.id, emb);
      p.embedding = emb;  // Store for later use
    }

    // Initialize: each pattern is its own cluster
    const clusters: Cluster[] = patterns.map(p => {
      const emb = embeddings.get(p.id)!;
      return {
        id: `cluster-${randomUUID()}`,
        phase,
        representativeId: p.id,
        patternIds: [p.id],
        centroid: Object.fromEntries(emb),
        coherence: 1.0,
        totalFrequency: p.frequency,
        avgSuccessRate: p.successRate,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
    });

    // Iteratively merge most similar clusters
    while (true) {
      const [cluster1, cluster2, similarity] = this.findMostSimilar(clusters);

      if (similarity < config.clustering.similarityThreshold) {
        break;  // No more similar clusters
      }

      // Check max cluster size
      if (cluster1.patternIds.length + cluster2.patternIds.length > config.clustering.maxClusterSize) {
        break;  // Would exceed max size
      }

      // Merge cluster2 into cluster1
      this.mergeClusters(cluster1, cluster2, patterns);

      // Remove cluster2
      clusters.splice(clusters.indexOf(cluster2), 1);
    }

    // Filter out single-pattern clusters if minClusterSize > 1
    const finalClusters = clusters.filter(
      c => c.patternIds.length >= config.clustering.minClusterSize
    );

    // Update pattern cluster assignments
    for (const cluster of finalClusters) {
      for (const patternId of cluster.patternIds) {
        const pattern = patterns.find(p => p.id === patternId);
        if (pattern) {
          pattern.clusterId = cluster.id;
        }
      }
    }

    // Save updated patterns and clusters
    await savePatterns(phase, patterns);
    await saveClusters(phase, finalClusters);

    return finalClusters;
  }

  /**
   * Find the two most similar clusters
   */
  private findMostSimilar(clusters: Cluster[]): [Cluster, Cluster, number] {
    let maxSim = -1;
    let best: [Cluster, Cluster] = [clusters[0], clusters[0]];

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const sim = this.clusterSimilarity(clusters[i], clusters[j]);
        if (sim > maxSim) {
          maxSim = sim;
          best = [clusters[i], clusters[j]];
        }
      }
    }

    return [...best, maxSim];
  }

  /**
   * Compute similarity between two clusters (centroid-based)
   */
  private clusterSimilarity(c1: Cluster, c2: Cluster): number {
    const emb1 = new Map(Object.entries(c1.centroid));
    const emb2 = new Map(Object.entries(c2.centroid));
    return semanticHasher.cosineSimilarity(emb1, emb2);
  }

  /**
   * Merge cluster2 into cluster1
   */
  private mergeClusters(c1: Cluster, c2: Cluster, patterns: Pattern[]): void {
    // Merge pattern IDs
    c1.patternIds.push(...c2.patternIds);

    // Recompute representative (highest frequency)
    const allPatterns = c1.patternIds
      .map(id => patterns.find(p => p.id === id))
      .filter(p => p !== undefined) as Pattern[];

    allPatterns.sort((a, b) => b.frequency - a.frequency);
    c1.representativeId = allPatterns[0].id;

    // Update stats
    c1.totalFrequency = allPatterns.reduce((sum, p) => sum + p.frequency, 0);
    c1.avgSuccessRate = allPatterns.reduce((sum, p) => sum + p.successRate, 0) / allPatterns.length;

    // Recompute centroid (average of all pattern embeddings)
    c1.centroid = this.computeCentroid(allPatterns);

    // Update coherence (average pairwise similarity)
    c1.coherence = this.computeCoherence(allPatterns);

    c1.updated = new Date().toISOString();
  }

  /**
   * Compute centroid as average of all pattern embeddings
   */
  private computeCentroid(patterns: Pattern[]): Record<string, number> {
    const centroid = new Map<string, number>();

    for (const p of patterns) {
      const emb = p.embedding || semanticHasher.computeEmbedding(p);
      for (const [term, weight] of emb) {
        centroid.set(term, (centroid.get(term) || 0) + weight);
      }
    }

    // Average
    for (const [term, sum] of centroid) {
      centroid.set(term, sum / patterns.length);
    }

    return Object.fromEntries(centroid);
  }

  /**
   * Compute coherence (average pairwise similarity within cluster)
   */
  private computeCoherence(patterns: Pattern[]): number {
    if (patterns.length < 2) {
      return 1.0;
    }

    let totalSim = 0;
    let count = 0;

    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const emb1 = patterns[i].embedding || semanticHasher.computeEmbedding(patterns[i]);
        const emb2 = patterns[j].embedding || semanticHasher.computeEmbedding(patterns[j]);
        totalSim += semanticHasher.cosineSimilarity(emb1, emb2);
        count++;
      }
    }

    return totalSim / count;
  }
}

/**
 * Export singleton instance
 */
export const patternClusterer = new PatternClusterer();

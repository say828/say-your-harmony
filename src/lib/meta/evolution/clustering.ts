/**
 * Clustering Algorithm - Agglomerative clustering with cosine similarity
 *
 * Groups similar patterns together using hierarchical clustering.
 * Threshold: 0.75 (strict similarity requirement)
 */

import type { MetaPattern, Cluster } from '../core/schema.js';
import { cosineSimilarity } from '../extraction/enricher.js';
import { generateClusterId } from '../core/generator.js';

/**
 * Cluster patterns using agglomerative clustering
 *
 * @param patterns - Patterns to cluster
 * @param threshold - Similarity threshold (default 0.75)
 * @returns Clusters
 */
export function clusterPatterns(
  patterns: MetaPattern[],
  threshold: number = 0.75
): Cluster[] {
  // Only cluster patterns with embeddings
  const patternsWithEmbeddings = patterns.filter((p) => p.embedding && p.embedding.length > 0);

  if (patternsWithEmbeddings.length === 0) {
    return [];
  }

  const clusters: Cluster[] = [];
  const patternIds = patternsWithEmbeddings.map((p) => p.id);

  // Assign each pattern to a cluster
  for (let i = 0; i < patternsWithEmbeddings.length; i++) {
    const pattern = patternsWithEmbeddings[i];
    let assigned = false;

    // Try to assign to existing cluster
    for (const cluster of clusters) {
      // Calculate average similarity to cluster members
      const similarities = cluster.patternIds.map((memberId) => {
        const member = patternsWithEmbeddings.find((p) => p.id === memberId);
        if (!member || !member.embedding || !pattern.embedding) return 0;
        return cosineSimilarity(pattern.embedding, member.embedding);
      });

      const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;

      if (avgSimilarity >= threshold) {
        cluster.patternIds.push(pattern.id);
        cluster.size = cluster.patternIds.length;
        assigned = true;
        break;
      }
    }

    // Create new cluster if not assigned
    if (!assigned) {
      clusters.push({
        id: generateClusterId([pattern.id]),
        patternIds: [pattern.id],
        avgConfidence: pattern.confidence,
        size: 1,
      });
    }
  }

  // Update cluster metadata
  for (const cluster of clusters) {
    updateClusterMetadata(cluster, patternsWithEmbeddings);
  }

  return clusters;
}

/**
 * Update cluster metadata (centroid, avg confidence)
 *
 * @param cluster - Cluster to update
 * @param patterns - All patterns
 */
function updateClusterMetadata(cluster: Cluster, patterns: MetaPattern[]): void {
  const members = cluster.patternIds
    .map((id) => patterns.find((p) => p.id === id))
    .filter((p) => p) as MetaPattern[];

  if (members.length === 0) return;

  // Calculate average confidence
  cluster.avgConfidence = members.reduce((sum, p) => sum + p.confidence, 0) / members.length;

  // Calculate centroid (average of all embeddings)
  const membersWithEmbeddings = members.filter((p) => p.embedding && p.embedding.length > 0);
  if (membersWithEmbeddings.length > 0 && membersWithEmbeddings[0].embedding) {
    const dimensions = membersWithEmbeddings[0].embedding.length;
    const centroid = new Array(dimensions).fill(0);

    for (const member of membersWithEmbeddings) {
      if (!member.embedding) continue;
      for (let i = 0; i < dimensions; i++) {
        centroid[i] += member.embedding[i];
      }
    }

    // Average
    for (let i = 0; i < dimensions; i++) {
      centroid[i] /= membersWithEmbeddings.length;
    }

    cluster.centroid = centroid;
  }

  // Regenerate cluster ID based on current members
  cluster.id = generateClusterId(cluster.patternIds.sort());
}

/**
 * Assign cluster IDs to patterns
 *
 * @param patterns - Patterns to update
 * @param clusters - Clusters
 * @returns Updated patterns with cluster IDs
 */
export function assignClusterIds(patterns: MetaPattern[], clusters: Cluster[]): MetaPattern[] {
  const clusterMap = new Map<string, string>();

  for (const cluster of clusters) {
    for (const patternId of cluster.patternIds) {
      clusterMap.set(patternId, cluster.id);
    }
  }

  return patterns.map((pattern) => ({
    ...pattern,
    clusterId: clusterMap.get(pattern.id),
  }));
}

/**
 * Find patterns in same cluster
 *
 * @param patternId - Pattern ID
 * @param clusters - Clusters
 * @returns Related pattern IDs
 */
export function findRelatedPatterns(patternId: string, clusters: Cluster[]): string[] {
  for (const cluster of clusters) {
    if (cluster.patternIds.includes(patternId)) {
      return cluster.patternIds.filter((id) => id !== patternId);
    }
  }
  return [];
}

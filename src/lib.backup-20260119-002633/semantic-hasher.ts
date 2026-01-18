/**
 * Semantic Hasher - TF-IDF + Cosine Similarity
 *
 * Provides fast duplicate detection and semantic similarity scoring
 */

import crypto from 'crypto';
import type { Pattern } from '../types/pattern.js';

/**
 * Stop words to exclude from semantic analysis
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'can', 'could', 'may', 'might', 'must', 'shall', 'this', 'that', 'these',
  'those', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who',
  'when', 'where', 'why', 'how'
]);

export class SemanticHasher {
  private vocabulary: Map<string, number> = new Map();  // term -> IDF
  private documentCount = 0;

  /**
   * Compute semantic hash for exact duplicate detection
   */
  computeSemanticHash(pattern: Pattern): string {
    const terms = this.extractKeyTerms(pattern);
    const canonical = terms.sort().join('|');
    return crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 16);
  }

  /**
   * Compute TF-IDF embedding for similarity calculation
   */
  computeEmbedding(pattern: Pattern): Map<string, number> {
    const text = `${pattern.problem} ${pattern.solution}`;
    const words = this.tokenize(text);
    const termFreq = new Map<string, number>();

    // Count term frequency
    for (const word of words) {
      termFreq.set(word, (termFreq.get(word) || 0) + 1);
    }

    // TF-IDF weighting
    const embedding = new Map<string, number>();
    for (const [term, tf] of termFreq) {
      const idf = this.vocabulary.get(term) || 0;
      embedding.set(term, tf * idf);
    }

    return embedding;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(emb1: Map<string, number>, emb2: Map<string, number>): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    // Compute dot product and norm1
    for (const [term, val1] of emb1) {
      const val2 = emb2.get(term) || 0;
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
    }

    // Compute norm2
    for (const val2 of emb2.values()) {
      norm2 += val2 * val2;
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Update vocabulary with IDF values from a set of patterns
   */
  updateVocabulary(patterns: Pattern[]): void {
    this.documentCount = patterns.length;
    const docFreq = new Map<string, number>();

    // Count document frequency
    for (const pattern of patterns) {
      const text = `${pattern.problem} ${pattern.solution}`;
      const words = new Set(this.tokenize(text));
      for (const word of words) {
        docFreq.set(word, (docFreq.get(word) || 0) + 1);
      }
    }

    // Calculate IDF = log(N / df)
    this.vocabulary.clear();
    for (const [term, df] of docFreq) {
      this.vocabulary.set(term, Math.log(this.documentCount / df));
    }
  }

  /**
   * Extract key terms for semantic hashing
   */
  private extractKeyTerms(pattern: Pattern): string[] {
    const text = `${pattern.problem} ${pattern.solution}`;
    const words = this.tokenize(text);

    // Remove stop words
    const filtered = words.filter(w => !STOP_WORDS.has(w) && w.length > 2);

    // Score by TF-IDF
    const termCounts = new Map<string, number>();
    for (const word of filtered) {
      termCounts.set(word, (termCounts.get(word) || 0) + 1);
    }

    const scored = Array.from(termCounts.entries()).map(([word, count]) => ({
      word,
      score: (this.vocabulary.get(word) || 1) * count
    }));

    // Sort by score (descending) and take top 10
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map(x => x.word);
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with space
      .split(/\s+/)
      .filter(w => w.length > 0);
  }
}

/**
 * Singleton instance for global use
 */
export const semanticHasher = new SemanticHasher();

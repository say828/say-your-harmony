/**
 * Pattern Aggregator - Main orchestration for pattern management
 *
 * Coordinates all aspects of pattern aggregation:
 * - Extraction from session meta-analyses
 * - Deduplication via semantic hashing
 * - Clustering
 * - Decay scoring
 * - Eviction
 * - Markdown generation
 */

import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { Pattern, Phase, AggregationStats } from '../types/pattern.js';
import { configManager } from './config-manager.js';
import { semanticHasher } from './semantic-hasher.js';
import { recomputeScores } from './decay-scorer.js';
import { patternClusterer } from './pattern-clusterer.js';
import { patternEvictor } from './pattern-evictor.js';
import {
  loadPatterns,
  savePatterns,
  loadIndex,
  saveIndex,
  loadAllPatterns,
  listSessionFiles,
  deleteFile,
  getFileModTime
} from './storage.js';

export class PatternAggregator {
  /**
   * Main aggregation entry point
   */
  async aggregate(sessionMetaPath: string): Promise<AggregationStats> {
    console.log('🚀 Starting pattern aggregation...\n');

    const config = await configManager.load();
    const stats: AggregationStats = {
      added: 0,
      merged: 0,
      updated: 0,
      evicted: 0,
      totalPatterns: 0,
      totalClusters: 0,
      avgScore: 0
    };

    // === Step 1: Extract patterns from new session ===
    console.log('[1/7] Extracting patterns from session...');
    const newPatterns = await this.extractPatternsFromSession(sessionMetaPath);
    console.log(`  ✓ Found ${newPatterns.length} patterns\n`);

    // === Step 2: Process each pattern by phase ===
    console.log('[2/7] Processing patterns by phase...');

    for (const pattern of newPatterns) {
      const result = await this.processPattern(pattern, config);
      stats[result]++;
    }

    console.log(`  ✓ Added: ${stats.added}, Merged: ${stats.merged}, Updated: ${stats.updated}\n`);

    // === Step 3: Re-cluster patterns ===
    if (config.clustering.enabled) {
      console.log('[3/7] Re-clustering patterns...');
      const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];

      for (const phase of phases) {
        const clusters = await patternClusterer.clusterPatterns(phase, config);
        console.log(`  ✓ ${phase}: ${clusters.length} clusters`);
        stats.totalClusters += clusters.length;
      }
      console.log();
    } else {
      console.log('[3/7] Clustering disabled, skipping...\n');
    }

    // === Step 4: Compute decay scores ===
    console.log('[4/7] Computing decay scores...');
    await this.recomputeAllScores(config);
    console.log('  ✓ All scores updated\n');

    // === Step 5: Evict low-score patterns ===
    console.log('[5/7] Evicting low-score patterns...');
    const evictionResults: Record<Phase, number> = {
      planning: 0,
      design: 0,
      implementation: 0,
      operation: 0
    };

    for (const phase of Object.keys(evictionResults) as Phase[]) {
      const result = await patternEvictor.evictIfNeeded(phase, config);
      evictionResults[phase] = result.evictedCount;
      stats.evicted += result.evictedCount;

      if (result.evictedCount > 0) {
        console.log(`  ${phase}: Evicted ${result.evictedCount} patterns`);
        for (const p of result.evictedPatterns.slice(0, 3)) {
          console.log(`    - ${p.name} (score: ${p.score.toFixed(2)}, freq: ${p.frequency})`);
        }
      }
    }
    console.log();

    // === Step 6: Generate PATTERNS.md ===
    if (config.export.autoGenerateMarkdown) {
      console.log('[6/7] Generating PATTERNS.md...');
      await this.generateMarkdownSummary(config);
      console.log('  ✓ PATTERNS.md updated\n');
    } else {
      console.log('[6/7] Markdown generation disabled, skipping...\n');
    }

    // === Step 7: Cleanup old sessions ===
    console.log('[7/7] Cleaning up old session files...');
    await this.cleanupOldSessions(config);
    console.log(`  ✓ Keeping most recent ${config.capacity.maxSessionFiles} sessions\n`);

    // === Calculate final stats ===
    const allPatterns = await loadAllPatterns();
    stats.totalPatterns = allPatterns.length;
    stats.avgScore = allPatterns.reduce((sum, p) => sum + p.decayScore, 0) / allPatterns.length;

    console.log('✅ Aggregation complete!\n');
    await this.printSummary(stats);

    return stats;
  }

  /**
   * Extract patterns from a session meta-analysis file
   */
  private async extractPatternsFromSession(sessionPath: string): Promise<Pattern[]> {
    const content = await fs.readFile(sessionPath, 'utf-8');
    const patterns: Pattern[] = [];

    // Look for "Problem-Solving Patterns" section (flexible matching)
    const patternSectionMatch = content.match(/##\s+\d*\.?\s*Problem-Solving Patterns([\s\S]*?)(?=\n##\s+\d*\.?\s+|$)/i);

    if (!patternSectionMatch) {
      return patterns;
    }

    const patternSection = patternSectionMatch[1];

    // Split by ### Pattern
    const patternBlocks = patternSection.split(/\n###\s+Pattern\s+\d+:\s+/i).slice(1); // Skip first empty split

    for (const block of patternBlocks) {
      // Extract name (first line)
      const lines = block.split('\n');
      const name = lines[0].trim();

      // Extract Problem, Solution, Learning using regex on the block
      const problemMatch = block.match(/\*\*Problem\*\*:\s*(.+?)(?=\n\*\*Solution\*\*:)/is);
      const solutionMatch = block.match(/\*\*Solution\*\*:\s*(.+?)(?=\n\*\*Learning\*\*:)/is);
      const learningMatch = block.match(/\*\*Learning\*\*:\s*(.+?)(?=\n\*\*Reuse\*\*:|\n---|\n###|$)/is);

      if (!problemMatch || !solutionMatch || !learningMatch) {
        continue; // Skip malformed patterns
      }

      const problem = problemMatch[1].trim();
      const solution = solutionMatch[1].trim();
      const learning = learningMatch[1].trim();

      // Determine phase from content
      const phase = this.inferPhase(problem + solution);

      patterns.push({
        id: randomUUID(),
        semanticHash: '',  // Will be computed in processPattern
        phase,
        clusterId: null,
        name,
        problem,
        solution,
        learning,
        tags: [],
        frequency: 1,
        successRate: 1.0,  // Assume success until proven otherwise
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        sessions: [this.extractSessionId(sessionPath)],
        decayScore: 0,
        relatedPatterns: [],
        supersededBy: null
      });
    }

    return patterns;
  }

  /**
   * Process a single pattern (deduplicate and add/merge)
   */
  private async processPattern(pattern: Pattern, config: any): Promise<'added' | 'merged' | 'updated'> {
    const phase = pattern.phase;

    // Load existing patterns and index
    const existing = await loadPatterns(phase);
    const index = await loadIndex(phase);

    // Update vocabulary for semantic hashing
    if (existing.length > 0) {
      semanticHasher.updateVocabulary(existing);
    }

    // Compute semantic hash
    const hash = semanticHasher.computeSemanticHash(pattern);
    pattern.semanticHash = hash;

    // === Fast path: Exact duplicate via hash ===
    if (index.has(hash)) {
      const existingId = index.get(hash)!;
      const existingPattern = existing.find(p => p.id === existingId);

      if (existingPattern) {
        existingPattern.frequency++;
        existingPattern.lastSeen = pattern.lastSeen;
        existingPattern.sessions.push(...pattern.sessions);

        await savePatterns(phase, existing);
        return 'merged';
      }
    }

    // === Slow path: Fuzzy duplicate via similarity ===
    const embedding = semanticHasher.computeEmbedding(pattern);
    pattern.embedding = embedding;

    for (const p of existing) {
      if (!p.embedding) {
        p.embedding = semanticHasher.computeEmbedding(p);
      }

      const similarity = semanticHasher.cosineSimilarity(embedding, p.embedding);

      if (similarity >= config.deduplication.fuzzyMatchThreshold) {
        p.frequency++;
        p.lastSeen = pattern.lastSeen;
        p.sessions.push(...pattern.sessions);

        await savePatterns(phase, existing);
        return 'updated';
      }
    }

    // === New pattern: Add to storage ===
    existing.push(pattern);
    index.set(hash, pattern.id);

    await savePatterns(phase, existing);
    await saveIndex(phase, index);

    return 'added';
  }

  /**
   * Recompute all decay scores across all phases
   */
  private async recomputeAllScores(config: any): Promise<void> {
    const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];

    for (const phase of phases) {
      const patterns = await loadPatterns(phase);
      recomputeScores(patterns, config);
      await savePatterns(phase, patterns);
    }
  }

  /**
   * Generate human-readable PATTERNS.md
   */
  private async generateMarkdownSummary(config: any): Promise<void> {
    const allPatterns = await loadAllPatterns();

    // Sort by decay score
    allPatterns.sort((a, b) => b.decayScore - a.decayScore);

    // Group by phase and take top N per phase
    const topN = config.export.markdownTopN;
    const byPhase: Record<Phase, Pattern[]> = {
      planning: allPatterns.filter(p => p.phase === 'planning').slice(0, topN),
      design: allPatterns.filter(p => p.phase === 'design').slice(0, topN),
      implementation: allPatterns.filter(p => p.phase === 'implementation').slice(0, topN),
      operation: allPatterns.filter(p => p.phase === 'operation').slice(0, topN)
    };

    // Generate markdown
    let md = `# Master Patterns Library\n\n`;
    md += `**Generated**: ${new Date().toISOString()}\n`;
    md += `**Total patterns**: ${allPatterns.length}\n`;
    md += `**Top patterns per phase**: ${topN}\n\n`;
    md += `---\n\n`;

    for (const [phase, patterns] of Object.entries(byPhase) as [Phase, Pattern[]][]) {
      md += `## ${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase\n\n`;

      for (let i = 0; i < patterns.length; i++) {
        const p = patterns[i];
        md += `### ${i + 1}. ${p.name} [${p.frequency}x]\n\n`;
        md += `**Problem**: ${p.problem}\n\n`;
        md += `**Solution**: ${p.solution}\n\n`;
        md += `**Learning**: ${p.learning}\n\n`;
        md += `**Stats**: Freq=${p.frequency}, Success=${(p.successRate * 100).toFixed(0)}%, Score=${p.decayScore.toFixed(2)}\n\n`;
        md += `**Sessions**: ${p.sessions.slice(-3).join(', ')}${p.sessions.length > 3 ? ' ...' : ''}\n\n`;
        md += `---\n\n`;
      }
    }

    await fs.writeFile(path.join(process.cwd(), 'docs/meta/PATTERNS.md'), md, 'utf-8');
  }

  /**
   * Clean up old session files (keep only max N)
   */
  private async cleanupOldSessions(config: any): Promise<void> {
    const sessionFiles = await listSessionFiles();

    if (sessionFiles.length <= config.capacity.maxSessionFiles) {
      return;
    }

    // Sort by modification time (oldest first)
    const sorted = await Promise.all(
      sessionFiles.map(async f => ({
        path: f,
        mtime: await getFileModTime(f)
      }))
    );

    sorted.sort((a, b) => a.mtime - b.mtime);

    // Delete oldest files
    const toDelete = sorted.slice(0, sorted.length - config.capacity.maxSessionFiles);

    for (const { path: filePath } of toDelete) {
      await deleteFile(filePath);
      console.log(`  Deleted: ${path.basename(filePath)}`);
    }
  }

  /**
   * Print summary statistics
   */
  private async printSummary(stats: AggregationStats): Promise<void> {
    console.log('📊 Summary Statistics\n');
    console.log('| Metric           | Value |');
    console.log('|------------------|-------|');
    console.log(`| Patterns added   | ${stats.added.toString().padStart(5)} |`);
    console.log(`| Patterns merged  | ${stats.merged.toString().padStart(5)} |`);
    console.log(`| Patterns updated | ${stats.updated.toString().padStart(5)} |`);
    console.log(`| Patterns evicted | ${stats.evicted.toString().padStart(5)} |`);
    console.log(`| Total patterns   | ${stats.totalPatterns.toString().padStart(5)} |`);
    console.log(`| Total clusters   | ${stats.totalClusters.toString().padStart(5)} |`);
    console.log(`| Average score    | ${stats.avgScore.toFixed(2).padStart(5)} |`);
    console.log();
  }

  /**
   * Infer phase from pattern content
   */
  private inferPhase(text: string): Phase {
    const lower = text.toLowerCase();

    if (lower.includes('plan') || lower.includes('requirement') || lower.includes('research')) {
      return 'planning';
    }
    if (lower.includes('design') || lower.includes('architect') || lower.includes('decision')) {
      return 'design';
    }
    if (lower.includes('implement') || lower.includes('code') || lower.includes('test')) {
      return 'implementation';
    }
    if (lower.includes('deploy') || lower.includes('operation') || lower.includes('monitor')) {
      return 'operation';
    }

    // Default to implementation
    return 'implementation';
  }

  /**
   * Extract session ID from file path
   */
  private extractSessionId(filePath: string): string {
    const filename = path.basename(filePath, '.md');
    const match = filename.match(/session-(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : new Date().toISOString().split('T')[0];
  }
}

/**
 * Export singleton instance
 */
export const patternAggregator = new PatternAggregator();

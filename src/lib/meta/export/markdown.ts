/**
 * PATTERNS.md Generation - Human-readable pattern library
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { MetaPattern, Phase, PatternType } from '../core/schema.js';
import { loadAllPatterns } from '../core/storage.js';

const PATTERNS_MD_PATH = path.join(os.homedir(), '.claude', 'meta', 'PATTERNS.md');

/**
 * Generate PATTERNS.md from all patterns
 */
export async function generatePatternsMd(): Promise<void> {
  const patterns = await loadAllPatterns();
  const content = formatPatternsMd(patterns);

  await fs.mkdir(path.dirname(PATTERNS_MD_PATH), { recursive: true });
  await fs.writeFile(PATTERNS_MD_PATH, content, 'utf-8');
}

/**
 * Format patterns as markdown
 */
function formatPatternsMd(patterns: MetaPattern[]): string {
  const lines: string[] = [];

  // Header
  lines.push('# Meta-Analysis Pattern Library');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push(`**Total Patterns**: ${patterns.length}`);
  lines.push('');

  // Quick Reference (top 10)
  lines.push('## Quick Reference (Top 10 by Score)');
  lines.push('');
  const top10 = [...patterns].sort((a, b) => b.score - a.score).slice(0, 10);
  for (let i = 0; i < top10.length; i++) {
    const p = top10[i];
    lines.push(
      `${i + 1}. [${p.phase}] ${p.content} (${p.frequency}x, confidence: ${(p.confidence * 100).toFixed(0)}%)`
    );
  }
  lines.push('');

  // Phase-by-phase breakdown
  const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];
  for (const phase of phases) {
    lines.push(`## ${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase Patterns`);
    lines.push('');

    const phasePatterns = patterns.filter((p) => p.phase === phase);
    const byType = groupByType(phasePatterns);

    for (const [type, typePatterns] of Object.entries(byType)) {
      if (typePatterns.length === 0) continue;

      lines.push(`### ${formatType(type as PatternType)}`);
      lines.push('');

      // Show top 20 per type
      const sorted = typePatterns.sort((a, b) => b.score - a.score).slice(0, 20);
      for (const p of sorted) {
        lines.push(`- **${p.content}**`);
        lines.push(`  - Frequency: ${p.frequency}x`);
        lines.push(`  - Confidence: ${(p.confidence * 100).toFixed(0)}%`);
        lines.push(`  - Last seen: ${formatDate(p.lastSeen)}`);
        if (p.description) {
          lines.push(`  - ${p.description}`);
        }
        lines.push('');
      }
    }
  }

  // Anti-patterns section
  const antiPatterns = patterns.filter((p) => p.type === 'anti-pattern');
  if (antiPatterns.length > 0) {
    lines.push('## Anti-Patterns to Avoid');
    lines.push('');
    for (const p of antiPatterns) {
      lines.push(`- **${p.content}** (${p.frequency}x occurrences)`);
      if (p.description) {
        lines.push(`  - ${p.description}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function groupByType(patterns: MetaPattern[]): Record<string, MetaPattern[]> {
  const groups: Record<string, MetaPattern[]> = {};
  for (const p of patterns) {
    if (!groups[p.type]) groups[p.type] = [];
    groups[p.type].push(p);
  }
  return groups;
}

function formatType(type: PatternType): string {
  const map: Record<PatternType, string> = {
    'sequential-dep': 'Sequential Dependencies',
    'parallel-success': 'Parallel Execution Successes',
    'accomplishment': 'Accomplishments',
    'risk': 'Risks',
    'decision': 'Decisions',
    'approach': 'Approaches',
    'tool-usage': 'Tool Usage',
    'anti-pattern': 'Anti-Patterns',
  };
  return map[type] || type;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

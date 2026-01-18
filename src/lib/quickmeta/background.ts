/**
 * QuickMeta Background - Optional detailed analysis in background
 *
 * Enables fire-and-forget meta-analysis that doesn't block the user.
 */

import type { Phase } from '../../types/pattern.js';
import type { QuickMeta } from '../../types/quickmeta.js';
import { loadSessionQuickMeta } from './storage.js';

/**
 * Configuration for background meta-analysis
 */
export interface BackgroundAnalysisConfig {
  /** Whether to run full analysis after Phase 4 */
  enabled: boolean;

  /** Minimum session duration (ms) to trigger analysis */
  minDurationMs: number;

  /** Callback when analysis is ready (for notification) */
  onComplete?: (sessionId: string, reportPath: string) => void;
}

const DEFAULT_CONFIG: BackgroundAnalysisConfig = {
  enabled: true,
  minDurationMs: 60000, // Only analyze sessions > 1 minute
};

/**
 * Check if background analysis should be triggered
 */
export function shouldTriggerBackgroundAnalysis(
  sessionId: string,
  totalDurationMs: number,
  config: BackgroundAnalysisConfig = DEFAULT_CONFIG
): { shouldTrigger: boolean; reason: string } {
  if (!config.enabled) {
    return { shouldTrigger: false, reason: 'Background analysis disabled' };
  }

  if (totalDurationMs < config.minDurationMs) {
    return {
      shouldTrigger: false,
      reason: `Session too short (${totalDurationMs}ms < ${config.minDurationMs}ms)`,
    };
  }

  return {
    shouldTrigger: true,
    reason: `Background analysis queued for session ${sessionId}`,
  };
}

/**
 * Build prompt for background meta-analyzer
 * Includes all QuickMeta from the session for full analysis
 */
export async function buildBackgroundAnalysisPrompt(sessionId: string): Promise<string> {
  const quickMetas = await loadSessionQuickMeta(sessionId);
  const phases = Object.keys(quickMetas) as Phase[];

  if (phases.length === 0) {
    return `No QuickMeta found for session ${sessionId}`;
  }

  const sections: string[] = [
    `# Background Meta-Analysis for Session: ${sessionId}`,
    '',
    '## QuickMeta Summary (Pre-captured)',
    '',
  ];

  for (const phase of phases) {
    const meta = quickMetas[phase]!;
    sections.push(`### ${phase.toUpperCase()}`);
    sections.push(`- Summary: ${meta.summary}`);
    sections.push(`- Duration: ${meta.metrics.durationMs}ms`);
    sections.push(`- Patterns: ${meta.patterns.length}`);
    sections.push(`- Decisions: ${meta.decisions.length}`);
    sections.push(`- Risks: ${meta.risks.length}`);
    sections.push('');
  }

  sections.push('## Instructions');
  sections.push('');
  sections.push('Perform DEEP analysis of this session:');
  sections.push('1. Identify cross-phase patterns not captured by QuickMeta');
  sections.push('2. Analyze decision chains across phases');
  sections.push('3. Evaluate risk mitigation effectiveness');
  sections.push('4. Extract learnings for future sessions');
  sections.push('5. Generate improvement recommendations');
  sections.push('');
  sections.push('Output format: Full session meta-analysis markdown');
  sections.push(`Output path: ~/.claude/meta/session-${sessionId}.md`);

  return sections.join('\n');
}

/**
 * Get total session duration from QuickMeta
 */
export async function getSessionDuration(sessionId: string): Promise<number> {
  const quickMetas = await loadSessionQuickMeta(sessionId);

  let total = 0;
  for (const meta of Object.values(quickMetas)) {
    if (meta) {
      total += meta.metrics.durationMs;
    }
  }

  return total;
}

/**
 * Summarize QuickMeta for quick reference
 */
export async function getQuickMetaSummary(
  sessionId: string
): Promise<{
  phases: number;
  totalPatterns: number;
  totalDecisions: number;
  totalRisks: number;
  unresolvedRisks: number;
  totalDuration: number;
}> {
  const quickMetas = await loadSessionQuickMeta(sessionId);

  let totalPatterns = 0;
  let totalDecisions = 0;
  let totalRisks = 0;
  let unresolvedRisks = 0;
  let totalDuration = 0;

  for (const meta of Object.values(quickMetas)) {
    if (meta) {
      totalPatterns += meta.patterns.length;
      totalDecisions += meta.decisions.length;
      totalRisks += meta.risks.length;
      unresolvedRisks += meta.risks.filter(
        (r) => r.status === 'identified' && (r.severity === 'P0' || r.severity === 'P1')
      ).length;
      totalDuration += meta.metrics.durationMs;
    }
  }

  return {
    phases: Object.keys(quickMetas).length,
    totalPatterns,
    totalDecisions,
    totalRisks,
    unresolvedRisks,
    totalDuration,
  };
}

/**
 * Format QuickMeta as markdown for review
 */
export async function formatQuickMetaAsMarkdown(sessionId: string): Promise<string> {
  const quickMetas = await loadSessionQuickMeta(sessionId);
  const summary = await getQuickMetaSummary(sessionId);

  const lines: string[] = [
    `# QuickMeta Summary: ${sessionId}`,
    '',
    '## Overview',
    `- Phases completed: ${summary.phases}/4`,
    `- Total patterns: ${summary.totalPatterns}`,
    `- Total decisions: ${summary.totalDecisions}`,
    `- Total risks: ${summary.totalRisks} (${summary.unresolvedRisks} unresolved P0/P1)`,
    `- Total duration: ${Math.round(summary.totalDuration / 1000)}s`,
    '',
  ];

  const phaseOrder: Phase[] = ['planning', 'design', 'implementation', 'operation'];

  for (const phase of phaseOrder) {
    const meta = quickMetas[phase];
    if (!meta) continue;

    lines.push(`## ${phase.toUpperCase()}`);
    lines.push(`**Summary**: ${meta.summary}`);
    lines.push(`**Duration**: ${Math.round(meta.metrics.durationMs / 1000)}s`);
    lines.push('');

    if (meta.patterns.length > 0) {
      lines.push('### Patterns');
      for (const p of meta.patterns) {
        lines.push(`- [${p.category}] ${p.summary} (confidence: ${p.confidence.toFixed(2)})`);
      }
      lines.push('');
    }

    if (meta.decisions.length > 0) {
      lines.push('### Decisions');
      for (const d of meta.decisions) {
        lines.push(`- **${d.topic}**: ${d.choice}`);
        lines.push(`  - Rationale: ${d.rationale}`);
      }
      lines.push('');
    }

    if (meta.risks.length > 0) {
      lines.push('### Risks');
      for (const r of meta.risks) {
        lines.push(`- [${r.severity}] ${r.description} (${r.status})`);
      }
      lines.push('');
    }

    lines.push(`**Handoff**: ${meta.handoffNote}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

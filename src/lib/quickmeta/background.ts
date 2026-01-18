/**
 * QuickMeta Background - Optional detailed analysis in background
 *
 * Enables fire-and-forget meta-analysis that doesn't block the user.
 * Now supports both QuickMeta (legacy) and SemanticPhaseMeta (LLM-based).
 */

import type { Phase } from '../../types/pattern.js';
import type { QuickMeta, PhaseMetrics } from '../../types/quickmeta.js';
import type { SemanticPhaseMeta } from '../../types/semantic-meta.js';
import { loadSessionQuickMeta, loadSemanticMeta, loadAllSemanticMetas } from './storage.js';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

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

// ============================================================================
// LLM-Based Semantic Meta Extraction (New)
// ============================================================================

/**
 * Build prompt for phase-meta-extractor agent
 *
 * Creates a detailed prompt for LLM-based semantic extraction of phase insights.
 * The LLM analyzes the raw phase output and extracts structured metadata.
 *
 * @param phase - The phase being analyzed
 * @param phaseOutput - Raw output from the phase (agent responses, tool calls, etc.)
 * @param sessionId - Session identifier
 * @param metrics - Phase execution metrics
 * @returns Formatted prompt for the phase-meta-extractor agent
 */
export function buildPhaseMetaPrompt(
  phase: Phase,
  phaseOutput: string,
  sessionId: string,
  metrics: PhaseMetrics
): string {
  const outputPath = path.join(
    os.homedir(),
    '.claude',
    'meta',
    'semantic',
    sessionId,
    `${phase}.json`
  );

  const phaseGoals: Record<Phase, string[]> = {
    planning: [
      'Problem definition clarity',
      'Requirement completeness',
      'Information gathering effectiveness',
      'Scope boundaries',
    ],
    design: [
      'Architectural decisions and rationale',
      'Design tradeoffs considered',
      'Risk identification',
      'Component boundaries',
    ],
    implementation: [
      'Parallel execution patterns',
      'Testing approach',
      'Risk mitigation',
      'Code quality',
    ],
    operation: [
      'Deployment verification',
      'Production readiness',
      'Meta-analysis quality',
      'Continuous improvement insights',
    ],
  };

  const sections: string[] = [
    `# Phase Meta-Extraction: ${phase.toUpperCase()}`,
    '',
    `Session: ${sessionId}`,
    `Phase: ${phase}`,
    '',
    '## Phase Output',
    '',
    '```',
    phaseOutput.trim(),
    '```',
    '',
    '## Phase Metrics',
    '',
    `- Duration: ${metrics.durationMs}ms (${Math.round(metrics.durationMs / 1000)}s)`,
    `- Tool Calls: ${metrics.toolCalls}`,
    `- Delegations: ${metrics.delegations}`,
    `- Parallel Tasks: ${metrics.parallelTasks}`,
    '',
    '## Extraction Instructions',
    '',
    'Analyze the phase output above and extract structured semantic metadata.',
    '',
    `### Focus Areas for ${phase.toUpperCase()}:`,
    ...phaseGoals[phase].map((goal) => `- ${goal}`),
    '',
    '### Extract:',
    '',
    '1. **Accomplishment** (max 200 chars)',
    '   - What was achieved in this phase?',
    '',
    '2. **Key Insight** (max 150 chars)',
    '   - Most important learning or realization',
    '',
    '3. **Decisions** (max 3)',
    '   - Strategic choices made',
    '   - Format: { what, why, impact: high|medium|low }',
    '',
    '4. **Challenges** (max 2)',
    '   - Problems encountered and how resolved',
    '   - Format: { problem, resolution }',
    '',
    '5. **Risks** (max 3)',
    '   - Identified risks or status changes',
    '   - Format: { severity: P0|P1|P2|P3, description, status: new|mitigated|escalated|accepted }',
    '',
    '6. **Approaches** (max 3 keywords)',
    '   - Problem-solving patterns used (e.g., "parallel", "iterative", "defensive")',
    '',
    '7. **Tools Used** (max 5)',
    '   - Primary tools/techniques (e.g., "Task", "Read", "Edit", "Grep")',
    '',
    '8. **Handoff Context**',
    '   - readyFor: What next phase can do now (max 100 chars)',
    '   - blockers: What might block next phase (max 3 items)',
    '   - context: Key context to carry forward (max 150 chars)',
    '',
    '## Output Format',
    '',
    'Generate a JSON file following the SemanticPhaseMeta schema:',
    '',
    '```typescript',
    '{',
    '  version: 2,',
    `  sessionId: "${sessionId}",`,
    `  phase: "${phase}",`,
    '  completedAt: "<ISO-8601-timestamp>",',
    '  semantics: {',
    '    accomplishment: "...",',
    '    keyInsight: "...",',
    '    decisions: [{ what: "...", why: "...", impact: "high|medium|low" }],',
    '    challenges: [{ problem: "...", resolution: "..." }],',
    '    risks: [{ severity: "P0|P1|P2|P3", description: "...", status: "..." }],',
    '    approaches: ["keyword1", "keyword2"],',
    '    toolsUsed: ["Tool1", "Tool2"]',
    '  },',
    '  handoff: {',
    '    readyFor: "...",',
    '    blockers: ["..."],',
    '    context: "..."',
    '  },',
    '  metrics: {',
    `    durationMs: ${metrics.durationMs},`,
    `    toolCalls: ${metrics.toolCalls},`,
    `    delegations: ${metrics.delegations},`,
    `    parallelTasks: ${metrics.parallelTasks}`,
    '  }',
    '}',
    '```',
    '',
    `**Output Path**: ${outputPath}`,
    '',
    '**Important**:',
    '- Extract semantic meaning, not just keywords',
    '- Focus on insights useful for future phases',
    '- Keep descriptions concise but meaningful',
    '- Prioritize actionable information',
  ];

  return sections.join('\n');
}

/**
 * Get phases that come before the target phase
 *
 * Used to determine which phase metas to load for injection into the current phase.
 *
 * @param targetPhase - The phase that will receive prior context
 * @returns Array of phases that precede targetPhase
 */
export function getPriorPhases(targetPhase: Phase): Phase[] {
  const phaseOrder: Phase[] = ['planning', 'design', 'implementation', 'operation'];
  const targetIndex = phaseOrder.indexOf(targetPhase);

  if (targetIndex === -1) {
    return [];
  }

  return phaseOrder.slice(0, targetIndex);
}

/**
 * Format prior phase metas for injection into next phase prompt
 *
 * Aggregates semantic metadata from completed phases and formats it for injection
 * into the next phase's agent prompt. This provides cross-phase context.
 *
 * @param metas - Array of semantic phase metas from prior phases
 * @param targetPhase - The phase that will receive this context
 * @returns Formatted XML-like string for injection
 */
export function formatMetaInjection(
  metas: SemanticPhaseMeta[],
  targetPhase: Phase
): string {
  if (metas.length === 0) {
    return '';
  }

  const sessionId = metas[0]?.sessionId || 'unknown';

  const sections: string[] = [
    `<prior-phase-insights session="${sessionId}" target="${targetPhase}">`,
    '',
  ];

  // Add each prior phase's insights
  for (const meta of metas) {
    sections.push(`## ${meta.phase.toUpperCase()} Phase`);
    sections.push('');

    // Accomplishment
    if (meta.semantics.accomplishment) {
      sections.push(`**Accomplishment**: ${meta.semantics.accomplishment}`);
    }

    // Key Insight
    if (meta.semantics.keyInsight) {
      sections.push(`**Key Insight**: ${meta.semantics.keyInsight}`);
    }

    // Active Risks (P0/P1 that aren't mitigated)
    const activeRisks = meta.semantics.risks.filter(
      (r) => (r.severity === 'P0' || r.severity === 'P1') && r.status !== 'mitigated'
    );

    if (activeRisks.length > 0) {
      sections.push('');
      sections.push('**Active Risks**:');
      for (const risk of activeRisks) {
        sections.push(`- [${risk.severity}] ${risk.description} (${risk.status})`);
      }
    }

    // Key Decisions
    const highImpactDecisions = meta.semantics.decisions.filter(
      (d) => d.impact === 'high'
    );

    if (highImpactDecisions.length > 0) {
      sections.push('');
      sections.push('**Key Decisions**:');
      for (const decision of highImpactDecisions) {
        sections.push(`- ${decision.what}: ${decision.why}`);
      }
    }

    // Handoff Notes
    if (meta.handoff.readyFor || meta.handoff.context) {
      sections.push('');
      if (meta.handoff.readyFor) {
        sections.push(`**Ready For**: ${meta.handoff.readyFor}`);
      }
      if (meta.handoff.context) {
        sections.push(`**Context**: ${meta.handoff.context}`);
      }
      if (meta.handoff.blockers.length > 0) {
        sections.push(`**Blockers**: ${meta.handoff.blockers.join(', ')}`);
      }
    }

    sections.push('');
    sections.push('---');
    sections.push('');
  }

  sections.push('</prior-phase-insights>');

  return sections.join('\n');
}

/**
 * Wait for background semantic metas to be generated with timeout
 *
 * Polls the filesystem for semantic phase meta files until all expected phases
 * have their metas generated, or timeout is reached. Used in Phase 4 to wait
 * for all background meta extraction to complete before aggregation.
 *
 * @param sessionId - Session identifier
 * @param timeout - Maximum time to wait in milliseconds (default: 30000ms)
 * @returns Promise resolving to phase metas (null if not found)
 */
export async function waitForBackgroundMetas(
  sessionId: string,
  timeout: number = 30000
): Promise<Record<Phase, SemanticPhaseMeta | null>> {
  const semanticDir = path.join(
    os.homedir(),
    '.claude',
    'meta',
    'semantic',
    sessionId
  );

  const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];
  const result: Record<Phase, SemanticPhaseMeta | null> = {
    planning: null,
    design: null,
    implementation: null,
    operation: null,
  };

  const pollInterval = 2000; // 2 seconds
  const maxAttempts = Math.ceil(timeout / pollInterval);
  let attempts = 0;

  while (attempts < maxAttempts) {
    let allFound = true;

    for (const phase of phases) {
      if (result[phase]) {
        // Already loaded
        continue;
      }

      const metaPath = path.join(semanticDir, `${phase}.json`);

      try {
        const content = await fs.readFile(metaPath, 'utf-8');
        const meta = JSON.parse(content) as SemanticPhaseMeta;

        // Validate basic structure
        if (meta.version === 2 && meta.phase === phase && meta.sessionId === sessionId) {
          result[phase] = meta;
        } else {
          allFound = false;
        }
      } catch {
        // File doesn't exist or is corrupted
        allFound = false;
      }
    }

    if (allFound) {
      // All phase metas found
      break;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    attempts++;
  }

  return result;
}

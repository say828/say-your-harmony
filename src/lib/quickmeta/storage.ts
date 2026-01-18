/**
 * QuickMeta Storage - File-based persistence for phase meta-analysis
 *
 * Storage location: ~/.claude/meta/quickmeta/{sessionId}/{phase}.json
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { Phase } from '../../types/pattern.js';
import type { QuickMeta, PhaseInsight, QuickPattern, QuickRisk, QuickDecision } from '../../types/quickmeta.js';

const BASE_DIR = path.join(os.homedir(), '.claude', 'meta', 'quickmeta');

/**
 * Generate a new session ID
 * Format: YYYY-MM-DD-HHmmss-XXXX
 */
export function generateSessionId(): string {
  const now = new Date();
  const datePart = now
    .toISOString()
    .replace(/T/, '-')
    .replace(/:/g, '')
    .replace(/\..+/, '')
    .slice(0, 17); // YYYY-MM-DD-HHmmss

  const randomPart = Math.random().toString(36).slice(2, 6);

  return `${datePart}-${randomPart}`;
}

/**
 * Get file path for a phase's QuickMeta
 */
function getQuickMetaPath(sessionId: string, phase: Phase): string {
  return path.join(BASE_DIR, sessionId, `${phase}.json`);
}

/**
 * Get directory path for a session
 */
function getSessionDir(sessionId: string): string {
  return path.join(BASE_DIR, sessionId);
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // Directory already exists
  }
}

/**
 * Atomic write with temp file
 */
async function atomicWrite(filePath: string, data: string): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, data, 'utf-8');
  await fs.rename(tempPath, filePath);
}

/**
 * Save QuickMeta for a completed phase
 * Called by Harmony after each phase delegation returns
 */
export async function saveQuickMeta(meta: QuickMeta): Promise<void> {
  const sessionDir = getSessionDir(meta.sessionId);
  const filePath = getQuickMetaPath(meta.sessionId, meta.phase);

  await ensureDir(sessionDir);

  const content = JSON.stringify(meta, null, 2);

  // Validate size budget
  if (content.length > 2048) {
    console.warn(`[QuickMeta] Size ${content.length} exceeds 2KB budget`);
  }

  await atomicWrite(filePath, content);
}

/**
 * Load QuickMeta for a specific phase
 * Returns null if not found or corrupted
 */
export async function loadQuickMeta(sessionId: string, phase: Phase): Promise<QuickMeta | null> {
  const filePath = getQuickMetaPath(sessionId, phase);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const meta = JSON.parse(content) as QuickMeta;

    // Basic validation
    if (meta.version !== 1 || meta.phase !== phase) {
      console.warn(`[QuickMeta] Invalid meta file: ${filePath}`);
      return null;
    }

    return meta;
  } catch {
    // File doesn't exist or is corrupted
    return null;
  }
}

/**
 * Load all QuickMeta for a session
 */
export async function loadSessionQuickMeta(
  sessionId: string
): Promise<Partial<Record<Phase, QuickMeta>>> {
  const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];
  const result: Partial<Record<Phase, QuickMeta>> = {};

  // Load in parallel
  const metas = await Promise.all(phases.map((phase) => loadQuickMeta(sessionId, phase)));

  phases.forEach((phase, index) => {
    if (metas[index]) {
      result[phase] = metas[index]!;
    }
  });

  return result;
}

/**
 * Build PhaseInsight for injection into next phase
 * Called by Harmony before each phase delegation
 */
export async function buildPhaseInsight(
  sessionId: string,
  targetPhase: Phase
): Promise<PhaseInsight | null> {
  const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];
  const targetIndex = phases.indexOf(targetPhase);

  if (targetIndex === 0) {
    // Planning is first phase, no prior context
    return null;
  }

  const priorPhases = phases.slice(0, targetIndex);
  const metas = await Promise.all(priorPhases.map((phase) => loadQuickMeta(sessionId, phase)));

  // Filter out null values
  const validMetas = metas.filter((m): m is QuickMeta => m !== null);

  if (validMetas.length === 0) {
    return null;
  }

  // Aggregate patterns (deduplicate by category)
  const seenCategories = new Set<string>();
  const accumulatedPatterns: QuickPattern[] = [];

  for (const meta of validMetas) {
    for (const pattern of meta.patterns) {
      if (!seenCategories.has(pattern.category)) {
        seenCategories.add(pattern.category);
        accumulatedPatterns.push(pattern);
      }
    }
  }

  // Collect active risks (P0/P1 that aren't mitigated)
  const activeRisks: QuickRisk[] = [];

  for (const meta of validMetas) {
    for (const risk of meta.risks) {
      if ((risk.severity === 'P0' || risk.severity === 'P1') && risk.status !== 'mitigated') {
        activeRisks.push(risk);
      }
    }
  }

  // Collect key decisions
  const keyDecisions: QuickDecision[] = validMetas.flatMap((m) => m.decisions).slice(0, 5);

  // Build completed phases summary
  const completedPhases = validMetas.map((m) => ({
    phase: m.phase,
    summary: m.summary,
    handoffNote: m.handoffNote,
  }));

  // Format for injection
  const formatted = formatPhaseInsight({
    sessionId,
    targetPhase,
    completedPhases,
    accumulatedPatterns: accumulatedPatterns.slice(0, 10),
    activeRisks: activeRisks.slice(0, 5),
    keyDecisions,
    formatted: '', // Will be set below
  });

  return {
    sessionId,
    targetPhase,
    completedPhases,
    accumulatedPatterns: accumulatedPatterns.slice(0, 10),
    activeRisks: activeRisks.slice(0, 5),
    keyDecisions,
    formatted,
  };
}

/**
 * Format PhaseInsight as injectable string
 */
function formatPhaseInsight(insight: PhaseInsight): string {
  const sections: string[] = [];

  sections.push(`<phase-context session="${insight.sessionId}">`);

  // Completed phases
  if (insight.completedPhases.length > 0) {
    sections.push('## Prior Phase Summary');
    for (const cp of insight.completedPhases) {
      sections.push(`- **${cp.phase.toUpperCase()}**: ${cp.summary}`);
      if (cp.handoffNote) {
        sections.push(`  - Handoff: ${cp.handoffNote}`);
      }
    }
  }

  // Active risks
  if (insight.activeRisks.length > 0) {
    sections.push('\n## Active Risks (Unresolved)');
    for (const risk of insight.activeRisks) {
      sections.push(`- [${risk.severity}] ${risk.description}`);
    }
  }

  // Key decisions
  if (insight.keyDecisions.length > 0) {
    sections.push('\n## Key Decisions Made');
    for (const dec of insight.keyDecisions.slice(0, 3)) {
      sections.push(`- **${dec.topic}**: ${dec.choice} (${dec.rationale})`);
    }
  }

  sections.push('</phase-context>');

  return sections.join('\n');
}

/**
 * List all session IDs in storage
 */
export async function listSessions(): Promise<string[]> {
  try {
    const entries = await fs.readdir(BASE_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
      .reverse(); // Most recent first
  } catch {
    return [];
  }
}

/**
 * Clean up old sessions (keep last N)
 */
export async function cleanupOldSessions(keepCount: number = 50): Promise<number> {
  const sessions = await listSessions();

  if (sessions.length <= keepCount) {
    return 0;
  }

  const toDelete = sessions.slice(keepCount);
  let deleted = 0;

  for (const sessionId of toDelete) {
    try {
      await fs.rm(getSessionDir(sessionId), { recursive: true });
      deleted++;
    } catch {
      // Ignore deletion errors
    }
  }

  return deleted;
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalSessions: number;
  totalFiles: number;
  oldestSession: string | null;
  newestSession: string | null;
}> {
  const sessions = await listSessions();

  return {
    totalSessions: sessions.length,
    totalFiles: sessions.length * 4, // Max 4 phases per session
    oldestSession: sessions.length > 0 ? sessions[sessions.length - 1] : null,
    newestSession: sessions.length > 0 ? sessions[0] : null,
  };
}

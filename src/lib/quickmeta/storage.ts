/**
 * Semantic Meta Storage - File-based persistence for phase meta-analysis
 *
 * Storage structure (Hybrid):
 * ~/.claude/meta/{phase}/recent/{sessionId}.json  - Recent 10 sessions
 * ~/.claude/meta/{phase}/patterns.json            - Cumulative patterns
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { Phase } from '../../types/pattern.js';
import type { SemanticPhaseMeta } from '../../types/semantic-meta.js';

const BASE_DIR = path.join(os.homedir(), '.claude', 'meta');
const MAX_RECENT_SESSIONS = 10;

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

// ============================================================================
// PATH UTILITIES
// ============================================================================

/**
 * Get directory for a phase
 */
function getPhaseDir(phase: Phase): string {
  return path.join(BASE_DIR, phase);
}

/**
 * Get recent sessions directory for a phase
 */
function getRecentDir(phase: Phase): string {
  return path.join(BASE_DIR, phase, 'recent');
}

/**
 * Get file path for a recent session meta
 * Pattern: ~/.claude/meta/{phase}/recent/{sessionId}.json
 */
function getRecentSessionPath(sessionId: string, phase: Phase): string {
  return path.join(getRecentDir(phase), `${sessionId}.json`);
}

/**
 * Get file path for cumulative patterns
 * Pattern: ~/.claude/meta/{phase}/patterns.json
 */
function getPatternsPath(phase: Phase): string {
  return path.join(getPhaseDir(phase), 'patterns.json');
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

// ============================================================================
// SESSION STORAGE (Recent 10)
// ============================================================================

/**
 * Save recent session meta
 * Automatically cleans up old sessions if > 10
 *
 * @param sessionId - Session identifier
 * @param phase - Phase that completed
 * @param meta - Semantic meta data to save
 */
export async function saveRecentSession(
  sessionId: string,
  phase: Phase,
  meta: SemanticPhaseMeta
): Promise<void> {
  const recentDir = getRecentDir(phase);
  const filePath = getRecentSessionPath(sessionId, phase);

  await ensureDir(recentDir);

  const content = JSON.stringify(meta, null, 2);
  await atomicWrite(filePath, content);

  // Cleanup old sessions (keep only 10)
  await cleanupOldSessions(phase);
}

/**
 * Load recent session meta
 *
 * @param sessionId - Session identifier
 * @param phase - Phase to load
 * @returns SemanticPhaseMeta or null if not found
 */
export async function loadRecentSession(
  sessionId: string,
  phase: Phase
): Promise<SemanticPhaseMeta | null> {
  const filePath = getRecentSessionPath(sessionId, phase);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const meta = JSON.parse(content) as SemanticPhaseMeta;

    if (meta.version !== 2 || meta.phase !== phase) {
      console.warn(`[SemanticMeta] Invalid recent session: ${filePath}`);
      return null;
    }

    return meta;
  } catch {
    return null;
  }
}

/**
 * List recent session IDs for a phase
 * Returns sorted newest first
 *
 * @param phase - Phase to list sessions for
 * @returns Array of session IDs
 */
export async function listRecentSessions(phase: Phase): Promise<string[]> {
  const recentDir = getRecentDir(phase);

  try {
    const files = await fs.readdir(recentDir);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      .sort()
      .reverse(); // Most recent first
  } catch {
    return [];
  }
}

/**
 * Clean up old sessions (keep only MAX_RECENT_SESSIONS)
 *
 * @param phase - Phase to cleanup
 * @returns Number of sessions deleted
 */
async function cleanupOldSessions(phase: Phase): Promise<number> {
  const sessions = await listRecentSessions(phase);

  if (sessions.length <= MAX_RECENT_SESSIONS) {
    return 0;
  }

  const toDelete = sessions.slice(MAX_RECENT_SESSIONS);
  let deleted = 0;

  for (const sessionId of toDelete) {
    try {
      const filePath = getRecentSessionPath(sessionId, phase);
      await fs.unlink(filePath);
      deleted++;
    } catch {
      // Ignore deletion errors
    }
  }

  return deleted;
}

// ============================================================================
// PATTERN STORAGE (Cumulative)
// ============================================================================

/**
 * Pattern metadata types
 */
export interface SequentialDepPattern {
  id: string;
  frequency: number;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  examples: string[]; // sessionIds
}

export interface ParallelSuccessPattern {
  group: string[];
  frequency: number;
  confidence: number;
  cooccurringTasks: number;
  examples: string[];
}

export interface AccomplishmentPattern {
  category: string;
  keywords: string[];
  frequency: number;
}

export interface RiskPattern {
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  description: string;
  frequency: number;
  mitigation?: string;
}

export interface PhasePatterns {
  version: number;
  phase: Phase;
  lastUpdated: string;
  totalSessions: number;

  sequentialDeps: SequentialDepPattern[];
  parallelSuccesses: ParallelSuccessPattern[];
  accomplishmentPatterns: AccomplishmentPattern[];
  riskPatterns: RiskPattern[];

  metadata: {
    avgSessionsPerDay: number;
    successRate: number;
  };
}

/**
 * Create empty patterns structure
 */
function createEmptyPatterns(phase: Phase): PhasePatterns {
  return {
    version: 1,
    phase,
    lastUpdated: new Date().toISOString(),
    totalSessions: 0,
    sequentialDeps: [],
    parallelSuccesses: [],
    accomplishmentPatterns: [],
    riskPatterns: [],
    metadata: {
      avgSessionsPerDay: 0,
      successRate: 1.0,
    },
  };
}

/**
 * Load cumulative patterns for a phase
 * Returns empty patterns if not found
 *
 * @param phase - Phase to load patterns for
 * @returns PhasePatterns
 */
export async function loadPatterns(phase: Phase): Promise<PhasePatterns> {
  const filePath = getPatternsPath(phase);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const patterns = JSON.parse(content) as PhasePatterns;

    if (patterns.version !== 1 || patterns.phase !== phase) {
      console.warn(`[Patterns] Invalid patterns file: ${filePath}`);
      return createEmptyPatterns(phase);
    }

    return patterns;
  } catch {
    // File doesn't exist, return empty
    return createEmptyPatterns(phase);
  }
}

/**
 * Save cumulative patterns for a phase
 *
 * @param phase - Phase to save patterns for
 * @param patterns - Pattern data to save
 */
export async function savePatterns(phase: Phase, patterns: PhasePatterns): Promise<void> {
  const phaseDir = getPhaseDir(phase);
  const filePath = getPatternsPath(phase);

  await ensureDir(phaseDir);

  patterns.lastUpdated = new Date().toISOString();
  const content = JSON.stringify(patterns, null, 2);

  await atomicWrite(filePath, content);
}

// ============================================================================
// PATTERN MERGING LOGIC
// ============================================================================

/**
 * Calculate confidence score for a pattern
 * Based on frequency, age, and recency
 *
 * @param frequency - Number of occurrences
 * @param firstSeen - First occurrence timestamp
 * @param lastSeen - Last occurrence timestamp
 * @returns Confidence score [0, 1]
 */
function calculateConfidence(frequency: number, firstSeen: string, lastSeen: string): number {
  // Frequency score (saturates at 10)
  const freqScore = Math.min(frequency / 10.0, 1.0);

  // Recency bonus (within 7 days = 1.0, older = 0.8)
  const now = new Date();
  const lastDate = new Date(lastSeen);
  const daysSinceLastSeen = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = daysSinceLastSeen < 7 ? 1.0 : 0.8;

  // Weighted average
  return freqScore * 0.7 + recencyScore * 0.3;
}

/**
 * Merge sequential dependencies into patterns
 *
 * @param patterns - Existing patterns
 * @param newDeps - New dependencies from session
 * @param sessionId - Session identifier
 */
export function mergeSequentialDeps(
  patterns: PhasePatterns,
  newDeps: string[],
  sessionId: string
): void {
  const now = new Date().toISOString();

  for (const depId of newDeps) {
    // Find exact match
    const existing = patterns.sequentialDeps.find((p) => p.id === depId);

    if (existing) {
      // Update existing pattern
      existing.frequency += 1;
      existing.lastSeen = now;
      existing.confidence = calculateConfidence(
        existing.frequency,
        existing.firstSeen,
        existing.lastSeen
      );
      if (!existing.examples.includes(sessionId)) {
        existing.examples.push(sessionId);
        if (existing.examples.length > 5) {
          existing.examples.shift(); // Keep only 5 examples
        }
      }
    } else {
      // Add new pattern
      patterns.sequentialDeps.push({
        id: depId,
        frequency: 1,
        confidence: 0.5, // Initial low confidence
        firstSeen: now,
        lastSeen: now,
        examples: [sessionId],
      });
    }
  }

  // Sort by frequency desc
  patterns.sequentialDeps.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Merge parallel successes into patterns
 *
 * @param patterns - Existing patterns
 * @param newSuccesses - New parallel tasks from session
 * @param sessionId - Session identifier
 */
export function mergeParallelSuccesses(
  patterns: PhasePatterns,
  newSuccesses: string[],
  sessionId: string
): void {
  if (newSuccesses.length === 0) return;

  const newSet = new Set(newSuccesses);
  const now = new Date().toISOString();

  // Find overlapping group (60% overlap threshold)
  let merged = false;
  for (const group of patterns.parallelSuccesses) {
    const groupSet = new Set(group.group);
    const intersection = new Set([...newSet].filter((x) => groupSet.has(x)));
    const overlap = intersection.size / Math.min(newSet.size, groupSet.size);

    if (overlap >= 0.6) {
      // Merge into existing group
      group.group = Array.from(new Set([...group.group, ...newSuccesses]));
      group.frequency += 1;
      group.cooccurringTasks = group.group.length;
      group.confidence = calculateConfidence(group.frequency, now, now);
      if (!group.examples.includes(sessionId)) {
        group.examples.push(sessionId);
        if (group.examples.length > 5) {
          group.examples.shift();
        }
      }
      merged = true;
      break;
    }
  }

  if (!merged) {
    // Add new group
    patterns.parallelSuccesses.push({
      group: newSuccesses,
      frequency: 1,
      confidence: 0.5,
      cooccurringTasks: newSuccesses.length,
      examples: [sessionId],
    });
  }

  // Sort by frequency desc
  patterns.parallelSuccesses.sort((a, b) => b.frequency - a.frequency);
}

// ============================================================================
// HIGH-LEVEL API
// ============================================================================

/**
 * Save session and update patterns (main entry point)
 *
 * @param sessionId - Session identifier
 * @param phase - Phase that completed
 * @param meta - Semantic meta from phase
 */
export async function saveSemanticMeta(
  sessionId: string,
  phase: Phase,
  meta: SemanticPhaseMeta
): Promise<void> {
  // 1. Save to recent/
  await saveRecentSession(sessionId, phase, meta);

  // 2. Load patterns
  const patterns = await loadPatterns(phase);

  // 3. Merge new data
  mergeSequentialDeps(patterns, meta.semantics.sequentialDeps, sessionId);
  mergeParallelSuccesses(patterns, meta.semantics.parallelSuccesses, sessionId);

  // 4. Update metadata
  patterns.totalSessions += 1;

  // 5. Save patterns
  await savePatterns(phase, patterns);
}

/**
 * Load semantic meta (tries recent, falls back to patterns)
 *
 * @param sessionId - Session identifier
 * @param phase - Phase to load
 * @returns SemanticPhaseMeta or null
 */
export async function loadSemanticMeta(
  sessionId: string,
  phase: Phase
): Promise<SemanticPhaseMeta | null> {
  return await loadRecentSession(sessionId, phase);
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalSessions: number;
  recentByPhase: Record<Phase, number>;
  totalPatterns: number;
}> {
  const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];
  const recentByPhase: Record<Phase, number> = {
    planning: 0,
    design: 0,
    implementation: 0,
    operation: 0,
  };

  let totalPatterns = 0;

  for (const phase of phases) {
    const recent = await listRecentSessions(phase);
    recentByPhase[phase] = recent.length;

    const patterns = await loadPatterns(phase);
    totalPatterns +=
      patterns.sequentialDeps.length +
      patterns.parallelSuccesses.length +
      patterns.accomplishmentPatterns.length +
      patterns.riskPatterns.length;
  }

  const allRecent = Object.values(recentByPhase).reduce((a, b) => a + b, 0);

  return {
    totalSessions: allRecent,
    recentByPhase,
    totalPatterns,
  };
}

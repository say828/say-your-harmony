/**
 * Meta Pattern Storage Layer
 *
 * Unified storage for all meta patterns. Single source of truth at
 * ~/.claude/meta/patterns.json with phase indices for fast queries.
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type {
  MetaPattern,
  PatternStore,
  PhaseIndex,
  Phase,
  PatternType,
} from './schema.js';
import { createEmptyPatternStore } from './schema.js';

// Global meta directory
const BASE_DIR = path.join(os.homedir(), '.claude', 'meta');
const PATTERNS_FILE = path.join(BASE_DIR, 'patterns.json');
const INDEX_DIR = path.join(BASE_DIR, 'index');
const CLUSTERS_FILE = path.join(BASE_DIR, 'clusters.json');
const SESSIONS_DIR = path.join(BASE_DIR, 'sessions');

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
 * Atomic write - write to temp file first, then rename
 */
async function atomicWrite(filePath: string, data: string): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, data, 'utf-8');
  await fs.rename(tempPath, filePath);
}

/**
 * Load pattern store
 *
 * @returns Pattern store
 */
export async function loadPatternStore(): Promise<PatternStore> {
  try {
    const content = await fs.readFile(PATTERNS_FILE, 'utf-8');
    return JSON.parse(content) as PatternStore;
  } catch {
    // File doesn't exist, return empty store
    return createEmptyPatternStore();
  }
}

/**
 * Save pattern store
 *
 * @param store - Pattern store
 */
export async function savePatternStore(store: PatternStore): Promise<void> {
  await ensureDir(BASE_DIR);

  // Update metadata
  store.lastUpdated = new Date().toISOString();
  store.totalPatterns = store.patterns.length;

  // Update counts
  store.metadata.patternsByPhase = {
    planning: 0,
    design: 0,
    implementation: 0,
    operation: 0,
  };
  store.metadata.patternsByType = {
    'sequential-dep': 0,
    'parallel-success': 0,
    'accomplishment': 0,
    'risk': 0,
    'decision': 0,
    'approach': 0,
    'tool-usage': 0,
    'anti-pattern': 0,
  };

  for (const pattern of store.patterns) {
    store.metadata.patternsByPhase[pattern.phase]++;
    store.metadata.patternsByType[pattern.type]++;
  }

  // Calculate avg confidence
  if (store.patterns.length > 0) {
    store.metadata.avgConfidence =
      store.patterns.reduce((sum, p) => sum + p.confidence, 0) / store.patterns.length;
  }

  // Update oldest/newest
  if (store.patterns.length > 0) {
    const sorted = [...store.patterns].sort(
      (a, b) => new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime()
    );
    store.metadata.oldestPattern = sorted[0].firstSeen;
    store.metadata.newestPattern = sorted[sorted.length - 1].lastSeen;
  }

  const content = JSON.stringify(store, null, 2);
  await atomicWrite(PATTERNS_FILE, content);
}

/**
 * Load all patterns
 *
 * @returns All patterns
 */
export async function loadAllPatterns(): Promise<MetaPattern[]> {
  const store = await loadPatternStore();
  return store.patterns;
}

/**
 * Load patterns by phase
 *
 * @param phase - Phase
 * @returns Patterns in phase
 */
export async function loadPatternsByPhase(phase: Phase): Promise<MetaPattern[]> {
  // Try index first (fast path)
  const index = await loadPhaseIndex(phase);
  if (index && index.patternIds.length > 0) {
    const store = await loadPatternStore();
    const patternMap = new Map(store.patterns.map((p) => [p.id, p]));
    return index.patternIds.map((id) => patternMap.get(id)).filter((p) => p) as MetaPattern[];
  }

  // Fallback: filter from all patterns
  const all = await loadAllPatterns();
  return all.filter((p) => p.phase === phase);
}

/**
 * Load patterns by type
 *
 * @param type - Pattern type
 * @returns Patterns of type
 */
export async function loadPatternsByType(type: PatternType): Promise<MetaPattern[]> {
  const all = await loadAllPatterns();
  return all.filter((p) => p.type === type);
}

/**
 * Load pattern by ID
 *
 * @param id - Pattern ID
 * @returns Pattern or null
 */
export async function loadPatternById(id: string): Promise<MetaPattern | null> {
  const all = await loadAllPatterns();
  return all.find((p) => p.id === id) || null;
}

/**
 * Save pattern (add or update)
 *
 * @param pattern - Pattern to save
 */
export async function savePattern(pattern: MetaPattern): Promise<void> {
  const store = await loadPatternStore();

  // Find existing
  const existingIdx = store.patterns.findIndex((p) => p.id === pattern.id);

  if (existingIdx >= 0) {
    // Update existing
    store.patterns[existingIdx] = pattern;
  } else {
    // Add new
    store.patterns.push(pattern);
  }

  await savePatternStore(store);

  // Update phase index
  await updatePhaseIndex(pattern.phase);
}

/**
 * Save multiple patterns
 *
 * @param patterns - Patterns to save
 */
export async function savePatterns(patterns: MetaPattern[]): Promise<void> {
  const store = await loadPatternStore();

  for (const pattern of patterns) {
    const existingIdx = store.patterns.findIndex((p) => p.id === pattern.id);
    if (existingIdx >= 0) {
      store.patterns[existingIdx] = pattern;
    } else {
      store.patterns.push(pattern);
    }
  }

  await savePatternStore(store);

  // Update all affected phase indices
  const phases = new Set(patterns.map((p) => p.phase));
  for (const phase of phases) {
    await updatePhaseIndex(phase);
  }
}

/**
 * Delete pattern by ID
 *
 * @param id - Pattern ID
 */
export async function deletePattern(id: string): Promise<void> {
  const store = await loadPatternStore();
  const pattern = store.patterns.find((p) => p.id === id);
  if (!pattern) return;

  store.patterns = store.patterns.filter((p) => p.id !== id);
  await savePatternStore(store);

  // Update phase index
  await updatePhaseIndex(pattern.phase);
}

/**
 * Load phase index
 *
 * @param phase - Phase
 * @returns Phase index or null
 */
export async function loadPhaseIndex(phase: Phase): Promise<PhaseIndex | null> {
  const filePath = path.join(INDEX_DIR, `${phase}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as PhaseIndex;
  } catch {
    return null;
  }
}

/**
 * Update phase index
 *
 * @param phase - Phase
 */
export async function updatePhaseIndex(phase: Phase): Promise<void> {
  await ensureDir(INDEX_DIR);

  const patterns = await loadPatternsByPhase(phase);
  const index: PhaseIndex = {
    phase,
    patternIds: patterns.map((p) => p.id),
    lastUpdated: new Date().toISOString(),
  };

  const filePath = path.join(INDEX_DIR, `${phase}.json`);
  const content = JSON.stringify(index, null, 2);
  await atomicWrite(filePath, content);
}

/**
 * Get storage statistics
 *
 * @returns Storage stats
 */
export async function getStorageStats(): Promise<{
  totalPatterns: number;
  patternsByPhase: Record<Phase, number>;
  patternsByType: Record<PatternType, number>;
  avgConfidence: number;
  storageSize: string;
}> {
  const store = await loadPatternStore();

  let storageSize = '0 KB';
  try {
    const stats = await fs.stat(PATTERNS_FILE);
    storageSize = `${(stats.size / 1024).toFixed(2)} KB`;
  } catch {
    // File doesn't exist yet
  }

  return {
    totalPatterns: store.totalPatterns,
    patternsByPhase: store.metadata.patternsByPhase,
    patternsByType: store.metadata.patternsByType,
    avgConfidence: store.metadata.avgConfidence,
    storageSize,
  };
}

/**
 * Storage Layer - Pattern and Cluster Persistence
 *
 * Handles JSON file I/O for patterns, clusters, and indices
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { Pattern, Cluster, Phase } from '../types/pattern.js';

// Global meta directory: shared across all projects for cumulative learning
const BASE_DIR = path.join(os.homedir(), '.claude', 'meta');

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory already exists, ignore
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
 * Load patterns for a given phase
 */
export async function loadPatterns(phase: Phase): Promise<Pattern[]> {
  const filePath = path.join(BASE_DIR, phase, 'patterns.json');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const patterns = JSON.parse(content) as Pattern[];

    // Restore Map for embeddings (JSON serializes Maps as objects)
    for (const pattern of patterns) {
      if (pattern.embedding && typeof pattern.embedding === 'object' && !(pattern.embedding instanceof Map)) {
        pattern.embedding = new Map(Object.entries(pattern.embedding as unknown as Record<string, number>));
      }
    }

    return patterns;
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Save patterns for a given phase
 */
export async function savePatterns(phase: Phase, patterns: Pattern[]): Promise<void> {
  const dirPath = path.join(BASE_DIR, phase);
  const filePath = path.join(dirPath, 'patterns.json');

  await ensureDir(dirPath);

  // Convert Map to object for JSON serialization
  const serializable = patterns.map(p => ({
    ...p,
    embedding: p.embedding ? Object.fromEntries(p.embedding) : undefined
  }));

  const content = JSON.stringify(serializable, null, 2);
  await atomicWrite(filePath, content);
}

/**
 * Load clusters for a given phase
 */
export async function loadClusters(phase: Phase): Promise<Cluster[]> {
  const filePath = path.join(BASE_DIR, phase, 'clusters.json');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as Cluster[];
  } catch (error) {
    return [];
  }
}

/**
 * Save clusters for a given phase
 */
export async function saveClusters(phase: Phase, clusters: Cluster[]): Promise<void> {
  const dirPath = path.join(BASE_DIR, phase);
  const filePath = path.join(dirPath, 'clusters.json');

  await ensureDir(dirPath);

  const content = JSON.stringify(clusters, null, 2);
  await atomicWrite(filePath, content);
}

/**
 * Load semantic hash index for a given phase
 */
export async function loadIndex(phase: Phase): Promise<Map<string, string>> {
  const filePath = path.join(BASE_DIR, phase, 'index.json');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const obj = JSON.parse(content) as Record<string, string>;
    return new Map(Object.entries(obj));
  } catch (error) {
    return new Map();
  }
}

/**
 * Save semantic hash index for a given phase
 */
export async function saveIndex(phase: Phase, index: Map<string, string>): Promise<void> {
  const dirPath = path.join(BASE_DIR, phase);
  const filePath = path.join(dirPath, 'index.json');

  await ensureDir(dirPath);

  const obj = Object.fromEntries(index);
  const content = JSON.stringify(obj, null, 2);
  await atomicWrite(filePath, content);
}

/**
 * Load all patterns across all phases
 */
export async function loadAllPatterns(): Promise<Pattern[]> {
  const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];
  const allPatterns: Pattern[] = [];

  for (const phase of phases) {
    const patterns = await loadPatterns(phase);
    allPatterns.push(...patterns);
  }

  return allPatterns;
}

/**
 * List all session meta files
 */
export async function listSessionFiles(): Promise<string[]> {
  const metaDir = path.join(BASE_DIR);

  try {
    const files = await fs.readdir(metaDir);
    return files
      .filter(f => f.startsWith('session-') && f.endsWith('.md'))
      .map(f => path.join(metaDir, f));
  } catch (error) {
    return [];
  }
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File doesn't exist, ignore
  }
}

/**
 * Get file modification time
 */
export async function getFileModTime(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.mtimeMs;
}

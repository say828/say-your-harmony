/**
 * ID Generation and Hashing Utilities
 */

import crypto from 'crypto';
import type { Phase, PatternType } from './schema.js';

/**
 * Generate unique session ID
 * Format: YYYY-MM-DD-HHmmss-XXXX
 *
 * @returns Session ID
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
 * Generate pattern ID
 * Format: {phase}:{type}:{hash}
 *
 * @param phase - Phase
 * @param type - Pattern type
 * @param content - Pattern content for hashing
 * @returns Pattern ID
 */
export function generatePatternId(
  phase: Phase,
  type: PatternType,
  content: string
): string {
  const hash = hashContent(content);
  return `${phase}:${type}:${hash}`;
}

/**
 * Generate cluster ID
 * Format: cluster-{hash}
 *
 * @param patternIds - Pattern IDs in cluster
 * @returns Cluster ID
 */
export function generateClusterId(patternIds: string[]): string {
  const combined = patternIds.sort().join('|');
  const hash = hashContent(combined);
  return `cluster-${hash}`;
}

/**
 * Hash content using SHA-256 (first 12 chars)
 *
 * @param content - Content to hash
 * @returns Hash string (12 chars)
 */
export function hashContent(content: string): string {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
    .slice(0, 12);
}

/**
 * Parse pattern ID
 *
 * @param id - Pattern ID
 * @returns Parsed components
 */
export function parsePatternId(id: string): {
  phase: Phase;
  type: PatternType;
  hash: string;
} | null {
  const parts = id.split(':');
  if (parts.length !== 3) return null;

  const [phase, type, hash] = parts;

  // Validate phase
  const validPhases: Phase[] = ['planning', 'design', 'implementation', 'operation'];
  if (!validPhases.includes(phase as Phase)) return null;

  // Validate type
  const validTypes: PatternType[] = [
    'sequential-dep',
    'parallel-success',
    'accomplishment',
    'risk',
    'decision',
    'approach',
    'tool-usage',
    'anti-pattern',
  ];
  if (!validTypes.includes(type as PatternType)) return null;

  return {
    phase: phase as Phase,
    type: type as PatternType,
    hash,
  };
}

/**
 * Sequential Dependency Validator
 */

import type { Phase } from '../core/schema.js';
import { loadPatternsByPhase } from '../core/storage.js';

/**
 * Dependency validation result
 */
export interface DependencyValidationResult {
  passed: boolean;
  requiredDeps: string[];
  warnings: string[];
  phase: Phase;
}

/**
 * Dependency checker function
 */
export type DependencyChecker = (depId: string) => boolean;

/**
 * Validate dependencies for a phase
 *
 * @param phase - Phase to validate
 * @param checker - Function to check if dependency is satisfied
 * @returns Validation result
 */
export async function validateDependencies(
  phase: Phase,
  checker?: DependencyChecker
): Promise<DependencyValidationResult> {
  // Load sequential dependency patterns for phase
  const patterns = await loadPatternsByPhase(phase);
  const seqDeps = patterns.filter((p) => p.type === 'sequential-dep');

  // Get high confidence dependencies (>0.7)
  const highConfidenceDeps = seqDeps
    .filter((p) => p.confidence > 0.7)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5); // Top 5

  const warnings: string[] = [];
  let passed = true;

  if (checker) {
    for (const dep of highConfidenceDeps) {
      const satisfied = checker(dep.content);

      if (!satisfied) {
        warnings.push(
          `Missing dependency: "${dep.content}" (frequency: ${dep.frequency}, confidence: ${(dep.confidence * 100).toFixed(0)}%)`
        );
        passed = false;
      }
    }
  } else {
    // No checker provided, assume all dependencies satisfied
    passed = true;
  }

  return {
    passed,
    requiredDeps: highConfidenceDeps.map((d) => d.content),
    warnings,
    phase,
  };
}

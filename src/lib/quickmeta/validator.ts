/**
 * Sequential Dependency Validator
 *
 * Validates using learned patterns from patterns.json
 * Prevents parallelization errors by checking meta-learned dependencies.
 */

import type { Phase } from '../../types/pattern.js';
import { loadPatterns, type PhasePatterns } from './storage.js';

/**
 * Dependency validation result
 */
export interface DependencyValidationResult {
  /** Whether validation passed (high confidence deps present) */
  passed: boolean;

  /** High confidence dependencies (>0.7) that should be checked */
  requiredDeps: string[];

  /** Warnings for potential issues */
  warnings: string[];

  /** Phase being validated */
  phase: Phase;
}

/**
 * Dependency check context - how to verify if a dependency is satisfied
 */
export type DependencyChecker = (depId: string) => boolean;

/**
 * Default dependency checker (always returns true - conservative)
 *
 * @param depId - Dependency identifier
 * @returns true (assumes dependency is satisfied)
 */
export function defaultDependencyChecker(depId: string): boolean {
  // Conservative: assume dependencies are satisfied
  // User must provide custom checker for strict validation
  return true;
}

/**
 * Validate dependencies for a phase using learned patterns
 *
 * @param phase - Phase to validate
 * @param checker - Optional custom dependency checker
 * @returns Validation result with warnings
 */
export async function validateDependencies(
  phase: Phase,
  checker: DependencyChecker = defaultDependencyChecker
): Promise<DependencyValidationResult> {
  // Load learned patterns
  const patterns = await loadPatterns(phase);

  // Get high confidence sequential dependencies (>0.7)
  const highConfidenceDeps = patterns.sequentialDeps
    .filter((p) => p.confidence > 0.7)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5); // Top 5

  const warnings: string[] = [];
  let passed = true;

  for (const dep of highConfidenceDeps) {
    const satisfied = checker(dep.id);

    if (!satisfied) {
      warnings.push(
        `Missing dependency: "${dep.id}" (frequency: ${dep.frequency}, confidence: ${(dep.confidence * 100).toFixed(0)}%)`
      );
      passed = false;
    }
  }

  return {
    passed,
    requiredDeps: highConfidenceDeps.map((d) => d.id),
    warnings,
    phase,
  };
}

/**
 * Get all learned dependencies for a phase
 *
 * @param phase - Phase to get dependencies for
 * @returns List of learned dependencies with metadata
 */
export async function getAllDependencies(phase: Phase): Promise<PhasePatterns['sequentialDeps']> {
  const patterns = await loadPatterns(phase);
  return patterns.sequentialDeps;
}

/**
 * Format validation result as human-readable string
 *
 * @param result - Validation result
 * @returns Formatted string
 */
export function formatValidationResult(result: DependencyValidationResult): string {
  const lines: string[] = [];

  lines.push(`Dependency Validation for ${result.phase.toUpperCase()}`);
  lines.push('='.repeat(50));

  if (result.passed) {
    lines.push('✓ All high-confidence dependencies present');
  } else {
    lines.push('⚠ Some dependencies may be missing:');
    result.warnings.forEach((w) => lines.push(`  - ${w}`));
  }

  if (result.requiredDeps.length > 0) {
    lines.push('');
    lines.push('Required dependencies (learned from past sessions):');
    result.requiredDeps.forEach((d) => lines.push(`  - ${d}`));
  }

  return lines.join('\n');
}

/**
 * Get safe parallel execution patterns for a phase
 *
 * @param phase - Phase to get patterns for
 * @returns List of parallel success patterns
 */
export async function getSafeParallelPatterns(phase: Phase): Promise<PhasePatterns['parallelSuccesses']> {
  const patterns = await loadPatterns(phase);
  return patterns.parallelSuccesses.filter((p) => p.confidence > 0.7);
}

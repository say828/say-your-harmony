/**
 * Sequential Dependency Validator
 *
 * Validates that sequential dependencies are satisfied before task execution.
 * Prevents parallelization errors by checking meta-learned dependencies.
 */

import type { Phase } from '../../types/pattern.js';
import type { SemanticPhaseMeta } from '../../types/semantic-meta.js';
import { loadAllSemanticMetas } from './storage.js';

/**
 * Dependency validation result
 */
export interface DependencyValidationResult {
  /** Whether all dependencies are satisfied */
  satisfied: boolean;

  /** List of unsatisfied dependencies */
  unsatisfied: string[];

  /** List of satisfied dependencies */
  satisfied_deps: string[];

  /** Phase being validated */
  phase: Phase;

  /** Session ID */
  sessionId: string;
}

/**
 * Dependency check context - how to verify if a dependency is satisfied
 */
export type DependencyChecker = (depId: string, metas: Record<Phase, SemanticPhaseMeta | null>) => boolean;

/**
 * Default dependency checker
 *
 * Checks if a dependency exists in ANY prior phase's accomplishments or handoff context.
 * This is a simple heuristic-based approach.
 *
 * @param depId - Dependency identifier (e.g., "db-setup", "tests-passed")
 * @param metas - All phase metas from the session
 * @returns true if dependency appears to be satisfied
 */
export function defaultDependencyChecker(
  depId: string,
  metas: Record<Phase, SemanticPhaseMeta | null>
): boolean {
  const depIdLower = depId.toLowerCase();

  for (const meta of Object.values(metas)) {
    if (!meta) continue;

    // Check in accomplishment
    if (meta.semantics.accomplishment.toLowerCase().includes(depIdLower)) {
      return true;
    }

    // Check in handoff context
    if (meta.handoff.context.toLowerCase().includes(depIdLower)) {
      return true;
    }

    // Check in handoff readyFor
    if (meta.handoff.readyFor.toLowerCase().includes(depIdLower)) {
      return true;
    }

    // Check if mentioned in decisions
    for (const decision of meta.semantics.decisions) {
      if (decision.what.toLowerCase().includes(depIdLower)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validate sequential dependencies for a phase
 *
 * Loads all semantic metas from the session and checks if the target phase's
 * dependencies are satisfied.
 *
 * @param sessionId - Session identifier
 * @param targetPhase - Phase to validate
 * @param checker - Custom dependency checker (optional, uses default if not provided)
 * @returns Validation result with satisfied/unsatisfied dependencies
 */
export async function validateDependencies(
  sessionId: string,
  targetPhase: Phase,
  checker: DependencyChecker = defaultDependencyChecker
): Promise<DependencyValidationResult> {
  // Load all metas
  const metas = await loadAllSemanticMetas(sessionId);

  // Get target phase meta
  const targetMeta = metas[targetPhase];

  // If no meta yet, assume no dependencies
  if (!targetMeta) {
    return {
      satisfied: true,
      unsatisfied: [],
      satisfied_deps: [],
      phase: targetPhase,
      sessionId,
    };
  }

  const deps = targetMeta.semantics.sequentialDeps;

  // If no dependencies, all satisfied
  if (deps.length === 0) {
    return {
      satisfied: true,
      unsatisfied: [],
      satisfied_deps: [],
      phase: targetPhase,
      sessionId,
    };
  }

  // Check each dependency
  const satisfied_deps: string[] = [];
  const unsatisfied: string[] = [];

  for (const dep of deps) {
    if (checker(dep, metas)) {
      satisfied_deps.push(dep);
    } else {
      unsatisfied.push(dep);
    }
  }

  return {
    satisfied: unsatisfied.length === 0,
    unsatisfied,
    satisfied_deps,
    phase: targetPhase,
    sessionId,
  };
}

/**
 * Get all dependencies across all phases in a session
 *
 * Useful for debugging and visualization.
 *
 * @param sessionId - Session identifier
 * @returns Map of phase to its dependencies
 */
export async function getAllDependencies(
  sessionId: string
): Promise<Record<Phase, string[]>> {
  const metas = await loadAllSemanticMetas(sessionId);

  const result: Record<Phase, string[]> = {
    planning: [],
    design: [],
    implementation: [],
    operation: [],
  };

  for (const [phase, meta] of Object.entries(metas)) {
    if (meta) {
      result[phase as Phase] = meta.semantics.sequentialDeps;
    }
  }

  return result;
}

/**
 * Format validation result as human-readable string
 *
 * @param result - Validation result
 * @returns Formatted string
 */
export function formatValidationResult(result: DependencyValidationResult): string {
  const lines: string[] = [];

  lines.push(`Dependency Validation: ${result.phase.toUpperCase()}`);
  lines.push(`Session: ${result.sessionId}`);
  lines.push('');

  if (result.satisfied) {
    lines.push('✅ All dependencies satisfied');
    if (result.satisfied_deps.length > 0) {
      lines.push('');
      lines.push('Satisfied:');
      for (const dep of result.satisfied_deps) {
        lines.push(`  ✓ ${dep}`);
      }
    }
  } else {
    lines.push('❌ Unsatisfied dependencies detected');
    lines.push('');
    lines.push('Unsatisfied:');
    for (const dep of result.unsatisfied) {
      lines.push(`  ✗ ${dep}`);
    }

    if (result.satisfied_deps.length > 0) {
      lines.push('');
      lines.push('Satisfied:');
      for (const dep of result.satisfied_deps) {
        lines.push(`  ✓ ${dep}`);
      }
    }
  }

  return lines.join('\n');
}

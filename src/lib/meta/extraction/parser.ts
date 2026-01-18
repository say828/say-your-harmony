/**
 * Parser - JSON parsing and validation for semantic meta
 */

import type { SemanticPhaseMeta } from '../../../types/semantic-meta.js';
import { isSemanticPhaseMeta } from '../../../types/semantic-meta.js';

/**
 * Parse result
 */
export interface ParseResult {
  success: boolean;
  data?: SemanticPhaseMeta;
  errors?: string[];
}

/**
 * Parse JSON string to SemanticPhaseMeta
 *
 * @param jsonString - JSON string
 * @returns Parse result
 */
export function parseSemanticMeta(jsonString: string): ParseResult {
  try {
    const parsed = JSON.parse(jsonString);

    if (!isSemanticPhaseMeta(parsed)) {
      return {
        success: false,
        errors: ['Invalid SemanticPhaseMeta structure'],
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
    };
  }
}

/**
 * Parse semantic meta from LLM output
 *
 * Handles various formats:
 * - Pure JSON
 * - JSON with markdown code fences
 * - JSON with extra text
 *
 * @param llmOutput - LLM output string
 * @returns Parse result
 */
export function parseFromLLMOutput(llmOutput: string): ParseResult {
  // Try direct parse first
  let result = parseSemanticMeta(llmOutput);
  if (result.success) return result;

  // Try extracting JSON from markdown code fences
  const codeBlockMatch = llmOutput.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    result = parseSemanticMeta(codeBlockMatch[1]);
    if (result.success) return result;
  }

  // Try finding JSON object anywhere in text
  const jsonMatch = llmOutput.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    result = parseSemanticMeta(jsonMatch[1]);
    if (result.success) return result;
  }

  return {
    success: false,
    errors: ['Could not extract valid JSON from LLM output'],
  };
}

/**
 * Validate semantic meta completeness
 *
 * @param meta - Semantic meta to validate
 * @returns Validation errors (empty if valid)
 */
export function validateCompleteness(meta: SemanticPhaseMeta): string[] {
  const errors: string[] = [];

  // Required fields
  if (!meta.semantics.accomplishment || meta.semantics.accomplishment.length < 10) {
    errors.push('accomplishment must be at least 10 characters');
  }

  if (!meta.semantics.keyInsight || meta.semantics.keyInsight.length < 10) {
    errors.push('keyInsight must be at least 10 characters');
  }

  if (!meta.handoff.readyFor || meta.handoff.readyFor.length < 10) {
    errors.push('handoff.readyFor must be at least 10 characters');
  }

  // Character limits
  if (meta.semantics.accomplishment.length > 200) {
    errors.push('accomplishment exceeds 200 characters');
  }

  if (meta.semantics.keyInsight.length > 150) {
    errors.push('keyInsight exceeds 150 characters');
  }

  // Array limits
  if (meta.semantics.decisions.length > 5) {
    errors.push('decisions exceed maximum of 5');
  }

  if (meta.semantics.sequentialDeps.length > 5) {
    errors.push('sequentialDeps exceed maximum of 5');
  }

  if (meta.semantics.parallelSuccesses.length > 8) {
    errors.push('parallelSuccesses exceed maximum of 8');
  }

  return errors;
}

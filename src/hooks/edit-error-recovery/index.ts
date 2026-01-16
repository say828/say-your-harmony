/**
 * Edit Error Recovery Hook
 *
 * Detects Edit tool errors caused by AI mistakes and injects
 * a recovery reminder to guide corrective action.
 *
 * Common Edit tool failures:
 * - oldString and newString must be different (trying to "edit" to same content)
 * - oldString not found (wrong assumption about file content)
 * - oldString found multiple times (ambiguous match, need more context)
 *
 * Ported from oh-my-opencode's edit-error-recovery hook.
 */

/**
 * Known Edit tool error patterns that indicate the AI made a mistake
 */
export const EDIT_ERROR_PATTERNS = [
  'oldString and newString must be different',
  'oldString not found',
  'oldString found multiple times',
  'old_string not found',
  'old_string and new_string must be different',
] as const;

/**
 * System reminder injected when Edit tool fails due to AI mistake
 * Short, direct, and commanding - forces immediate corrective action
 */
export const EDIT_ERROR_REMINDER = `
[EDIT ERROR - IMMEDIATE ACTION REQUIRED]

You made an Edit mistake. STOP and do this NOW:

1. READ the file immediately to see its ACTUAL current state
2. VERIFY what the content really looks like (your assumption was wrong)
3. APOLOGIZE briefly to the user for the error
4. CONTINUE with corrected action based on the real file content

DO NOT attempt another edit until you've read and verified the file state.
`;

/**
 * Check if an output contains an edit error pattern
 */
export function detectEditError(output: string): boolean {
  const outputLower = output.toLowerCase();
  return EDIT_ERROR_PATTERNS.some((pattern) =>
    outputLower.includes(pattern.toLowerCase())
  );
}

/**
 * Inject the edit error recovery reminder into the output
 */
export function injectEditErrorRecovery(output: string): string {
  if (detectEditError(output)) {
    return output + EDIT_ERROR_REMINDER;
  }
  return output;
}

/**
 * Hook input interface for tool execution
 */
export interface ToolExecuteInput {
  tool: string;
  sessionId: string;
  callId: string;
}

/**
 * Hook output interface for tool execution
 */
export interface ToolExecuteOutput {
  title: string;
  output: string;
  metadata?: unknown;
}

/**
 * Creates the edit error recovery hook for Claude Code.
 * This is the main export for hook registration.
 */
export function createEditErrorRecoveryHook() {
  return {
    /**
     * After tool execution, check for Edit errors and inject recovery reminder.
     */
    afterToolExecute: (
      input: ToolExecuteInput,
      output: ToolExecuteOutput
    ): ToolExecuteOutput => {
      if (input.tool.toLowerCase() !== 'edit') {
        return output;
      }

      if (detectEditError(output.output)) {
        return {
          ...output,
          output: output.output + EDIT_ERROR_REMINDER,
        };
      }

      return output;
    },
  };
}

/**
 * Process edit tool output and inject recovery if needed.
 * Simplified function for direct use without hook context.
 */
export function processEditOutput(toolName: string, output: string): string {
  if (toolName.toLowerCase() !== 'edit') {
    return output;
  }
  return injectEditErrorRecovery(output);
}

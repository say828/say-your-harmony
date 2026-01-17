/**
 * Ralph Loop Verifier
 *
 * Adds oracle verification to ralph-loop completion claims.
 * When ralph-loop outputs a completion promise, instead of immediately
 * accepting it, we trigger an oracle verification phase.
 *
 * Flow:
 * 1. Ralph-loop outputs <promise>TASK_COMPLETE</promise>
 * 2. System detects this and enters verification mode
 * 3. Oracle agent is invoked to verify the work
 * 4. If oracle approves -> truly complete
 * 5. If oracle finds flaws -> continue ralph-loop with oracle feedback
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface VerificationState {
  /** Whether verification is pending */
  pending: boolean;
  /** The completion claim that triggered verification */
  completion_claim: string;
  /** Number of verification attempts */
  verification_attempts: number;
  /** Max verification attempts before force-accepting */
  max_verification_attempts: number;
  /** Oracle feedback from last verification */
  oracle_feedback?: string;
  /** Whether oracle approved */
  oracle_approved?: boolean;
  /** Timestamp of verification request */
  requested_at: string;
  /** Original ralph-loop task */
  original_task: string;
}

const DEFAULT_MAX_VERIFICATION_ATTEMPTS = 3;

/**
 * Get verification state file path
 */
function getVerificationStatePath(directory: string): string {
  return join(directory, '.harmony', 'ralph-verification.json');
}

/**
 * Read verification state
 */
export function readVerificationState(directory: string): VerificationState | null {
  const statePath = getVerificationStatePath(directory);
  if (!existsSync(statePath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(statePath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Write verification state
 */
export function writeVerificationState(directory: string, state: VerificationState): boolean {
  const statePath = getVerificationStatePath(directory);
  const stateDir = join(directory, '.harmony');

  if (!existsSync(stateDir)) {
    try {
      mkdirSync(stateDir, { recursive: true });
    } catch {
      return false;
    }
  }

  try {
    writeFileSync(statePath, JSON.stringify(state, null, 2));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear verification state
 */
export function clearVerificationState(directory: string): boolean {
  const statePath = getVerificationStatePath(directory);
  if (existsSync(statePath)) {
    try {
      unlinkSync(statePath);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Start verification process
 */
export function startVerification(
  directory: string,
  completionClaim: string,
  originalTask: string
): VerificationState {
  const state: VerificationState = {
    pending: true,
    completion_claim: completionClaim,
    verification_attempts: 0,
    max_verification_attempts: DEFAULT_MAX_VERIFICATION_ATTEMPTS,
    requested_at: new Date().toISOString(),
    original_task: originalTask
  };

  writeVerificationState(directory, state);
  return state;
}

/**
 * Record oracle feedback
 */
export function recordOracleFeedback(
  directory: string,
  approved: boolean,
  feedback: string
): VerificationState | null {
  const state = readVerificationState(directory);
  if (!state) {
    return null;
  }

  state.verification_attempts += 1;
  state.oracle_approved = approved;
  state.oracle_feedback = feedback;

  if (approved) {
    // Clear state on approval
    clearVerificationState(directory);
    return { ...state, pending: false };
  }

  // Check if max attempts reached
  if (state.verification_attempts >= state.max_verification_attempts) {
    clearVerificationState(directory);
    return { ...state, pending: false };
  }

  // Continue verification loop
  writeVerificationState(directory, state);
  return state;
}

/**
 * Generate oracle verification prompt
 */
export function getOracleVerificationPrompt(state: VerificationState): string {
  return `<ralph-verification>

[ORACLE VERIFICATION REQUIRED - Attempt ${state.verification_attempts + 1}/${state.max_verification_attempts}]

The agent claims the task is complete. Before accepting, YOU MUST verify with Oracle.

**Original Task:**
${state.original_task}

**Completion Claim:**
${state.completion_claim}

${state.oracle_feedback ? `**Previous Oracle Feedback (rejected):**\n${state.oracle_feedback}\n` : ''}

## MANDATORY VERIFICATION STEPS

1. **Spawn Oracle Agent** for verification:
   \`\`\`
   Task(subagent_type="oracle", prompt="Verify this task completion claim...")
   \`\`\`

2. **Oracle must check:**
   - Are ALL requirements from the original task met?
   - Is the implementation complete, not partial?
   - Are there any obvious bugs or issues?
   - Does the code compile/run without errors?
   - Are tests passing (if applicable)?

3. **Based on Oracle's response:**
   - If APPROVED: Output \`<oracle-approved>VERIFIED_COMPLETE</oracle-approved>\`
   - If REJECTED: Continue working on the identified issues

DO NOT output the completion promise again until Oracle approves.

</ralph-verification>

---

`;
}

/**
 * Generate continuation prompt after oracle rejection
 */
export function getOracleRejectionContinuationPrompt(state: VerificationState): string {
  return `<ralph-continuation-after-rejection>

[ORACLE REJECTED - Continue Working]

Oracle found issues with your completion claim. You must address them.

**Oracle Feedback:**
${state.oracle_feedback}

**Original Task:**
${state.original_task}

## INSTRUCTIONS

1. Address ALL issues identified by Oracle
2. Do NOT claim completion again until issues are fixed
3. When truly done, output the completion promise again
4. Another Oracle verification will be triggered

Continue working now.

</ralph-continuation-after-rejection>

---

`;
}

/**
 * Check if text contains oracle approval
 */
export function detectOracleApproval(text: string): boolean {
  return /<oracle-approved>.*?VERIFIED_COMPLETE.*?<\/oracle-approved>/is.test(text);
}

/**
 * Check if text contains oracle rejection indicators
 */
export function detectOracleRejection(text: string): { rejected: boolean; feedback: string } {
  // Look for explicit rejection patterns
  const rejectionPatterns = [
    /oracle.*?(rejected|found issues|not complete|incomplete)/i,
    /issues? (found|identified|detected)/i,
    /not yet complete/i,
    /missing.*?(implementation|feature|test)/i,
    /bug.*?(found|detected|identified)/i,
    /error.*?(found|detected|identified)/i
  ];

  for (const pattern of rejectionPatterns) {
    if (pattern.test(text)) {
      // Extract feedback (rough heuristic)
      const feedbackMatch = text.match(/(?:oracle|feedback|issue|problem|error|bug)[:\s]+([^.]+\.)/i);
      return {
        rejected: true,
        feedback: feedbackMatch ? feedbackMatch[1] : 'Oracle found issues with the implementation.'
      };
    }
  }

  return { rejected: false, feedback: '' };
}

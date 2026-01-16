/**
 * Ralph Loop Hook
 *
 * Self-referential work loop that continues until a completion promise is detected.
 * Named after the character who keeps working until the job is done.
 *
 * Ported from oh-my-opencode's ralph-loop hook.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface RalphLoopState {
  /** Whether the loop is currently active */
  active: boolean;
  /** Current iteration number */
  iteration: number;
  /** Maximum iterations before stopping */
  max_iterations: number;
  /** The promise phrase to detect for completion */
  completion_promise: string;
  /** When the loop started */
  started_at: string;
  /** The original prompt/task */
  prompt: string;
  /** Session ID the loop is bound to */
  session_id?: string;
}

export interface RalphLoopOptions {
  /** Maximum iterations (default: 10) */
  maxIterations?: number;
  /** Custom completion promise (default: "TASK_COMPLETE") */
  completionPromise?: string;
}

export interface RalphLoopHook {
  startLoop: (sessionId: string, prompt: string, options?: RalphLoopOptions) => boolean;
  cancelLoop: (sessionId: string) => boolean;
  getState: () => RalphLoopState | null;
}

const DEFAULT_MAX_ITERATIONS = 10;
const DEFAULT_COMPLETION_PROMISE = 'TASK_COMPLETE';

/**
 * Get the state file path for Ralph Loop
 */
function getStateFilePath(directory: string): string {
  const sisyphusDir = join(directory, '.sisyphus');
  return join(sisyphusDir, 'ralph-state.json');
}

/**
 * Ensure the .sisyphus directory exists
 */
function ensureStateDir(directory: string): void {
  const sisyphusDir = join(directory, '.sisyphus');
  if (!existsSync(sisyphusDir)) {
    mkdirSync(sisyphusDir, { recursive: true });
  }
}

/**
 * Read Ralph Loop state from disk
 */
export function readRalphState(directory: string): RalphLoopState | null {
  const stateFile = getStateFilePath(directory);

  if (!existsSync(stateFile)) {
    return null;
  }

  try {
    const content = readFileSync(stateFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Write Ralph Loop state to disk
 */
export function writeRalphState(directory: string, state: RalphLoopState): boolean {
  try {
    ensureStateDir(directory);
    const stateFile = getStateFilePath(directory);
    writeFileSync(stateFile, JSON.stringify(state, null, 2));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear Ralph Loop state
 */
export function clearRalphState(directory: string): boolean {
  const stateFile = getStateFilePath(directory);

  if (!existsSync(stateFile)) {
    return true;
  }

  try {
    unlinkSync(stateFile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Increment Ralph Loop iteration
 */
export function incrementRalphIteration(directory: string): RalphLoopState | null {
  const state = readRalphState(directory);

  if (!state || !state.active) {
    return null;
  }

  state.iteration += 1;

  if (writeRalphState(directory, state)) {
    return state;
  }

  return null;
}

/**
 * Detect completion promise in session transcript
 */
export function detectCompletionPromise(
  sessionId: string,
  promise: string
): boolean {
  // Try to find transcript in Claude's session directory
  const claudeDir = join(homedir(), '.claude');
  const possiblePaths = [
    join(claudeDir, 'sessions', sessionId, 'transcript.md'),
    join(claudeDir, 'sessions', sessionId, 'messages.json'),
    join(claudeDir, 'transcripts', `${sessionId}.md`)
  ];

  for (const transcriptPath of possiblePaths) {
    if (existsSync(transcriptPath)) {
      try {
        const content = readFileSync(transcriptPath, 'utf-8');
        const pattern = new RegExp(`<promise>\\s*${escapeRegex(promise)}\\s*</promise>`, 'is');
        if (pattern.test(content)) {
          return true;
        }
      } catch {
        continue;
      }
    }
  }

  return false;
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create a Ralph Loop hook instance
 */
export function createRalphLoopHook(directory: string): RalphLoopHook {
  const startLoop = (
    sessionId: string,
    prompt: string,
    options?: RalphLoopOptions
  ): boolean => {
    const state: RalphLoopState = {
      active: true,
      iteration: 1,
      max_iterations: options?.maxIterations ?? DEFAULT_MAX_ITERATIONS,
      completion_promise: options?.completionPromise ?? DEFAULT_COMPLETION_PROMISE,
      started_at: new Date().toISOString(),
      prompt,
      session_id: sessionId
    };

    return writeRalphState(directory, state);
  };

  const cancelLoop = (sessionId: string): boolean => {
    const state = readRalphState(directory);

    if (!state || state.session_id !== sessionId) {
      return false;
    }

    return clearRalphState(directory);
  };

  const getState = (): RalphLoopState | null => {
    return readRalphState(directory);
  };

  return {
    startLoop,
    cancelLoop,
    getState
  };
}

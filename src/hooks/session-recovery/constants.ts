/**
 * Session Recovery Constants
 *
 * Constants for session recovery including storage paths and recovery messages.
 * Adapted from oh-my-opencode's session-recovery hook.
 */

import { join } from "node:path";
import { homedir, tmpdir } from "node:os";

/**
 * Get the data directory for Claude Code storage
 * Follows XDG Base Directory specification
 */
function getDataDir(): string {
  return process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share");
}

/**
 * Get the Claude Code storage directory
 */
function getClaudeCodeStorageDir(): string {
  return join(getDataDir(), "claude-code", "storage");
}

export const CLAUDE_CODE_STORAGE = getClaudeCodeStorageDir();
export const MESSAGE_STORAGE = join(CLAUDE_CODE_STORAGE, "message");
export const PART_STORAGE = join(CLAUDE_CODE_STORAGE, "part");

/**
 * Part type sets for categorization
 */
export const THINKING_TYPES = new Set(["thinking", "redacted_thinking", "reasoning"]);
export const META_TYPES = new Set(["step-start", "step-finish"]);
export const CONTENT_TYPES = new Set(["text", "tool", "tool_use", "tool_result"]);

/**
 * Recovery messages
 */
export const RECOVERY_RESUME_TEXT = "[session recovered - continuing previous task]";
export const PLACEHOLDER_TEXT = "[user interrupted]";

/**
 * Toast/notification messages for recovery
 */
export const RECOVERY_MESSAGES = {
  tool_result_missing: {
    title: "Tool Crash Recovery",
    message: "Injecting cancelled tool results...",
  },
  thinking_block_order: {
    title: "Thinking Block Recovery",
    message: "Fixing message structure...",
  },
  thinking_disabled_violation: {
    title: "Thinking Strip Recovery",
    message: "Stripping thinking blocks...",
  },
  empty_content: {
    title: "Empty Content Recovery",
    message: "Adding placeholder content...",
  },
} as const;

/**
 * Recovery error patterns
 */
export const ERROR_PATTERNS = {
  tool_result_missing: ["tool_use", "tool_result"],
  thinking_block_order: [
    "thinking",
    "first block",
    "must start with",
    "preceeding",
    "final block",
    "cannot be thinking",
  ],
  thinking_disabled_violation: ["thinking is disabled", "cannot contain"],
  empty_content: ["empty", "content", "message"],
} as const;

/**
 * Debug logging configuration
 */
export const DEBUG = process.env.SESSION_RECOVERY_DEBUG === "1";
export const DEBUG_LOG_PATH = join(tmpdir(), "session-recovery-debug.log");

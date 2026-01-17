/**
 * Session Recovery Types
 *
 * Types for session state recovery when Claude Code restarts or crashes.
 * Adapted from oh-my-opencode's session-recovery hook.
 */

export type ThinkingPartType = "thinking" | "redacted_thinking" | "reasoning";
export type MetaPartType = "step-start" | "step-finish";
export type ContentPartType = "text" | "tool" | "tool_use" | "tool_result";

/**
 * Stored message metadata
 */
export interface StoredMessageMeta {
  id: string;
  sessionID: string;
  role: "user" | "assistant";
  parentID?: string;
  time?: {
    created: number;
    completed?: number;
  };
  error?: unknown;
}

/**
 * Stored text part
 */
export interface StoredTextPart {
  id: string;
  sessionID: string;
  messageID: string;
  type: "text";
  text: string;
  synthetic?: boolean;
  ignored?: boolean;
}

/**
 * Stored tool part
 */
export interface StoredToolPart {
  id: string;
  sessionID: string;
  messageID: string;
  type: "tool";
  callID: string;
  tool: string;
  state: {
    status: "pending" | "running" | "completed" | "error";
    input: Record<string, unknown>;
    output?: string;
    error?: string;
  };
}

/**
 * Stored reasoning/thinking part
 */
export interface StoredReasoningPart {
  id: string;
  sessionID: string;
  messageID: string;
  type: "reasoning";
  text: string;
}

/**
 * Stored step part
 */
export interface StoredStepPart {
  id: string;
  sessionID: string;
  messageID: string;
  type: "step-start" | "step-finish";
}

/**
 * Union of all stored part types
 */
export type StoredPart =
  | StoredTextPart
  | StoredToolPart
  | StoredReasoningPart
  | StoredStepPart
  | {
      id: string;
      sessionID: string;
      messageID: string;
      type: string;
      [key: string]: unknown;
    };

/**
 * Message data structure
 */
export interface MessageData {
  info?: {
    id?: string;
    role?: string;
    sessionID?: string;
    parentID?: string;
    error?: unknown;
    agent?: string;
    model?: {
      providerID: string;
      modelID: string;
    };
    system?: string;
    tools?: Record<string, boolean>;
  };
  parts?: Array<{
    type: string;
    id?: string;
    text?: string;
    thinking?: string;
    name?: string;
    input?: Record<string, unknown>;
    callID?: string;
  }>;
}

/**
 * Resume configuration
 */
export interface ResumeConfig {
  sessionID: string;
  agent?: string;
  model?: {
    providerID: string;
    modelID: string;
  };
}

/**
 * Recovery error types
 */
export type RecoveryErrorType =
  | "tool_result_missing"
  | "thinking_block_order"
  | "thinking_disabled_violation"
  | "empty_content"
  | null;

/**
 * Recovery result
 */
export interface RecoveryResult {
  attempted: boolean;
  success: boolean;
  message?: string;
  errorType?: string;
}

/**
 * Session recovery configuration
 */
export interface SessionRecoveryConfig {
  /** Whether to enable auto-resume after recovery */
  autoResume?: boolean;
  /** Whether to enable detailed logging */
  debug?: boolean;
  /** Custom recovery messages */
  customMessages?: Partial<Record<RecoveryErrorType & string, string>>;
}

/**
 * Context Window Limit Recovery Constants
 *
 * Messages and prompts for recovery from context limit errors.
 *
 * Adapted from oh-my-opencode's anthropic-context-window-limit-recovery hook.
 */

/**
 * Recovery message when context window limit is hit
 */
export const CONTEXT_LIMIT_RECOVERY_MESSAGE = `CONTEXT WINDOW LIMIT REACHED - IMMEDIATE ACTION REQUIRED

The conversation has exceeded the model's context window limit. To continue working effectively, you must take one of these actions:

1. SUMMARIZE THE CONVERSATION
   - Use the /compact command if available
   - Or provide a concise summary of what has been accomplished so far
   - Include key decisions, code changes, and remaining tasks

2. START A FRESH CONTEXT
   - If summarization isn't sufficient, suggest starting a new session
   - Provide a handoff message with essential context

3. REDUCE OUTPUT SIZE
   - When showing code, show only relevant portions
   - Use file paths and line numbers instead of full code blocks
   - Be more concise in explanations

IMPORTANT: Do not attempt to continue without addressing this limit.
The API will reject further requests until the context is reduced.

Current Status:
- Context limit exceeded
- Further API calls will fail until context is reduced
- Action required before continuing
`;

/**
 * Short notification for context limit
 */
export const CONTEXT_LIMIT_SHORT_MESSAGE = `Context window limit reached. Please use /compact to summarize the conversation or start a new session.`;

/**
 * Recovery message for non-empty content errors
 */
export const NON_EMPTY_CONTENT_RECOVERY_MESSAGE = `API ERROR: Non-empty content validation failed.

This error typically occurs when:
- A message has empty text content
- The conversation structure is invalid

Suggested actions:
1. Continue with a new message
2. If the error persists, start a new session

The system will attempt automatic recovery.
`;

/**
 * Recovery message when truncation was applied
 */
export const TRUNCATION_APPLIED_MESSAGE = `CONTEXT OPTIMIZATION APPLIED

Some tool outputs have been truncated to fit within the context window.
The conversation can now continue normally.

If you need to see the full output of a previous tool call, you can:
- Re-run the specific command
- Ask to see a particular file or section

Continuing with the current task...
`;

/**
 * Message when recovery fails
 */
export const RECOVERY_FAILED_MESSAGE = `CONTEXT RECOVERY FAILED

All automatic recovery attempts have been exhausted.
Please start a new session to continue.

Before starting a new session:
1. Note what has been accomplished
2. Save any important code changes
3. Document the current state of the task

You can copy this conversation summary to continue in a new session.
`;

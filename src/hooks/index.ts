/**
 * Hooks Module for Oh-My-Claude-Sisyphus
 *
 * This module provides the TypeScript bridge for Claude Code's native shell hook system.
 * Shell scripts call these TypeScript functions for complex logic processing.
 *
 * Architecture:
 * - Claude Code runs shell scripts on hook events (UserPromptSubmit, Stop, etc.)
 * - Shell scripts invoke Node.js bridge for complex processing
 * - Bridge returns JSON response that shell passes back to Claude Code
 */

export {
  // Keyword detection
  detectKeywordsWithType,
  extractPromptText,
  removeCodeBlocks,
  type DetectedKeyword,
  type KeywordType
} from './keyword-detector/index.js';

export {
  // Ralph Loop (persistence)
  createRalphLoopHook,
  readRalphState,
  writeRalphState,
  clearRalphState,
  type RalphLoopState,
  type RalphLoopHook
} from './ralph-loop/index.js';

export {
  // Todo Continuation
  createTodoContinuationHook,
  checkIncompleteTodos,
  type TodoContinuationHook
} from './todo-continuation/index.js';

export {
  // Hook Bridge (main entry point for shell scripts)
  processHook,
  type HookInput,
  type HookOutput
} from './bridge.js';

export {
  // Edit Error Recovery
  createEditErrorRecoveryHook,
  detectEditError,
  injectEditErrorRecovery,
  processEditOutput,
  EDIT_ERROR_PATTERNS,
  EDIT_ERROR_REMINDER,
  type ToolExecuteInput,
  type ToolExecuteOutput
} from './edit-error-recovery/index.js';

export {
  // Think Mode
  createThinkModeHook,
  detectThinkKeyword,
  detectUltrathinkKeyword,
  extractPromptText as extractThinkPromptText,
  removeCodeBlocks as removeThinkCodeBlocks,
  getHighVariant,
  isAlreadyHighVariant,
  getThinkingConfig,
  getClaudeThinkingConfig,
  clearThinkModeState,
  getThinkModeState,
  isThinkModeActive,
  processThinkMode,
  shouldActivateThinkMode,
  shouldActivateUltrathink,
  THINKING_CONFIGS,
  type ThinkModeState,
  type ModelRef,
  type MessageWithModel,
  type ThinkModeInput,
  type ClaudeThinkingConfig,
  type ThinkingConfig
} from './think-mode/index.js';

export {
  // Rules Injector
  createRulesInjectorHook,
  getRulesForPath,
  findProjectRoot,
  findRuleFiles,
  parseRuleFrontmatter,
  shouldApplyRule,
  createContentHash,
  isDuplicateByRealPath,
  isDuplicateByContentHash,
  loadInjectedRules,
  saveInjectedRules,
  clearInjectedRules,
  RULES_INJECTOR_STORAGE,
  PROJECT_MARKERS,
  PROJECT_RULE_SUBDIRS,
  PROJECT_RULE_FILES,
  USER_RULE_DIR,
  RULE_EXTENSIONS,
  TRACKED_TOOLS,
  type RuleMetadata,
  type RuleInfo,
  type RuleFileCandidate,
  type InjectedRulesData,
  type RuleToInject,
  type MatchResult,
  type RuleFrontmatterResult
} from './rules-injector/index.js';

export {
  // Sisyphus Orchestrator
  createSisyphusOrchestratorHook,
  isAllowedPath,
  isWriteEditTool,
  getGitDiffStats,
  formatFileChanges,
  buildVerificationReminder,
  buildOrchestratorReminder,
  buildBoulderContinuation,
  checkBoulderContinuation,
  processOrchestratorPreTool,
  processOrchestratorPostTool,
  HOOK_NAME as SISYPHUS_ORCHESTRATOR_HOOK_NAME,
  ALLOWED_PATH_PREFIX,
  WRITE_EDIT_TOOLS,
  DIRECT_WORK_REMINDER,
  ORCHESTRATOR_DELEGATION_REQUIRED,
  BOULDER_CONTINUATION_PROMPT,
  VERIFICATION_REMINDER,
  SINGLE_TASK_DIRECTIVE,
  type ToolExecuteInput as OrchestratorToolInput,
  type ToolExecuteOutput as OrchestratorToolOutput
} from './sisyphus-orchestrator/index.js';

export {
  // Auto Slash Command
  createAutoSlashCommandHook,
  processSlashCommand,
  detectSlashCommand,
  extractPromptText as extractSlashPromptText,
  parseSlashCommand,
  removeCodeBlocks as removeSlashCodeBlocks,
  isExcludedCommand,
  executeSlashCommand,
  findCommand,
  discoverAllCommands,
  listAvailableCommands,
  HOOK_NAME as AUTO_SLASH_COMMAND_HOOK_NAME,
  AUTO_SLASH_COMMAND_TAG_OPEN,
  AUTO_SLASH_COMMAND_TAG_CLOSE,
  SLASH_COMMAND_PATTERN,
  EXCLUDED_COMMANDS,
  type AutoSlashCommandHookInput,
  type AutoSlashCommandHookOutput,
  type ParsedSlashCommand,
  type AutoSlashCommandResult,
  type CommandInfo,
  type CommandMetadata,
  type CommandScope,
  type ExecuteResult
} from './auto-slash-command/index.js';

export {
  // Comment Checker
  createCommentCheckerHook,
  checkForComments,
  applyFilters as applyCommentFilters,
  BDD_KEYWORDS,
  TYPE_CHECKER_PREFIXES,
  HOOK_MESSAGE_HEADER as COMMENT_CHECKER_MESSAGE_HEADER,
  LINE_COMMENT_PATTERNS,
  EXTENSION_TO_LANGUAGE,
  type CommentInfo,
  type CommentCheckResult,
  type PendingCall as CommentPendingCall,
  type CommentCheckerConfig
} from './comment-checker/index.js';

export {
  // Context Window Limit Recovery
  createContextLimitRecoveryHook,
  detectContextLimitError,
  parseContextLimitError,
  parseTokenLimitError,
  containsTokenLimitError,
  TOKEN_LIMIT_PATTERNS,
  TOKEN_LIMIT_KEYWORDS,
  CONTEXT_LIMIT_RECOVERY_MESSAGE,
  CONTEXT_LIMIT_SHORT_MESSAGE,
  NON_EMPTY_CONTENT_RECOVERY_MESSAGE,
  TRUNCATION_APPLIED_MESSAGE,
  RECOVERY_FAILED_MESSAGE,
  RETRY_CONFIG,
  TRUNCATE_CONFIG,
  type ParsedTokenLimitError,
  type RetryState,
  type TruncateState,
  type RecoveryResult,
  type ContextLimitRecoveryConfig
} from './context-window-limit-recovery/index.js';

export {
  // Preemptive Compaction
  createPreemptiveCompactionHook,
  estimateTokens,
  analyzeContextUsage,
  getSessionTokenEstimate,
  resetSessionTokenEstimate,
  DEFAULT_THRESHOLD as PREEMPTIVE_DEFAULT_THRESHOLD,
  CRITICAL_THRESHOLD,
  COMPACTION_COOLDOWN_MS,
  MAX_WARNINGS,
  CLAUDE_DEFAULT_CONTEXT_LIMIT,
  CHARS_PER_TOKEN,
  CONTEXT_WARNING_MESSAGE,
  CONTEXT_CRITICAL_MESSAGE,
  type ContextUsageResult,
  type PreemptiveCompactionConfig
} from './preemptive-compaction/index.js';

export {
  // Background Notification
  createBackgroundNotificationHook,
  processBackgroundNotification,
  processBackgroundNotificationHook,
  checkBackgroundNotifications,
  handleBackgroundEvent,
  HOOK_NAME as BACKGROUND_NOTIFICATION_HOOK_NAME,
  type BackgroundNotificationHookConfig,
  type BackgroundNotificationHookInput,
  type BackgroundNotificationHookOutput,
  type NotificationCheckResult
} from './background-notification/index.js';

export {
  // Directory README Injector
  createDirectoryReadmeInjectorHook,
  getReadmesForPath,
  loadInjectedPaths,
  saveInjectedPaths,
  clearInjectedPaths,
  README_INJECTOR_STORAGE,
  README_FILENAME,
  TRACKED_TOOLS as README_TRACKED_TOOLS,
  type InjectedPathsData
} from './directory-readme-injector/index.js';

export {
  // Empty Message Sanitizer
  createEmptyMessageSanitizerHook,
  sanitizeMessages,
  sanitizeMessage,
  hasTextContent,
  isToolPart,
  hasValidContent,
  PLACEHOLDER_TEXT,
  TOOL_PART_TYPES,
  HOOK_NAME as EMPTY_MESSAGE_SANITIZER_HOOK_NAME,
  DEBUG_PREFIX as EMPTY_MESSAGE_SANITIZER_DEBUG_PREFIX,
  ERROR_PATTERNS as EMPTY_MESSAGE_SANITIZER_ERROR_PATTERNS,
  type MessagePart,
  type MessageInfo,
  type MessageWithParts,
  type EmptyMessageSanitizerInput,
  type EmptyMessageSanitizerOutput,
  type EmptyMessageSanitizerConfig
} from './empty-message-sanitizer/index.js';

export {
  // Thinking Block Validator
  createThinkingBlockValidatorHook,
  isExtendedThinkingModel,
  hasContentParts,
  startsWithThinkingBlock,
  findPreviousThinkingContent,
  prependThinkingBlock,
  validateMessage,
  validateMessages,
  getValidationStats,
  HOOK_NAME as THINKING_BLOCK_VALIDATOR_HOOK_NAME,
  CONTENT_PART_TYPES,
  THINKING_PART_TYPES,
  THINKING_MODEL_PATTERNS,
  DEFAULT_THINKING_CONTENT,
  SYNTHETIC_THINKING_ID_PREFIX,
  PREVENTED_ERROR,
  type MessagePart as ThinkingValidatorMessagePart,
  type MessageInfo as ThinkingValidatorMessageInfo,
  type MessageWithParts as ThinkingValidatorMessageWithParts,
  type MessagesTransformInput,
  type MessagesTransformOutput,
  type MessagesTransformHook,
  type ValidationResult
} from './thinking-block-validator/index.js';

export {
  // Non-Interactive Environment
  nonInteractiveEnvHook,
  isNonInteractive,
  HOOK_NAME as NON_INTERACTIVE_ENV_HOOK_NAME,
  NON_INTERACTIVE_ENV,
  SHELL_COMMAND_PATTERNS,
  type NonInteractiveEnvConfig,
  type ShellHook
} from './non-interactive-env/index.js';

export {
  // Session Recovery
  createSessionRecoveryHook,
  handleSessionRecovery,
  detectErrorType,
  isRecoverableError,
  findEmptyMessages as findRecoveryEmptyMessages,
  findMessagesWithThinkingBlocks as findRecoveryThinkingBlocks,
  findMessagesWithOrphanThinking as findRecoveryOrphanThinking,
  readMessages as readRecoveryMessages,
  readParts as readRecoveryParts,
  RECOVERY_MESSAGES,
  PLACEHOLDER_TEXT as RECOVERY_PLACEHOLDER_TEXT,
  type MessageData,
  type RecoveryErrorType,
  type RecoveryResult as SessionRecoveryResult,
  type SessionRecoveryConfig,
  type StoredMessageMeta,
  type StoredPart,
  type StoredTextPart,
  type StoredToolPart
} from './session-recovery/index.js';

export {
  // Agent Usage Reminder
  createAgentUsageReminderHook,
  loadAgentUsageState,
  saveAgentUsageState,
  clearAgentUsageState,
  TARGET_TOOLS,
  AGENT_TOOLS,
  REMINDER_MESSAGE,
  type AgentUsageState
} from './agent-usage-reminder/index.js';

export {
  // Ultrawork State (Persistent Mode)
  activateUltrawork,
  deactivateUltrawork,
  readUltraworkState,
  writeUltraworkState,
  incrementReinforcement,
  shouldReinforceUltrawork,
  getUltraworkPersistenceMessage,
  createUltraworkStateHook,
  type UltraworkState
} from './ultrawork-state/index.js';

export {
  // Persistent Mode (Unified Stop Handler)
  checkPersistentModes,
  createHookOutput,
  type PersistentModeResult
} from './persistent-mode/index.js';

export {
  // Plugin Patterns (Popular Community Patterns)
  getFormatter,
  isFormatterAvailable,
  formatFile,
  getLinter,
  lintFile,
  validateCommitMessage,
  runTypeCheck,
  runTests,
  runPreCommitChecks,
  getPreCommitReminderMessage,
  getAutoFormatMessage,
  type FormatConfig,
  type LintConfig,
  type CommitConfig,
  type PreCommitResult
} from './plugin-patterns/index.js';

export {
  // Ralph Verifier (Oracle-verified completion)
  readVerificationState,
  writeVerificationState,
  clearVerificationState,
  startVerification,
  recordOracleFeedback,
  getOracleVerificationPrompt,
  getOracleRejectionContinuationPrompt,
  detectOracleApproval,
  detectOracleRejection,
  type VerificationState
} from './ralph-verifier/index.js';

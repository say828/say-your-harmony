/**
 * Agents Module Exports
 *
 * New modular agent system with individual files and metadata.
 * Maintains backward compatibility with definitions.ts exports.
 */

// Types
export * from './types.js';

// Utilities
export {
  createAgentToolRestrictions,
  mergeAgentConfig,
  buildDelegationTable,
  buildUseAvoidSection,
  createEnvContext,
  getAvailableAgents,
  buildKeyTriggersSection,
  validateAgentConfig,
  deepMerge
} from './utils.js';

// Individual agent exports (say-your-harmony 4-phase system)

// Core agents (4-phase workflow)
export { harmonyAgent, HARMONY_PROMPT_METADATA } from './harmony.js';
export { plannerAgent, PLANNER_PROMPT_METADATA } from './planner.js';
export { architectAgent, ARCHITECT_PROMPT_METADATA } from './architect.js';
export { builderAgent, BUILDER_PROMPT_METADATA } from './builder.js';
export { operatorAgent, OPERATOR_PROMPT_METADATA } from './operator.js';

// Support agents
export { explorerAgent, EXPLORER_PROMPT_METADATA } from './explorer.js';
export { documenterAgent, DOCUMENTER_PROMPT_METADATA } from './documenter.js';
export { metaAnalyzerAgent, META_ANALYZER_PROMPT_METADATA } from './meta-analyzer.js';

// Legacy exports (backward compatibility - getAgentDefinitions and harmonySystemPrompt)
export {
  getAgentDefinitions,
  harmonySystemPrompt
} from './definitions.js';

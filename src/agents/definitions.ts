/**
 * Agent Definitions for Say-Your-Harmony
 *
 * This module provides the getAgentDefinitions() function and harmonySystemPrompt
 * for backward compatibility. All agents are now defined in individual files:
 * - harmony.ts (orchestrator)
 * - planner.ts (Phase 1: Planning)
 * - architect.ts (Phase 2: Design)
 * - builder.ts (Phase 3: Implementation)
 * - operator.ts (Phase 4: Operation)
 * - explorer.ts (support: codebase search)
 * - documenter.ts (support: documentation)
 * - meta-analyzer.ts (support: meta-analysis)
 * - meta-aggregator.ts (support: cross-session pattern consolidation)
 */

import type { ModelType } from '../shared/types.js';

// Import all agents from their individual files
import { harmonyAgent } from './harmony.js';
import { plannerAgent } from './planner.js';
import { architectAgent } from './architect.js';
import { builderAgent } from './builder.js';
import { operatorAgent } from './operator.js';
import { explorerAgent } from './explorer.js';
import { documenterAgent } from './documenter.js';
import { metaAnalyzerAgent } from './meta-analyzer.js';
import { metaAggregatorAgent } from './meta-aggregator.js';

/**
 * Get all agent definitions as a record for use with Claude Agent SDK
 *
 * Say-Your-Harmony 9-Agent System:
 * - harmony: Master orchestrator (4-phase workflow)
 * - planner: Phase 1 - Planning (problem definition, requirements)
 * - architect: Phase 2 - Design (architecture, decisions, tradeoffs)
 * - builder: Phase 3 - Implementation (parallel coding, testing)
 * - operator: Phase 4 - Operation (deployment, verification, meta-analysis)
 * - explorer: Support - Fast codebase search
 * - documenter: Support - Technical documentation
 * - meta-analyzer: Support - Session meta-analysis
 * - meta-aggregator: Support - Cross-session pattern consolidation
 */
export function getAgentDefinitions(overrides?: Partial<Record<string, Partial<{
  description: string;
  prompt: string;
  tools: string[];
  model: ModelType;
}>>>): Record<string, {
  description: string;
  prompt: string;
  tools: string[];
  model?: ModelType;
}> {
  const agents = {
    // Orchestrator
    harmony: harmonyAgent,
    // Core 4-phase agents
    planner: plannerAgent,
    architect: architectAgent,
    builder: builderAgent,
    operator: operatorAgent,
    // Support agents
    explorer: explorerAgent,
    documenter: documenterAgent,
    'meta-analyzer': metaAnalyzerAgent,
    'meta-aggregator': metaAggregatorAgent,
  };

  const result: Record<string, { description: string; prompt: string; tools: string[]; model?: ModelType }> = {};

  for (const [name, config] of Object.entries(agents)) {
    const override = overrides?.[name];
    result[name] = {
      description: override?.description ?? config.description,
      prompt: override?.prompt ?? config.prompt,
      tools: override?.tools ?? config.tools,
      model: (override?.model ?? config.model) as ModelType | undefined
    };
  }

  return result;
}

/**
 * Harmony System Prompt - The 4-Phase Development Orchestrator
 *
 * This is the main system prompt that enforces the say-your-harmony philosophy:
 * - 4-phase mandatory workflow (Planning → Design → Implementation → Operation)
 * - Parallel execution for 4x efficiency
 * - Meta-analysis for continuous improvement
 * - Decision documentation culture
 */
export const harmonySystemPrompt = `You are Harmony, the orchestrator of a 4-phase development system for structured, high-quality software engineering.

## THE 4-PHASE MANDATE

Every development task MUST progress through four mandatory phases:

\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│  PLANNING   │ →  │   DESIGN    │ →  │ IMPLEMENTATION  │ →  │  OPERATION  │
└─────────────┘    └─────────────┘    └─────────────────┘    └─────────────┘
     │                  │                    │                     │
     ▼                  ▼                    ▼                     ▼
 • Problem          • Architecture       • Parallel           • Deployment
 • Requirements     • Decisions         • Testing            • Verification
 • Information      • Tradeoffs         • Risk Analysis      • Meta-Analysis
\`\`\`

## Available Agents (9-Agent System)

### Core 4-Phase Agents
- **planner**: Phase 1 - Problem definition, requirements gathering, information research
- **architect**: Phase 2 - Architecture design, decision documentation, tradeoff analysis
- **builder**: Phase 3 - Parallel implementation, testing, risk identification
- **operator**: Phase 4 - Deployment, verification, meta-analysis generation

### Support Agents
- **explorer**: Fast internal codebase search (use for finding implementations)
- **documenter**: Technical writing (use for README, API docs, guides)
- **meta-analyzer**: Session analysis (use for pattern extraction, continuous improvement)
- **meta-aggregator**: Cross-session pattern consolidation (use for aggregating multiple meta-analyses into PATTERNS.md)

## Orchestration Principles

1. **NO SHORTCUTS**: Every task goes through all 4 phases
2. **PARALLEL EXECUTION**: Independent tasks run concurrently (4x minimum efficiency)
3. **DETAILED DELEGATION**: Every Task call includes full context (TASK, OUTCOME, CONTEXT)
4. **VERIFY TRANSITIONS**: Check completion criteria before phase transition
5. **TODO TRACKING**: Use TodoWrite to track phases in real-time
6. **META-ANALYSIS MANDATORY**: Generate analysis after every major task

## Workflow

1. **Phase 1 - Planning** (planner agent)
   - Read ALL relevant documents
   - Gather maximum context
   - Define problem correctly (50% of success)
   - Research latest information (WebSearch)

2. **Phase 2 - Design** (architect agent)
   - Create architecture with documented decisions
   - Analyze tradeoffs (Security vs UX, etc.)
   - Classify risks (P0/P1/P2/P3)
   - Document rationale for all choices

3. **Phase 3 - Implementation** (builder agent)
   - PARALLEL execution for independent tasks
   - Write tests alongside code
   - Identify implementation-level risks
   - Verify build succeeds

4. **Phase 4 - Operation** (operator agent)
   - Verify deployment
   - Validate P0/P1 risk mitigations
   - Generate meta-analysis document
   - Extract patterns for improvement

## The Harmony Promise

Before concluding, verify:
- [ ] All 4 phases completed
- [ ] Tests passing
- [ ] P0 risks fixed
- [ ] Meta-analysis generated
- [ ] User request FULLY satisfied

If ANY checkbox is unchecked, YOU ARE NOT DONE. Continue working.

## Communication Style

- Start work immediately, no acknowledgments
- Brief phase announcements ("Entering Planning phase...")
- Concise status updates
- Direct answers
- No over-explaining`;

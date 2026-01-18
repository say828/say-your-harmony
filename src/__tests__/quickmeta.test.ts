/**
 * QuickMeta Tests
 *
 * Validates the fast meta-analysis system for 4-phase workflow
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

import {
  extractQuickPatterns,
  generateSessionId,
  saveQuickMeta,
  loadQuickMeta,
  loadSessionQuickMeta,
  buildPhaseInsight,
  onPhaseComplete,
  startPhase,
  createSessionState,
  enterPhase,
  completePhase,
  isSessionComplete,
  getSessionSummary,
  shouldTriggerBackgroundAnalysis,
  getQuickMetaSummary,
} from '../lib/quickmeta/index.js';
import type { QuickMeta, ExtractionContext } from '../types/quickmeta.js';
import type { Phase } from '../types/pattern.js';

const TEST_BASE_DIR = path.join(os.homedir(), '.claude', 'meta', 'quickmeta');

describe('QuickMeta Extractor', () => {
  describe('extractQuickPatterns', () => {
    it('should extract patterns from content with approach keywords', () => {
      const ctx: ExtractionContext = {
        content: 'We used parallel execution with concurrent tasks for better performance. The cached results improved efficiency.',
        phase: 'implementation',
      };

      const result = extractQuickPatterns(ctx);

      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.patterns.some((p) => p.category === 'approach')).toBe(true);
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should extract decisions from content', () => {
      const ctx: ExtractionContext = {
        content: 'We chose file-based storage because Claude Code has no shared memory. Rejected in-memory cache due to process isolation.',
        phase: 'design',
      };

      const result = extractQuickPatterns(ctx);

      expect(result.decisions.length).toBeGreaterThan(0);
      expect(result.decisions[0].alternatives.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract risks from content', () => {
      const ctx: ExtractionContext = {
        content: 'P0 critical security vulnerability identified. P1 high priority issue must fix before deployment. Medium risk tech debt found.',
        phase: 'operation',
      };

      const result = extractQuickPatterns(ctx);

      expect(result.risks.length).toBeGreaterThan(0);
      expect(result.risks.some((r) => r.severity === 'P0')).toBe(true);
      expect(result.risks.some((r) => r.severity === 'P1')).toBe(true);
    });

    it('should complete extraction in under 100ms', () => {
      const largeContent = 'parallel '.repeat(1000) + 'cached '.repeat(1000);
      const ctx: ExtractionContext = {
        content: largeContent,
        phase: 'implementation',
      };

      const start = Date.now();
      extractQuickPatterns(ctx);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100);
    });

    it('should limit patterns to max 5', () => {
      const ctx: ExtractionContext = {
        content: 'parallel concurrent async batch incremental iterative recursive cached memoized lazy eager performance faster efficient optimized cached reduced improved simplified refactored retry fallback error handling recovery fix workaround mitigation resolved debugged chose selected decided rejected preferred because rationale reason tradeoff vs alternative Task Read Write Grep Glob Bash WebSearch TodoWrite',
        phase: 'implementation',
      };

      const result = extractQuickPatterns(ctx);

      expect(result.patterns.length).toBeLessThanOrEqual(5);
    });

    it('should limit decisions to max 3', () => {
      const ctx: ExtractionContext = {
        content: 'We chose A because X. We selected B because Y. We decided on C because Z. We preferred D because W.',
        phase: 'design',
      };

      const result = extractQuickPatterns(ctx);

      expect(result.decisions.length).toBeLessThanOrEqual(3);
    });

    it('should limit risks to max 3', () => {
      const ctx: ExtractionContext = {
        content: 'P0 issue. P1 problem. P2 concern. P3 minor thing.',
        phase: 'operation',
      };

      const result = extractQuickPatterns(ctx);

      expect(result.risks.length).toBeLessThanOrEqual(3);
    });
  });
});

describe('QuickMeta Session ID', () => {
  it('should generate valid session ID format', () => {
    const sessionId = generateSessionId();

    // Format: YYYY-MM-DD-HHmmss-XXXX
    expect(sessionId).toMatch(/^\d{4}-\d{2}-\d{2}-\d{6}-[a-z0-9]{4}$/);
  });

  it('should generate unique session IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateSessionId());
    }
    // Most should be unique (allowing for same-millisecond collisions)
    expect(ids.size).toBeGreaterThan(90);
  });
});

describe('QuickMeta Storage', () => {
  const testSessionId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  afterEach(async () => {
    // Cleanup test session
    try {
      await fs.rm(path.join(TEST_BASE_DIR, testSessionId), { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should save and load QuickMeta', async () => {
    const meta: QuickMeta = {
      version: 1,
      sessionId: testSessionId,
      phase: 'planning',
      completedAt: new Date().toISOString(),
      summary: 'Test planning phase',
      patterns: [
        {
          id: 'test-pattern',
          category: 'approach',
          summary: 'Test pattern',
          keywords: ['test'],
          confidence: 0.8,
        },
      ],
      decisions: [],
      risks: [],
      metrics: {
        durationMs: 1000,
        toolCalls: 5,
        delegations: 1,
        parallelTasks: 0,
      },
      handoffNote: 'Test handoff',
    };

    await saveQuickMeta(meta);
    const loaded = await loadQuickMeta(testSessionId, 'planning');

    expect(loaded).not.toBeNull();
    expect(loaded?.sessionId).toBe(testSessionId);
    expect(loaded?.phase).toBe('planning');
    expect(loaded?.patterns.length).toBe(1);
  });

  it('should return null for non-existent QuickMeta', async () => {
    const loaded = await loadQuickMeta('non-existent-session', 'planning');
    expect(loaded).toBeNull();
  });

  it('should keep realistic QuickMeta size under 4KB', async () => {
    // Test with realistic field lengths (not maximum allowed)
    const meta: QuickMeta = {
      version: 1,
      sessionId: testSessionId,
      phase: 'design',
      completedAt: new Date().toISOString(),
      summary: 'Designed architecture with file-based storage approach',
      patterns: Array(5).fill(null).map((_, i) => ({
        id: `pattern-${i}`,
        category: 'approach' as const,
        summary: 'Used parallel execution for efficiency',
        keywords: ['parallel', 'concurrent', 'async'],
        confidence: 0.8,
      })),
      decisions: Array(3).fill(null).map(() => ({
        topic: 'Storage approach selection',
        choice: 'File-based JSON',
        rationale: 'Claude Code has no shared memory between tasks',
        alternatives: ['In-memory', 'SQLite'],
      })),
      risks: Array(3).fill(null).map(() => ({
        severity: 'P1' as const,
        description: 'Integration complexity may cause issues',
        status: 'identified' as const,
        mitigation: 'Add comprehensive tests',
      })),
      metrics: {
        durationMs: 100000,
        toolCalls: 50,
        delegations: 3,
        parallelTasks: 2,
      },
      handoffNote: 'Architecture complete. Ready for implementation.',
    };

    const content = JSON.stringify(meta, null, 2);
    // Realistic QuickMeta should be well under 4KB
    expect(content.length).toBeLessThan(4096);
  });
});

describe('QuickMeta Phase Insight', () => {
  const testSessionId = `insight-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  beforeEach(async () => {
    // Create planning phase QuickMeta
    const planningMeta: QuickMeta = {
      version: 1,
      sessionId: testSessionId,
      phase: 'planning',
      completedAt: new Date().toISOString(),
      summary: 'Gathered requirements for test feature',
      patterns: [
        {
          id: 'test-p1',
          category: 'approach',
          summary: 'Used iterative approach',
          keywords: ['iterative'],
          confidence: 0.9,
        },
      ],
      decisions: [
        {
          topic: 'Architecture',
          choice: 'Microservices',
          rationale: 'Better scalability',
          alternatives: ['Monolith'],
        },
      ],
      risks: [
        {
          severity: 'P1',
          description: 'Integration complexity',
          status: 'identified',
        },
      ],
      metrics: {
        durationMs: 60000,
        toolCalls: 10,
        delegations: 1,
        parallelTasks: 0,
      },
      handoffNote: 'Ready for design',
    };

    await saveQuickMeta(planningMeta);
  });

  afterEach(async () => {
    try {
      await fs.rm(path.join(TEST_BASE_DIR, testSessionId), { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should return null for first phase (planning)', async () => {
    const insight = await buildPhaseInsight(testSessionId, 'planning');
    expect(insight).toBeNull();
  });

  it('should build insight for subsequent phases', async () => {
    const insight = await buildPhaseInsight(testSessionId, 'design');

    expect(insight).not.toBeNull();
    expect(insight?.completedPhases.length).toBe(1);
    expect(insight?.completedPhases[0].phase).toBe('planning');
    expect(insight?.activeRisks.length).toBe(1);
    expect(insight?.keyDecisions.length).toBe(1);
    expect(insight?.formatted).toContain('<phase-context');
  });

  it('should format insight for injection', async () => {
    const insight = await buildPhaseInsight(testSessionId, 'design');

    expect(insight?.formatted).toContain('## Prior Phase Summary');
    expect(insight?.formatted).toContain('PLANNING');
    expect(insight?.formatted).toContain('## Active Risks');
    expect(insight?.formatted).toContain('[P1]');
  });
});

describe('QuickMeta Orchestration', () => {
  const testSessionId = `orch-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  afterEach(async () => {
    try {
      await fs.rm(path.join(TEST_BASE_DIR, testSessionId), { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should complete phase and save QuickMeta', async () => {
    const meta = await onPhaseComplete({
      sessionId: testSessionId,
      phase: 'planning',
      agentOutput: 'We used parallel execution with concurrent tasks. Chose file-based storage because of constraints.',
      startTime: Date.now() - 60000,
      endTime: Date.now(),
      delegationCount: 1,
      parallelTaskCount: 0,
    });

    expect(meta.sessionId).toBe(testSessionId);
    expect(meta.phase).toBe('planning');
    expect(meta.patterns.length).toBeGreaterThan(0);
    expect(meta.metrics.durationMs).toBeGreaterThan(0);

    // Verify saved to disk
    const loaded = await loadQuickMeta(testSessionId, 'planning');
    expect(loaded).not.toBeNull();
  });

  it('should provide injection text for phase start', async () => {
    // First complete planning
    await onPhaseComplete({
      sessionId: testSessionId,
      phase: 'planning',
      agentOutput: 'Completed planning with iterative approach.',
      startTime: Date.now() - 30000,
      endTime: Date.now(),
      delegationCount: 1,
      parallelTaskCount: 0,
    });

    // Then start design
    const { insight, injectionText } = await startPhase(testSessionId, 'design');

    expect(insight).not.toBeNull();
    expect(injectionText.length).toBeGreaterThan(0);
    expect(injectionText).toContain('<phase-context');
  });
});

describe('QuickMeta Session State', () => {
  it('should create initial session state', () => {
    const state = createSessionState();

    expect(state.sessionId).toMatch(/^\d{4}-\d{2}-\d{2}-\d{6}-[a-z0-9]{4}$/);
    expect(state.currentPhase).toBeNull();
    expect(state.completedPhases).toEqual([]);
    expect(state.quickMetas).toEqual({});
  });

  it('should track phase entry', () => {
    let state = createSessionState();
    state = enterPhase(state, 'planning');

    expect(state.currentPhase).toBe('planning');
    expect(state.phaseStartTime).toBeGreaterThan(0);
  });

  it('should track phase completion', () => {
    let state = createSessionState();
    state = enterPhase(state, 'planning');

    const mockMeta: QuickMeta = {
      version: 1,
      sessionId: state.sessionId,
      phase: 'planning',
      completedAt: new Date().toISOString(),
      summary: 'Done',
      patterns: [],
      decisions: [],
      risks: [],
      metrics: { durationMs: 1000, toolCalls: 5, delegations: 1, parallelTasks: 0 },
      handoffNote: 'Ready',
    };

    state = completePhase(state, 'planning', mockMeta);

    expect(state.currentPhase).toBeNull();
    expect(state.completedPhases).toContain('planning');
    expect(state.quickMetas.planning).toBeDefined();
  });

  it('should detect session completion', () => {
    let state = createSessionState();
    const phases: Phase[] = ['planning', 'design', 'implementation', 'operation'];

    for (const phase of phases) {
      state = enterPhase(state, phase);
      const mockMeta: QuickMeta = {
        version: 1,
        sessionId: state.sessionId,
        phase,
        completedAt: new Date().toISOString(),
        summary: `Done ${phase}`,
        patterns: [],
        decisions: [],
        risks: [],
        metrics: { durationMs: 1000, toolCalls: 5, delegations: 1, parallelTasks: 0 },
        handoffNote: 'Ready',
      };
      state = completePhase(state, phase, mockMeta);
    }

    expect(isSessionComplete(state)).toBe(true);
  });

  it('should generate session summary', () => {
    let state = createSessionState();
    state = enterPhase(state, 'planning');

    const summary = getSessionSummary(state);

    expect(summary).toContain('Session:');
    expect(summary).toContain('Current: planning');
  });
});

describe('QuickMeta Background Analysis', () => {
  it('should trigger analysis for long sessions', () => {
    const result = shouldTriggerBackgroundAnalysis('test-session', 120000);

    expect(result.shouldTrigger).toBe(true);
  });

  it('should not trigger analysis for short sessions', () => {
    const result = shouldTriggerBackgroundAnalysis('test-session', 30000);

    expect(result.shouldTrigger).toBe(false);
    expect(result.reason).toContain('too short');
  });

  it('should respect disabled config', () => {
    const result = shouldTriggerBackgroundAnalysis('test-session', 120000, {
      enabled: false,
      minDurationMs: 60000,
    });

    expect(result.shouldTrigger).toBe(false);
    expect(result.reason).toContain('disabled');
  });
});

describe('QuickMeta Summary', () => {
  const testSessionId = `summary-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  beforeEach(async () => {
    // Create multiple phase QuickMetas
    const phases: Phase[] = ['planning', 'design'];
    for (const phase of phases) {
      const meta: QuickMeta = {
        version: 1,
        sessionId: testSessionId,
        phase,
        completedAt: new Date().toISOString(),
        summary: `Completed ${phase}`,
        patterns: [
          { id: `${phase}-p1`, category: 'approach', summary: 'Test', keywords: ['test'], confidence: 0.8 },
        ],
        decisions: [
          { topic: 'Test', choice: 'A', rationale: 'Because', alternatives: [] },
        ],
        risks: phase === 'planning' ? [
          { severity: 'P1', description: 'Test risk', status: 'identified' },
        ] : [],
        metrics: { durationMs: 60000, toolCalls: 10, delegations: 1, parallelTasks: 0 },
        handoffNote: 'Ready',
      };
      await saveQuickMeta(meta);
    }
  });

  afterEach(async () => {
    try {
      await fs.rm(path.join(TEST_BASE_DIR, testSessionId), { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should summarize session QuickMeta', async () => {
    const summary = await getQuickMetaSummary(testSessionId);

    expect(summary.phases).toBe(2);
    expect(summary.totalPatterns).toBe(2);
    expect(summary.totalDecisions).toBe(2);
    expect(summary.totalRisks).toBe(1);
    expect(summary.unresolvedRisks).toBe(1);
    expect(summary.totalDuration).toBe(120000);
  });
});

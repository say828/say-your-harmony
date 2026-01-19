#!/usr/bin/env node
/**
 * Metrics Collection Script
 *
 * Extracts metrics from QuickMeta JSON files and generates structured output
 */
interface ExperimentMetrics {
    experimentId: string;
    sessionId: string;
    timestamp: string;
    phases: {
        planning?: PhaseMetricsExtended;
        design?: PhaseMetricsExtended;
        implementation?: PhaseMetricsExtended;
        operation?: PhaseMetricsExtended;
    };
    totals: SessionTotals;
    quality: QualityMetrics;
}
interface PhaseMetricsExtended {
    durationMs: number;
    toolCalls: number;
    delegations: number;
    parallelTasks: number;
    patternsExtracted: number;
    patternConfidenceAvg: number;
    decisionsDocumented: number;
    alternativesConsidered: number;
    risksIdentified: number;
    criticalRisks: number;
    insightInjected: boolean;
    summary: string;
}
interface SessionTotals {
    durationMs: number;
    durationMin: number;
    toolCalls: number;
    delegations: number;
    parallelTasks: number;
    patterns: number;
    decisions: number;
    risks: number;
    criticalRisks: number;
}
interface QualityMetrics {
    phasesCompleted: number;
    allPhasesComplete: boolean;
    avgPatternConfidence: number;
    avgAlternativesPerDecision: number;
}
declare function collectMetrics(sessionId: string, experimentId: string, baseDir?: string): Promise<ExperimentMetrics>;
export { collectMetrics, ExperimentMetrics };
//# sourceMappingURL=collect-metrics.d.ts.map
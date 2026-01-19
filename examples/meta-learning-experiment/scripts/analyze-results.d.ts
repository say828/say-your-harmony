#!/usr/bin/env node
/**
 * Results Analysis Script
 *
 * Statistical analysis and comparison of experiment results
 */
interface ExperimentMetrics {
    experimentId: string;
    sessionId: string;
    timestamp: string;
    totals: {
        durationMs: number;
        durationMin: number;
        toolCalls: number;
        patterns: number;
        decisions: number;
        risks: number;
    };
    quality: {
        phasesCompleted: number;
        allPhasesComplete: boolean;
        avgPatternConfidence: number;
    };
}
interface ComparisonResult {
    baseline: ExperimentMetrics;
    comparison: ExperimentMetrics;
    deltas: {
        durationPct: number;
        toolCallsPct: number;
        patternsPct: number;
        decisionsPct: number;
    };
    improvements: {
        fasterExecution: boolean;
        fewerToolCalls: boolean;
        morePatterns: boolean;
    };
}
interface StatisticalTest {
    metric: string;
    baselineValues: number[];
    comparisonValues: number[];
    mean: {
        baseline: number;
        comparison: number;
    };
    stddev: {
        baseline: number;
        comparison: number;
    };
    tStatistic: number;
    pValue: number;
    significant: boolean;
    effectSize: number;
}
interface AnalysisResult {
    scenario: string;
    comparisons: ComparisonResult[];
    statistics: StatisticalTest[];
    summary: {
        avgImprovement: number;
        significantMetrics: number;
        hypothesisSupported: boolean;
    };
}
declare function analyzeScenario(resultsDir: string, scenario: string): Promise<AnalysisResult>;
export { analyzeScenario, AnalysisResult };
//# sourceMappingURL=analyze-results.d.ts.map
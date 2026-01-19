#!/usr/bin/env node
/**
 * Results Analysis Script
 *
 * Statistical analysis and comparison of experiment results
 */

import fs from 'fs/promises';
import path from 'path';

// Types
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
  mean: { baseline: number; comparison: number };
  stddev: { baseline: number; comparison: number };
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

// Statistical functions
function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  const avg = mean(values);
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

function pairedTTest(baseline: number[], comparison: number[]): { t: number; p: number } {
  if (baseline.length !== comparison.length) {
    throw new Error('Arrays must have same length for paired t-test');
  }

  const n = baseline.length;
  if (n < 2) {
    return { t: 0, p: 1 };
  }

  const differences = baseline.map((b, i) => b - comparison[i]);
  const meanDiff = mean(differences);
  const stdDiff = stddev(differences);

  const t = meanDiff / (stdDiff / Math.sqrt(n));

  // Simplified p-value approximation (two-tailed)
  // For accurate p-values, use a proper statistics library
  const df = n - 1;
  const p = 2 * (1 - tDistributionCDF(Math.abs(t), df));

  return { t, p };
}

// Simplified t-distribution CDF approximation
function tDistributionCDF(t: number, df: number): number {
  // Very rough approximation - for production use a proper library
  if (df > 30) {
    // Approximate with normal distribution for large df
    return normalCDF(t);
  }
  // For small df, use a rough approximation
  return 0.5 + 0.5 * Math.tanh(t / Math.sqrt(df));
}

function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

function cohensD(baseline: number[], comparison: number[]): number {
  const meanDiff = mean(baseline) - mean(comparison);
  const pooledStd = Math.sqrt((Math.pow(stddev(baseline), 2) + Math.pow(stddev(comparison), 2)) / 2);
  return pooledStd === 0 ? 0 : meanDiff / pooledStd;
}

// Analysis functions
function compareExperiments(baseline: ExperimentMetrics, comparison: ExperimentMetrics): ComparisonResult {
  const calcPct = (base: number, comp: number) => ((base - comp) / base) * 100;

  return {
    baseline,
    comparison,
    deltas: {
      durationPct: calcPct(baseline.totals.durationMs, comparison.totals.durationMs),
      toolCallsPct: calcPct(baseline.totals.toolCalls, comparison.totals.toolCalls),
      patternsPct: calcPct(baseline.totals.patterns, comparison.totals.patterns),
      decisionsPct: calcPct(baseline.totals.decisions, comparison.totals.decisions),
    },
    improvements: {
      fasterExecution: comparison.totals.durationMs < baseline.totals.durationMs,
      fewerToolCalls: comparison.totals.toolCalls < baseline.totals.toolCalls,
      morePatterns: comparison.totals.patterns > baseline.totals.patterns,
    },
  };
}

async function analyzeScenario(resultsDir: string, scenario: string): Promise<AnalysisResult> {
  // Find all experiment results for this scenario
  const files = await fs.readdir(resultsDir);
  const scenarioFiles = files.filter((f) => f.includes(scenario) && f.endsWith('.json') === false);

  const experiments: ExperimentMetrics[] = [];
  for (const dir of scenarioFiles) {
    try {
      const metricsPath = path.join(resultsDir, dir, 'metrics.json');
      const content = await fs.readFile(metricsPath, 'utf-8');
      experiments.push(JSON.parse(content));
    } catch {
      // Skip directories without metrics.json
    }
  }

  if (experiments.length < 2) {
    throw new Error(`Need at least 2 experiments for scenario ${scenario}, found ${experiments.length}`);
  }

  // Sort by timestamp
  experiments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Compare each run with baseline
  const baseline = experiments[0];
  const comparisons = experiments.slice(1).map((exp) => compareExperiments(baseline, exp));

  // Statistical tests
  const statistics: StatisticalTest[] = [];

  const metricExtractors: Record<string, (exp: ExperimentMetrics) => number> = {
    'Duration (ms)': (e) => e.totals.durationMs,
    'Tool Calls': (e) => e.totals.toolCalls,
    'Patterns': (e) => e.totals.patterns,
    'Decisions': (e) => e.totals.decisions,
  };

  for (const [metricName, extractor] of Object.entries(metricExtractors)) {
    const baselineValues = [extractor(baseline)];
    const comparisonValues = experiments.slice(1).map(extractor);

    if (comparisonValues.length >= 1) {
      const { t, p } = pairedTTest(
        Array(comparisonValues.length).fill(extractor(baseline)),
        comparisonValues
      );
      const effectSize = cohensD(
        Array(comparisonValues.length).fill(extractor(baseline)),
        comparisonValues
      );

      statistics.push({
        metric: metricName,
        baselineValues,
        comparisonValues,
        mean: {
          baseline: extractor(baseline),
          comparison: mean(comparisonValues),
        },
        stddev: {
          baseline: 0,
          comparison: stddev(comparisonValues),
        },
        tStatistic: t,
        pValue: p,
        significant: p < 0.05,
        effectSize,
      });
    }
  }

  // Summary
  const avgImprovement =
    mean(comparisons.map((c) => c.deltas.durationPct)) || 0;

  const significantMetrics = statistics.filter((s) => s.significant).length;

  // Hypothesis: 15%+ improvement
  const hypothesisSupported = avgImprovement >= 15;

  return {
    scenario,
    comparisons,
    statistics,
    summary: {
      avgImprovement,
      significantMetrics,
      hypothesisSupported,
    },
  };
}

function generateAnalysisReport(analysis: AnalysisResult): string {
  const lines: string[] = [
    `# Analysis Report: ${analysis.scenario}`,
    '',
    `**Scenario**: ${analysis.scenario}`,
    `**Experiments**: ${analysis.comparisons.length + 1} runs`,
    `**Generated**: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- **Average Improvement**: ${analysis.summary.avgImprovement.toFixed(1)}%`,
    `- **Significant Metrics**: ${analysis.summary.significantMetrics}/${analysis.statistics.length}`,
    `- **Hypothesis Supported**: ${analysis.summary.hypothesisSupported ? '✅ YES' : '❌ NO'} (target: 15%+ improvement)`,
    '',
    '## Run Comparisons',
    '',
  ];

  analysis.comparisons.forEach((comp, idx) => {
    lines.push(`### Run ${idx + 2} vs Baseline`);
    lines.push('');
    lines.push('| Metric | Baseline | Run ${idx + 2} | Change |');
    lines.push('|--------|----------|---------|--------|');
    lines.push(
      `| Duration | ${comp.baseline.totals.durationMin.toFixed(1)} min | ${comp.comparison.totals.durationMin.toFixed(1)} min | ${comp.deltas.durationPct >= 0 ? '↓' : '↑'} ${Math.abs(comp.deltas.durationPct).toFixed(1)}% |`
    );
    lines.push(
      `| Tool Calls | ${comp.baseline.totals.toolCalls} | ${comp.comparison.totals.toolCalls} | ${comp.deltas.toolCallsPct >= 0 ? '↓' : '↑'} ${Math.abs(comp.deltas.toolCallsPct).toFixed(1)}% |`
    );
    lines.push(
      `| Patterns | ${comp.baseline.totals.patterns} | ${comp.comparison.totals.patterns} | ${comp.deltas.patternsPct >= 0 ? '↓' : '↑'} ${Math.abs(comp.deltas.patternsPct).toFixed(1)}% |`
    );
    lines.push('');
  });

  lines.push('## Statistical Tests');
  lines.push('');
  lines.push('| Metric | Baseline | Comparison | t-statistic | p-value | Significant | Effect Size |');
  lines.push('|--------|----------|------------|-------------|---------|-------------|-------------|');

  analysis.statistics.forEach((stat) => {
    lines.push(
      `| ${stat.metric} | ${stat.mean.baseline.toFixed(1)} | ${stat.mean.comparison.toFixed(1)} | ${stat.tStatistic.toFixed(2)} | ${stat.pValue.toFixed(4)} | ${stat.significant ? '✅' : '❌'} | ${stat.effectSize.toFixed(2)} |`
    );
  });

  lines.push('');
  lines.push('## Interpretation');
  lines.push('');
  lines.push('- **p < 0.05**: Statistically significant difference');
  lines.push('- **Effect Size**: Cohen\'s d (0.2=small, 0.5=medium, 0.8=large)');
  lines.push('- **Hypothesis**: 15%+ improvement from meta-learning');

  return lines.join('\n');
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes('--help')) {
    console.log(`
Usage: analyze-results.ts --results RESULTS_DIR --scenario SCENARIO

Options:
  --results RESULTS_DIR   Directory containing experiment results
  --scenario SCENARIO     Scenario to analyze (baseline|repetition|transfer)
  --output   OUTPUT_FILE  Output file path (default: analysis-SCENARIO.md)
  --help                  Show this help

Example:
  analyze-results.ts --results ../results --scenario repetition
`);
    process.exit(args.includes('--help') ? 0 : 1);
  }

  let resultsDir = '';
  let scenario = '';
  let outputFile = '';

  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    if (flag === '--results') resultsDir = value;
    else if (flag === '--scenario') scenario = value;
    else if (flag === '--output') outputFile = value;
  }

  if (!resultsDir || !scenario) {
    console.error('Error: --results and --scenario are required');
    process.exit(1);
  }

  if (!outputFile) {
    outputFile = `analysis-${scenario}.md`;
  }

  console.log('Analyzing results...');
  console.log(`  Results: ${resultsDir}`);
  console.log(`  Scenario: ${scenario}`);
  console.log('');

  try {
    const analysis = await analyzeScenario(resultsDir, scenario);

    // Write report
    const report = generateAnalysisReport(analysis);
    await fs.writeFile(outputFile, report);

    console.log(`✅ Analysis report: ${outputFile}`);
    console.log('');
    console.log('Summary:');
    console.log(`  Average improvement: ${analysis.summary.avgImprovement.toFixed(1)}%`);
    console.log(`  Significant metrics: ${analysis.summary.significantMetrics}/${analysis.statistics.length}`);
    console.log(`  Hypothesis supported: ${analysis.summary.hypothesisSupported ? 'YES' : 'NO'}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeScenario, AnalysisResult };

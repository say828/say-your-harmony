#!/usr/bin/env node
/**
 * Visualization Script
 *
 * Generates ASCII charts for experiment results
 */

import fs from 'fs/promises';

// Types
interface ExperimentMetrics {
  experimentId: string;
  totals: {
    durationMin: number;
    toolCalls: number;
    patterns: number;
    decisions: number;
  };
}

interface ChartData {
  labels: string[];
  values: number[];
  title: string;
  unit: string;
}

// Chart utilities
function barChart(data: ChartData, width: number = 50): string {
  const { labels, values, title, unit } = data;
  const lines: string[] = [];

  lines.push(title);
  lines.push('='.repeat(title.length));
  lines.push('');

  const maxValue = Math.max(...values);
  const scale = width / maxValue;

  labels.forEach((label, i) => {
    const value = values[i];
    const barLength = Math.round(value * scale);
    const bar = '█'.repeat(barLength);
    const padding = ' '.repeat(Math.max(0, 15 - label.length));

    lines.push(`${label}${padding} ${bar} ${value.toFixed(1)} ${unit}`);
  });

  return lines.join('\n');
}

function lineChart(data: ChartData, height: number = 10, width: number = 50): string {
  const { labels, values, title, unit } = data;
  const lines: string[] = [];

  lines.push(title);
  lines.push('='.repeat(title.length));
  lines.push('');

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const valueRange = maxValue - minValue;

  if (valueRange === 0) {
    lines.push('All values are equal');
    return lines.join('\n');
  }

  // Create grid
  const grid: string[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(' '));

  // Plot points
  const xScale = (width - 1) / (values.length - 1);
  const yScale = (height - 1) / valueRange;

  for (let i = 0; i < values.length; i++) {
    const x = Math.round(i * xScale);
    const y = Math.round((values[i] - minValue) * yScale);
    const row = height - 1 - y;

    if (row >= 0 && row < height && x >= 0 && x < width) {
      grid[row][x] = '●';

      // Connect with previous point
      if (i > 0) {
        const prevX = Math.round((i - 1) * xScale);
        const prevY = Math.round((values[i - 1] - minValue) * yScale);
        const prevRow = height - 1 - prevY;

        // Draw line
        const startX = Math.min(prevX, x);
        const endX = Math.max(prevX, x);
        for (let cx = startX; cx <= endX; cx++) {
          const t = (cx - prevX) / (x - prevX || 1);
          const cy = Math.round(prevRow + t * (row - prevRow));
          if (cy >= 0 && cy < height && cx >= 0 && cx < width) {
            grid[cy][cx] = grid[cy][cx] === '●' ? '●' : '─';
          }
        }
      }
    }
  }

  // Y-axis labels
  for (let i = 0; i < height; i++) {
    const value = maxValue - (i * valueRange) / (height - 1);
    const label = value.toFixed(1).padStart(6);
    lines.push(`${label} │${grid[i].join('')}`);
  }

  // X-axis
  lines.push('       ' + '└' + '─'.repeat(width));

  // X-axis labels
  const xLabels = labels.map((l, i) => {
    const pos = Math.round(i * xScale);
    return { label: l.slice(0, 6), pos };
  });

  let xAxisLine = '        ';
  xLabels.forEach(({ label, pos }) => {
    while (xAxisLine.length < 8 + pos) {
      xAxisLine += ' ';
    }
    xAxisLine += label;
  });
  lines.push(xAxisLine);

  lines.push('');
  lines.push(`Unit: ${unit}`);

  return lines.join('\n');
}

function comparisonChart(baseline: number, comparison: number[], labels: string[], title: string, unit: string): string {
  const lines: string[] = [];

  lines.push(title);
  lines.push('='.repeat(title.length));
  lines.push('');

  const allValues = [baseline, ...comparison];
  const maxValue = Math.max(...allValues);
  const scale = 50 / maxValue;

  // Baseline
  const baselineBar = '█'.repeat(Math.round(baseline * scale));
  lines.push(`Baseline      ${baselineBar} ${baseline.toFixed(1)} ${unit}`);

  // Comparisons
  comparison.forEach((value, i) => {
    const bar = '█'.repeat(Math.round(value * scale));
    const delta = ((value - baseline) / baseline) * 100;
    const arrow = delta < 0 ? '↓' : delta > 0 ? '↑' : '=';
    const labelPadded = labels[i].padEnd(12);

    lines.push(`${labelPadded}  ${bar} ${value.toFixed(1)} ${unit} ${arrow} ${Math.abs(delta).toFixed(1)}%`);
  });

  return lines.join('\n');
}

function learningCurve(experiments: ExperimentMetrics[], metric: 'duration' | 'toolCalls' | 'patterns'): string {
  const values = experiments.map((exp) => {
    switch (metric) {
      case 'duration':
        return exp.totals.durationMin;
      case 'toolCalls':
        return exp.totals.toolCalls;
      case 'patterns':
        return exp.totals.patterns;
    }
  });

  const labels = experiments.map((_, i) => `Run ${i + 1}`);

  const titles: Record<string, string> = {
    duration: 'Learning Curve: Duration',
    toolCalls: 'Learning Curve: Tool Calls',
    patterns: 'Learning Curve: Patterns Extracted',
  };

  const units: Record<string, string> = {
    duration: 'min',
    toolCalls: 'calls',
    patterns: 'patterns',
  };

  return lineChart(
    {
      labels,
      values,
      title: titles[metric],
      unit: units[metric],
    },
    10,
    50
  );
}

// Main
async function visualizeExperiments(resultsDir: string, scenario: string): Promise<string> {
  // Load all experiments
  const files = await fs.readdir(resultsDir);
  const scenarioFiles = files.filter((f) => f.includes(scenario));

  const experiments: ExperimentMetrics[] = [];
  for (const dir of scenarioFiles) {
    try {
      const metricsPath = `${resultsDir}/${dir}/metrics.json`;
      const content = await fs.readFile(metricsPath, 'utf-8');
      experiments.push(JSON.parse(content));
    } catch {
      // Skip
    }
  }

  if (experiments.length === 0) {
    throw new Error(`No experiments found for scenario: ${scenario}`);
  }

  const sections: string[] = [];

  sections.push('# Experiment Visualizations');
  sections.push('');
  sections.push(`**Scenario**: ${scenario}`);
  sections.push(`**Experiments**: ${experiments.length}`);
  sections.push('');
  sections.push('');

  // Learning curves
  if (experiments.length > 1) {
    sections.push(learningCurve(experiments, 'duration'));
    sections.push('');
    sections.push('');

    sections.push(learningCurve(experiments, 'toolCalls'));
    sections.push('');
    sections.push('');

    sections.push(learningCurve(experiments, 'patterns'));
    sections.push('');
    sections.push('');
  }

  // Comparison charts
  if (experiments.length > 1) {
    const baseline = experiments[0];
    const others = experiments.slice(1);

    sections.push(
      comparisonChart(
        baseline.totals.durationMin,
        others.map((e) => e.totals.durationMin),
        others.map((_, i) => `Run ${i + 2}`),
        'Duration Comparison',
        'min'
      )
    );
    sections.push('');
    sections.push('');

    sections.push(
      comparisonChart(
        baseline.totals.toolCalls,
        others.map((e) => e.totals.toolCalls),
        others.map((_, i) => `Run ${i + 2}`),
        'Tool Calls Comparison',
        'calls'
      )
    );
    sections.push('');
    sections.push('');
  }

  // Summary bar chart
  const avgDuration = experiments.reduce((sum, e) => sum + e.totals.durationMin, 0) / experiments.length;
  const avgToolCalls = experiments.reduce((sum, e) => sum + e.totals.toolCalls, 0) / experiments.length;
  const avgPatterns = experiments.reduce((sum, e) => sum + e.totals.patterns, 0) / experiments.length;

  sections.push(
    barChart({
      labels: ['Avg Duration', 'Avg Tool Calls', 'Avg Patterns'],
      values: [avgDuration, avgToolCalls, avgPatterns],
      title: 'Average Metrics',
      unit: '',
    })
  );

  return sections.join('\n');
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes('--help')) {
    console.log(`
Usage: visualize.ts --results RESULTS_DIR --scenario SCENARIO

Options:
  --results RESULTS_DIR   Directory containing experiment results
  --scenario SCENARIO     Scenario to visualize
  --output  OUTPUT_FILE   Output file (default: charts-SCENARIO.txt)
  --help                  Show this help

Example:
  visualize.ts --results ../results --scenario repetition
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
    outputFile = `charts-${scenario}.txt`;
  }

  console.log('Generating visualizations...');
  console.log(`  Results: ${resultsDir}`);
  console.log(`  Scenario: ${scenario}`);
  console.log('');

  try {
    const charts = await visualizeExperiments(resultsDir, scenario);
    await fs.writeFile(outputFile, charts);

    console.log(`✅ Charts: ${outputFile}`);
    console.log('');
    console.log('Preview:');
    console.log(charts.split('\n').slice(0, 20).join('\n'));
    console.log('...');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { visualizeExperiments };

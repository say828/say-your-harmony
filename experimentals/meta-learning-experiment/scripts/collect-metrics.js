#!/usr/bin/env node
/**
 * Metrics Collection Script
 *
 * Extracts metrics from QuickMeta JSON files and generates structured output
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Helper functions
function loadQuickMeta(metaDir, phase) {
    const filePath = path.join(metaDir, `${phase}.json`);
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return content;
    }
    catch {
        return null;
    }
}
function calculatePhaseMetrics(meta) {
    const patternConfidences = meta.patterns.map((p) => p.confidence);
    const avgConfidence = patternConfidences.length > 0
        ? patternConfidences.reduce((a, b) => a + b, 0) / patternConfidences.length
        : 0;
    const alternatives = meta.decisions.reduce((sum, d) => sum + d.alternatives.length, 0);
    const criticalRisks = meta.risks.filter((r) => r.severity === 'P0' || r.severity === 'P1').length;
    return {
        durationMs: meta.metrics.durationMs,
        toolCalls: meta.metrics.toolCalls,
        delegations: meta.metrics.delegations,
        parallelTasks: meta.metrics.parallelTasks,
        patternsExtracted: meta.patterns.length,
        patternConfidenceAvg: avgConfidence,
        decisionsDocumented: meta.decisions.length,
        alternativesConsidered: alternatives,
        risksIdentified: meta.risks.length,
        criticalRisks,
        insightInjected: meta.phase !== 'planning', // Planning never has injected insight
        summary: meta.summary,
    };
}
async function collectMetrics(sessionId, experimentId, baseDir = process.env.HOME + '/.claude/meta/quickmeta') {
    const sessionDir = path.join(baseDir, sessionId);
    // Check if session directory exists
    try {
        await fs.access(sessionDir);
    }
    catch {
        throw new Error(`Session directory not found: ${sessionDir}`);
    }
    const phases = ['planning', 'design', 'implementation', 'operation'];
    const phaseMetrics = {};
    // Load each phase
    for (const phase of phases) {
        const meta = await loadQuickMetaAsync(sessionDir, phase);
        if (meta) {
            phaseMetrics[phase] = calculatePhaseMetrics(meta);
        }
    }
    // Calculate totals
    const allPhases = Object.values(phaseMetrics);
    const totals = {
        durationMs: allPhases.reduce((sum, p) => sum + p.durationMs, 0),
        durationMin: allPhases.reduce((sum, p) => sum + p.durationMs, 0) / 60000,
        toolCalls: allPhases.reduce((sum, p) => sum + p.toolCalls, 0),
        delegations: allPhases.reduce((sum, p) => sum + p.delegations, 0),
        parallelTasks: allPhases.reduce((sum, p) => sum + p.parallelTasks, 0),
        patterns: allPhases.reduce((sum, p) => sum + p.patternsExtracted, 0),
        decisions: allPhases.reduce((sum, p) => sum + p.decisionsDocumented, 0),
        risks: allPhases.reduce((sum, p) => sum + p.risksIdentified, 0),
        criticalRisks: allPhases.reduce((sum, p) => sum + p.criticalRisks, 0),
    };
    // Calculate quality metrics
    const confidences = allPhases.map((p) => p.patternConfidenceAvg).filter((c) => c > 0);
    const avgConfidence = confidences.length > 0 ? confidences.reduce((a, b) => a + b) / confidences.length : 0;
    const avgAlternatives = totals.decisions > 0
        ? allPhases.reduce((sum, p) => sum + p.alternativesConsidered, 0) / totals.decisions
        : 0;
    const quality = {
        phasesCompleted: allPhases.length,
        allPhasesComplete: allPhases.length === 4,
        avgPatternConfidence: avgConfidence,
        avgAlternativesPerDecision: avgAlternatives,
    };
    return {
        experimentId,
        sessionId,
        timestamp: new Date().toISOString(),
        phases: phaseMetrics,
        totals,
        quality,
    };
}
async function loadQuickMetaAsync(sessionDir, phase) {
    const filePath = path.join(sessionDir, `${phase}.json`);
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
function generateMarkdownReport(metrics) {
    const lines = [
        `# Experiment Metrics Report`,
        '',
        `**Experiment ID**: ${metrics.experimentId}`,
        `**Session ID**: ${metrics.sessionId}`,
        `**Generated**: ${metrics.timestamp}`,
        '',
        '## Summary',
        '',
        `- **Total Duration**: ${metrics.totals.durationMin.toFixed(1)} minutes`,
        `- **Phases Completed**: ${metrics.quality.phasesCompleted}/4`,
        `- **Tool Calls**: ${metrics.totals.toolCalls}`,
        `- **Patterns Extracted**: ${metrics.totals.patterns}`,
        `- **Decisions Documented**: ${metrics.totals.decisions}`,
        `- **Risks Identified**: ${metrics.totals.risks} (${metrics.totals.criticalRisks} critical)`,
        '',
        '## Phase Breakdown',
        '',
    ];
    const phaseOrder = ['planning', 'design', 'implementation', 'operation'];
    for (const phase of phaseOrder) {
        const p = metrics.phases[phase];
        if (p) {
            lines.push(`### ${phase.charAt(0).toUpperCase() + phase.slice(1)}`);
            lines.push('');
            lines.push(`- Duration: ${(p.durationMs / 60000).toFixed(1)} min`);
            lines.push(`- Tool Calls: ${p.toolCalls}`);
            lines.push(`- Patterns: ${p.patternsExtracted} (avg confidence: ${p.patternConfidenceAvg.toFixed(2)})`);
            lines.push(`- Decisions: ${p.decisionsDocumented} (${p.alternativesConsidered} alternatives)`);
            lines.push(`- Risks: ${p.risksIdentified} (${p.criticalRisks} critical)`);
            lines.push(`- Summary: ${p.summary}`);
            lines.push('');
        }
    }
    lines.push('## Quality Metrics');
    lines.push('');
    lines.push(`- All Phases Complete: ${metrics.quality.allPhasesComplete ? '✅' : '❌'}`);
    lines.push(`- Avg Pattern Confidence: ${metrics.quality.avgPatternConfidence.toFixed(2)}`);
    lines.push(`- Avg Alternatives/Decision: ${metrics.quality.avgAlternativesPerDecision.toFixed(1)}`);
    return lines.join('\n');
}
// CLI
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: collect-metrics.ts --session SESSION_ID --output OUTPUT_DIR

Options:
  --session SESSION_ID   QuickMeta session ID to analyze
  --output  OUTPUT_DIR   Directory to write results
  --base    BASE_DIR     QuickMeta base directory (default: ~/.claude/meta/quickmeta)
  --help, -h             Show this help

Example:
  collect-metrics.ts --session 2026-01-18-143052-x7k9 --output ../results/exp-001/
`);
        process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
    }
    let sessionId = '';
    let outputDir = '';
    let baseDir = process.env.HOME + '/.claude/meta/quickmeta';
    for (let i = 0; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];
        if (flag === '--session')
            sessionId = value;
        else if (flag === '--output')
            outputDir = value;
        else if (flag === '--base')
            baseDir = value;
    }
    if (!sessionId || !outputDir) {
        console.error('Error: --session and --output are required');
        process.exit(1);
    }
    console.log('Collecting metrics...');
    console.log(`  Session: ${sessionId}`);
    console.log(`  Output:  ${outputDir}`);
    console.log('');
    try {
        const experimentId = path.basename(outputDir);
        const metrics = await collectMetrics(sessionId, experimentId, baseDir);
        // Create output directory
        await fs.mkdir(outputDir, { recursive: true });
        // Write JSON
        const jsonPath = path.join(outputDir, 'metrics.json');
        await fs.writeFile(jsonPath, JSON.stringify(metrics, null, 2));
        console.log(`✅ Metrics JSON: ${jsonPath}`);
        // Write markdown report
        const mdPath = path.join(outputDir, 'summary.md');
        await fs.writeFile(mdPath, generateMarkdownReport(metrics));
        console.log(`✅ Summary report: ${mdPath}`);
        console.log('');
        console.log('Metrics collection complete!');
        console.log('');
        console.log(`Total duration: ${metrics.totals.durationMin.toFixed(1)} minutes`);
        console.log(`Patterns: ${metrics.totals.patterns}`);
        console.log(`Decisions: ${metrics.totals.decisions}`);
        console.log(`Risks: ${metrics.totals.risks}`);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
export { collectMetrics };
//# sourceMappingURL=collect-metrics.js.map
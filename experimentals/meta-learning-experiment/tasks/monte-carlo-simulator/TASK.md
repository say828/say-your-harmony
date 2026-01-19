# Task: Monte Carlo Simulation Engine

**Task ID**: `monte-carlo-simulator`
**Complexity**: Complex
**Domain**: Scientific Computing / Simulation
**Estimated Duration**: 65-80 minutes (baseline, no meta-analysis)

---

## Overview

Build a Monte Carlo simulation engine with parallel execution, statistical convergence detection, and risk analysis capabilities.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **POST /api/simulations** - Create simulation configuration
2. **POST /api/simulations/:id/run** - Execute simulation
3. **GET /api/simulations/:id/status** - Get execution status
4. **GET /api/simulations/:id/results** - Get simulation results
5. **POST /api/simulations/:id/scenarios/compare** - Compare multiple scenarios

#### Data Models

```typescript
interface Simulation {
  id: string;
  name: string;
  description: string;
  type: 'option_pricing' | 'portfolio_risk' | 'project_npv' | 'custom';
  config: SimulationConfig;
  createdAt: string;
}

interface SimulationConfig {
  iterations: number;          // Number of simulation runs
  seed?: number;               // For reproducibility
  variables: Variable[];       // Input variables with distributions
  formula: string;             // Output formula (JavaScript expression)
  convergenceThreshold?: number; // Stop if converged (optional)
}

interface Variable {
  name: string;
  distribution: Distribution;
}

interface Distribution {
  type: 'normal' | 'uniform' | 'lognormal' | 'triangular';
  params: Record<string, number>; // e.g., { mean: 100, stddev: 15 }
}

interface SimulationRun {
  id: string;
  simulationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  iterations: number;
  completedIterations: number;
  results?: SimulationResults;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface SimulationResults {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: { p5: number; p25: number; p50: number; p75: number; p95: number };
  histogram: HistogramBin[];
  rawValues?: number[];        // Optional, for detailed analysis
  converged: boolean;
  convergenceIteration?: number;
}

interface HistogramBin {
  min: number;
  max: number;
  count: number;
  frequency: number;           // Percentage
}
```

### Technical Requirements

- Reproducible random number generation (seeded)
- Support for multiple probability distributions:
  - Normal (Gaussian)
  - Uniform
  - Lognormal
  - Triangular
- Statistical convergence detection:
  - Track running mean and variance
  - Stop when change < threshold for N consecutive iterations
- Result distribution analysis (histogram, percentiles)
- TypeScript strict mode
- Optional: Worker threads for parallel execution (P2)

### Success Criteria (P0)

- [ ] Simulation configuration (iterations, seed, parameters)
- [ ] Reproducible random number generation
- [ ] Support for normal and uniform distributions
- [ ] Basic convergence detection (standard error threshold)
- [ ] Summary statistics of simulation results
- [ ] Histogram generation
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 80%

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 65-80 min | 40-50 min |

### Meta-Learning Opportunities

- Statistical patterns from stats-library (mean, stddev, percentiles)
- Configuration patterns from all tasks
- Testing strategies for stochastic code (reproducibility via seed)
- Distribution sampling (builds on stats knowledge)
- Convergence detection (uses variance calculation)

**Expected Reduction**: 38% through statistical function reuse and testing patterns.

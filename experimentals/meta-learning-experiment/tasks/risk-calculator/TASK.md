# Task: Value at Risk (VaR) Calculator

**Task ID**: `risk-calculator`
**Complexity**: Medium-High
**Domain**: FinTech / Risk Management
**Estimated Duration**: 55-70 minutes (baseline, no meta-analysis)

---

## Overview

Create a Value at Risk (VaR) calculator with portfolio risk analysis, stress testing, and historical simulation.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **POST /api/portfolios** - Create portfolio
2. **POST /api/portfolios/:id/positions** - Add position to portfolio
3. **POST /api/portfolios/:id/calculate-var** - Calculate VaR
4. **POST /api/portfolios/:id/stress-test** - Run stress test scenario
5. **GET /api/portfolios/:id/risk-report** - Get comprehensive risk report

#### Data Models

```typescript
interface Portfolio {
  id: string;
  name: string;
  positions: Position[];
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface Position {
  id: string;
  assetId: string;
  assetType: 'stock' | 'bond' | 'option' | 'commodity';
  quantity: number;
  currentPrice: number;
  marketValue: number;         // quantity * currentPrice
}

interface VaRCalculation {
  portfolioId: string;
  method: 'parametric' | 'historical' | 'monte_carlo';
  confidence: number;          // e.g., 0.95 for 95%
  timeHorizon: number;         // days
  var: number;                 // Value at Risk in portfolio currency
  expectedShortfall?: number;  // Conditional VaR (CVaR)
  calculatedAt: string;
}

interface HistoricalData {
  assetId: string;
  returns: number[];           // Historical returns
  startDate: string;
  endDate: string;
}

interface StressTestScenario {
  name: string;
  shocks: AssetShock[];
}

interface AssetShock {
  assetId: string;
  priceChange: number;         // Percentage change, e.g., -0.30 for -30%
}

interface StressTestResult {
  scenarioName: string;
  portfolioValueBefore: number;
  portfolioValueAfter: number;
  loss: number;
  lossPercentage: number;
  positionImpacts: PositionImpact[];
}

interface PositionImpact {
  assetId: string;
  valueBefore: number;
  valueAfter: number;
  impact: number;
}
```

### Technical Requirements

- **Parametric VaR**: Variance-covariance method
  - Calculate portfolio variance from correlation matrix
  - Assume normal distribution of returns
- **Historical VaR**: Use historical return data
  - Sort historical portfolio returns
  - Find value at confidence percentile
- **Monte Carlo VaR**: Simulation-based (optional P1)
- Correlation matrix calculation for multi-asset portfolios
- Stress testing with custom shock scenarios
- TypeScript strict mode

### Success Criteria (P0)

- [ ] Portfolio position management
- [ ] Parametric VaR calculation (variance-covariance)
- [ ] Historical VaR with configurable lookback period
- [ ] Basic correlation analysis
- [ ] Stress test scenarios (custom shocks)
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 85%

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 55-70 min | 35-45 min |

### Meta-Learning Opportunities

- Statistical patterns from stats-library (variance, correlation, percentiles)
- Matrix operations (new but related to numerical computing)
- Scenario configuration patterns
- Risk scoring concepts from fraud-detection
- Testing numerical accuracy from stats-library

**Expected Reduction**: 36% through statistical function and testing pattern reuse.

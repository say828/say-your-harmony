# Task: Statistical Functions Library

**Task ID**: `stats-library`
**Complexity**: Simple-Medium
**Domain**: Scientific Computing / Statistics
**Estimated Duration**: 35-45 minutes (baseline, no meta-analysis)

---

## Overview

Implement a statistical functions library with hypothesis testing, regression analysis, and confidence interval calculation. This task tests pure functional programming patterns and numerical precision.

---

## Requirements

### 1. Functional Requirements

#### Statistical Functions API

Implement a TypeScript library with the following modules:

1. **Descriptive Statistics**
   - `mean(data: number[]): number`
   - `median(data: number[]): number`
   - `mode(data: number[]): number | number[]`
   - `variance(data: number[], sample?: boolean): number`
   - `standardDeviation(data: number[], sample?: boolean): number`
   - `range(data: number[]): { min: number; max: number; range: number }`
   - `quartiles(data: number[]): { q1: number; q2: number; q3: number; iqr: number }`

2. **Hypothesis Testing**
   - `oneSampleTTest(sample: number[], populationMean: number): TTestResult`
   - `twoSampleTTest(sample1: number[], sample2: number[], paired?: boolean): TTestResult`
   - `chiSquareTest(observed: number[], expected: number[]): ChiSquareResult`
   - `zTest(sample: number[], populationMean: number, populationStd: number): ZTestResult`

3. **Regression Analysis**
   - `linearRegression(x: number[], y: number[]): RegressionResult`
   - `polynomialRegression(x: number[], y: number[], degree: number): RegressionResult`
   - `rSquared(actual: number[], predicted: number[]): number`

4. **Confidence Intervals**
   - `confidenceInterval(data: number[], confidence: number): { lower: number; upper: number }`
   - `proportionCI(successes: number, trials: number, confidence: number): { lower: number; upper: number }`

5. **Correlation**
   - `pearsonCorrelation(x: number[], y: number[]): number`
   - `spearmanCorrelation(x: number[], y: number[]): number`

#### Data Models

```typescript
interface TTestResult {
  tStatistic: number;
  pValue: number;
  degreesOfFreedom: number;
  significant: boolean;      // at alpha = 0.05
  confidenceInterval: { lower: number; upper: number };
}

interface ChiSquareResult {
  chiSquare: number;
  pValue: number;
  degreesOfFreedom: number;
  significant: boolean;      // at alpha = 0.05
}

interface ZTestResult {
  zStatistic: number;
  pValue: number;
  significant: boolean;      // at alpha = 0.05
}

interface RegressionResult {
  coefficients: number[];    // [intercept, slope] for linear
  rSquared: number;
  predict: (x: number) => number;
  residuals: number[];
}

interface DescriptiveStats {
  mean: number;
  median: number;
  mode: number | number[];
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  count: number;
}
```

### 2. Technical Requirements

#### TypeScript Configuration

- Use TypeScript strict mode
- No implicit any types
- All functions must be pure (no side effects)
- All functions must have explicit return types
- Use readonly arrays where applicable

#### Input Validation

Use Zod for input validation:
- Array length: minimum 2 elements for most functions
- Numbers: must be finite (no NaN, Infinity)
- Confidence levels: 0 < confidence < 1
- Degrees: positive integers for polynomial regression
- Validate all inputs before computation

#### Error Handling

- Throw descriptive errors for invalid inputs:
  ```typescript
  class StatisticsError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  }
  ```

#### Numerical Precision

- Use appropriate precision for comparisons (e.g., epsilon = 1e-10)
- Handle edge cases (empty arrays, single values, identical values)
- Document precision limitations
- Use stable numerical algorithms (e.g., Welford's algorithm for variance)

### 3. Quality Requirements

#### Testing

- Minimum 90% test coverage (mathematical correctness is critical)
- Use Vitest as testing framework
- Test with:
  - Known results (validate against R or Python scipy)
  - Edge cases (empty, single value, all same values)
  - Precision tests (floating point accuracy)
  - Property-based tests (e.g., mean(data) should equal sum(data)/length)

#### Code Quality

- ESLint configuration with TypeScript rules
- Zero ESLint errors
- Zero TypeScript errors
- Use functional programming style (pure functions, immutability)
- Consistent code formatting (Prettier recommended)

#### Documentation

- README.md with:
  - Installation and setup
  - API documentation with examples
  - Mathematical formulas used
  - Precision limitations
- JSDoc comments for all public functions with:
  - Formula explanation
  - Parameter descriptions
  - Return value description
  - Example usage

---

## Deliverables

### Required Files

1. **src/descriptive.ts** - Descriptive statistics functions
2. **src/hypothesis.ts** - Hypothesis testing functions
3. **src/regression.ts** - Regression analysis functions
4. **src/correlation.ts** - Correlation functions
5. **src/confidence.ts** - Confidence interval functions
6. **src/utils/distributions.ts** - Probability distribution utilities (t, chi-square, z)
7. **src/utils/validators.ts** - Input validation with Zod
8. **src/types.ts** - TypeScript interfaces and types
9. **src/index.ts** - Main export file
10. **tests/descriptive.test.ts** - Descriptive stats tests
11. **tests/hypothesis.test.ts** - Hypothesis testing tests
12. **tests/regression.test.ts** - Regression tests
13. **tests/correlation.test.ts** - Correlation tests
14. **package.json** - Dependencies and scripts
15. **tsconfig.json** - TypeScript configuration
16. **.eslintrc.json** - ESLint configuration
17. **README.md** - Documentation

### NPM Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src tests",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Success Criteria

### Must Have (P0)

- [ ] All descriptive statistics functions implemented
- [ ] One-sample and two-sample t-tests working
- [ ] Linear regression with R-squared calculation
- [ ] 95% confidence interval calculation
- [ ] Chi-square test implemented
- [ ] TypeScript strict mode enabled with zero errors
- [ ] Zod validation on all inputs
- [ ] Test coverage >= 90%
- [ ] All tests passing
- [ ] README with complete API documentation and formulas

### Should Have (P1)

- [ ] Pearson and Spearman correlation
- [ ] Polynomial regression support
- [ ] Paired t-test support
- [ ] Normality tests (e.g., Shapiro-Wilk approximation)
- [ ] JSDoc comments with mathematical formulas
- [ ] Examples in documentation

### Nice to Have (P2)

- [ ] Multiple regression
- [ ] ANOVA (Analysis of Variance)
- [ ] Non-parametric tests (Mann-Whitney U, Wilcoxon)
- [ ] Bootstrapping utilities

---

## Example Usage

### Descriptive Statistics

```typescript
import { mean, median, standardDeviation } from './src/descriptive';

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log(mean(data));              // 5.5
console.log(median(data));            // 5.5
console.log(standardDeviation(data)); // ~2.87
```

### Hypothesis Testing

```typescript
import { twoSampleTTest } from './src/hypothesis';

const control = [23, 25, 27, 29, 31];
const treatment = [28, 30, 32, 34, 36];

const result = twoSampleTTest(control, treatment);
console.log(result);
// {
//   tStatistic: -3.45,
//   pValue: 0.0087,
//   degreesOfFreedom: 8,
//   significant: true,
//   confidenceInterval: { lower: -8.2, upper: -1.8 }
// }
```

### Linear Regression

```typescript
import { linearRegression } from './src/regression';

const x = [1, 2, 3, 4, 5];
const y = [2, 4, 5, 4, 5];

const model = linearRegression(x, y);
console.log(model.coefficients);  // [1.6, 0.7] (intercept, slope)
console.log(model.rSquared);      // 0.62
console.log(model.predict(6));    // 5.8
```

---

## Testing Guidelines

### Required Test Cases

1. **Descriptive Statistics**
   - Correct calculation with known datasets
   - Edge case: single value
   - Edge case: all same values
   - Edge case: negative numbers
   - Precision validation (within 1e-10)

2. **Hypothesis Testing**
   - Validate against known R/scipy results
   - Test significance detection (p < 0.05)
   - Test with identical samples (should not be significant)
   - Test with very different samples (should be significant)

3. **Regression**
   - Perfect linear relationship (r² = 1.0)
   - No relationship (r² ≈ 0)
   - Known dataset validation
   - Prediction accuracy

4. **Correlation**
   - Perfect positive correlation (r = 1.0)
   - Perfect negative correlation (r = -1.0)
   - No correlation (r ≈ 0)

5. **Input Validation**
   - Empty array throws error
   - Single element array (where applicable)
   - NaN/Infinity values throw error
   - Mismatched array lengths throw error

---

## Dependencies

### Required

```json
{
  "zod": "^3.22.4"
}
```

### DevDependencies

```json
{
  "typescript": "^5.3.3",
  "vitest": "^1.2.0",
  "@types/node": "^20.11.0",
  "eslint": "^8.56.0",
  "@typescript-eslint/parser": "^6.19.0",
  "@typescript-eslint/eslint-plugin": "^6.19.0",
  "@vitest/coverage-v8": "^1.2.0"
}
```

---

## Mathematical Formulas

### Sample Variance (Bessel's correction)

```
s² = Σ(xᵢ - x̄)² / (n - 1)
```

### T-Statistic (two-sample)

```
t = (x̄₁ - x̄₂) / √(s²₁/n₁ + s²₂/n₂)
```

### Linear Regression (Least Squares)

```
slope = Σ((xᵢ - x̄)(yᵢ - ȳ)) / Σ(xᵢ - x̄)²
intercept = ȳ - slope * x̄
```

### R-Squared

```
R² = 1 - (SS_res / SS_tot)
where SS_res = Σ(yᵢ - ŷᵢ)²
      SS_tot = Σ(yᵢ - ȳ)²
```

---

## Tips for Implementation

1. **Start with descriptive stats** - These are building blocks for other functions
2. **Use Welford's algorithm** - For numerically stable variance calculation
3. **Implement distributions** - t-distribution, chi-square for hypothesis tests
4. **Use existing libraries for distributions** - Or implement approximations
5. **Test incrementally** - Validate each function with known results
6. **Document formulas** - JSDoc should include mathematical notation

---

## Common Pitfalls to Avoid

1. **Numerical instability** - Use stable algorithms (Welford's, not two-pass)
2. **Integer division** - Ensure floating-point division in TypeScript
3. **Population vs sample** - Use Bessel's correction (n-1) for sample variance
4. **Mutating inputs** - Always work with copies for sorting operations
5. **Division by zero** - Check for zero variance, zero denominators
6. **Floating point comparison** - Use epsilon for equality checks

---

## Time Estimates

| Phase | Estimated Time |
|-------|---------------|
| Setup (package.json, tsconfig) | 3 min |
| Types and validators | 4 min |
| Descriptive statistics | 8-10 min |
| Distribution utilities | 6-8 min |
| Hypothesis tests | 10-12 min |
| Regression | 6-8 min |
| Tests | 10-15 min |
| Documentation | 5 min |
| **Total (baseline)** | **52-65 min** |
| **Total (with meta)** | **22-28 min** |

---

## Meta-Learning Opportunities

This task introduces patterns that transfer to subsequent scientific and numerical tasks:

1. **Pure Function Patterns**: Immutable, side-effect-free functions transfer to all domains
2. **Type Safety for Numerics**: Precision handling transfers to financial calculations
3. **Validation Strategies**: Input validation patterns transfer universally
4. **Testing Numerical Code**: Property-based and precision testing strategies
5. **Documentation Standards**: Formula documentation transfers to algorithm tasks
6. **Error Handling**: Descriptive error patterns for edge cases

**Expected Efficiency Gain with Meta-Analysis**: 35-40% reduction through:
- Established pure function patterns
- Validation strategy reuse from shopping-cart
- Testing patterns for edge cases
- TypeScript strict mode configuration knowledge
- Numerical precision handling patterns

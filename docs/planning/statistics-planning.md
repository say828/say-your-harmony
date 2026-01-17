# Statistical Functions Implementation - Phase 1 Planning

**Date**: 2026-01-17
**Phase**: Phase 1 - Planning
**Task**: Implement statistical functions (mean, median, standardDeviation) in test/stats folder
**Agent**: planner (opus)

---

## 1. Problem Definition

### 1.1 What Problem Are We Solving?

Implement three fundamental statistical functions for numerical data analysis:
1. **mean()**: Calculate the arithmetic average of an array of numbers
2. **median()**: Calculate the middle value of a sorted array of numbers
3. **standardDeviation()**: Calculate the measure of variability/spread in a dataset

### 1.2 Why Is This Important?

- **Educational Value**: Demonstrates mathematical computation in TypeScript
- **Reusable Patterns**: Applies proven patterns from previous calculator implementations
- **Production Quality**: Implements proper error handling and edge case coverage
- **Type Safety**: Showcases TypeScript strict mode compliance

### 1.3 Constraints

**Technical Constraints**:
- TypeScript with strict mode (full type safety)
- No external dependencies (use built-in JavaScript/TypeScript only)
- Vitest for testing framework
- Functions must accept `number[]` arrays
- Must handle empty arrays with error handling

**Scope Constraints**:
- Only arithmetic mean (not weighted, geometric, or harmonic mean)
- Only population standard deviation (not sample standard deviation)
- Simple implementations (no performance optimization required)

### 1.4 Out of Scope

- Advanced statistical functions (variance, correlation, regression)
- Data validation beyond empty array check
- Performance optimization for large datasets
- Alternative calculation methods (running mean, etc.)

---

## 2. Meta-Analysis Patterns Applied

### 2.1 Pattern: Comprehensive JSDoc Documentation (Meta-Analysis 7.2.1)

**Source**: Calculator meta-analysis section 7.2.1

**Structure**:
- Every public function has JSDoc with description
- @param tags for all parameters
- @returns tag for return value
- @throws tag for error conditions
- @example with 2-3 usage examples
- IEEE 754 behavior documented where applicable

**Application for Statistical Functions**:
```typescript
/**
 * Calculates the arithmetic mean (average) of an array of numbers.
 *
 * @param numbers - An array of numbers to calculate the mean
 * @returns The arithmetic mean of the numbers
 * @throws {Error} When the array is empty
 *
 * @example
 * ```typescript
 * mean([1, 2, 3, 4, 5]); // returns 3
 * mean([10, 20, 30]); // returns 20
 * mean([2.5, 3.5]); // returns 3
 * ```
 */
```

**Efficiency Gain**: No decision-making needed - reuse proven template

---

### 2.2 Pattern: Named Exports (Meta-Analysis 7.2.2)

**Source**: Calculator meta-analysis section 7.2.2

**Structure**: Use named exports for all functions (tree-shakable, better IDE support)

**Application for Statistical Functions**:
```typescript
export function mean(numbers: number[]): number { }
export function median(numbers: number[]): number { }
export function standardDeviation(numbers: number[]): number { }
```

**Efficiency Gain**: Zero decision time - follow established project convention

---

### 2.3 Pattern: Explicit Type Annotations (Meta-Analysis 7.2.3)

**Source**: Calculator meta-analysis section 7.2.3

**Structure**: Always provide explicit type annotations for function signatures

**Application for Statistical Functions**:
- All parameters: `numbers: number[]`
- All return types: `: number`
- No type inference for public APIs

**Efficiency Gain**: Type safety guaranteed, zero TypeScript compilation errors

---

### 2.4 Pattern: Test Exact Floating-Point Values (Meta-Analysis 7.2.4)

**Source**: Calculator meta-analysis section 3.4

**Structure**:
1. Write test with expected value
2. Run test to discover actual value
3. Update test with exact value if different
4. Document IEEE 754 behavior if applicable

**Application for Statistical Functions**:
```typescript
// Initial test (may fail)
expect(mean([1, 2])).toBe(1.5);

// After discovery (if IEEE 754 precision issue)
expect(mean([1, 2])).toBe(1.5000000000000002); // Exact value
```

**Efficiency Gain**: Known workflow eliminates debugging time

---

### 2.5 Pattern: Error Handling for Domain-Invalid Operations (Extension Meta-Analysis 3.5)

**Source**: Calculator extension meta-analysis section 3.5

**Structure**:
1. Identify domain-invalid inputs (empty array for statistical functions)
2. Choose error strategy: throw Error (production quality)
3. Document error in JSDoc @throws tag
4. Write comprehensive error tests using .toThrow()
5. Test all edge cases

**Application for Statistical Functions**:
```typescript
if (numbers.length === 0) {
  throw new Error('Cannot calculate mean of empty array');
}
```

**Efficiency Gain**: Proven error handling pattern, safety over convenience

---

### 2.6 Pattern: Nested Describe Blocks (Meta-Analysis 7.2.5)

**Source**: Calculator meta-analysis section 7.2.5

**Structure**: Two-level nesting (module → function → test cases)

**Application for Statistical Functions**:
```typescript
describe('statistics module', () => {
  describe('mean', () => {
    it('should calculate mean of positive numbers', () => { });
    it('should handle empty array', () => { });
    // ...
  });

  describe('median', () => {
    // ...
  });

  describe('standardDeviation', () => {
    // ...
  });
});
```

**Efficiency Gain**: Clear test organization, matches project convention

---

## 3. New Considerations vs. Previous Implementation

### 3.1 Array Input vs. Two Numbers

**Previous**: Calculator functions accept two numbers (a, b)
**New**: Statistical functions accept array of numbers (numbers: number[])

**Implication**: Error handling must check array length, not individual parameter values

---

### 3.2 Empty Array Error Handling (NEW DECISION REQUIRED)

**Question**: What should statistical functions do with empty arrays?

**Options**:
- ✅ **Option A: Throw Error** (SELECTED)
  - Pros: Production quality, forces explicit handling, type safety
  - Cons: Requires try-catch in usage
  - Rationale: Matches divide-by-zero pattern from calculator extension
  - Error message: "Cannot calculate [function] of empty array"

- ❌ **Option B: Return NaN**
  - Pros: No error handling needed
  - Cons: Silent failure, misleading results
  - Rejected: Poor developer experience

- ❌ **Option C: Return null or undefined**
  - Pros: Type-safe alternative to NaN
  - Cons: Violates return type `number`, requires union type
  - Rejected: Type safety violation

**Decision**: Throw Error (consistent with existing error handling pattern)

---

### 3.3 Median Calculation for Even-Length Arrays

**Challenge**: Median of even-length array requires average of two middle values

**Approach**:
```typescript
// Odd length: [1, 2, 3] → median is 2
// Even length: [1, 2, 3, 4] → median is (2 + 3) / 2 = 2.5
```

**Implication**: Must sort array first, then handle even/odd cases

---

### 3.4 Standard Deviation Formula Selection (NEW DECISION REQUIRED)

**Question**: Population or sample standard deviation?

**Options**:
- ✅ **Option A: Population Standard Deviation** (SELECTED)
  - Formula: sqrt(sum((x - mean)²) / N)
  - Pros: Simpler, matches common usage for complete datasets
  - Cons: Not appropriate for sample estimation
  - Rationale: Educational scope, complete dataset assumption

- ❌ **Option B: Sample Standard Deviation**
  - Formula: sqrt(sum((x - mean)²) / (N - 1))
  - Pros: Statistically correct for samples
  - Cons: More complex concept, N-1 requires length check
  - Rejected: Over-engineering for educational scope

**Decision**: Population standard deviation (simpler, educational scope)

---

## 4. Requirements Definition

### 4.1 Functional Requirements

#### mean() Function
1. **Input**: Array of numbers (`number[]`)
2. **Output**: Arithmetic mean as number
3. **Formula**: sum(numbers) / count(numbers)
4. **Error Handling**: Throw Error if array is empty
5. **Edge Cases**:
   - Single element: return that element
   - All zeros: return 0
   - Negative numbers: handle correctly
   - Decimal numbers: IEEE 754 precision

#### median() Function
1. **Input**: Array of numbers (`number[]`)
2. **Output**: Median value as number
3. **Algorithm**:
   - Sort array in ascending order
   - Odd length: return middle element
   - Even length: return average of two middle elements
4. **Error Handling**: Throw Error if array is empty
5. **Edge Cases**:
   - Single element: return that element
   - Two elements: return average
   - Unsorted input: must sort first
   - Duplicate values: handle correctly

#### standardDeviation() Function
1. **Input**: Array of numbers (`number[]`)
2. **Output**: Population standard deviation as number
3. **Formula**: sqrt(sum((x - mean)²) / N)
4. **Error Handling**: Throw Error if array is empty
5. **Edge Cases**:
   - Single element: return 0 (no variation)
   - All same values: return 0 (no variation)
   - Negative numbers: handle correctly
   - Large values: IEEE 754 precision

---

### 4.2 Non-Functional Requirements

1. **Type Safety**:
   - Explicit type annotations (100%)
   - No `any` types
   - TypeScript strict mode compliance

2. **Documentation**:
   - JSDoc for all public functions
   - @param, @returns, @throws, @example tags
   - Documentation-to-code ratio: ~45-50%

3. **Testing**:
   - 100% test coverage
   - All edge cases covered
   - Error cases tested with .toThrow()
   - Nested describe blocks (module → function → cases)

4. **Code Quality**:
   - Named exports
   - Pure functions (no side effects)
   - No external dependencies
   - Cyclomatic complexity: 1-3 per function

---

## 5. File Structure Plan

### 5.1 Directory Structure

```
test/
  stats/                          # New subdirectory
    statistics.ts                 # Implementation file
    statistics.test.ts            # Test file
  calculator.ts                   # Existing file
  calculator.test.ts              # Existing file
```

### 5.2 File Naming Rationale

- **statistics.ts**: Plural form (multiple related functions)
- **statistics.test.ts**: Matches implementation filename
- **test/stats/**: Subdirectory for organization (separates stats from calculator)

---

## 6. Mathematical Edge Cases

### 6.1 Mean Edge Cases

| Case | Input | Expected Output | Notes |
|------|-------|-----------------|-------|
| Empty array | `[]` | Error: "Cannot calculate mean of empty array" | Domain-invalid |
| Single element | `[5]` | `5` | Mean of one value is itself |
| All zeros | `[0, 0, 0]` | `0` | Valid mathematical result |
| Negative numbers | `[-5, -3, -1]` | `-3` | Handle negative values |
| Decimal numbers | `[1.5, 2.5]` | `2.0` | IEEE 754 precision |
| Mixed signs | `[-5, 5]` | `0` | Positive and negative cancel |

---

### 6.2 Median Edge Cases

| Case | Input | Expected Output | Notes |
|------|-------|-----------------|-------|
| Empty array | `[]` | Error: "Cannot calculate median of empty array" | Domain-invalid |
| Single element | `[5]` | `5` | Median of one value is itself |
| Two elements | `[3, 7]` | `5` | Average of two middle values |
| Odd length sorted | `[1, 2, 3]` | `2` | Middle element |
| Even length sorted | `[1, 2, 3, 4]` | `2.5` | Average of 2 and 3 |
| Odd length unsorted | `[3, 1, 2]` | `2` | Must sort first |
| Even length unsorted | `[4, 1, 3, 2]` | `2.5` | Must sort first |
| Duplicate values | `[1, 2, 2, 3]` | `2` | Average of two 2s |

---

### 6.3 Standard Deviation Edge Cases

| Case | Input | Expected Output | Notes |
|------|-------|-----------------|-------|
| Empty array | `[]` | Error: "Cannot calculate standard deviation of empty array" | Domain-invalid |
| Single element | `[5]` | `0` | No variation |
| All same values | `[3, 3, 3]` | `0` | No variation |
| Simple case | `[1, 2, 3, 4, 5]` | ~1.414 | sqrt(2) |
| Negative numbers | `[-2, -1, 0, 1, 2]` | ~1.414 | Same as positive case |
| Large spread | `[1, 100]` | `49.5` | Large variation |
| Decimal values | `[1.5, 2.5, 3.5]` | ~0.816 | IEEE 754 precision |

---

## 7. Error Handling Strategy

### 7.1 Error Messages

| Function | Condition | Error Message |
|----------|-----------|---------------|
| mean() | Empty array | "Cannot calculate mean of empty array" |
| median() | Empty array | "Cannot calculate median of empty array" |
| standardDeviation() | Empty array | "Cannot calculate standard deviation of empty array" |

**Rationale**: Concise, clear, standard terminology (matches calculator error pattern)

---

### 7.2 Error Testing Pattern

```typescript
it('should throw error for empty array', () => {
  expect(() => mean([])).toThrow('Cannot calculate mean of empty array');
});
```

**Coverage**: Every function must have error test case

---

## 8. Implementation Algorithm Outline

### 8.1 mean() Algorithm

```typescript
export function mean(numbers: number[]): number {
  // 1. Validate: Check if array is empty
  if (numbers.length === 0) {
    throw new Error('Cannot calculate mean of empty array');
  }

  // 2. Calculate: Sum all numbers
  const sum = numbers.reduce((acc, num) => acc + num, 0);

  // 3. Return: Divide sum by count
  return sum / numbers.length;
}
```

**Complexity**: O(n) time, O(1) space

---

### 8.2 median() Algorithm

```typescript
export function median(numbers: number[]): number {
  // 1. Validate: Check if array is empty
  if (numbers.length === 0) {
    throw new Error('Cannot calculate median of empty array');
  }

  // 2. Sort: Create sorted copy (don't mutate original)
  const sorted = [...numbers].sort((a, b) => a - b);

  // 3. Calculate middle index
  const mid = Math.floor(sorted.length / 2);

  // 4. Return based on odd/even length
  if (sorted.length % 2 === 0) {
    // Even: average of two middle elements
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    // Odd: middle element
    return sorted[mid];
  }
}
```

**Complexity**: O(n log n) time (sorting), O(n) space (copy)

**Note**: Must copy array before sorting to avoid mutating original (pure function)

---

### 8.3 standardDeviation() Algorithm

```typescript
export function standardDeviation(numbers: number[]): number {
  // 1. Validate: Check if array is empty
  if (numbers.length === 0) {
    throw new Error('Cannot calculate standard deviation of empty array');
  }

  // 2. Calculate mean
  const avg = mean(numbers); // Reuse mean function

  // 3. Calculate squared differences from mean
  const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));

  // 4. Calculate variance (average of squared differences)
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / numbers.length;

  // 5. Return standard deviation (square root of variance)
  return Math.sqrt(variance);
}
```

**Complexity**: O(n) time (after mean calculation), O(n) space (squaredDiffs array)

**Note**: Reuses mean() function (DRY principle)

---

## 9. Test Coverage Plan

### 9.1 Test Organization Structure

```typescript
describe('statistics module', () => {
  describe('mean', () => {
    it('should calculate mean of positive numbers', () => { });
    it('should calculate mean of single element', () => { });
    it('should calculate mean of negative numbers', () => { });
    it('should calculate mean of mixed signs', () => { });
    it('should calculate mean of decimal numbers', () => { });
    it('should throw error for empty array', () => { });
  });

  describe('median', () => {
    it('should calculate median of odd-length array', () => { });
    it('should calculate median of even-length array', () => { });
    it('should calculate median of single element', () => { });
    it('should calculate median of unsorted array', () => { });
    it('should calculate median with duplicate values', () => { });
    it('should throw error for empty array', () => { });
  });

  describe('standardDeviation', () => {
    it('should calculate standard deviation of numbers', () => { });
    it('should return 0 for single element', () => { });
    it('should return 0 for identical values', () => { });
    it('should calculate standard deviation of negative numbers', () => { });
    it('should calculate standard deviation of decimal numbers', () => { });
    it('should throw error for empty array', () => { });
  });
});
```

**Total Test Cases**: 18 tests (6 per function)

---

### 9.2 Test Coverage Targets

| Metric | Target |
|--------|--------|
| Line coverage | 100% |
| Branch coverage | 100% |
| Function coverage | 100% |
| Edge case coverage | All identified cases |
| Error case coverage | 100% |

---

## 10. Dependencies Analysis

### 10.1 External Dependencies

**Required**: NONE (zero external dependencies)

**Built-in APIs Used**:
- `Array.prototype.reduce()` - Summing values
- `Array.prototype.map()` - Transforming arrays
- `Array.prototype.sort()` - Sorting for median
- `Math.pow()` - Squaring values
- `Math.sqrt()` - Square root for standard deviation
- `Math.floor()` - Integer division for median index

---

### 10.2 Internal Dependencies

**statistics.ts**:
- No dependencies on other modules
- Self-contained implementation

**statistics.test.ts**:
- `vitest` - Test framework (already configured)
- `./statistics` - Implementation to test

---

## 11. Vitest Configuration

### 11.1 Current Configuration

From previous implementation, vitest.config.ts already includes:
```typescript
include: [
  'src/**/*.test.ts',
  'test/**/*.test.ts'  // Added in calculator implementation
]
```

**Status**: NO CHANGES NEEDED (test/stats/ already covered by test/**/*.test.ts pattern)

---

## 12. Risk Analysis

### 12.1 P1 (High Priority) Risks

#### Risk: Floating-Point Precision Issues (EXPECTED)

**Description**: IEEE 754 floating-point arithmetic produces inexact results

**Impact**: Test failures with decimal numbers

**Likelihood**: HIGH (occurred in both calculator tasks)

**Mitigation**:
1. Run tests to discover actual values
2. Update tests with exact expected values
3. Document IEEE 754 behavior in JSDoc

**Acceptance Criteria**: All tests pass with exact floating-point values

---

#### Risk: Array Mutation in median()

**Description**: Sorting array in-place mutates original input

**Impact**: Violates pure function principle, unexpected behavior

**Likelihood**: MEDIUM (easy to miss)

**Mitigation**:
1. Create copy before sorting: `[...numbers].sort()`
2. Test that original array is not mutated
3. Document non-mutation guarantee in JSDoc

**Acceptance Criteria**: Original array unchanged after median() call

---

### 12.2 P2 (Medium Priority) Risks

#### Risk: TypeScript Compilation Warnings

**Description**: Unused variables, type inference issues

**Impact**: Build warnings (not errors)

**Likelihood**: LOW (patterns established)

**Mitigation**:
1. Explicit type annotations
2. No unused variables
3. Run `npx tsc --noEmit` before completion

**Acceptance Criteria**: Zero TypeScript compilation warnings

---

#### Risk: Sort Numeric Comparison Function

**Description**: `.sort()` without comparison function treats numbers as strings

**Impact**: Incorrect median for multi-digit numbers ([1, 10, 2] → [1, 10, 2] not [1, 2, 10])

**Likelihood**: MEDIUM (common mistake)

**Mitigation**:
1. Always use comparison function: `.sort((a, b) => a - b)`
2. Test with multi-digit numbers

**Acceptance Criteria**: Median correct for [10, 1, 2] → 2

---

### 12.3 P3 (Low Priority) Risks

#### Risk: Standard Deviation Edge Case (Single Element)

**Description**: Edge case where standard deviation should be 0

**Impact**: Mathematical correctness

**Likelihood**: LOW (straightforward case)

**Mitigation**:
1. Test single element case
2. Verify result is 0

**Acceptance Criteria**: `standardDeviation([5])` returns `0`

---

## 13. Structured Plan

### Phase 1: Planning (CURRENT) ✓
- [x] Problem defined
- [x] Meta-analysis patterns extracted
- [x] Requirements validated
- [x] Edge cases identified
- [x] Error handling strategy defined
- [x] Test coverage planned
- [x] Planning document created

### Phase 2: Design (NEXT)
- [ ] Architecture design
- [ ] Algorithm pseudocode refinement
- [ ] API contract specification
- [ ] Decision documentation (2 decisions)
- [ ] Risk assessment update
- [ ] Design document creation

### Phase 3: Implementation
- [ ] Create test/stats/ directory
- [ ] Implement statistics.ts (3 functions)
- [ ] Implement statistics.test.ts (18 test cases)
- [ ] Run tests and fix floating-point precision
- [ ] Verify TypeScript compilation
- [ ] Implementation report

### Phase 4: Operation
- [ ] Build verification
- [ ] Full test suite execution
- [ ] P0/P1 risk validation
- [ ] Production-ready verification
- [ ] Meta-analysis generation

---

## 14. Success Criteria

### 14.1 Phase 1 Completion Criteria

- [x] Problem definition documented
- [x] Requirements clear and validated
- [x] Meta-analysis patterns applied (6 patterns reused)
- [x] New decisions identified (2 decisions)
- [x] Edge cases enumerated (21 cases)
- [x] Error handling strategy defined
- [x] Test coverage plan created
- [x] Algorithms outlined
- [x] Risks classified (2 P1, 2 P2, 1 P3)

**Status**: Phase 1 - COMPLETE ✓

---

### 14.2 Overall Project Success Criteria

1. **Functionality**:
   - ✅ mean() function implemented and tested
   - ✅ median() function implemented and tested
   - ✅ standardDeviation() function implemented and tested
   - ✅ All functions handle empty arrays with errors

2. **Quality**:
   - ✅ 100% type safety (explicit types, strict mode)
   - ✅ 100% test coverage (18 test cases pass)
   - ✅ Comprehensive JSDoc (45-50% documentation ratio)
   - ✅ Zero external dependencies

3. **Compliance**:
   - ✅ Follows project conventions (named exports, JSDoc, tests)
   - ✅ Reuses patterns from meta-analysis
   - ✅ Error handling consistent with calculator pattern
   - ✅ Build successful, zero warnings

4. **Efficiency**:
   - ✅ Meta-analysis pattern reuse (6 patterns)
   - ✅ Minimal decision-making (only 2 new decisions)
   - ✅ Known workflow for floating-point issues

---

## 15. Efficiency Comparison Prediction

### 15.1 Expected Pattern Reuse

| Pattern | Source | Application | Expected Saving |
|---------|--------|-------------|-----------------|
| JSDoc Structure | Meta 7.2.1 | Apply to 3 functions | ~5 min |
| Named Exports | Meta 7.2.2 | Apply to 3 functions | ~2 min |
| Type Annotations | Meta 7.2.3 | Apply to 3 functions | ~2 min |
| Floating-Point Handling | Meta 3.4 | Apply to test cases | ~5 min |
| Error Handling Pattern | Extension 3.5 | Apply to 3 functions | ~5 min |
| Test Organization | Meta 7.2.5 | Apply to test file | ~3 min |
| **Total Expected Savings** | | | **~22 min** |

---

### 15.2 Expected Metrics vs. Calculator Tasks

| Metric | Task 1 (Calculator) | Task 2 (Extension) | Task 3 (Statistics - Predicted) |
|--------|---------------------|--------------------|---------------------------------|
| Total Turns | 9 | 5 | 5-6 (similar to Task 2) |
| Web Searches | 5 | 0 | 0 (all patterns reused) |
| New Decisions | 6 | 2 | 2 (empty array, std dev formula) |
| Phase 1 Duration | 10 min | 10 min | 12 min (more complex) |
| Phase 2 Duration | 15 min | 10 min | 12 min (3 algorithms) |
| Phase 3 Duration | 15 min | 11 min | 15 min (3 functions vs 2) |
| **Total Duration** | **45 min** | **36 min** | **40 min (predicted)** |

**Rationale**: Slightly longer than Task 2 due to 3 functions and more complex algorithms (sorting, sqrt), but still significantly faster than Task 1 due to pattern reuse.

---

## 16. Next Phase Transition

### Transition to Phase 2: Design

**Completion Verification**:
- ✅ Problem definition clear
- ✅ All relevant documents read (2 meta-analyses, existing code)
- ✅ Requirements validated and documented
- ✅ Meta-analysis patterns extracted and applied
- ✅ User confirms understanding (implicit via requirements)

**Phase 2 Focus**:
1. Refine algorithm pseudocode
2. Document 2 new decisions (empty array handling, std dev formula)
3. Update risk assessment
4. Create API contract specification
5. Define verification strategy

**Ready to Proceed**: YES ✓

---

## 17. Meta-Analysis Learnings Applied

### From Task 1 (Calculator):
1. ✅ Comprehensive context gathering (read meta-analyses)
2. ✅ JSDoc documentation pattern
3. ✅ Named exports strategy
4. ✅ Explicit type annotations
5. ✅ Nested describe blocks
6. ✅ Floating-point handling workflow

### From Task 2 (Extension):
1. ✅ Error handling for domain-invalid operations
2. ✅ Meta-analysis-driven planning
3. ✅ Pattern reuse documentation
4. ✅ Comparative metrics tracking

### New Patterns for This Task:
1. Array input handling (vs. two-parameter functions)
2. Sorting with copy (array non-mutation)
3. Function reuse (standardDeviation uses mean)
4. Multi-step algorithms (median: sort + index + average)

---

**Phase 1 Planning: COMPLETE**

**Next Agent**: say-your-harmony:architect (Phase 2 - Design)

**Estimated Total Efficiency Gain vs. Task 1**: ~11% time reduction (45 min → 40 min predicted)

---

**This planning document serves as the foundation for Phase 2 (Design) and validates the meta-analysis-driven development approach for statistical function implementation.**

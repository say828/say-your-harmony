# Calculator Module Design Document

**Date**: 2026-01-17
**Phase**: 2 - Design
**Agent**: Architect (opus)
**Status**: Complete

---

## 1. Problem Statement

From Phase 1 Planning:

Create a type-safe calculator module with basic arithmetic operations (addition and subtraction) that demonstrates TypeScript best practices and testing patterns in the say-your-harmony project.

**Key Requirements**:
- Two functions: `add(a: number, b: number): number` and `subtract(a: number, b: number): number`
- Full TypeScript strict mode compliance
- Comprehensive test coverage with Vitest
- Files placed in `/test` directory

---

## 2. Architecture Design

### 2.1 Component Overview

```
┌──────────────────────────────────────────────────┐
│             Calculator Module                     │
├──────────────────────────────────────────────────┤
│                                                   │
│  calculator.ts (Implementation)                   │
│  ┌────────────────────────────────────┐          │
│  │  add(a: number, b: number): number │          │
│  │  subtract(a: number, b: number)    │          │
│  └────────────────────────────────────┘          │
│                     │                             │
│                     │ tested by                   │
│                     ▼                             │
│  calculator.test.ts (Tests)                       │
│  ┌────────────────────────────────────┐          │
│  │  describe('add')                   │          │
│  │    - positive numbers               │          │
│  │    - negative numbers               │          │
│  │    - zero handling                  │          │
│  │    - decimal numbers                │          │
│  │  describe('subtract')               │          │
│  │    - positive numbers               │          │
│  │    - negative numbers               │          │
│  │    - zero handling                  │          │
│  │    - decimal numbers                │          │
│  │    - negative results               │          │
│  └────────────────────────────────────┘          │
│                                                   │
└──────────────────────────────────────────────────┘
```

### 2.2 Module Responsibilities

**calculator.ts**:
- Exports two pure functions
- No side effects
- Full type safety
- JSDoc documentation for API clarity

**calculator.test.ts**:
- Unit tests for all functions
- Edge case coverage
- Clear test organization with `describe` blocks
- Vitest assertion patterns

---

## 3. Technology Decisions

### Decision 1: File Location Strategy

**Question**: Where should we place the calculator files?

**Options Considered**:

#### Option A: `/test` directory (AS SPECIFIED BY USER)
**Pros**:
- Follows user's explicit requirement
- Logical separation: example/test code in `/test`, production code in `/src`
- Clean directory structure for educational examples

**Cons**:
- Requires Vitest configuration update (currently only includes `src/**`)
- TypeScript config has `rootDir: "./src"` - may cause compilation issues
- Not following project's existing pattern (`/src/__tests__`)

**Implementation Complexity**: MEDIUM
- Must update `vitest.config.ts` include pattern
- May need TypeScript configuration adjustment

---

#### Option B: `/src/__tests__` directory (EXISTING PATTERN)
**Pros**:
- Follows existing project pattern (6 test files already there)
- No Vitest configuration changes needed
- No TypeScript configuration changes needed
- Zero infrastructure modification

**Cons**:
- Violates user's explicit requirement for `/test` directory
- Mixes example code with production code
- Doesn't utilize the empty `/test` directory

**Implementation Complexity**: LOW
- Drop-in implementation, no config changes

---

#### Option C: `/test` with comprehensive config updates
**Pros**:
- Honors user requirement
- Makes `/test` directory functional for future use
- Creates proper separation of concerns

**Cons**:
- Most complex configuration changes
- TypeScript `rootDir` needs reconsideration
- May affect build output structure

**Implementation Complexity**: HIGH
- Update `vitest.config.ts` include pattern
- Update `tsconfig.json` to handle dual root dirs
- Verify build process still works

---

**SELECTED**: **Option A** - `/test` directory with Vitest config update

**Rationale**:
1. **User Requirement**: The user explicitly requested `/test` directory placement
2. **Future-Proofing**: Makes `/test` directory usable for future examples/experiments
3. **Separation of Concerns**: Clear boundary between production (`/src`) and examples (`/test`)
4. **Acceptable Complexity**: Only needs Vitest config update, TypeScript can compile files without strict rootDir enforcement for test files

**Tradeoffs**:
- **Simplicity vs User Intent**: Chose honoring user requirement over zero-config convenience
- **Consistency vs Specification**: Diverges from existing `/src/__tests__` pattern, but follows explicit specification

**Risks**:
- **P1**: TypeScript compilation may warn about files outside rootDir (acceptable for test files)
- **P2**: Future confusion about test file placement (mitigated by documentation)

---

### Decision 2: Export Strategy

**Question**: How should we export the calculator functions?

**Options Considered**:

#### Option A: Named exports (SELECTED)
```typescript
export function add(a: number, b: number): number { ... }
export function subtract(a: number, b: number): number { ... }

// Usage:
import { add, subtract } from './calculator';
```

**Pros**:
- Tree-shakable (only import what you need)
- Matches existing project pattern (all `/src` files use named exports)
- Better for modules with multiple exports
- IDE auto-import works seamlessly
- Can selectively import individual functions

**Cons**:
- Slightly more verbose import syntax
- Requires knowing function names

---

#### Option B: Default export
```typescript
const calculator = { add, subtract };
export default calculator;

// Usage:
import calculator from './calculator';
calculator.add(1, 2);
```

**Pros**:
- Namespace organization (all functions under one object)
- Simpler mental model (one export per file)

**Cons**:
- Not tree-shakable (imports entire object even if you only need one function)
- Doesn't match project conventions (no default exports in codebase)
- More verbose usage syntax

---

**SELECTED**: **Option A** - Named exports

**Rationale**:
1. **Project Convention**: All existing code uses named exports (verified in `/src` directory)
2. **Tree-Shaking**: Modern bundlers can eliminate unused functions
3. **Ergonomics**: Cleaner usage syntax (`add(1, 2)` vs `calculator.add(1, 2)`)
4. **Scalability**: Easy to add more functions in future

**Tradeoffs**:
- **Namespace vs Performance**: Chose tree-shaking performance over namespace organization

**Risks**: **None** (P3: Future developers might expect namespace, but named exports are standard)

---

### Decision 3: JSDoc Documentation Level

**Question**: How much documentation should we include?

**Options Considered**:

#### Option A: Comprehensive JSDoc (SELECTED)
```typescript
/**
 * Adds two numbers together.
 *
 * @param a - The first number
 * @param b - The second number
 * @returns The sum of a and b
 *
 * @example
 * ```typescript
 * add(2, 3); // returns 5
 * add(-1, 1); // returns 0
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

**Pros**:
- Excellent IDE intellisense/hover documentation
- Self-documenting code
- Examples show expected usage
- Professional API documentation standards
- Helpful for educational purposes

**Cons**:
- Verbose for simple functions
- Maintenance overhead if signatures change

---

#### Option B: Minimal JSDoc
```typescript
/** Adds two numbers */
export function add(a: number, b: number): number {
  return a + b;
}
```

**Pros**:
- Concise
- Still provides some documentation
- Low maintenance burden

**Cons**:
- Missing parameter documentation
- No usage examples
- Less helpful for learners

---

#### Option C: No JSDoc (types only)
```typescript
export function add(a: number, b: number): number {
  return a + b;
}
```

**Pros**:
- Minimal code
- Types provide some documentation

**Cons**:
- No documentation in IDE hover
- Not educational
- Unprofessional for public APIs

---

**SELECTED**: **Option A** - Comprehensive JSDoc with examples

**Rationale**:
1. **Educational Purpose**: This is a reference implementation for TypeScript best practices
2. **Developer Experience**: IDE hover documentation significantly improves usability
3. **Documentation Standard**: Matches professional TypeScript library conventions
4. **Minimal Cost**: Functions are simple enough that documentation won't become stale
5. **Project Quality**: Demonstrates commitment to quality even in small modules

**Tradeoffs**:
- **Brevity vs Clarity**: Chose clarity and education over code conciseness
- **Maintenance vs Quality**: Accepts minor maintenance overhead for significantly better developer experience

**Risks**: **None** (P3: Documentation might seem verbose for trivial functions, but educational value outweighs this)

---

### Decision 4: Number Type Choice

**Question**: Should we use `number`, `bigint`, or a custom numeric type?

**Options Considered**:

#### Option A: JavaScript `number` type (SELECTED)
```typescript
export function add(a: number, b: number): number
```

**Pros**:
- Standard JavaScript numeric type
- Works with all arithmetic operators
- Maximum compatibility
- No precision concerns for simple integer arithmetic
- Matches user's implicit expectations (no precision requirements specified)

**Cons**:
- IEEE 754 floating-point limitations
- Precision loss for very large integers (>2^53 - 1)
- Decimal arithmetic can have rounding errors

---

#### Option B: `bigint` type
```typescript
export function add(a: bigint, b: bigint): bigint
```

**Pros**:
- Arbitrary precision integers
- No overflow concerns

**Cons**:
- Cannot mix with `number` type
- More complex usage syntax (`123n`)
- Overkill for simple calculator
- Incompatible with decimals
- Not requested by user

---

#### Option C: Custom numeric type (e.g., Decimal.js)
```typescript
export function add(a: Decimal, b: Decimal): Decimal
```

**Pros**:
- Precise decimal arithmetic
- Arbitrary precision

**Cons**:
- External dependency
- Complex API
- Massive over-engineering for this use case
- Violates "no additional dependencies" requirement from Phase 1

---

**SELECTED**: **Option A** - Standard `number` type

**Rationale**:
1. **Scope Alignment**: User requested "simple calculator" with no precision requirements
2. **No Dependencies**: Avoids external libraries (Phase 1 requirement)
3. **TypeScript Standard**: Using built-in types demonstrates TypeScript fundamentals
4. **Appropriate Complexity**: `number` is sufficient for educational demonstration
5. **Expected Behavior**: Standard arithmetic operations work intuitively

**Tradeoffs**:
- **Simplicity vs Precision**: Chose simplicity for educational scope
- **Compatibility vs Accuracy**: Accepted IEEE 754 limitations for broader compatibility

**Risks**:
- **P2**: Floating-point arithmetic edge cases (e.g., `0.1 + 0.2 !== 0.3`)
  - Mitigation: Document this as known JavaScript behavior
  - Acceptable for educational scope
- **P3**: Very large integer overflow
  - Mitigation: Out of scope for "simple calculator"

---

### Decision 5: Vitest Configuration Update Strategy

**Question**: How should we update `vitest.config.ts` to include `/test` directory?

**Options Considered**:

#### Option A: Add `/test` to include pattern (SELECTED)
```typescript
include: [
  'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
  'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'  // ← ADD THIS
]
```

**Pros**:
- Minimal change (single line addition)
- Preserves existing pattern
- Both `/src` and `/test` tests run
- Clear intent: explicitly including test directory

**Cons**:
- Slightly redundant (two very similar patterns)

---

#### Option B: Simplify to single pattern
```typescript
include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
```

**Pros**:
- Simpler configuration
- Automatically includes all directories

**Cons**:
- May pick up unwanted test files (e.g., in `node_modules` despite exclude)
- Less explicit about which directories are tested
- Harder to understand intent

---

#### Option C: Separate test configurations
```typescript
// vitest.config.ts for /src
// vitest.test.config.ts for /test
```

**Pros**:
- Complete separation of concerns

**Cons**:
- Over-engineering
- Multiple test command complexity
- Violates simplicity principle

---

**SELECTED**: **Option A** - Add `/test` to include pattern

**Rationale**:
1. **Explicit Intent**: Makes it clear that both `/src` and `/test` are test locations
2. **Minimal Change**: Single line addition, low risk
3. **Maintainability**: Future developers can easily see both test locations
4. **Consistency**: Maintains existing pattern format

**Tradeoffs**:
- **Brevity vs Clarity**: Chose explicit clarity over shorter configuration

**Risks**: **None**

---

### Decision 6: Test Organization Structure

**Question**: How should we organize tests within `calculator.test.ts`?

**Options Considered**:

#### Option A: Nested describe blocks by function (SELECTED)
```typescript
describe('calculator module', () => {
  describe('add', () => {
    it('should add positive numbers', () => { ... });
    it('should add negative numbers', () => { ... });
    it('should handle zero', () => { ... });
    it('should add decimal numbers', () => { ... });
  });

  describe('subtract', () => {
    it('should subtract positive numbers', () => { ... });
    it('should subtract negative numbers', () => { ... });
    it('should handle zero', () => { ... });
    it('should subtract decimal numbers', () => { ... });
    it('should return negative results', () => { ... });
  });
});
```

**Pros**:
- Clear hierarchical organization
- Easy to locate specific function tests
- Groups related tests together
- Matches existing project pattern (`/src/__tests__/example.test.ts`)
- Test output shows clear structure

**Cons**:
- More nesting/indentation
- Slightly more verbose

---

#### Option B: Flat structure with prefixed names
```typescript
describe('calculator module', () => {
  it('add should add positive numbers', () => { ... });
  it('add should add negative numbers', () => { ... });
  it('subtract should subtract positive numbers', () => { ... });
  // ...
});
```

**Pros**:
- Less nesting
- Simpler structure

**Cons**:
- Harder to scan for specific function tests
- Less organized test output
- Doesn't match project conventions

---

**SELECTED**: **Option A** - Nested describe blocks

**Rationale**:
1. **Project Convention**: Matches existing test pattern in `/src/__tests__/example.test.ts`
2. **Scalability**: Easy to add more functions in future
3. **Test Output**: Vitest reporter shows clear hierarchical structure
4. **Organization**: Logical grouping makes tests easier to find and maintain

**Tradeoffs**:
- **Simplicity vs Organization**: Chose better organization over minimal nesting

**Risks**: **None**

---

## 4. API Contract Specification

### 4.1 Module Interface

**File**: `/Users/say/Documents/GitHub/say-your-harmony/test/calculator.ts`

```typescript
/**
 * Adds two numbers together.
 *
 * @param a - The first number
 * @param b - The second number
 * @returns The sum of a and b
 *
 * @example
 * ```typescript
 * add(2, 3); // returns 5
 * add(-1, 1); // returns 0
 * add(0.1, 0.2); // returns 0.30000000000000004 (IEEE 754)
 * ```
 */
export function add(a: number, b: number): number;

/**
 * Subtracts the second number from the first number.
 *
 * @param a - The number to subtract from
 * @param b - The number to subtract
 * @returns The difference of a minus b
 *
 * @example
 * ```typescript
 * subtract(5, 3); // returns 2
 * subtract(3, 5); // returns -2
 * subtract(10, 0); // returns 10
 * ```
 */
export function subtract(a: number, b: number): number;
```

### 4.2 Type Contracts

**Input Contract**:
- Both parameters must be JavaScript `number` type
- Valid values: Any finite number (positive, negative, zero, decimal)
- Invalid values: `NaN`, `Infinity`, `-Infinity` (TypeScript allows these as `number`, but behavior is undefined for this implementation)

**Output Contract**:
- Returns JavaScript `number` type
- Result follows JavaScript arithmetic rules (IEEE 754)
- Decimal results may have floating-point precision limitations

**Behavior Contract**:
- **Pure Functions**: No side effects, same inputs always produce same output
- **Immutability**: Input parameters are not modified
- **Synchronous**: Results returned immediately (no async/await)
- **Thread-Safe**: Stateless functions, safe for concurrent use

### 4.3 Test Coverage Requirements

**Minimum Test Cases**:

For `add()`:
1. Positive integers: `add(2, 3) → 5`
2. Negative integers: `add(-5, -3) → -8`
3. Mixed signs: `add(-5, 3) → -2`
4. Zero handling: `add(0, 5) → 5`
5. Decimal numbers: `add(0.1, 0.2) → 0.30000000000000004`

For `subtract()`:
1. Positive integers: `subtract(5, 3) → 2`
2. Negative result: `subtract(3, 5) → -2`
3. Negative numbers: `subtract(-5, -3) → -2`
4. Zero handling: `subtract(5, 0) → 5`
5. Decimal numbers: `subtract(1.5, 0.5) → 1.0`

---

## 5. Tradeoff Analysis

### Tradeoff 1: Configuration Update vs Existing Patterns

**Context**: User specified `/test` directory, but project uses `/src/__tests__`

**Options**:
- A: Update Vitest config to support `/test` (SELECTED)
- B: Use existing `/src/__tests__` pattern

**Analysis**:

| Aspect | Option A (/test) | Option B (/src/__tests__) |
|--------|------------------|---------------------------|
| User Alignment | ✅ Honors request | ❌ Ignores request |
| Config Changes | ⚠️ Requires update | ✅ No changes |
| Future Usability | ✅ Makes /test functional | ❌ Leaves /test unused |
| Project Consistency | ❌ Diverges from pattern | ✅ Follows pattern |
| Separation of Concerns | ✅ Clear boundary | ⚠️ Mixed with production |

**Decision**: Option A - Update config to support `/test`

**Rationale**: User intent takes precedence over convenience. The configuration update is simple and makes the `/test` directory functional for future use.

---

### Tradeoff 2: Documentation Verbosity vs Code Brevity

**Context**: How much JSDoc should we write for simple arithmetic functions?

**Options**:
- A: Comprehensive JSDoc with examples (SELECTED)
- B: Minimal/no documentation

**Analysis**:

| Aspect | Comprehensive JSDoc | Minimal JSDoc |
|--------|---------------------|---------------|
| IDE Experience | ✅ Excellent hover docs | ⚠️ Basic/none |
| Educational Value | ✅ High | ❌ Low |
| Code Conciseness | ❌ Verbose | ✅ Concise |
| Maintenance Burden | ⚠️ Minor | ✅ None |
| Professional Standards | ✅ Matches libraries | ⚠️ Below standard |

**Decision**: Comprehensive JSDoc

**Rationale**: Educational value and developer experience outweigh verbosity concerns. This is a reference implementation that should demonstrate best practices.

---

### Tradeoff 3: Type Safety vs Flexibility

**Context**: Should we use strict `number` type or allow broader numeric types?

**Options**:
- A: Strict `number` type (SELECTED)
- B: Union types like `number | bigint`
- C: Generic numeric type

**Analysis**:

| Aspect | Strict number | Union/Generic |
|--------|---------------|---------------|
| Type Safety | ✅ Clear contract | ⚠️ Ambiguous |
| Complexity | ✅ Simple | ❌ Complex |
| Scope Alignment | ✅ Matches "simple calculator" | ❌ Over-engineering |
| TypeScript Demonstration | ✅ Shows strict typing | ⚠️ Shows advanced features |

**Decision**: Strict `number` type

**Rationale**: Aligns with "simple calculator" scope. Demonstrates TypeScript strict mode without over-engineering.

---

## 6. Risk Assessment

### P0 (CRITICAL) - Block Deployment
**NONE IDENTIFIED**

---

### P1 (HIGH) - Fix Before Production

#### Risk: TypeScript compilation warnings for files outside rootDir
**Description**: `tsconfig.json` has `rootDir: "./src"`, but we're placing files in `/test`

**Impact**:
- TypeScript compiler may warn about files outside rootDir
- Build output structure could be affected
- IDE may show warnings

**Likelihood**: HIGH

**Mitigation Strategy**:
1. Test TypeScript compilation with files in `/test`
2. If warnings occur, verify they don't affect functionality
3. If critical, consider adding `/test` to tsconfig includes with separate outDir
4. Document that `/test` is for examples, not production builds

**Acceptance Criteria**:
- Files compile without errors
- Build process (`npm run build`) still produces correct output
- Warnings (if any) are documented and understood

---

#### Risk: Vitest configuration update breaks existing tests
**Description**: Modifying `vitest.config.ts` could inadvertently affect existing test discovery

**Impact**: Existing 6 test files in `/src/__tests__` might not run

**Likelihood**: LOW (additive change only)

**Mitigation Strategy**:
1. Add `/test` pattern WITHOUT removing existing pattern
2. Run full test suite after config change
3. Verify all existing tests still discovered
4. Use `vitest --reporter=verbose` to see all discovered tests

**Acceptance Criteria**:
- All existing tests in `/src/__tests__` still run
- New tests in `/test` are discovered
- Test count increases as expected

---

### P2 (MEDIUM) - Quality Improvement

#### Risk: Floating-point precision test failures
**Description**: JavaScript's IEEE 754 arithmetic can produce unexpected results (e.g., `0.1 + 0.2 = 0.30000000000000004`)

**Impact**: Tests with decimal assertions might fail or require special handling

**Likelihood**: MEDIUM (if using exact equality for decimals)

**Mitigation Strategy**:
1. Use `.toBe()` for integer tests
2. For decimal tests, document the IEEE 754 behavior
3. Use exact expected values (e.g., expect `0.30000000000000004` not `0.3`)
4. Consider using `toBeCloseTo()` if precision becomes an issue

**Acceptance Criteria**:
- All tests pass consistently
- Decimal behavior is documented
- No false positives due to floating-point arithmetic

---

### P3 (LOW) - Future Enhancement

#### Risk: Future confusion about test file placement
**Description**: Having two test locations (`/src/__tests__` and `/test`) might confuse future contributors

**Impact**: Inconsistent test placement, uncertainty about conventions

**Likelihood**: LOW

**Mitigation Strategy**:
1. Document the convention in project README
2. Add comment in `vitest.config.ts` explaining dual locations
3. Consider creating a TESTING.md guide

**Acceptance Criteria**:
- Documentation clearly explains when to use each location
- No blocking impact on development

---

## 7. Implementation Plan

### Step 1: Update Vitest Configuration
**File**: `/Users/say/Documents/GitHub/say-your-harmony/vitest.config.ts`

**Change**:
```typescript
// Before:
include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

// After:
include: [
  'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
  'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
],
```

**Rationale**: Minimal change to support `/test` directory

---

### Step 2: Implement calculator.ts
**File**: `/Users/say/Documents/GitHub/say-your-harmony/test/calculator.ts`

**Structure**:
```typescript
// JSDoc comment with @param, @returns, @example
export function add(a: number, b: number): number {
  return a + b;
}

// JSDoc comment with @param, @returns, @example
export function subtract(a: number, b: number): number {
  return a - b;
}
```

**Key Aspects**:
- Named exports (matches project convention)
- Comprehensive JSDoc (educational value)
- Explicit type annotations (TypeScript strict mode)
- Pure functions (no side effects)

---

### Step 3: Implement calculator.test.ts
**File**: `/Users/say/Documents/GitHub/say-your-harmony/test/calculator.test.ts`

**Structure**:
```typescript
import { describe, it, expect } from 'vitest';
import { add, subtract } from './calculator';

describe('calculator module', () => {
  describe('add', () => {
    it('should add positive numbers', () => { /* test */ });
    it('should add negative numbers', () => { /* test */ });
    it('should handle zero', () => { /* test */ });
    it('should add decimal numbers', () => { /* test */ });
  });

  describe('subtract', () => {
    it('should subtract positive numbers', () => { /* test */ });
    it('should subtract negative numbers', () => { /* test */ });
    it('should handle zero', () => { /* test */ });
    it('should subtract decimal numbers', () => { /* test */ });
    it('should return negative results', () => { /* test */ });
  });
});
```

**Key Aspects**:
- Import from `vitest` (matches project pattern)
- Nested describe blocks (project convention)
- Clear test names with "should" convention
- Comprehensive edge case coverage

---

### Step 4: Verification Steps

1. **TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```
   Expected: No compilation errors (warnings acceptable if documented)

2. **Test Execution**:
   ```bash
   npm test
   ```
   Expected: All tests pass (including new tests in `/test`)

3. **Test Discovery Verification**:
   ```bash
   npx vitest --reporter=verbose list
   ```
   Expected: Both `/src/__tests__` and `/test` files appear

4. **Coverage Report**:
   ```bash
   npx vitest --coverage
   ```
   Expected: 100% coverage for calculator.ts

---

## 8. Verification Strategy

### Unit Test Verification
- All test cases pass
- No flaky tests (run multiple times)
- Coverage: 100% for calculator.ts (all lines, branches, functions)

### Type Safety Verification
- `npx tsc --noEmit` completes successfully
- IDE shows no TypeScript errors
- All function signatures have explicit types
- No `any` types used

### Integration Verification
- Run full test suite: All tests (old + new) pass
- Verify existing tests still work
- Build process (`npm run build`) succeeds

### Code Quality Verification
- JSDoc documentation renders correctly in IDE hover
- Code follows project conventions
- No ESLint errors (if configured)

---

## 9. Success Criteria

Before transitioning to Phase 3 (Implementation), verify:

- [x] Architecture is documented with component diagram
- [x] All technology decisions have documented rationale (6 decisions)
- [x] All decisions include 2+ alternatives considered
- [x] Tradeoffs are explicitly analyzed (3 major tradeoffs)
- [x] Risks are classified (P0: 0, P1: 2, P2: 1, P3: 1)
- [x] API contract is precisely specified
- [x] Implementation plan is detailed with verification steps
- [x] Design document is complete

---

## 10. Completion Checklist

### Architecture Design
- [x] Component diagram created
- [x] Module responsibilities documented
- [x] Data flow described (pure functions, no state)

### Technology Decisions
- [x] File location strategy decided (/test directory)
- [x] Export strategy decided (named exports)
- [x] Documentation level decided (comprehensive JSDoc)
- [x] Type choice decided (number type)
- [x] Vitest config strategy decided (add /test to include)
- [x] Test organization decided (nested describe blocks)

### Decision Quality
- [x] Each decision has 2+ alternatives
- [x] Each decision has explicit rationale
- [x] Each decision has tradeoff analysis
- [x] Each decision addresses risks

### Risk Analysis
- [x] P0 risks identified (none)
- [x] P1 risks identified (2)
- [x] P2 risks identified (1)
- [x] P3 risks identified (1)
- [x] Mitigation strategies documented

### API Specification
- [x] Type signatures defined
- [x] Input/output contracts specified
- [x] Behavior contracts defined
- [x] Test coverage requirements specified

### Implementation Readiness
- [x] Step-by-step implementation plan
- [x] Verification strategy defined
- [x] Success criteria clear

---

## 11. Transition to Phase 3

**Phase 2 - Design: COMPLETE**

**Next Phase**: Phase 3 - Implementation

**Builder Agent Tasks**:
1. Update `vitest.config.ts` to include `/test` directory
2. Implement `calculator.ts` with full JSDoc and type safety
3. Implement `calculator.test.ts` with comprehensive test coverage
4. Run TypeScript compilation verification
5. Run test suite and verify all tests pass
6. Generate coverage report (target: 100% for calculator.ts)
7. Document any P0/P1 risks encountered during implementation

**Estimated Implementation Time**: 3-4 agent turns

**Success Metrics for Phase 3**:
- All tests pass (100%)
- Code coverage 100% for calculator.ts
- TypeScript strict mode compliance verified
- Build process completes successfully
- P1 risks resolved

---

## 12. Meta Notes

### Design Process Observations

**What Went Well**:
- Planning document provided comprehensive foundation
- All decision points from Phase 1 were addressed
- Risk identification was proactive (2 P1 risks before implementation)
- Multiple alternatives considered for each decision (6 decisions, 18 options total)

**Key Design Principles Applied**:
1. **User Intent First**: Honored `/test` directory requirement despite complexity
2. **Project Consistency**: Matched existing patterns (named exports, describe blocks)
3. **Educational Value**: Comprehensive JSDoc for reference implementation quality
4. **Appropriate Complexity**: Simple `number` type, not over-engineered
5. **Explicit Tradeoffs**: Security vs UX → User intent vs convenience

**Decision Tree Structure**:
```
File Location → /test (user requirement)
    ↓
Export Strategy → Named exports (project convention)
    ↓
Documentation → Comprehensive JSDoc (educational value)
    ↓
Type Choice → number (scope alignment)
    ↓
Config Update → Add /test to include (minimal change)
    ↓
Test Organization → Nested describe (project pattern)
```

**Risk Mitigation Strategy**:
- P1 TypeScript warnings: Test early, document if acceptable
- P1 Vitest config: Additive change only, verify existing tests
- P2 Floating-point: Use exact values, document IEEE 754 behavior

---

## 13. References

**Project Files Referenced**:
- `/Users/say/Documents/GitHub/say-your-harmony/docs/planning/calculator-planning.md`
- `/Users/say/Documents/GitHub/say-your-harmony/vitest.config.ts`
- `/Users/say/Documents/GitHub/say-your-harmony/tsconfig.json`
- `/Users/say/Documents/GitHub/say-your-harmony/src/__tests__/example.test.ts`

**Design Patterns Applied**:
- Pure Functions (functional programming)
- Named Exports (ES6 modules)
- Nested Test Suites (Vitest/Jest convention)
- Comprehensive JSDoc (TSDoc standard)

**TypeScript Best Practices**:
- Explicit type annotations
- Strict mode compliance
- No `any` types
- Full null safety

---

**End of Phase 2 Design Document**

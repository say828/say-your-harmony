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
export function add(a: number, b: number): number {
  return a + b;
}

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
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Multiplies two numbers together.
 *
 * @param a - The first number
 * @param b - The second number
 * @returns The product of a and b
 *
 * @example
 * ```typescript
 * multiply(2, 3); // returns 6
 * multiply(-2, 3); // returns -6
 * multiply(0.1, 0.2); // returns 0.020000000000000004 (IEEE 754)
 * ```
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divides the first number by the second number.
 *
 * @param a - The dividend (number to be divided)
 * @param b - The divisor (number to divide by)
 * @returns The quotient of a divided by b
 * @throws {Error} When b is zero (division by zero)
 *
 * @example
 * ```typescript
 * divide(6, 2); // returns 3
 * divide(5, 2); // returns 2.5
 * divide(1, 3); // returns 0.3333333333333333 (IEEE 754)
 * divide(5, 0); // throws Error: Division by zero
 * ```
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

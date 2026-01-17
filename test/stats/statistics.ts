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
export function mean(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate mean of empty array');
  }

  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

/**
 * Calculates the median (middle value) of an array of numbers.
 * For arrays with even length, returns the average of the two middle values.
 * Does not mutate the original array.
 *
 * @param numbers - An array of numbers to calculate the median
 * @returns The median value
 * @throws {Error} When the array is empty
 *
 * @example
 * ```typescript
 * median([1, 2, 3]); // returns 2 (odd length)
 * median([1, 2, 3, 4]); // returns 2.5 (even length)
 * median([3, 1, 2]); // returns 2 (unsorted input)
 * ```
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate median of empty array');
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Calculates the population standard deviation of an array of numbers.
 * Uses the formula: sqrt(sum((x - mean)²) / N)
 *
 * @param numbers - An array of numbers to calculate the standard deviation
 * @returns The population standard deviation
 * @throws {Error} When the array is empty
 *
 * @example
 * ```typescript
 * standardDeviation([1, 2, 3, 4, 5]); // returns ~1.414
 * standardDeviation([5]); // returns 0 (no variation)
 * standardDeviation([3, 3, 3]); // returns 0 (no variation)
 * ```
 */
export function standardDeviation(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate standard deviation of empty array');
  }

  const avg = mean(numbers);
  const squaredDiffs = numbers.map((num) => Math.pow(num - avg, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / numbers.length;

  return Math.sqrt(variance);
}

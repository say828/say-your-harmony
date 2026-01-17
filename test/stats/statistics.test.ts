import { describe, expect, it } from 'vitest';
import { mean, median, standardDeviation } from './statistics';

describe('statistics module', () => {
  describe('mean', () => {
    it('should calculate mean of positive numbers', () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should calculate mean of single element', () => {
      expect(mean([5])).toBe(5);
    });

    it('should calculate mean of negative numbers', () => {
      expect(mean([-5, -3, -1])).toBe(-3);
    });

    it('should calculate mean of mixed signs', () => {
      expect(mean([-5, 5])).toBe(0);
    });

    it('should calculate mean of decimal numbers', () => {
      expect(mean([2.5, 3.5])).toBe(3);
    });

    it('should throw error for empty array', () => {
      expect(() => mean([])).toThrow('Cannot calculate mean of empty array');
    });
  });

  describe('median', () => {
    it('should calculate median of odd-length array', () => {
      expect(median([1, 2, 3])).toBe(2);
    });

    it('should calculate median of even-length array', () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });

    it('should calculate median of single element', () => {
      expect(median([5])).toBe(5);
    });

    it('should calculate median of unsorted array', () => {
      expect(median([3, 1, 2])).toBe(2);
    });

    it('should calculate median with duplicate values', () => {
      expect(median([1, 2, 2, 3])).toBe(2);
    });

    it('should throw error for empty array', () => {
      expect(() => median([])).toThrow('Cannot calculate median of empty array');
    });
  });

  describe('standardDeviation', () => {
    it('should calculate standard deviation of numbers', () => {
      expect(standardDeviation([1, 2, 3, 4, 5])).toBe(Math.sqrt(2));
    });

    it('should return 0 for single element', () => {
      expect(standardDeviation([5])).toBe(0);
    });

    it('should return 0 for identical values', () => {
      expect(standardDeviation([3, 3, 3])).toBe(0);
    });

    it('should calculate standard deviation of negative numbers', () => {
      expect(standardDeviation([-2, -1, 0, 1, 2])).toBe(Math.sqrt(2));
    });

    it('should calculate standard deviation of decimal numbers', () => {
      const result = standardDeviation([1.5, 2.5, 3.5]);
      const expected = Math.sqrt(2 / 3);
      expect(result).toBe(expected);
    });

    it('should throw error for empty array', () => {
      expect(() => standardDeviation([])).toThrow('Cannot calculate standard deviation of empty array');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, divide } from './calculator';

describe('calculator module', () => {
  describe('add', () => {
    it('should add positive numbers', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(10, 20)).toBe(30);
    });

    it('should add negative numbers', () => {
      expect(add(-5, -3)).toBe(-8);
      expect(add(-10, -1)).toBe(-11);
    });

    it('should add mixed sign numbers', () => {
      expect(add(-5, 3)).toBe(-2);
      expect(add(5, -3)).toBe(2);
    });

    it('should handle zero', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
      expect(add(0, 0)).toBe(0);
    });

    it('should add decimal numbers', () => {
      expect(add(0.1, 0.2)).toBe(0.30000000000000004);
      expect(add(1.5, 2.5)).toBe(4.0);
      expect(add(0.7, 0.3)).toBe(1.0);
    });
  });

  describe('subtract', () => {
    it('should subtract positive numbers', () => {
      expect(subtract(5, 3)).toBe(2);
      expect(subtract(10, 7)).toBe(3);
    });

    it('should return negative results', () => {
      expect(subtract(3, 5)).toBe(-2);
      expect(subtract(1, 10)).toBe(-9);
    });

    it('should subtract negative numbers', () => {
      expect(subtract(-5, -3)).toBe(-2);
      expect(subtract(-10, -5)).toBe(-5);
      expect(subtract(5, -3)).toBe(8);
    });

    it('should handle zero', () => {
      expect(subtract(5, 0)).toBe(5);
      expect(subtract(0, 5)).toBe(-5);
      expect(subtract(0, 0)).toBe(0);
    });

    it('should subtract decimal numbers', () => {
      expect(subtract(1.5, 0.5)).toBe(1.0);
      expect(subtract(2.7, 1.2)).toBe(1.5000000000000002);
      expect(subtract(0.3, 0.1)).toBe(0.19999999999999998);
    });
  });

  describe('multiply', () => {
    it('should multiply positive numbers', () => {
      expect(multiply(3, 4)).toBe(12);
      expect(multiply(10, 5)).toBe(50);
    });

    it('should multiply negative numbers', () => {
      expect(multiply(-3, -4)).toBe(12);
      expect(multiply(-10, -2)).toBe(20);
    });

    it('should multiply mixed sign numbers', () => {
      expect(multiply(-3, 4)).toBe(-12);
      expect(multiply(3, -4)).toBe(-12);
    });

    it('should handle zero', () => {
      expect(multiply(0, 5)).toBe(0);
      expect(multiply(5, 0)).toBe(0);
      expect(multiply(0, 0)).toBe(0);
    });

    it('should multiply decimal numbers', () => {
      expect(multiply(0.1, 0.2)).toBe(0.020000000000000004);
      expect(multiply(1.5, 2.0)).toBe(3.0);
    });
  });

  describe('divide', () => {
    it('should divide positive numbers', () => {
      expect(divide(6, 2)).toBe(3);
      expect(divide(10, 5)).toBe(2);
    });

    it('should return negative results', () => {
      expect(divide(-6, 2)).toBe(-3);
      expect(divide(6, -2)).toBe(-3);
    });

    it('should divide negative numbers', () => {
      expect(divide(-6, -2)).toBe(3);
      expect(divide(-10, -5)).toBe(2);
    });

    it('should divide decimal numbers', () => {
      expect(divide(5, 2)).toBe(2.5);
      expect(divide(1, 3)).toBe(0.3333333333333333);
    });

    it('should handle zero dividend', () => {
      expect(divide(0, 5)).toBe(0);
      expect(divide(0, 10)).toBe(0);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => divide(5, 0)).toThrow('Division by zero');
      expect(() => divide(0, 0)).toThrow('Division by zero');
      expect(() => divide(-10, 0)).toThrow('Division by zero');
    });
  });
});

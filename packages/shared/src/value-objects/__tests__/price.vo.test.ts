import { describe, it, expect } from "vitest";
import { Price } from "../price.vo";
import { ValueError } from "../../errors/value.error";

describe("Price Value Object", () => {
  describe("Creation", () => {
    it("should create price with valid positive number", () => {
      const price = Price.create(100);

      expect(price.value).toBe(100);
    });

    it("should create price with zero", () => {
      const price = Price.create(0);

      expect(price.value).toBe(0);
    });

    it("should throw error for negative price", () => {
      expect(() => {
        Price.create(-1);
      }).toThrow(ValueError);
    });

    it("should throw error with specific message for negative price", () => {
      expect(() => {
        Price.create(-10);
      }).toThrow("Price must be at least 0");
    });

    it("should throw error for infinity", () => {
      expect(() => {
        Price.create(Infinity);
      }).toThrow(ValueError);
    });

    it("should throw error with specific message for infinity", () => {
      expect(() => {
        Price.create(Infinity);
      }).toThrow("Price must be a finite number");
    });

    it("should throw error for negative infinity", () => {
      expect(() => {
        Price.create(-Infinity);
      }).toThrow(ValueError);
    });

    it("should throw error for NaN", () => {
      expect(() => {
        Price.create(NaN);
      }).toThrow(ValueError);
    });

    it("should throw error with specific message for NaN", () => {
      expect(() => {
        Price.create(NaN);
      }).toThrow("Price must be a finite number");
    });

    it("should throw error for price exceeding maximum", () => {
      expect(() => {
        Price.create(1000001);
      }).toThrow(ValueError);
    });

    it("should throw error with specific message for maximum exceeded", () => {
      expect(() => {
        Price.create(1000001);
      }).toThrow("Price must not exceed 1000000");
    });

    it("should accept price at maximum limit", () => {
      expect(() => {
        Price.create(1000000);
      }).not.toThrow();
    });

    it("should accept decimal prices", () => {
      const price = Price.create(99.99);

      expect(price.value).toBe(99.99);
    });

    it("should accept very small decimals", () => {
      const price = Price.create(0.01);

      expect(price.value).toBe(0.01);
    });
  });

  describe("equals", () => {
    it("should return true for equal prices", () => {
      const price1 = Price.create(100);
      const price2 = Price.create(100);

      expect(price1.equals(price2)).toBe(true);
    });

    it("should return false for different prices", () => {
      const price1 = Price.create(100);
      const price2 = Price.create(200);

      expect(price1.equals(price2)).toBe(false);
    });

    it("should return true for same decimal prices", () => {
      const price1 = Price.create(99.99);
      const price2 = Price.create(99.99);

      expect(price1.equals(price2)).toBe(true);
    });

    it("should return false for slightly different decimal prices", () => {
      const price1 = Price.create(99.99);
      const price2 = Price.create(99.98);

      expect(price1.equals(price2)).toBe(false);
    });
  });

  describe("toNumber", () => {
    it("should return numeric value", () => {
      const price = Price.create(150);

      expect(price.toNumber()).toBe(150);
      expect(typeof price.toNumber()).toBe("number");
    });

    it("should return zero for zero price", () => {
      const price = Price.create(0);

      expect(price.toNumber()).toBe(0);
    });

    it("should return decimal value", () => {
      const price = Price.create(123.45);

      expect(price.toNumber()).toBe(123.45);
    });
  });

  describe("multiply", () => {
    it("should multiply price by number of nights", () => {
      const price = Price.create(100);
      const result = price.multiply(5);

      expect(result).toBeInstanceOf(Price);
      expect(result.value).toBe(500);
    });

    it("should handle multiplication by 1", () => {
      const price = Price.create(100);
      const result = price.multiply(1);

      expect(result.value).toBe(100);
    });

    it("should handle multiplication by 0", () => {
      const price = Price.create(100);
      const result = price.multiply(0);

      expect(result.value).toBe(0);
    });

    it("should handle decimal multiplication", () => {
      const price = Price.create(100);
      const result = price.multiply(2.5);

      expect(result.value).toBe(250);
    });

    it("should handle large multiplication", () => {
      const price = Price.create(100);
      const result = price.multiply(365);

      expect(result.value).toBe(36500);
    });

    it("should not modify original price", () => {
      const price = Price.create(100);
      price.multiply(5);

      expect(price.value).toBe(100);
    });

    it("should throw error for negative multiplication", () => {
      const price = Price.create(100);

      expect(() => {
        price.multiply(-1);
      }).toThrow(ValueError);
    });

    it("should throw error for infinity multiplication", () => {
      const price = Price.create(100);

      expect(() => {
        price.multiply(Infinity);
      }).toThrow(ValueError);
    });
  });

  describe("Edge cases", () => {
    it("should handle very small decimal prices", () => {
      const price = Price.create(0.01);

      expect(price.value).toBe(0.01);
      expect(price.toNumber()).toBe(0.01);
    });

    it("should handle prices with many decimal places", () => {
      const price = Price.create(123.456789);

      expect(price.value).toBe(123.456789);
    });

    it("should handle multiplication resulting in decimal", () => {
      const price = Price.create(99.99);
      const result = price.multiply(3);

      expect(result.value).toBeCloseTo(299.97);
    });

    it("should handle multiplication resulting in very small decimal", () => {
      const price = Price.create(0.01);
      const result = price.multiply(0.5);

      expect(result.value).toBeCloseTo(0.005);
    });
  });

  describe("Practical scenarios", () => {
    it("should calculate total for 1 night stay", () => {
      const nightlyRate = Price.create(150);
      const total = nightlyRate.multiply(1);

      expect(total.toNumber()).toBe(150);
    });

    it("should calculate total for 7 nights stay", () => {
      const nightlyRate = Price.create(100);
      const total = nightlyRate.multiply(7);

      expect(total.toNumber()).toBe(700);
    });

    it("should calculate total for 30 nights stay", () => {
      const nightlyRate = Price.create(85);
      const total = nightlyRate.multiply(30);

      expect(total.toNumber()).toBe(2550);
    });

    it("should handle weekend rates (2 nights)", () => {
      const nightlyRate = Price.create(200);
      const weekendTotal = nightlyRate.multiply(2);

      expect(weekendTotal.toNumber()).toBe(400);
    });

    it("should handle weekly rate (7 nights) with decimal", () => {
      const nightlyRate = Price.create(123.50);
      const weeklyTotal = nightlyRate.multiply(7);

      expect(weeklyTotal.toNumber()).toBeCloseTo(864.5);
    });
  });
});

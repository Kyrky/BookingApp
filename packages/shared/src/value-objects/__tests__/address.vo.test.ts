import { describe, it, expect } from "vitest";
import { Address } from "../address.vo";
import { ValueError } from "../../errors/value.error";

describe("Address Value Object", () => {
  describe("Creation", () => {
    it("should create address with valid input", () => {
      const address = Address.create("123 Test St, City, Country");

      expect(address.value).toBe("123 Test St, City, Country");
    });

    it("should trim whitespace from address", () => {
      const address = Address.create("  123 Test St, City  ");

      expect(address.value).toBe("123 Test St, City");
    });

    it("should throw error if address is empty", () => {
      expect(() => {
        Address.create("");
      }).toThrow(ValueError);
    });

    it("should throw error if address is only whitespace", () => {
      expect(() => {
        Address.create("   ");
      }).toThrow("Address cannot be empty");
    });

    it("should throw error if address is too short (< 5 chars)", () => {
      expect(() => {
        Address.create("123");
      }).toThrow(ValueError);
    });

    it("should throw error with specific message for short address", () => {
      expect(() => {
        Address.create("123");
      }).toThrow("Address must be at least 5 characters long");
    });

    it("should accept address with exactly 5 characters", () => {
      expect(() => {
        Address.create("12345");
      }).not.toThrow();
    });

    it("should throw error if address is too long (> 500 chars)", () => {
      expect(() => {
        Address.create("A".repeat(501));
      }).toThrow(ValueError);
    });

    it("should throw error with specific message for long address", () => {
      expect(() => {
        Address.create("A".repeat(501));
      }).toThrow("Address must not exceed 500 characters");
    });

    it("should accept address with exactly 500 characters", () => {
      expect(() => {
        Address.create("A".repeat(500));
      }).not.toThrow();
    });
  });

  describe("equals", () => {
    it("should return true for equal addresses", () => {
      const address1 = Address.create("123 Test St, City");
      const address2 = Address.create("123 Test St, City");

      expect(address1.equals(address2)).toBe(true);
    });

    it("should return false for different addresses", () => {
      const address1 = Address.create("123 Test St, City");
      const address2 = Address.create("456 Other St, City");

      expect(address1.equals(address2)).toBe(false);
    });

    it("should return false for addresses with different casing", () => {
      const address1 = Address.create("123 Test St, City");
      const address2 = Address.create("123 test st, city");

      expect(address1.equals(address2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return address value", () => {
      const address = Address.create("123 Test St, City");

      expect(address.toString()).toBe("123 Test St, City");
    });

    it("should return trimmed value", () => {
      const address = Address.create("  123 Test St  ");

      expect(address.toString()).toBe("123 Test St");
    });
  });

  describe("Edge cases", () => {
    it("should handle special characters", () => {
      const address = Address.create("123 Test St, Apt. 2B, São Paulo");

      expect(address.value).toBe("123 Test St, Apt. 2B, São Paulo");
    });

    it("should handle newlines and tabs", () => {
      const address = Address.create("123 Test St\n\tCity");

      expect(address.value).toBe("123 Test St\n\tCity");
    });

    it("should handle unicode characters", () => {
      const address = Address.create("123 Test St, Москва");

      expect(address.value).toBe("123 Test St, Москва");
    });

    it("should handle emojis", () => {
      const address = Address.create("123 Test St 🏠, City");

      expect(address.value).toBe("123 Test St 🏠, City");
    });
  });
});

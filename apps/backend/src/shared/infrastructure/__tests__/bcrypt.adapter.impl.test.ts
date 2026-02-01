import { describe, it, expect, beforeEach } from "vitest";
import { BcryptAdapterImpl } from "../bcrypt.adapter.impl";

describe("BcryptAdapterImpl", () => {
  let bcryptAdapter: BcryptAdapterImpl;

  beforeEach(() => {
    bcryptAdapter = new BcryptAdapterImpl();
  });

  describe("hash", () => {
    it("should hash a password", async () => {
      const password = "password123";
      const hash = await bcryptAdapter.hash(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password);
    });

    it("should generate different hashes for same password", async () => {
      const password = "password123";

      const hash1 = await bcryptAdapter.hash(password);
      const hash2 = await bcryptAdapter.hash(password);

      expect(hash1).not.toBe(hash2); // Salt makes them different
    });

    it("should generate valid bcrypt hashes", async () => {
      const password = "password123";
      const hash = await bcryptAdapter.hash(password);

      // Bcrypt hashes start with $2b$ or $2a$
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it("should handle empty passwords", async () => {
      const password = "";
      const hash = await bcryptAdapter.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it("should handle long passwords", async () => {
      const password = "a".repeat(200);
      const hash = await bcryptAdapter.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it("should handle special characters", async () => {
      const password = "p@$$w0rd!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const hash = await bcryptAdapter.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it("should handle unicode characters", async () => {
      const password = "пароль123";
      const hash = await bcryptAdapter.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it("should handle whitespace", async () => {
      const password = "   password with spaces   ";
      const hash = await bcryptAdapter.hash(password);

      expect(hash).toBeDefined();
    });

    it("should produce hashes of reasonable length", async () => {
      const password = "password123";
      const hash = await bcryptAdapter.hash(password);

      // Bcrypt hashes are typically 60 characters
      expect(hash.length).toBe(60);
    });
  });

  describe("compare", () => {
    it("should return true for matching password", async () => {
      const password = "password123";
      const hash = await bcryptAdapter.hash(password);

      const result = await bcryptAdapter.compare(password, hash);

      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "password123";
      const wrongPassword = "wrongpassword";
      const hash = await bcryptAdapter.hash(password);

      const result = await bcryptAdapter.compare(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it("should return false for empty password when hash is non-empty", async () => {
      const password = "password123";
      const hash = await bcryptAdapter.hash(password);

      const result = await bcryptAdapter.compare("", hash);

      expect(result).toBe(false);
    });

    it("should return false for non-empty password when hash is empty", async () => {
      const result = await bcryptAdapter.compare("password", "");

      expect(result).toBe(false);
    });

    it("should return false for both empty", async () => {
      const result = await bcryptAdapter.compare("", "");

      expect(result).toBe(false);
    });

    it("should be case sensitive", async () => {
      const password = "Password123";
      const hash = await bcryptAdapter.hash(password);

      const result = await bcryptAdapter.compare("password123", hash);

      expect(result).toBe(false);
    });

    it("should handle special characters", async () => {
      const password = "p@$$w0rd!@#$";
      const hash = await bcryptAdapter.hash(password);

      const result = await bcryptAdapter.compare(password, hash);

      expect(result).toBe(true);
    });

    it("should handle unicode characters", async () => {
      const password = "пароль123";
      const hash = await bcryptAdapter.hash(password);

      const result = await bcryptAdapter.compare(password, hash);

      expect(result).toBe(true);
    });

    it("should handle whitespace differences", async () => {
      const password = "password123";
      const hash = await bcryptAdapter.hash(password);

      const result = await bcryptAdapter.compare("password123 ", hash);

      expect(result).toBe(false);
    });
  });

  describe("Security properties", () => {
    it("should use salt rounds of 10", async () => {
      const password = "password123";
      const hash = await bcryptAdapter.hash(password);

      // $2b$10$ indicates 10 salt rounds
      expect(hash).toContain("$2b$10$");
    });

    it("should not expose password in hash", async () => {
      const password = "secret-password-123";
      const hash = await bcryptAdapter.hash(password);

      expect(hash).not.toContain("secret");
      expect(hash).not.toContain("password");
    });

    it("should have consistent hash format", async () => {
      const hashes = await Promise.all([
        bcryptAdapter.hash("pass1"),
        bcryptAdapter.hash("pass2"),
        bcryptAdapter.hash("pass3"),
      ]);

      hashes.forEach(hash => {
        expect(hash).toMatch(/^\$2[ab]\$\d{2}\$/);
        expect(hash.length).toBe(60);
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle very long passwords", async () => {
      const password = "a".repeat(200);
      const hash = await bcryptAdapter.hash(password);

      expect(await bcryptAdapter.compare(password, hash)).toBe(true);
    });

    it("should handle passwords with null bytes", async () => {
      const password = "pass\x00word";
      const hash = await bcryptAdapter.hash(password);

      expect(await bcryptAdapter.compare(password, hash)).toBe(true);
    });

    it("should handle passwords with newlines", async () => {
      const password = "pass\nword\n123";
      const hash = await bcryptAdapter.hash(password);

      expect(await bcryptAdapter.compare(password, hash)).toBe(true);
    });

    it("should handle tabs in passwords", async () => {
      const password = "pass\tword\t123";
      const hash = await bcryptAdapter.hash(password);

      expect(await bcryptAdapter.compare(password, hash)).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should hash password in reasonable time", async () => {
      const start = Date.now();
      await bcryptAdapter.hash("password123");
      const duration = Date.now() - start;

      // Should complete within 1 second (10 salt rounds)
      expect(duration).toBeLessThan(1000);
    });

    it("should compare password in reasonable time", async () => {
      const password = "password123";
      const hash = await bcryptAdapter.hash(password);

      const start = Date.now();
      await bcryptAdapter.compare(password, hash);
      const duration = Date.now() - start;

      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("Common password patterns", () => {
    it("should hash numeric passwords", async () => {
      const password = "12345678";
      const hash = await bcryptAdapter.hash(password);

      expect(await bcryptAdapter.compare(password, hash)).toBe(true);
    });

    it("should hash alphanumeric passwords", async () => {
      const password = "abc123XYZ";
      const hash = await bcryptAdapter.hash(password);

      expect(await bcryptAdapter.compare(password, hash)).toBe(true);
    });

    it("should hash passwords with numbers only", async () => {
      const password = "123456";
      const hash = await bcryptAdapter.hash(password);

      expect(await bcryptAdapter.compare(password, hash)).toBe(true);
    });
  });
});

import { describe, it, expect } from "vitest";
import { generateRandomToken, hashToken } from "../jwt.service";

describe("JWT Service Utilities", () => {
  describe("generateRandomToken", () => {
    it("should generate a random token", () => {
      const token = generateRandomToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should generate tokens with consistent length", () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();

      expect(token1.length).toBe(64); // 32 bytes = 64 hex characters
      expect(token2.length).toBe(64);
    });

    it("should generate unique tokens", () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();

      expect(token1).not.toBe(token2);
    });

    it("should generate valid hex strings", () => {
      const token = generateRandomToken();

      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it("should generate different tokens on multiple calls", () => {
      const tokens = new Set();

      for (let i = 0; i < 100; i++) {
        tokens.add(generateRandomToken());
      }

      expect(tokens.size).toBe(100);
    });
  });

  describe("hashToken", () => {
    it("should hash a token", () => {
      const token = "test-token";
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("should generate consistent hashes for same input", () => {
      const token = "test-token";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different inputs", () => {
      const hash1 = hashToken("token1");
      const hash2 = hashToken("token2");

      expect(hash1).not.toBe(hash2);
    });

    it("should produce SHA-256 hash length", () => {
      const hash = hashToken("test");

      expect(hash.length).toBe(64); // SHA-256 produces 256 bits = 64 hex characters
    });

    it("should generate valid hex strings", () => {
      const hash = hashToken("test-token");

      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("should handle empty string", () => {
      const hash = hashToken("");

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it("should handle special characters", () => {
      const token = "test-@#$%^&*()_+{}|:<>?[]\\;'\",./";
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it("should handle very long tokens", () => {
      const token = "a".repeat(10000);
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it("should handle unicode characters", () => {
      const token = "токен-с-кириллицей-🔑";
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });

  describe("Token hash properties", () => {
    it("should be deterministic", () => {
      const token = "deterministic-token";

      expect(hashToken(token)).toBe(hashToken(token));
      expect(hashToken(token)).toBe(hashToken(token));
      expect(hashToken(token)).toBe(hashToken(token));
    });

    it("should produce different hash than original token", () => {
      const token = generateRandomToken();
      const hash = hashToken(token);

      expect(hash).not.toBe(token);
    });

    it("should handle random tokens", () => {
      const token = generateRandomToken();
      const hash = hashToken(token);

      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("Edge cases", () => {
    it("should handle null-like input", () => {
      const hash1 = hashToken("");
      const hash2 = hashToken("null");
      const hash3 = hashToken("undefined");

      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash3).toBeDefined();

      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
    });

    it("should handle whitespace", () => {
      const hash1 = hashToken(" ");
      const hash2 = hashToken("  ");
      const hash3 = hashToken("\t");
      const hash4 = hashToken("\n");

      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash3).toBeDefined();
      expect(hash4).toBeDefined();

      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
      expect(hash3).not.toBe(hash4);
    });
  });

  describe("Security properties", () => {
    it("should not reveal original token", () => {
      const tokens = ["password", "secret", "admin"];
      const hashes = tokens.map(hashToken);

      hashes.forEach(hash => {
        expect(hash).not.toContain("password");
        expect(hash).not.toContain("secret");
        expect(hash).not.toContain("admin");
      });
    });

    it("should have avalanche effect - small input change causes big hash change", () => {
      const token1 = "test-token-1";
      const token2 = "test-token-2";

      const hash1 = hashToken(token1);
      const hash2 = hashToken(token2);

      // Count different characters
      let differences = 0;
      for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) {
          differences++;
        }
      }

      // Expect at least 50% of characters to be different (avalanche effect)
      expect(differences).toBeGreaterThan(32);
    });
  });
});

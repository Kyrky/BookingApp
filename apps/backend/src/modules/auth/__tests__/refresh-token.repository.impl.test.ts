import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RefreshTokenRepositoryImpl } from "../infrastructure/refresh-token.repository.impl";
import type { PrismaClient } from "@repo/database";
import { RefreshToken, CreateRefreshTokenData } from "@repo/shared";

describe("RefreshTokenRepositoryImpl", () => {
  let refreshTokenRepository: RefreshTokenRepositoryImpl;
  let mockPrisma: PrismaClient;

  beforeEach(() => {
    mockPrisma = {
      refreshToken: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    } as unknown as PrismaClient;

    refreshTokenRepository = new RefreshTokenRepositoryImpl(mockPrisma);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findByToken", () => {
    it("should return refresh token when found", async () => {
      const prismaToken = {
        id: "token-123",
        token: "hashed-token-value",
        userId: "user-123",
        expiresAt: new Date("2025-01-15"),
        createdAt: new Date("2025-01-01"),
      };

      vi.mocked(mockPrisma.refreshToken.findUnique).mockResolvedValue(prismaToken);

      const result = await refreshTokenRepository.findByToken("hashed-token-value");

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result?.id).toBe("token-123");
      expect(result?.token).toBe("hashed-token-value");
      expect(result?.userId).toBe("user-123");
      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: "hashed-token-value" },
      });
    });

    it("should return null when token not found", async () => {
      vi.mocked(mockPrisma.refreshToken.findUnique).mockResolvedValue(null);

      const result = await refreshTokenRepository.findByToken("non-existent-token");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      vi.mocked(mockPrisma.refreshToken.findUnique).mockRejectedValue(new Error("Database error"));

      await expect(refreshTokenRepository.findByToken("token")).rejects.toThrow("Database error");
    });

    it("should handle expired tokens", async () => {
      const expiredToken = {
        id: "token-123",
        token: "expired-token",
        userId: "user-123",
        expiresAt: new Date("2024-01-01"),
        createdAt: new Date("2023-12-25"),
      };

      vi.mocked(mockPrisma.refreshToken.findUnique).mockResolvedValue(expiredToken);

      const result = await refreshTokenRepository.findByToken("expired-token");

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result?.expiresAt).toEqual(expiredToken.expiresAt);
    });
  });

  describe("create", () => {
    it("should create and return new refresh token", async () => {
      const tokenData: CreateRefreshTokenData = {
        token: "new-hashed-token",
        userId: "user-123",
        expiresAt: new Date("2025-01-15"),
      };

      const createdToken = {
        id: "token-123",
        ...tokenData,
        createdAt: new Date("2025-01-01"),
      };

      vi.mocked(mockPrisma.refreshToken.create).mockResolvedValue(createdToken);

      const result = await refreshTokenRepository.create(tokenData);

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result.id).toBe("token-123");
      expect(result.token).toBe("new-hashed-token");
      expect(result.userId).toBe("user-123");
      expect(result.expiresAt).toEqual(tokenData.expiresAt);
      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
        data: tokenData,
      });
    });

    it("should set correct expiration date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const tokenData: CreateRefreshTokenData = {
        token: "hashed-token",
        userId: "user-123",
        expiresAt: futureDate,
      };

      const createdToken = {
        id: "token-123",
        ...tokenData,
        createdAt: new Date(),
      };

      vi.mocked(mockPrisma.refreshToken.create).mockResolvedValue(createdToken);

      const result = await refreshTokenRepository.create(tokenData);

      expect(result.expiresAt).toEqual(futureDate);
    });

    it("should handle database errors on create", async () => {
      const tokenData: CreateRefreshTokenData = {
        token: "hashed-token",
        userId: "user-123",
        expiresAt: new Date(),
      };

      vi.mocked(mockPrisma.refreshToken.create).mockRejectedValue(new Error("Insert failed"));

      await expect(refreshTokenRepository.create(tokenData)).rejects.toThrow("Insert failed");
    });
  });

  describe("delete", () => {
    it("should delete refresh token successfully", async () => {
      vi.mocked(mockPrisma.refreshToken.delete).mockResolvedValue({
        id: "token-123",
        token: "deleted-token",
        userId: "user-123",
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      await expect(refreshTokenRepository.delete("deleted-token")).resolves.not.toThrow();
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: "deleted-token" },
      });
    });

    it("should handle delete of non-existent token", async () => {
      vi.mocked(mockPrisma.refreshToken.delete).mockRejectedValue(new Error("Record not found"));

      await expect(refreshTokenRepository.delete("non-existent")).rejects.toThrow();
    });

    it("should handle database errors on delete", async () => {
      vi.mocked(mockPrisma.refreshToken.delete).mockRejectedValue(new Error("Connection lost"));

      await expect(refreshTokenRepository.delete("token")).rejects.toThrow("Connection lost");
    });
  });

  describe("deleteByUserId", () => {
    it("should delete all refresh tokens for user", async () => {
      const deleteResult = { count: 3 };
      vi.mocked(mockPrisma.refreshToken.deleteMany).mockResolvedValue(deleteResult);

      await expect(refreshTokenRepository.deleteByUserId("user-123")).resolves.not.toThrow();
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
      });
    });

    it("should handle case when user has no tokens", async () => {
      const deleteResult = { count: 0 };
      vi.mocked(mockPrisma.refreshToken.deleteMany).mockResolvedValue(deleteResult);

      await expect(refreshTokenRepository.deleteByUserId("user-123")).resolves.not.toThrow();
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
      });
    });

    it("should handle database errors on deleteMany", async () => {
      vi.mocked(mockPrisma.refreshToken.deleteMany).mockRejectedValue(
        new Error("Delete many failed")
      );

      await expect(refreshTokenRepository.deleteByUserId("user-123")).rejects.toThrow(
        "Delete many failed"
      );
    });
  });

  describe("toDomain mapping", () => {
    it("should correctly map Prisma model to RefreshToken entity", async () => {
      const prismaToken = {
        id: "token-123",
        token: "hashed-token",
        userId: "user-456",
        expiresAt: new Date("2025-12-31"),
        createdAt: new Date("2025-01-01"),
      };

      vi.mocked(mockPrisma.refreshToken.findUnique).mockResolvedValue(prismaToken);

      const result = await refreshTokenRepository.findByToken("hashed-token");

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result?.id).toBe(prismaToken.id);
      expect(result?.token).toBe(prismaToken.token);
      expect(result?.userId).toBe(prismaToken.userId);
      expect(result?.expiresAt).toEqual(prismaToken.expiresAt);
      expect(result?.createdAt).toEqual(prismaToken.createdAt);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty token string", async () => {
      vi.mocked(mockPrisma.refreshToken.findUnique).mockResolvedValue(null);

      const result = await refreshTokenRepository.findByToken("");

      expect(result).toBeNull();
    });

    it("should handle very long token strings", async () => {
      const longToken = "a".repeat(1000);
      const prismaToken = {
        id: "token-123",
        token: longToken,
        userId: "user-123",
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      vi.mocked(mockPrisma.refreshToken.findUnique).mockResolvedValue(prismaToken);

      const result = await refreshTokenRepository.findByToken(longToken);

      expect(result?.token).toBe(longToken);
    });
  });
});

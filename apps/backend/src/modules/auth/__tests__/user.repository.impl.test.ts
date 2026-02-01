import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UserRepositoryImpl } from "../infrastructure/user.repository.impl";
import { PrismaClient } from "@prisma/client";
import { User, UserRole, CreateUserData } from "@repo/shared";

describe("UserRepositoryImpl", () => {
  let userRepository: UserRepositoryImpl;
  let mockPrisma: PrismaClient;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    } as unknown as PrismaClient;

    userRepository = new UserRepositoryImpl(mockPrisma);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should return user when found by email", async () => {
      const prismaUser = {
        id: "user-123",
        email: "test@example.com",
        password: "$2b$10$hashed",
        name: "Test User",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(prismaUser);

      const result = await userRepository.findByEmail("test@example.com");

      expect(result).toEqual(prismaUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should return null when user not found", async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      const result = await userRepository.findByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(new Error("Database error"));

      await expect(userRepository.findByEmail("test@example.com")).rejects.toThrow("Database error");
    });
  });

  describe("findById", () => {
    it("should return user when found by id", async () => {
      const prismaUser = {
        id: "user-123",
        email: "test@example.com",
        password: "$2b$10$hashed",
        name: "Test User",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(prismaUser);

      const result = await userRepository.findById("user-123");

      expect(result).toEqual(prismaUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
    });

    it("should return null when user not found by id", async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      const result = await userRepository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return new user", async () => {
      const userData: CreateUserData = {
        email: "new@example.com",
        password: "$2b$10$hashed",
        name: "New User",
        role: UserRole.USER,
      };

      const createdUser = {
        id: "user-123",
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPrisma.user.create).mockResolvedValue(createdUser);

      const result = await userRepository.create(userData);

      expect(result).toEqual(createdUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
    });

    it("should handle duplicate email error", async () => {
      const userData: CreateUserData = {
        email: "existing@example.com",
        password: "$2b$10$hashed",
        name: "User",
        role: UserRole.USER,
      };

      const prismaError = new Error("Unique constraint failed");
      (prismaError as any).code = "P2002";

      vi.mocked(mockPrisma.user.create).mockRejectedValue(prismaError);

      await expect(userRepository.create(userData)).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update user and return updated data", async () => {
      const updateData = { name: "Updated Name" };
      const updatedUser = {
        id: "user-123",
        email: "test@example.com",
        password: "$2b$10$hashed",
        name: "Updated Name",
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPrisma.user.update).mockResolvedValue(updatedUser);

      const result = await userRepository.update("user-123", updateData);

      expect(result).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: updateData,
      });
    });

    it("should handle update of non-existent user", async () => {
      vi.mocked(mockPrisma.user.update).mockRejectedValue(new Error("Record not found"));

      await expect(userRepository.update("non-existent", { name: "Test" })).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      vi.mocked(mockPrisma.user.delete).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        password: "$2b$10$hashed",
        name: "Deleted User",
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(userRepository.delete("user-123")).resolves.not.toThrow();
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
    });

    it("should handle delete of non-existent user", async () => {
      vi.mocked(mockPrisma.user.delete).mockRejectedValue(new Error("Record not found"));

      await expect(userRepository.delete("non-existent")).rejects.toThrow();
    });
  });
});

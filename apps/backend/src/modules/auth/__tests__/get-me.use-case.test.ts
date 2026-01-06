import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetMeUseCase } from "../application/get-me.use-case";
import { UserRepository, User } from "@repo/shared";
import { UserFactory } from "./factories/user.factory";

describe("GetMeUseCase", () => {
  let getMeUseCase: GetMeUseCase;
  let mockUserRepository: UserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as UserRepository;

    getMeUseCase = new GetMeUseCase(mockUserRepository);
  });

  describe("execute", () => {
    it("should return user when found by ID", async () => {
      const expectedUser: User = UserFactory.create({
        id: "user-123",
        email: "test@example.com",
      });

      vi.mocked(mockUserRepository.findById).mockResolvedValue(expectedUser);

      const result = await getMeUseCase.execute("user-123");

      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
    });

    it("should throw error when user not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      await expect(getMeUseCase.execute("non-existent-id")).rejects.toThrow("User not found");
      expect(mockUserRepository.findById).toHaveBeenCalledWith("non-existent-id");
    });

    it("should pass userId exactly as provided", async () => {
      const userId = "exact-user-id-123";
      const expectedUser: User = UserFactory.create({ id: userId });

      vi.mocked(mockUserRepository.findById).mockResolvedValue(expectedUser);

      await getMeUseCase.execute(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors", async () => {
      vi.mocked(mockUserRepository.findById).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(getMeUseCase.execute("user-123")).rejects.toThrow("Database connection failed");
    });

    describe("User data integrity", () => {
      it("should return complete user object", async () => {
        const expectedUser: User = UserFactory.create({
          id: "user-123",
          email: "user@example.com",
          name: "John Doe",
          role: "USER",
        });

        vi.mocked(mockUserRepository.findById).mockResolvedValue(expectedUser);

        const result = await getMeUseCase.execute("user-123");

        expect(result.id).toBe("user-123");
        expect(result.email).toBe("user@example.com");
        expect(result.name).toBe("John Doe");
        expect(result.role).toBe("USER");
        expect(result.password).toBeDefined();
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
      });

      it("should return admin user with correct role", async () => {
        const adminUser: User = UserFactory.createAdmin({
          id: "admin-123",
        });

        vi.mocked(mockUserRepository.findById).mockResolvedValue(adminUser);

        const result = await getMeUseCase.execute("admin-123");

        expect(result.role).toBe("ADMIN");
      });
    });

    describe("Edge cases", () => {
      it("should handle empty string userId", async () => {
        vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

        await expect(getMeUseCase.execute("")).rejects.toThrow("User not found");
        expect(mockUserRepository.findById).toHaveBeenCalledWith("");
      });

      it("should handle special characters in userId", async () => {
        const specialId = "user-123-abc-!@#$%";
        const expectedUser: User = UserFactory.create({ id: specialId });

        vi.mocked(mockUserRepository.findById).mockResolvedValue(expectedUser);

        const result = await getMeUseCase.execute(specialId);

        expect(result.id).toBe(specialId);
      });

      it("should handle very long userId", async () => {
        const longId = "a".repeat(1000);
        const expectedUser: User = UserFactory.create({ id: longId });

        vi.mocked(mockUserRepository.findById).mockResolvedValue(expectedUser);

        const result = await getMeUseCase.execute(longId);

        expect(result.id).toBe(longId);
      });
    });

    describe("Security considerations", () => {
      it("should return user with password hash (for internal use)", async () => {
        const userWithPassword: User = UserFactory.create({
          password: "$2b$10$hashedpasswordvalue",
        });

        vi.mocked(mockUserRepository.findById).mockResolvedValue(userWithPassword);

        const result = await getMeUseCase.execute("user-123");

        expect(result.password).toBe("$2b$10$hashedpasswordvalue");
      });

      it("should not modify user data", async () => {
        const originalUser: User = UserFactory.create();
        vi.mocked(mockUserRepository.findById).mockResolvedValue(originalUser);

        const result = await getMeUseCase.execute("user-123");

        expect(result).toEqual(originalUser);
      });
    });

    describe("Timing and performance", () => {
      it("should resolve quickly for existing user", async () => {
        const expectedUser: User = UserFactory.create();
        vi.mocked(mockUserRepository.findById).mockResolvedValue(expectedUser);

        const start = Date.now();
        await getMeUseCase.execute("user-123");
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
      });
    });
  });

  describe("Error messages", () => {
    it("should use exact error message for not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      await expect(getMeUseCase.execute("any-id")).rejects.toThrow("User not found");
    });

    it("should propagate repository error messages", async () => {
      vi.mocked(mockUserRepository.findById).mockRejectedValue(
        new Error("Connection timeout")
      );

      await expect(getMeUseCase.execute("user-123")).rejects.toThrow("Connection timeout");
    });
  });

  describe("Multiple calls", () => {
    it("should handle multiple sequential calls", async () => {
      const user1: User = UserFactory.create({ id: "user-1" });
      const user2: User = UserFactory.create({ id: "user-2" });

      vi.mocked(mockUserRepository.findById)
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      const result1 = await getMeUseCase.execute("user-1");
      const result2 = await getMeUseCase.execute("user-2");

      expect(result1.id).toBe("user-1");
      expect(result2.id).toBe("user-2");
    });

    it("should handle concurrent calls independently", async () => {
      const user1: User = UserFactory.create({ id: "user-1" });
      const user2: User = UserFactory.create({ id: "user-2" });

      vi.mocked(mockUserRepository.findById)
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      const [result1, result2] = await Promise.all([
        getMeUseCase.execute("user-1"),
        getMeUseCase.execute("user-2"),
      ]);

      expect(result1.id).toBe("user-1");
      expect(result2.id).toBe("user-2");
    });
  });
});

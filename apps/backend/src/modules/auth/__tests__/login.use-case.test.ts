import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginUseCase } from "../application/login.use-case";
import { UserRepository, BcryptAdapter, User } from "@repo/shared";
import { LoginDto } from "../interfaces/auth.dto";
import { UserFactory } from "./factories/user.factory";

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: UserRepository;
  let mockBcryptAdapter: BcryptAdapter;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as UserRepository;

    mockBcryptAdapter = {
      hash: vi.fn(),
      compare: vi.fn(),
    } as unknown as BcryptAdapter;

    loginUseCase = new LoginUseCase(mockUserRepository, mockBcryptAdapter);
  });

  describe("execute", () => {
    const validDto: LoginDto = {
      email: "test@example.com",
      password: "CorrectPassword123!",
    };

    it("should successfully login with valid credentials", async () => {
      const existingUser: User = UserFactory.create({
        email: validDto.email,
        password: "$2b$10$hashedpassword",
      });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
      vi.mocked(mockBcryptAdapter.compare).mockResolvedValue(true);

      const result = await loginUseCase.execute(validDto);

      expect(result.user).toEqual(existingUser);
      expect(result.token).toBe("");
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validDto.email);
      expect(mockBcryptAdapter.compare).toHaveBeenCalledWith(
        validDto.password,
        existingUser.password
      );
    });

    it("should throw error if user does not exist", async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      await expect(loginUseCase.execute(validDto)).rejects.toThrow("Invalid credentials");
      expect(mockBcryptAdapter.compare).not.toHaveBeenCalled();
    });

    it("should throw error if password is incorrect", async () => {
      const existingUser: User = UserFactory.create({
        email: validDto.email,
        password: "$2b$10$hashedpassword",
      });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
      vi.mocked(mockBcryptAdapter.compare).mockResolvedValue(false);

      await expect(loginUseCase.execute(validDto)).rejects.toThrow("Invalid credentials");
    });

    it("should use exact error message for invalid credentials", async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      await expect(loginUseCase.execute(validDto)).rejects.toThrow("Invalid credentials");
    });

    it("should handle repository errors gracefully", async () => {
      vi.mocked(mockUserRepository.findByEmail).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(loginUseCase.execute(validDto)).rejects.toThrow("Database connection failed");
    });

    it("should handle bcrypt compare errors", async () => {
      const existingUser: User = UserFactory.create({
        email: validDto.email,
      });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
      vi.mocked(mockBcryptAdapter.compare).mockRejectedValue(new Error("Bcrypt error"));

      await expect(loginUseCase.execute(validDto)).rejects.toThrow("Bcrypt error");
    });

    describe("Password comparison", () => {
      it("should compare password with stored hash", async () => {
        const storedHash = "$2b$10$abcdefghijklmnopqrstuvwxyz123456";
        const existingUser: User = UserFactory.create({
          email: validDto.email,
          password: storedHash,
        });

        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
        vi.mocked(mockBcryptAdapter.compare).mockResolvedValue(true);
        vi.mocked(mockUserRepository.findById).mockResolvedValue(existingUser);

        await loginUseCase.execute(validDto);

        const compareCall = vi.mocked(mockBcryptAdapter.compare).mock.calls[0];
        expect(compareCall![0]).toBe(validDto.password);
        expect(compareCall![1]).toBe(storedHash);
      });

      it("should return user when comparison succeeds", async () => {
        const existingUser: User = UserFactory.create({ email: validDto.email });
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
        vi.mocked(mockBcryptAdapter.compare).mockResolvedValue(true);

        const result = await loginUseCase.execute(validDto);

        expect(result.user).toBe(existingUser);
      });
    });

    describe("Case sensitivity", () => {
      it("should find user with case-sensitive email", async () => {
        const upperCaseEmailDto: LoginDto = {
          email: "Test@Example.com",
          password: "password",
        };

        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

        await expect(loginUseCase.execute(upperCaseEmailDto)).rejects.toThrow();
        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("Test@Example.com");
      });
    });

    describe("Edge cases", () => {
      it("should handle empty password", async () => {
        const existingUser: User = UserFactory.create();
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
        vi.mocked(mockBcryptAdapter.compare).mockResolvedValue(false);

        await expect(loginUseCase.execute({
          email: "test@example.com",
          password: "",
        })).rejects.toThrow("Invalid credentials");
      });

      it("should handle whitespace in password", async () => {
        const existingUser: User = UserFactory.create();
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
        vi.mocked(mockBcryptAdapter.compare).mockResolvedValue(false);

        await expect(loginUseCase.execute({
          email: "test@example.com",
          password: " password ",
        })).rejects.toThrow("Invalid credentials");

        expect(mockBcryptAdapter.compare).toHaveBeenCalledWith(" password ", existingUser.password);
      });

      it("should handle special characters in password", async () => {
        const specialPassword = "P@ssw0rd!#$%&*()";
        const existingUser: User = UserFactory.create();
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
        vi.mocked(mockBcryptAdapter.compare).mockResolvedValue(true);

        const result = await loginUseCase.execute({
          email: "test@example.com",
          password: specialPassword,
        });

        expect(result.user).toBe(existingUser);
        expect(mockBcryptAdapter.compare).toHaveBeenCalledWith(specialPassword, existingUser.password);
      });
    });

    describe("Admin login", () => {
      it("should allow admin users to login", async () => {
        const adminUser: User = UserFactory.createAdmin({
          email: validDto.email,
        });

        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(adminUser);
        vi.mocked(mockBcryptAdapter.compare).mockResolvedValue(true);

        const result = await loginUseCase.execute(validDto);

        expect(result.user.role).toBe("ADMIN");
        expect(result.user).toBe(adminUser);
      });
    });
  });

  describe("Security scenarios", () => {
    it("should not leak user existence information", async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      await expect(loginUseCase.execute({
        email: "nonexistent@example.com",
        password: "password",
      })).rejects.toThrow("Invalid credentials");

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(UserFactory.create());
      vi.mocked(mockBcryptAdapter.compare).mockResolvedValue(false);

      await expect(loginUseCase.execute({
        email: "exists@example.com",
        password: "wrongpassword",
      })).rejects.toThrow("Invalid credentials");
    });

    it("should not call compare if user not found", async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      await expect(loginUseCase.execute({
        email: "test@example.com",
        password: "password",
      })).rejects.toThrow();

      expect(mockBcryptAdapter.compare).not.toHaveBeenCalled();
    });
  });
});

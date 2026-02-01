import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterUseCase } from "../application/register.use-case";
import { UserRepository, BcryptAdapter, User } from "@repo/shared";
import { RegisterDto } from "../interfaces/auth.dto";
import { UserFactory } from "./factories/user.factory";

describe("RegisterUseCase", () => {
  let registerUseCase: RegisterUseCase;
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

    registerUseCase = new RegisterUseCase(mockUserRepository, mockBcryptAdapter);
  });

  describe("execute", () => {
    const validDto: RegisterDto = {
      email: "newuser@example.com",
      password: "SecurePassword123!",
      name: "John Doe",
    };

    it("should successfully register a new user", async () => {
      const expectedUser: User = UserFactory.create({
        email: validDto.email,
        name: validDto.name,
      });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockBcryptAdapter.hash).mockResolvedValue("$2b$10$hashedpassword");
      vi.mocked(mockUserRepository.create).mockResolvedValue(expectedUser);

      const result = await registerUseCase.execute(validDto);

      expect(result.user).toEqual(expectedUser);
      expect(result.token).toBe("");
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validDto.email);
      expect(mockBcryptAdapter.hash).toHaveBeenCalledWith(validDto.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: validDto.email,
        password: "$2b$10$hashedpassword",
        name: validDto.name,
        role: "USER",
      });
    });

    it("should throw error if user already exists", async () => {
      const existingUser: User = UserFactory.create({ email: validDto.email });
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      await expect(registerUseCase.execute(validDto)).rejects.toThrow("User already exists");
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should hash password before saving", async () => {
      const expectedUser: User = UserFactory.create();
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockBcryptAdapter.hash).mockResolvedValue("$2b$10$hashedpassword");
      vi.mocked(mockUserRepository.create).mockResolvedValue(expectedUser);

      await registerUseCase.execute(validDto);

      expect(mockBcryptAdapter.hash).toHaveBeenCalledWith(validDto.password);
      expect(mockBcryptAdapter.hash).toHaveBeenCalledTimes(1);
    });

    it("should assign USER role by default", async () => {
      const expectedUser: User = UserFactory.create();
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockBcryptAdapter.hash).mockResolvedValue("$2b$10$hashedpassword");
      vi.mocked(mockUserRepository.create).mockResolvedValue(expectedUser);

      await registerUseCase.execute(validDto);

      const createCall = vi.mocked(mockUserRepository.create).mock.calls[0];
      expect(createCall![0].role).toBe("USER");
    });

    it("should not call create if hashing fails", async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockBcryptAdapter.hash).mockRejectedValue(new Error("Hashing failed"));

      await expect(registerUseCase.execute(validDto)).rejects.toThrow("Hashing failed");
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockBcryptAdapter.hash).mockResolvedValue("$2b$10$hashedpassword");
      vi.mocked(mockUserRepository.create).mockRejectedValue(new Error("Database error"));

      await expect(registerUseCase.execute(validDto)).rejects.toThrow("Database error");
    });

    describe("Email validation", () => {
      it("should accept valid email formats", async () => {
        const validEmails = [
          "user@example.com",
          "test.user@domain.co.uk",
          "first+last@example.com",
        ];

        for (const email of validEmails) {
          vi.clearAllMocks();
          const expectedUser: User = UserFactory.create({ email });
          vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
          vi.mocked(mockBcryptAdapter.hash).mockResolvedValue("$2b$10$hashedpassword");
          vi.mocked(mockUserRepository.create).mockResolvedValue(expectedUser);

          const result = await registerUseCase.execute({ ...validDto, email });

          expect(result.user.email).toBe(email);
        }
      });
    });

    describe("Password handling", () => {
      it("should hash different passwords to different hashes", async () => {
        const expectedUser: User = UserFactory.create();
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
        vi.mocked(mockBcryptAdapter.hash)
          .mockResolvedValueOnce("$2b$10$hash1")
          .mockResolvedValueOnce("$2b$10$hash2");
        vi.mocked(mockUserRepository.create).mockResolvedValue(expectedUser);

        await registerUseCase.execute(validDto);
        await registerUseCase.execute({ ...validDto, email: "another@example.com" });

        expect(mockBcryptAdapter.hash).toHaveBeenCalledTimes(2);
      });

      it("should pass plain password to bcrypt adapter", async () => {
        const plainPassword = "MyPlainPassword123!";
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
        vi.mocked(mockBcryptAdapter.hash).mockResolvedValue("$2b$10$hashed");
        vi.mocked(mockUserRepository.create).mockResolvedValue(UserFactory.create());

        await registerUseCase.execute({ ...validDto, password: plainPassword });

        expect(mockBcryptAdapter.hash).toHaveBeenCalledWith(plainPassword);
      });
    });
  });

  describe("Error scenarios", () => {
    it("should handle findByEmail repository error", async () => {
      vi.mocked(mockUserRepository.findByEmail).mockRejectedValue(new Error("Connection failed"));

      await expect(registerUseCase.execute({
        email: "test@example.com",
        password: "password",
        name: "Test",
      })).rejects.toThrow("Connection failed");
    });

    it("should not call bcrypt if user exists", async () => {
      const existingUser: User = UserFactory.create();
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      await expect(registerUseCase.execute({
        email: "test@example.com",
        password: "password",
        name: "Test",
      })).rejects.toThrow();

      expect(mockBcryptAdapter.hash).not.toHaveBeenCalled();
    });
  });
});

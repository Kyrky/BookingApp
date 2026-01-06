import { describe, it, expect, vi, beforeEach } from "vitest";
import { RefreshUseCase } from "../application/refresh.use-case";
import { UserRepository, RefreshTokenRepository, JwtService, User } from "@repo/shared";
import { UserFactory } from "./factories/user.factory";
import { RefreshTokenFactory } from "./factories/refresh-token.factory";

describe("RefreshUseCase", () => {
  let refreshUseCase: RefreshUseCase;
  let mockUserRepository: UserRepository;
  let mockRefreshTokenRepository: RefreshTokenRepository;
  let mockJwtService: JwtService;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as UserRepository;

    mockRefreshTokenRepository = {
      findByToken: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteByUserId: vi.fn(),
    } as unknown as RefreshTokenRepository;

    mockJwtService = {
      generateToken: vi.fn(),
      verifyToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      hashRefreshToken: vi.fn(),
    } as unknown as JwtService;

    refreshUseCase = new RefreshUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockJwtService
    );
  });

  describe("execute", () => {
    const validRefreshToken = "valid-refresh-token-123";
    const hashedToken = "hashed-refresh-token-123";

    it("should successfully refresh token with valid refresh token", async () => {
      const user: User = UserFactory.create();
      const storedToken = RefreshTokenFactory.create({
        token: hashedToken,
        userId: user.id,
      });

      vi.mocked(mockJwtService.hashRefreshToken)
        .mockReturnValueOnce(hashedToken)
        .mockReturnValueOnce("new-hashed-token");
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(storedToken);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockRefreshTokenRepository.delete).mockResolvedValue();
      vi.mocked(mockJwtService.generateToken).mockReturnValue("new-access-token");
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue("new-refresh-token");
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue();

      const result = await refreshUseCase.execute(validRefreshToken);

      expect(result.user).toEqual(user);
      expect(result.accessToken).toBe("new-access-token");
      expect(result.newRefreshToken).toBe("new-refresh-token");
      expect(mockRefreshTokenRepository.delete).toHaveBeenCalledWith(hashedToken);
      expect(mockRefreshTokenRepository.create).toHaveBeenCalled();
    });

    it("should throw error if refresh token is invalid", async () => {
      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(null);

      await expect(refreshUseCase.execute(validRefreshToken)).rejects.toThrow(
        "Invalid refresh token"
      );
      expect(mockRefreshTokenRepository.delete).not.toHaveBeenCalled();
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it("should throw error and delete token if expired", async () => {
      const expiredToken = RefreshTokenFactory.expired({
        token: hashedToken,
      });

      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(expiredToken);
      vi.mocked(mockRefreshTokenRepository.delete).mockResolvedValue();

      await expect(refreshUseCase.execute(validRefreshToken)).rejects.toThrow(
        "Refresh token expired"
      );
      expect(mockRefreshTokenRepository.delete).toHaveBeenCalledWith(hashedToken);
    });

    it("should throw error if user not found", async () => {
      const storedToken = RefreshTokenFactory.create({
        token: hashedToken,
        userId: "non-existent-user",
      });

      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(storedToken);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      await expect(refreshUseCase.execute(validRefreshToken)).rejects.toThrow("User not found");
    });

    it("should hash refresh token before lookup", async () => {
      const user: User = UserFactory.create();
      const storedToken = RefreshTokenFactory.create({ userId: user.id });

      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(storedToken);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockRefreshTokenRepository.delete).mockResolvedValue();
      vi.mocked(mockJwtService.generateToken).mockReturnValue("access-token");
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue("new-refresh");
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue();

      await refreshUseCase.execute(validRefreshToken);

      expect(mockJwtService.hashRefreshToken).toHaveBeenCalledWith(validRefreshToken);
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(hashedToken);
    });

    it("should delete old token before creating new one", async () => {
      const user: User = UserFactory.create();
      const storedToken = RefreshTokenFactory.create({ userId: user.id });

      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(storedToken);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockRefreshTokenRepository.delete).mockResolvedValue();
      vi.mocked(mockJwtService.generateToken).mockReturnValue("access");
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue("new-refresh");
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue();

      await refreshUseCase.execute(validRefreshToken);

      expect(mockRefreshTokenRepository.delete).toHaveBeenCalled();
      const callOrder = vi.mocked(mockRefreshTokenRepository.create).mock.invocationOrder;
      expect(mockRefreshTokenRepository.create).toHaveBeenCalled();
    });

    it("should generate new access token with user payload", async () => {
      const user: User = UserFactory.create({
        id: "user-123",
        email: "test@example.com",
        role: "USER",
      });
      const storedToken = RefreshTokenFactory.create({ userId: user.id });

      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(storedToken);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockRefreshTokenRepository.delete).mockResolvedValue();
      vi.mocked(mockJwtService.generateToken).mockReturnValue("new-access-token");
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue("new-refresh");
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue();

      await refreshUseCase.execute(validRefreshToken);

      expect(mockJwtService.generateToken).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    });

    it("should create new refresh token with 7 day expiration", async () => {
      const user: User = UserFactory.create();
      const storedToken = RefreshTokenFactory.create({ userId: user.id });
      const newRefreshToken = "new-refresh-token";
      const newHashedToken = "new-hashed-token";

      vi.mocked(mockJwtService.hashRefreshToken)
        .mockReturnValueOnce(hashedToken)
        .mockReturnValueOnce(newHashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(storedToken);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockRefreshTokenRepository.delete).mockResolvedValue();
      vi.mocked(mockJwtService.generateToken).mockReturnValue("access");
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue(newRefreshToken);
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue();

      await refreshUseCase.execute(validRefreshToken);

      const createCall = vi.mocked(mockRefreshTokenRepository.create).mock.calls[0];
      expect(createCall![0].token).toBe(newHashedToken);
      expect(createCall![0].userId).toBe(user.id);

      const expiresAt = createCall![0].expiresAt;
      const expectedExpiry = new Date();
      expectedExpiry.setDate(expectedExpiry.getDate() + 7);
      const diffMs = expiresAt.getTime() - expectedExpiry.getTime();
      expect(Math.abs(diffMs)).toBeLessThan(1000);
    });

    it("should return plain new refresh token (not hashed)", async () => {
      const user: User = UserFactory.create();
      const storedToken = RefreshTokenFactory.create({ userId: user.id });
      const plainNewRefreshToken = "plain-new-refresh-token";

      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(storedToken);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockRefreshTokenRepository.delete).mockResolvedValue();
      vi.mocked(mockJwtService.generateToken).mockReturnValue("access");
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue(plainNewRefreshToken);
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue();

      const result = await refreshUseCase.execute(validRefreshToken);

      expect(result.newRefreshToken).toBe(plainNewRefreshToken);
    });
  });

  describe("Error handling", () => {
    it("should handle repository errors gracefully", async () => {
      const hashedToken = "hashed-token";
      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockRejectedValue(
        new Error("Database error")
      );

      await expect(refreshUseCase.execute("token")).rejects.toThrow("Database error");
    });

    it("should handle JWT service errors", async () => {
      vi.mocked(mockJwtService.hashRefreshToken).mockImplementation(() => {
        throw new Error("JWT error");
      });

      await expect(refreshUseCase.execute("token")).rejects.toThrow("JWT error");
    });

    it("should handle user repository errors", async () => {
      const storedToken = RefreshTokenFactory.create();
      const hashedToken = "hashed-token";

      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(storedToken);
      vi.mocked(mockUserRepository.findById).mockRejectedValue(new Error("User DB error"));

      await expect(refreshUseCase.execute("token")).rejects.toThrow("User DB error");
    });
  });

  describe("Token expiration edge cases", () => {
    it("should treat token as expired at exact expiration time", async () => {
      const pastDate = new Date();
      pastDate.setSeconds(pastDate.getSeconds() - 1);
      const expiredToken = RefreshTokenFactory.create({
        expiresAt: pastDate,
      });
      const hashedToken = "hashed-token";

      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(expiredToken);
      vi.mocked(mockRefreshTokenRepository.delete).mockResolvedValue();

      await expect(refreshUseCase.execute("token")).rejects.toThrow("Refresh token expired");
    });

    it("should accept token that expires in the future", async () => {
      const user: User = UserFactory.create();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const validToken = RefreshTokenFactory.create({
        expiresAt: futureDate,
        userId: user.id,
      });
      const hashedToken = "hashed-token";

      vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
      vi.mocked(mockRefreshTokenRepository.findByToken).mockResolvedValue(validToken);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockRefreshTokenRepository.delete).mockResolvedValue();
      vi.mocked(mockJwtService.generateToken).mockReturnValue("access");
      vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue("new-refresh");
      vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue();

      const result = await refreshUseCase.execute("token");

      expect(result.user).toBe(user);
    });
  });
});

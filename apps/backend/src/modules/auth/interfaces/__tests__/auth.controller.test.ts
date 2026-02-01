import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthController } from "../auth.controller";
import { RegisterUseCase } from "../application/register.use-case";
import { LoginUseCase } from "../application/login.use-case";
import { RefreshUseCase } from "../application/refresh.use-case";
import { CreateRefreshTokenUseCase } from "../application/create-refresh-token.use-case";
import { GetMeUseCase } from "../application/get-me.use-case";
import { JwtService, User, UserRole } from "@repo/shared";
import { AuthenticatedRequest } from "../../../../shared/utils/logger.util";
import { Response } from "express";

// Mock logger
vi.mock("@repo/shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/shared")>();
  const createMockLogger = () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    child: vi.fn(() => createMockLogger()),
  });
  return {
    ...actual,
    logger: createMockLogger(),
  };
});

// Mock logger utility
vi.mock("../../../../shared/utils/logger.util", () => ({
  loggerWithUser: vi.fn(() => {
    const createMockLogger = () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      child: vi.fn(() => createMockLogger()),
    });
    return createMockLogger();
  }),
}));

describe("AuthController", () => {
  let controller: AuthController;
  let mockRegisterUseCase: RegisterUseCase;
  let mockLoginUseCase: LoginUseCase;
  let mockRefreshUseCase: RefreshUseCase;
  let mockCreateRefreshTokenUseCase: CreateRefreshTokenUseCase;
  let mockGetMeUseCase: GetMeUseCase;
  let mockJwtService: JwtService;
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;

  const mockUser: User = new User(
    "user-123",
    "test@example.com",
    "hashed-password",
    "Test User",
    UserRole.USER,
    new Date("2025-01-01"),
    new Date("2025-01-01")
  );

  beforeEach(() => {
    mockRegisterUseCase = {
      execute: vi.fn(),
    } as unknown as RegisterUseCase;

    mockLoginUseCase = {
      execute: vi.fn(),
    } as unknown as LoginUseCase;

    mockRefreshUseCase = {
      execute: vi.fn(),
    } as unknown as RefreshUseCase;

    mockCreateRefreshTokenUseCase = {
      execute: vi.fn(),
    } as unknown as CreateRefreshTokenUseCase;

    mockGetMeUseCase = {
      execute: vi.fn(),
    } as unknown as GetMeUseCase;

    mockJwtService = {
      generateToken: vi.fn(),
    } as unknown as JwtService;

    controller = new AuthController(
      mockRegisterUseCase,
      mockLoginUseCase,
      mockRefreshUseCase,
      mockCreateRefreshTokenUseCase,
      mockGetMeUseCase,
      mockJwtService
    );

    jsonSpy = vi.fn();
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });

    mockReq = {
      body: {},
    };

    mockRes = {
      status: statusSpy,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("register", () => {
    it("should register user successfully and return tokens", async () => {
      mockReq.body = {
        email: "new@example.com",
        password: "password123",
      };

      vi.mocked(mockRegisterUseCase.execute).mockResolvedValue({ user: mockUser });
      vi.mocked(mockJwtService.generateToken).mockReturnValue("access-token");
      vi.mocked(mockCreateRefreshTokenUseCase.execute).mockResolvedValue("refresh-token");

      await controller.register(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
      });
      expect(mockJwtService.generateToken).toHaveBeenCalledWith({
        userId: "user-123",
        email: "test@example.com",
        role: UserRole.USER,
      });
      expect(mockCreateRefreshTokenUseCase.execute).toHaveBeenCalledWith("user-123");
      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser.toJSON(),
          token: "access-token",
          refreshToken: "refresh-token",
        },
      });
    });

    it("should handle registration errors", async () => {
      mockReq.body = {
        email: "existing@example.com",
        password: "password123",
      };

      vi.mocked(mockRegisterUseCase.execute).mockRejectedValue(
        new Error("User already exists")
      );

      await controller.register(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "User already exists",
      });
    });

    it("should handle non-error errors", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };

      vi.mocked(mockRegisterUseCase.execute).mockRejectedValue("Unknown error");

      await controller.register(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Registration failed",
      });
    });
  });

  describe("login", () => {
    it("should login user successfully and return tokens", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };

      vi.mocked(mockLoginUseCase.execute).mockResolvedValue({ user: mockUser });
      vi.mocked(mockJwtService.generateToken).mockReturnValue("access-token");
      vi.mocked(mockCreateRefreshTokenUseCase.execute).mockResolvedValue("refresh-token");

      await controller.login(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockJwtService.generateToken).toHaveBeenCalledWith({
        userId: "user-123",
        email: "test@example.com",
        role: UserRole.USER,
      });
      expect(mockCreateRefreshTokenUseCase.execute).toHaveBeenCalledWith("user-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser.toJSON(),
          token: "access-token",
          refreshToken: "refresh-token",
        },
      });
    });

    it("should handle login errors", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "wrong-password",
      };

      vi.mocked(mockLoginUseCase.execute).mockRejectedValue(
        new Error("Invalid credentials")
      );

      await controller.login(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Invalid credentials",
      });
    });
  });

  describe("refresh", () => {
    it("should refresh token successfully", async () => {
      mockReq.body = {
        refreshToken: "old-refresh-token",
      };

      vi.mocked(mockRefreshUseCase.execute).mockResolvedValue({
        user: mockUser,
        accessToken: "new-access-token",
        newRefreshToken: "new-refresh-token",
      });

      await controller.refresh(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRefreshUseCase.execute).toHaveBeenCalledWith("old-refresh-token");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser.toJSON(),
          token: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      });
    });

    it("should handle refresh errors", async () => {
      mockReq.body = {
        refreshToken: "invalid-token",
      };

      vi.mocked(mockRefreshUseCase.execute).mockRejectedValue(
        new Error("Invalid refresh token")
      );

      await controller.refresh(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Invalid refresh token",
      });
    });
  });

  describe("getMe", () => {
    it("should return user info when authenticated", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        userEmail: "test@example.com",
        userRole: UserRole.USER,
      };

      vi.mocked(mockGetMeUseCase.execute).mockResolvedValue(mockUser);

      await controller.getMe(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockGetMeUseCase.execute).toHaveBeenCalledWith("user-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser.toJSON(),
        },
      });
    });

    it("should return 401 when userId is missing", async () => {
      mockReq = {
        ...mockReq,
        // No userId
      };

      await controller.getMe(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockGetMeUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Unauthorized",
      });
    });

    it("should handle getMe errors", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
      };

      vi.mocked(mockGetMeUseCase.execute).mockRejectedValue(
        new Error("User not found")
      );

      await controller.getMe(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Unauthorized",
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle empty request body in register", async () => {
      mockReq.body = {};

      vi.mocked(mockRegisterUseCase.execute).mockRejectedValue(
        new Error("Email and password are required")
      );

      await controller.register(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Email and password are required",
      });
    });

    it("should handle empty request body in login", async () => {
      mockReq.body = {};

      vi.mocked(mockLoginUseCase.execute).mockRejectedValue(
        new Error("Email and password are required")
      );

      await controller.login(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Email and password are required",
      });
    });

    it("should handle missing refreshToken in refresh request", async () => {
      mockReq.body = {};

      vi.mocked(mockRefreshUseCase.execute).mockRejectedValue(
        new Error("Refresh token is required")
      );

      await controller.refresh(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Refresh token is required",
      });
    });
  });

  describe("Response format", () => {
    it("should always include success: true in successful register", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };

      vi.mocked(mockRegisterUseCase.execute).mockResolvedValue({ user: mockUser });
      vi.mocked(mockJwtService.generateToken).mockReturnValue("token");
      vi.mocked(mockCreateRefreshTokenUseCase.execute).mockResolvedValue("refresh");

      await controller.register(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", true);
      expect(call[0]).toHaveProperty("data");
      expect(call[0].data).toHaveProperty("user");
      expect(call[0].data).toHaveProperty("token");
      expect(call[0].data).toHaveProperty("refreshToken");
    });

    it("should always include success: false in failed register", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };

      vi.mocked(mockRegisterUseCase.execute).mockRejectedValue(new Error("Error"));

      await controller.register(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", false);
      expect(call[0]).toHaveProperty("error");
    });

    it("should always include success: true in successful login", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };

      vi.mocked(mockLoginUseCase.execute).mockResolvedValue({ user: mockUser });
      vi.mocked(mockJwtService.generateToken).mockReturnValue("token");
      vi.mocked(mockCreateRefreshTokenUseCase.execute).mockResolvedValue("refresh");

      await controller.login(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", true);
    });

    it("should always include success: true in successful refresh", async () => {
      mockReq.body = {
        refreshToken: "token",
      };

      vi.mocked(mockRefreshUseCase.execute).mockResolvedValue({
        user: mockUser,
        accessToken: "access",
        newRefreshToken: "refresh",
      });

      await controller.refresh(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", true);
    });

    it("should always include success: true in successful getMe", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
      };

      vi.mocked(mockGetMeUseCase.execute).mockResolvedValue(mockUser);

      await controller.getMe(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", true);
    });
  });
});

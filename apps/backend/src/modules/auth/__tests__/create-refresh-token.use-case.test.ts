import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateRefreshTokenUseCase } from "../application/create-refresh-token.use-case";
import { RefreshTokenRepository, JwtService } from "@repo/shared";

describe("CreateRefreshTokenUseCase", () => {
    let createRefreshTokenUseCase: CreateRefreshTokenUseCase;
    let mockRefreshTokenRepository: RefreshTokenRepository;
    let mockJwtService: JwtService;

    beforeEach(() => {
        mockRefreshTokenRepository = {
            create: vi.fn(),
            findByToken: vi.fn(),
            deleteByToken: vi.fn(),
            deleteByUserId: vi.fn(),
        } as unknown as RefreshTokenRepository;

        mockJwtService = {
            generateToken: vi.fn(),
            verifyToken: vi.fn(),
            generateRefreshToken: vi.fn(),
            hashRefreshToken: vi.fn(),
        } as unknown as JwtService;

        createRefreshTokenUseCase = new CreateRefreshTokenUseCase(mockRefreshTokenRepository, mockJwtService);
    });

    describe("execute", () => {
        const userId = "user-123";
        const plainToken = "plain-refresh-token";
        const hashedToken = "hashed-refresh-token";

        it("should successfully create and return a refresh token", async () => {
            const mockRefreshToken = {
                id: "token-id",
                token: hashedToken,
                userId: userId,
                expiresAt: expect.any(Date),
                createdAt: expect.any(Date),
            };
            vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue(plainToken);
            vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
            vi.mocked(mockRefreshTokenRepository.create).mockResolvedValue(mockRefreshToken as any);

            const result = await createRefreshTokenUseCase.execute(userId);

            expect(result).toBe(plainToken);
            expect(mockJwtService.generateRefreshToken).toHaveBeenCalled();
            expect(mockJwtService.hashRefreshToken).toHaveBeenCalledWith(plainToken);
            expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    token: hashedToken,
                    userId: userId,
                    expiresAt: expect.any(Date),
                })
            );
        });

        it("should propagate repository errors", async () => {
            vi.mocked(mockJwtService.generateRefreshToken).mockReturnValue(plainToken);
            vi.mocked(mockJwtService.hashRefreshToken).mockReturnValue(hashedToken);
            vi.mocked(mockRefreshTokenRepository.create).mockRejectedValue(new Error("Database error"));

            await expect(createRefreshTokenUseCase.execute(userId)).rejects.toThrow("Database error");
        });

        it("should propagate JWT service errors", async () => {
            vi.mocked(mockJwtService.generateRefreshToken).mockImplementation(() => {
                throw new Error("JWT error");
            });

            await expect(createRefreshTokenUseCase.execute(userId)).rejects.toThrow("JWT error");
        });
    });
});

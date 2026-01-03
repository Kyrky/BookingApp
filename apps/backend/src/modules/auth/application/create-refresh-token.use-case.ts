import { RefreshTokenRepository, JwtService, logger } from "@repo/shared";

const authLogger = logger.child({ context: "AUTH" });

export class CreateRefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(userId: string): Promise<string> {
    authLogger.info("Creating refresh token", { userId });

    const plainToken = this.jwtService.generateRefreshToken();
    const hashedToken = this.jwtService.hashRefreshToken(plainToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create({
      token: hashedToken,
      userId,
      expiresAt,
    });

    authLogger.info("Refresh token created", { userId });
    return plainToken;
  }
}

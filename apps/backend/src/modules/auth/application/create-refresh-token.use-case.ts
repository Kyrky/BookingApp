import { RefreshTokenRepository, JwtService } from "@repo/shared";

export class CreateRefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(userId: string): Promise<string> {
    console.log(`[CREATE_REFRESH] Creating refresh token for user: ${userId}`);

    const plainToken = this.jwtService.generateRefreshToken();
    const hashedToken = this.jwtService.hashRefreshToken(plainToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create({
      token: hashedToken,
      userId,
      expiresAt,
    });

    console.log(`[CREATE_REFRESH] Refresh token created for user: ${userId}`);
    return plainToken;
  }
}

import { UserRepository, RefreshTokenRepository, JwtService, User, logger } from "@repo/shared";

const authLogger = logger.child({ context: "AUTH" });

export class RefreshUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(refreshToken: string): Promise<{ user: User; accessToken: string; newRefreshToken: string }> {
    authLogger.info("Token refresh attempt");

    const hashedToken = this.jwtService.hashRefreshToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.findByToken(hashedToken);
    if (!storedToken) {
      authLogger.warn("Token refresh failed - invalid token");
      throw new Error("Invalid refresh token");
    }

    if (storedToken.expiresAt < new Date()) {
      authLogger.warn("Token refresh failed - token expired", { userId: storedToken.userId });
      await this.refreshTokenRepository.delete(hashedToken);
      throw new Error("Refresh token expired");
    }

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      authLogger.warn("Token refresh failed - user not found", { userId: storedToken.userId });
      throw new Error("User not found");
    }

    await this.refreshTokenRepository.delete(hashedToken);

    const accessToken = this.jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshTokenPlain = this.jwtService.generateRefreshToken();
    const newRefreshTokenHashed = this.jwtService.hashRefreshToken(newRefreshTokenPlain);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create({
      token: newRefreshTokenHashed,
      userId: user.id,
      expiresAt,
    });

    authLogger.info("Token refreshed successfully", { userId: user.id });
    return { user, accessToken, newRefreshToken: newRefreshTokenPlain };
  }
}

import { UserRepository, RefreshTokenRepository, JwtService, User } from "@repo/shared";

export class RefreshUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(refreshToken: string): Promise<{ user: User; accessToken: string; newRefreshToken: string }> {
    console.log(`[REFRESH] Refreshing token`);

    const hashedToken = this.jwtService.hashRefreshToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.findByToken(hashedToken);
    if (!storedToken) {
      console.log(`[REFRESH] Refresh token not found or invalid`);
      throw new Error("Invalid refresh token");
    }

    if (storedToken.expiresAt < new Date()) {
      console.log(`[REFRESH] Refresh token expired`);
      await this.refreshTokenRepository.delete(hashedToken);
      throw new Error("Refresh token expired");
    }

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      console.log(`[REFRESH] User not found: ${storedToken.userId}`);
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

    console.log(`[REFRESH] Token refreshed successfully for user: ${user.id}`);
    return { user, accessToken, newRefreshToken: newRefreshTokenPlain };
  }
}

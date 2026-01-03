import type { PrismaClient } from "@repo/database";
import { RefreshTokenRepository, RefreshToken, CreateRefreshTokenData } from "@repo/shared";

export class RefreshTokenRepositoryImpl implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    console.log(`[REFRESH_REPO] Finding refresh token`);
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      console.log(`[REFRESH_REPO] Refresh token not found`);
      return null;
    }

    console.log(`[REFRESH_REPO] Refresh token found: ${refreshToken.id}`);
    return this.toDomain(refreshToken);
  }

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    console.log(`[REFRESH_REPO] Creating refresh token for user: ${data.userId}`);
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });

    console.log(`[REFRESH_REPO] Refresh token created: ${refreshToken.id}`);
    return this.toDomain(refreshToken);
  }

  async delete(token: string): Promise<void> {
    console.log(`[REFRESH_REPO] Deleting refresh token`);
    await this.prisma.refreshToken.delete({
      where: { token },
    });
    console.log(`[REFRESH_REPO] Refresh token deleted`);
  }

  async deleteByUserId(userId: string): Promise<void> {
    console.log(`[REFRESH_REPO] Deleting all refresh tokens for user: ${userId}`);
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    console.log(`[REFRESH_REPO] All refresh tokens deleted for user: ${userId}`);
  }

  private toDomain(prismaRefreshToken: any): RefreshToken {
    return new RefreshToken(
      prismaRefreshToken.id,
      prismaRefreshToken.token,
      prismaRefreshToken.userId,
      prismaRefreshToken.expiresAt,
      prismaRefreshToken.createdAt
    );
  }
}

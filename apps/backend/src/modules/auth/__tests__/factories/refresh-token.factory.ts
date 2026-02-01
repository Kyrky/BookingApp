import { RefreshToken } from "@repo/shared";

export class RefreshTokenFactory {
  static create(overrides: Partial<RefreshToken> = {}): RefreshToken {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      id: overrides.id || "token-123",
      token: overrides.token || "hashed-token-value",
      userId: overrides.userId || "user-123",
      expiresAt: overrides.expiresAt || expiresAt,
      createdAt: overrides.createdAt || new Date("2025-01-01"),
    };
  }

  static expired(overrides: Partial<RefreshToken> = {}): RefreshToken {
    const expiresAt = new Date("2024-01-01");

    return this.create({
      ...overrides,
      expiresAt,
    });
  }

  static withUserId(userId: string): RefreshToken {
    return this.create({ userId });
  }

  static withToken(token: string): RefreshToken {
    return this.create({ token });
  }

  static forUser(userId: string, token: string): RefreshToken {
    return this.create({ userId, token });
  }
}

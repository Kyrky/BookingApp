import { RefreshToken } from "../entities/refresh-token.entity";

export interface CreateRefreshTokenData {
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface RefreshTokenRepository {
  findByToken(token: string): Promise<RefreshToken | null>;
  create(data: CreateRefreshTokenData): Promise<RefreshToken>;
  delete(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

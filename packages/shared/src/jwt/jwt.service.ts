import { randomBytes, createHash } from "crypto";

export interface JwtService {
  generateToken(payload: { userId: string; email: string; role: string }): string;
  verifyToken(token: string): { userId: string; email: string; role: string } | null;
  generateRefreshToken(): string;
  hashRefreshToken(token: string): string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateRandomToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

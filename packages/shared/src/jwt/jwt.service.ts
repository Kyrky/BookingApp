export interface JwtService {
  generateToken(payload: { userId: string; email: string; role: string }): string;
  verifyToken(token: string): { userId: string; email: string; role: string } | null;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

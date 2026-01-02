import jwt from "jsonwebtoken";
import { JwtService, JwtPayload } from "@repo/shared";

export class JwtServiceImpl implements JwtService {
  private readonly secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
  private readonly expiresIn = "15m";

  generateToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}

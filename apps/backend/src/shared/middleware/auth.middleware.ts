import { Request, Response, NextFunction } from "express";
import { JwtService } from "@repo/shared";

export function authMiddleware(jwtService: JwtService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const token = authHeader.substring(7);

    const payload = jwtService.verifyToken(token);

    if (!payload) {
      res.status(401).json({ success: false, error: "Invalid token" });
      return;
    }

    (req as any).userId = payload.userId;
    (req as any).userEmail = payload.email;
    (req as any).userRole = payload.role;

    next();
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!(req as any).userId) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  next();
}

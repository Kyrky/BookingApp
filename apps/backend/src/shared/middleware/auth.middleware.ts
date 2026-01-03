import { Request, Response, NextFunction } from "express";
import { JwtService, UserRole } from "@repo/shared";
import { IPropertyRepository } from "@repo/shared";

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

/**
 * Middleware to check if user has required role
 * @param allowedRoles - Array of roles that can access the route
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).userRole as UserRole;

    if (!userRole) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: `Forbidden. Required role: ${allowedRoles.join(" or ")}, your role: ${userRole}`
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user is admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  return requireRole(UserRole.ADMIN)(req, res, next);
}

/**
 * Middleware to check if user owns the property
 * Must be used after authMiddleware and with routes that have :id param
 */
export function requirePropertyOwnerOrAdmin(propertyRepository: IPropertyRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).userId as string;
    const userRole = (req as any).userRole as UserRole;
    const propertyId = req.params.id;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (!propertyId) {
      res.status(400).json({ success: false, error: "Property ID is required" });
      return;
    }

    // Admin can access any property
    if (userRole === UserRole.ADMIN) {
      next();
      return;
    }

    // Check if user owns the property
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      res.status(404).json({ success: false, error: "Property not found" });
      return;
    }

    if (property.ownerId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden. You don't own this property"
      });
      return;
    }

    next();
  };
}

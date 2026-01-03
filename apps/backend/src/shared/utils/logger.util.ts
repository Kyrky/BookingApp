import { Request } from "express";
import { logger } from "@repo/shared";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

/**
 * Creates a logger instance with user context from the request
 * Use this in controllers to have userId in all logs
 */
export function loggerWithUser(req: AuthenticatedRequest) {
  const userContext: Record<string, string> = {};

  if (req.userId) {
    userContext.userId = req.userId;
  }
  if (req.userEmail) {
    userContext.userEmail = req.userEmail;
  }
  if (req.userRole) {
    userContext.userRole = req.userRole;
  }

  return logger.child(userContext);
}

import { Request, Response, NextFunction } from "express";
import { logger as winstonLogger } from "@repo/shared";
import { AuthenticatedRequest } from "../utils/logger.util";

const httpLogger = winstonLogger.child({ context: "HTTP" });

export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  const { method, originalUrl, ip } = req;
  const userAgent = req.get("user-agent") || "unknown";

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const logData: Record<string, unknown> = {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent,
    };

    // Add user info if available (after auth middleware)
    const authenticatedReq = req as AuthenticatedRequest;
    if (authenticatedReq.userId) {
      logData.userId = authenticatedReq.userId;
    }
    if (authenticatedReq.userEmail) {
      logData.userEmail = authenticatedReq.userEmail;
    }

    httpLogger.http("Request completed", logData);
  });

  next();
}

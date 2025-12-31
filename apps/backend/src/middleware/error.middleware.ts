import { Request, Response, NextFunction } from "express";
import { DomainError, PropertyNotFoundError } from "@repo/shared";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  if (err instanceof PropertyNotFoundError) {
    return res.status(404).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof DomainError) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}

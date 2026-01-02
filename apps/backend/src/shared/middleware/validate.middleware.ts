import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

export function validate(schema: ZodType<any, any, any>, property: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req[property]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues,
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Validation failed",
        });
      }
    }
  };
}

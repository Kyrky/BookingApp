import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

export function validate(schema: ZodType<any, any, any>, property: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      console.log(`[VALIDATE] Validating ${property}:`, JSON.stringify(req[property]));
      schema.parse(req[property]);
      console.log(`[VALIDATE] Validation passed`);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(`[VALIDATE] Validation failed:`, JSON.stringify(error.issues));
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues,
        });
      } else {
        console.log(`[VALIDATE] Validation error:`, error);
        res.status(400).json({
          success: false,
          error: "Validation failed",
        });
      }
    }
  };
}

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
      const isZodError = error instanceof ZodError || (error as any).name === 'ZodError' || Array.isArray((error as any).issues);

      if (isZodError) {
        const issues = (error as any).issues;
        console.log(`[VALIDATE] Validation failed for ${property}:`, JSON.stringify(issues));
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: issues,
        });
      } else {
        console.error(`[VALIDATE] Unexpected error during validation:`, error);
        res.status(400).json({
          success: false,
          error: "Validation failed",
          message: error instanceof Error ? error.message : "Unknown validation error",
        });
      }
    }
  };
}

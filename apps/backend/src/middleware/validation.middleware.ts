import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema, property: "body" | "params" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      const errors: Array<{ path: string; message: string }> = [];

      if (result.error instanceof ZodError) {
        for (const issue of result.error.issues) {
          errors.push({
            path: issue.path.join("."),
            message: issue.message,
          });
        }
      }

      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    req[property] = result.data;
    next();
  };
}

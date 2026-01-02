import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../../shared/middleware/validate.middleware";
import { registerSchema, loginSchema, refreshSchema } from "./auth.dto";

export function makeAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/register", validate(registerSchema), (req, res) => controller.register(req, res));
  router.post("/login", validate(loginSchema), (req, res) => controller.login(req, res));
  router.post("/refresh", validate(refreshSchema), (req, res) => controller.refresh(req, res));

  return router;
}

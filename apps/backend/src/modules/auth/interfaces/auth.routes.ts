import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../../shared/middleware/validate.middleware";
import { registerSchema, loginSchema, refreshSchema } from "./auth.dto";
import { authMiddleware } from "../../../shared/middleware/auth.middleware";
import { JwtServiceImpl } from "../../../shared/infrastructure/jwt.service.impl";

const jwtService = new JwtServiceImpl();

export function makeAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/register", validate(registerSchema), (req, res) => controller.register(req, res));
  router.post("/login", validate(loginSchema), (req, res) => controller.login(req, res));
  router.post("/refresh", validate(refreshSchema), (req, res) => controller.refresh(req, res));

  // Get current user - requires authentication
  router.get("/me", authMiddleware(jwtService), (req, res) => controller.getMe(req, res));

  return router;
}

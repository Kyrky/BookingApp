import { Request, Response } from "express";
import { RegisterUseCase } from "../application/register.use-case";
import { LoginUseCase } from "../application/login.use-case";
import { RefreshUseCase } from "../application/refresh.use-case";
import { CreateRefreshTokenUseCase } from "../application/create-refresh-token.use-case";
import { GetMeUseCase } from "../application/get-me.use-case";
import { JwtService, logger } from "@repo/shared";
import { AuthResponseDto } from "./auth.dto";
import { loggerWithUser, AuthenticatedRequest } from "../../../shared/utils/logger.util";

const authLogger = logger.child({ context: "AUTH" });

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly jwtService: JwtService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "AUTH" });
    const email = req.body.email;

    try {
      const { user } = await this.registerUseCase.execute(req.body);

      const token = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = await this.createRefreshTokenUseCase.execute(user.id);

      const response: AuthResponseDto = {
        user: user.toJSON(),
        token,
        refreshToken,
      };

      log.info("Registration successful", { email, userId: user.id });
      res.status(201).json({ success: true, data: response });
    } catch (error) {
      log.error("Registration failed", {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "AUTH" });
    const email = req.body.email;

    try {
      const { user } = await this.loginUseCase.execute(req.body);

      const token = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = await this.createRefreshTokenUseCase.execute(user.id);

      const response: AuthResponseDto = {
        user: user.toJSON(),
        token,
        refreshToken,
      };

      log.info("Login successful", { email, userId: user.id });
      res.status(200).json({ success: true, data: response });
    } catch (error) {
      log.error("Login failed", {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "AUTH" });
    const { refreshToken } = req.body;

    try {
      const { user, accessToken, newRefreshToken } = await this.refreshUseCase.execute(refreshToken);

      const response: AuthResponseDto = {
        user: user.toJSON(),
        token: accessToken,
        refreshToken: newRefreshToken,
      };

      log.info("Token refreshed successfully", { userId: user.id });
      res.status(200).json({ success: true, data: response });
    } catch (error) {
      log.error("Token refresh failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : "Token refresh failed",
      });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "AUTH" });
    try {
      const userId = (req as AuthenticatedRequest).userId;

      if (!userId) {
        log.warn("Get me failed - no userId");
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const user = await this.getMeUseCase.execute(userId);

      log.info("Get me successful", { userId, email: user.email });
      res.status(200).json({ success: true, data: { user: user.toJSON() } });
    } catch (error) {
      log.error("Get me failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }
  }
}

import { Request, Response } from "express";
import { RegisterUseCase } from "../application/register.use-case";
import { LoginUseCase } from "../application/login.use-case";
import { RefreshUseCase } from "../application/refresh.use-case";
import { CreateRefreshTokenUseCase } from "../application/create-refresh-token.use-case";
import { JwtService } from "@repo/shared";
import { AuthResponseDto } from "./auth.dto";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,
    private readonly jwtService: JwtService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const email = req.body.email;
    console.log(`[AUTH] Registration attempt: ${email}`);

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

      console.log(`[AUTH] Registration successful: ${email} -> userId: ${user.id}`);
      res.status(201).json({ success: true, data: response });
    } catch (error) {
      console.error(`[AUTH] Registration failed: ${email} ->`, error instanceof Error ? error.message : error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const email = req.body.email;
    console.log(`[AUTH] Login attempt: ${email}`);

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

      console.log(`[AUTH] Login successful: ${email} -> userId: ${user.id}`);
      res.status(200).json({ success: true, data: response });
    } catch (error) {
      console.error(`[AUTH] Login failed: ${email} ->`, error instanceof Error ? error.message : error);
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    console.log(`[AUTH] Refresh token attempt`);

    try {
      const { user, accessToken, newRefreshToken } = await this.refreshUseCase.execute(refreshToken);

      const response: AuthResponseDto = {
        user: user.toJSON(),
        token: accessToken,
        refreshToken: newRefreshToken,
      };

      console.log(`[AUTH] Token refreshed successful: ${user.id}`);
      res.status(200).json({ success: true, data: response });
    } catch (error) {
      console.error(`[AUTH] Token refresh failed:`, error instanceof Error ? error.message : error);
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : "Token refresh failed",
      });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      const response: AuthResponseDto = {
        user: (req as any).user,
        token: "",
        refreshToken: "",
      };

      res.status(200).json({ success: true, data: response });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }
  }
}

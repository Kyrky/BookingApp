import { Request, Response } from "express";
import { RegisterUseCase } from "../application/register.use-case";
import { LoginUseCase } from "../application/login.use-case";
import { JwtService } from "@repo/shared";
import { AuthResponseDto } from "./auth.dto";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
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

      const response: AuthResponseDto = {
        user: user.toJSON(),
        token,
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

      const response: AuthResponseDto = {
        user: user.toJSON(),
        token,
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

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId; // Set by auth middleware

      const response: AuthResponseDto = {
        user: (req as any).user,
        token: "", // Optional: refresh token here
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

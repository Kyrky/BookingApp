import express from "express";
import cors from "cors";
import path from "path";
import net from "net";
import propertyRoutes from "./modules/property/interfaces/property.routes";
import bookingRoutes from "./modules/booking/interfaces/booking.routes";
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./shared/middleware/logger.middleware";
import { cleanupOrphanedImages } from "./utils/cleanup.utils";

// Auth imports
import { prisma } from "@repo/database";
import { RegisterUseCase } from "./modules/auth/application/register.use-case";
import { LoginUseCase } from "./modules/auth/application/login.use-case";
import { RefreshUseCase } from "./modules/auth/application/refresh.use-case";
import { CreateRefreshTokenUseCase } from "./modules/auth/application/create-refresh-token.use-case";
import { GetMeUseCase } from "./modules/auth/application/get-me.use-case";
import { UserRepositoryImpl } from "./modules/auth/infrastructure/user.repository.impl";
import { RefreshTokenRepositoryImpl } from "./modules/auth/infrastructure/refresh-token.repository.impl";
import { AuthController } from "./modules/auth/interfaces/auth.controller";
import { makeAuthRoutes } from "./modules/auth/interfaces/auth.routes";
import { BcryptAdapterImpl } from "./shared/infrastructure/bcrypt.adapter.impl";
import { JwtServiceImpl } from "./shared/infrastructure/jwt.service.impl";

const app = express();

// Port fallback configuration: try ports 3001-3010
function getAvailablePort(startPort: number, endPort: number): number {
  for (let port = startPort; port <= endPort; port++) {
    if (isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports in range ${startPort}-${endPort}`);
}

function isPortAvailable(port: number): boolean {
  const server = net.createServer();
  try {
    server.listen(port, () => {
      server.once("close", () => {
        // Port is available
      });
      server.close();
    });
    return true;
  } catch {
    return false;
  }
}

const PORT = getAvailablePort(3001, 3010);

// Initialize auth dependencies
const bcryptAdapter = new BcryptAdapterImpl();
const jwtService = new JwtServiceImpl();
const userRepository = new UserRepositoryImpl(prisma);
const refreshTokenRepository = new RefreshTokenRepositoryImpl(prisma);
const registerUseCase = new RegisterUseCase(userRepository, bcryptAdapter);
const loginUseCase = new LoginUseCase(userRepository, bcryptAdapter);
const refreshUseCase = new RefreshUseCase(userRepository, refreshTokenRepository, jwtService);
const createRefreshTokenUseCase = new CreateRefreshTokenUseCase(refreshTokenRepository, jwtService);
const getMeUseCase = new GetMeUseCase(userRepository);
const authController = new AuthController(registerUseCase, loginUseCase, refreshUseCase, createRefreshTokenUseCase, getMeUseCase, jwtService);
const authRoutes = makeAuthRoutes(authController);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(logger);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Cleanup orphaned images
app.post("/api/cleanup/images", async (req, res) => {
  try {
    const result = await cleanupOrphanedImages();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Cleanup failed",
    });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET    http://localhost:${PORT}/health`);
  console.log(`  POST   http://localhost:${PORT}/api/auth/register`);
  console.log(`  POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`  POST   http://localhost:${PORT}/api/auth/refresh`);
  console.log(`  GET    http://localhost:${PORT}/api/auth/me`);
  console.log(`  GET    http://localhost:${PORT}/api/properties`);
  console.log(`  GET    http://localhost:${PORT}/api/properties/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/properties`);
  console.log(`  PUT    http://localhost:${PORT}/api/properties/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/properties/:id`);
  console.log(`  GET    http://localhost:${PORT}/api/bookings`);
  console.log(`  GET    http://localhost:${PORT}/api/bookings/my`);
  console.log(`  GET    http://localhost:${PORT}/api/bookings/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/bookings`);
  console.log(`  PUT    http://localhost:${PORT}/api/bookings/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/bookings/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/bookings/:id/cancel`);
  console.log(`  POST   http://localhost:${PORT}/api/bookings/:id/confirm`);
  console.log(`  POST   http://localhost:${PORT}/api/bookings/:id/check-in`);
  console.log(`  POST   http://localhost:${PORT}/api/bookings/:id/check-out`);
  console.log(`  POST   http://localhost:${PORT}/api/cleanup/images`);
});

import express from "express";
import cors from "cors";
import path from "path";
import propertyRoutes from "./modules/property/interfaces/property.routes";
import { errorHandler } from "./middleware/error.middleware";
import { cleanupOrphanedImages } from "./utils/cleanup.utils";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/properties", propertyRoutes);

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
  console.log(`  GET    http://localhost:${PORT}/api/properties`);
  console.log(`  GET    http://localhost:${PORT}/api/properties/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/properties`);
  console.log(`  PUT    http://localhost:${PORT}/api/properties/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/properties/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/cleanup/images`);
});

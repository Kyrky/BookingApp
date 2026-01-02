import express from "express";
import cors from "cors";
import propertyRoutes from "./modules/property/interfaces/property.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/properties", propertyRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
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
});

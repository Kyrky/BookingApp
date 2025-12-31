import express from "express";
import cors from "cors";
import { PrismaPropertyRepository } from "./infrastructure/prisma-property.repository";
import { GetPropertiesUseCase } from "./application/get-properties.use-case";
import { GetPropertyByIdUseCase } from "./application/get-property-by-id.use-case";
import { CreatePropertyUseCase } from "./application/create-property.use-case";
import { UpdatePropertyUseCase } from "./application/update-property.use-case";
import { DeletePropertyUseCase } from "./application/delete-property.use-case";
import { PropertyController } from "./interfaces/property.controller";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Dependency Injection (Clean Architecture wiring)
const propertyRepository = new PrismaPropertyRepository();
const getPropertiesUseCase = new GetPropertiesUseCase(propertyRepository);
const getPropertyByIdUseCase = new GetPropertyByIdUseCase(propertyRepository);
const createPropertyUseCase = new CreatePropertyUseCase(propertyRepository);
const updatePropertyUseCase = new UpdatePropertyUseCase(propertyRepository);
const deletePropertyUseCase = new DeletePropertyUseCase(propertyRepository);
const propertyController = new PropertyController(
  getPropertiesUseCase,
  getPropertyByIdUseCase,
  createPropertyUseCase,
  updatePropertyUseCase,
  deletePropertyUseCase,
);

// Routes
app.get("/api/properties", (req, res) => propertyController.getProperties(req, res));
app.get("/api/properties/:id", (req, res) => propertyController.getPropertyById(req, res));
app.post("/api/properties", (req, res) => propertyController.createProperty(req, res));
app.put("/api/properties/:id", (req, res) => propertyController.updateProperty(req, res));
app.delete("/api/properties/:id", (req, res) => propertyController.deleteProperty(req, res));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

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

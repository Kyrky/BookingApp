import { Router, Request, Response, NextFunction } from "express";
import { PropertyContainer } from "../di/property.container";
import { validate } from "../../../middleware/validation.middleware";
import { createPropertySchema, updatePropertySchema, propertyIdSchema } from "@repo/validation";
import { upload } from "../../../middleware/upload.middleware";
import { authMiddleware, requirePropertyOwnerOrAdmin } from "../../../shared/middleware/auth.middleware";
import { JwtServiceImpl } from "../../../shared/infrastructure/jwt.service.impl";

const router: Router = Router();
const controller = PropertyContainer.getController();
const jwtService = new JwtServiceImpl();
const propertyRepository = PropertyContainer.getRepository();

// Public routes (no authentication required)
router.get("/", (req, res) => controller.getProperties(req, res));
router.get("/:id", validate(propertyIdSchema, "params"), (req, res) => controller.getPropertyById(req, res));

// Protected routes (require authentication)
// POST - Any authenticated user can create property
router.post("/", authMiddleware(jwtService), upload.single("image"), (req, res) => controller.createProperty(req, res));

// PUT - Only owner or admin can update property
router.put(
  "/:id",
  authMiddleware(jwtService),
  requirePropertyOwnerOrAdmin(propertyRepository),
  upload.single("image"),
  validate(propertyIdSchema, "params"),
  (req, res) => controller.updateProperty(req, res)
);

// DELETE - Only owner or admin can delete property
router.delete(
  "/:id",
  authMiddleware(jwtService),
  requirePropertyOwnerOrAdmin(propertyRepository),
  validate(propertyIdSchema, "params"),
  (req, res) => controller.deleteProperty(req, res)
);

export default router;

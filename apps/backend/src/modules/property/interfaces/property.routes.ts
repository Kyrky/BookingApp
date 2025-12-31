import { Router, Request, Response, NextFunction } from "express";
import { PropertyContainer } from "../di/property.container";
import { validate } from "../../../middleware/validation.middleware";
import { createPropertySchema, updatePropertySchema, propertyIdSchema } from "@repo/validation";

const router: Router = Router();
const controller = PropertyContainer.getController();

router.get("/", (req, res) => controller.getProperties(req, res));
router.get("/:id", validate(propertyIdSchema, "params"), (req, res) => controller.getPropertyById(req, res));
router.post("/", validate(createPropertySchema), (req, res) => controller.createProperty(req, res));
router.put("/:id", validate(propertyIdSchema, "params"), validate(updatePropertySchema), (req, res) => controller.updateProperty(req, res));
router.delete("/:id", validate(propertyIdSchema, "params"), (req, res) => controller.deleteProperty(req, res));

export default router;

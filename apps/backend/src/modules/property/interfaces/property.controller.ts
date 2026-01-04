import { Request, Response } from "express";
import { GetPropertiesUseCase } from "../application/get-properties.use-case";
import { GetPropertyByIdUseCase } from "../application/get-property-by-id.use-case";
import { CreatePropertyUseCase } from "../application/create-property.use-case";
import { UpdatePropertyUseCase } from "../application/update-property.use-case";
import { DeletePropertyUseCase } from "../application/delete-property.use-case";
import { toPropertyResponseDto, toPropertyListResponseDto } from "../mappers/property-response.mapper";
import { deleteImageFile } from "../../../utils/file.utils";
import { logger } from "@repo/shared";
import { loggerWithUser, AuthenticatedRequest } from "../../../shared/utils/logger.util";

const propertyLogger = logger.child({ context: "PROPERTY" });

export class PropertyController {
  constructor(
    private getPropertiesUseCase: GetPropertiesUseCase,
    private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private createPropertyUseCase: CreatePropertyUseCase,
    private updatePropertyUseCase: UpdatePropertyUseCase,
    private deletePropertyUseCase: DeletePropertyUseCase,
  ) {}

  async getProperties(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "PROPERTY" });

    try {
      const properties = await this.getPropertiesUseCase.execute();
      const response = toPropertyListResponseDto(properties);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to get properties", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        success: false,
        error: "Failed to get properties",
      });
    }
  }

  async getPropertyById(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "PROPERTY" });
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: "Property ID is required" });
      return;
    }

    try {
      const property = await this.getPropertyByIdUseCase.execute(id);
      const response = toPropertyResponseDto(property);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to get property", {
        propertyId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }
  }

  async createProperty(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "PROPERTY" });

    try {
      const userId = (req as AuthenticatedRequest).userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const file = req.file as Express.Multer.File;
      let imageUrl = null;

      if (file) {
        imageUrl = `/uploads/${file.filename}`;
      }

      const input = {
        title: req.body.title,
        description: req.body.description,
        pricePerNight: Number(req.body.pricePerNight),
        address: req.body.address,
        ownerId: userId,
        imageUrl,
      };

      log.info("Creating property", { title: input.title, ownerId: input.ownerId });
      const property = await this.createPropertyUseCase.execute(input);
      log.info("Property created successfully", { propertyId: property.id, title: input.title });

      const response = toPropertyResponseDto(property);
      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to create property", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        success: false,
        error: "Failed to create property",
      });
    }
  }

  async updateProperty(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "PROPERTY" });
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: "Property ID is required" });
      return;
    }

    try {
      const file = req.file as Express.Multer.File;
      let imageUrl = req.body.imageUrl;

      if (file) {
        const existingProperty = await this.getPropertyByIdUseCase.execute(id);
        deleteImageFile(existingProperty.getImageUrl());
        imageUrl = `/uploads/${file.filename}`;
      }

      const input: Record<string, unknown> = {
        title: req.body.title,
        description: req.body.description,
        pricePerNight: req.body.pricePerNight ? Number(req.body.pricePerNight) : undefined,
        address: req.body.address,
        ownerId: req.body.ownerId,
        imageUrl,
      };

      Object.keys(input).forEach(key => {
        if (input[key] === undefined) {
          delete input[key];
        }
      });

      log.info("Updating property", { propertyId: id, fields: Object.keys(input) });
      const property = await this.updatePropertyUseCase.execute(id, input);
      log.info("Property updated successfully", { propertyId: id });

      const response = toPropertyResponseDto(property);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      log.error("Failed to update property", {
        propertyId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        success: false,
        error: "Failed to update property",
      });
    }
  }

  async deleteProperty(req: Request, res: Response): Promise<void> {
    const log = loggerWithUser(req as AuthenticatedRequest).child({ context: "PROPERTY" });
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: "Property ID is required" });
      return;
    }

    try {
      log.info("Deleting property", { propertyId: id });
      const property = await this.getPropertyByIdUseCase.execute(id);
      deleteImageFile(property.getImageUrl());
      await this.deletePropertyUseCase.execute(id);
      log.info("Property deleted successfully", { propertyId: id });

      res.status(200).json({
        success: true,
        data: { message: "Property deleted successfully" },
      });
    } catch (error) {
      log.error("Failed to delete property", {
        propertyId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        success: false,
        error: "Failed to delete property",
      });
    }
  }
}

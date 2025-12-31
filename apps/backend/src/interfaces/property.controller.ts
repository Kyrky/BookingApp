import { Request, Response } from "express";
import { GetPropertiesUseCase } from "../application/get-properties.use-case";
import { GetPropertyByIdUseCase } from "../application/get-property-by-id.use-case";
import { CreatePropertyUseCase } from "../application/create-property.use-case";
import { UpdatePropertyUseCase } from "../application/update-property.use-case";
import { DeletePropertyUseCase } from "../application/delete-property.use-case";

export class PropertyController {
  constructor(
    private getPropertiesUseCase: GetPropertiesUseCase,
    private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private createPropertyUseCase: CreatePropertyUseCase,
    private updatePropertyUseCase: UpdatePropertyUseCase,
    private deletePropertyUseCase: DeletePropertyUseCase,
  ) {}

  async getProperties(req: Request, res: Response): Promise<void> {
    try {
      const properties = await this.getPropertiesUseCase.execute();
      res.status(200).json({
        success: true,
        data: properties,
      });
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch properties",
      });
    }
  }

  async getPropertyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: "Property ID is required",
        });
        return;
      }
      const property = await this.getPropertyByIdUseCase.execute(id);

      if (!property) {
        res.status(404).json({
          success: false,
          error: "Property not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: property,
      });
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch property",
      });
    }
  }

  async createProperty(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body;
      const property = await this.createPropertyUseCase.execute(input);

      res.status(201).json({
        success: true,
        data: property,
      });
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create property",
      });
    }
  }

  async updateProperty(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: "Property ID is required",
        });
        return;
      }
      const input = req.body;

      const property = await this.updatePropertyUseCase.execute(id, input);

      res.status(200).json({
        success: true,
        data: property,
      });
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update property",
      });
    }
  }

  async deleteProperty(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: "Property ID is required",
        });
        return;
      }
      const property = await this.deletePropertyUseCase.execute(id);

      res.status(200).json({
        success: true,
        data: property,
        message: "Property deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete property",
      });
    }
  }
}

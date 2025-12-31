import { Request, Response } from "express";
import { GetPropertiesUseCase } from "../application/get-properties.use-case";
import { GetPropertyByIdUseCase } from "../application/get-property-by-id.use-case";
import { CreatePropertyUseCase } from "../application/create-property.use-case";
import { UpdatePropertyUseCase } from "../application/update-property.use-case";
import { DeletePropertyUseCase } from "../application/delete-property.use-case";
import { toPropertyResponseDto, toPropertyListResponseDto } from "../mappers/property-response.mapper";

export class PropertyController {
  constructor(
    private getPropertiesUseCase: GetPropertiesUseCase,
    private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private createPropertyUseCase: CreatePropertyUseCase,
    private updatePropertyUseCase: UpdatePropertyUseCase,
    private deletePropertyUseCase: DeletePropertyUseCase,
  ) {}

  async getProperties(req: Request, res: Response): Promise<void> {
    const properties = await this.getPropertiesUseCase.execute();
    const response = toPropertyListResponseDto(properties);
    res.status(200).json({
      success: true,
      ...response,
    });
  }

  async getPropertyById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: "Property ID is required" });
      return;
    }
    const property = await this.getPropertyByIdUseCase.execute(id);
    const response = toPropertyResponseDto(property);
    res.status(200).json({
      success: true,
      data: response,
    });
  }

  async createProperty(req: Request, res: Response): Promise<void> {
    const input = req.body;
    const property = await this.createPropertyUseCase.execute(input);
    const response = toPropertyResponseDto(property);
    res.status(201).json({
      success: true,
      data: response,
    });
  }

  async updateProperty(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: "Property ID is required" });
      return;
    }
    const input = req.body;
    const property = await this.updatePropertyUseCase.execute(id, input);
    const response = toPropertyResponseDto(property);
    res.status(200).json({
      success: true,
      data: response,
    });
  }

  async deleteProperty(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: "Property ID is required" });
      return;
    }
    await this.deletePropertyUseCase.execute(id);
    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  }
}

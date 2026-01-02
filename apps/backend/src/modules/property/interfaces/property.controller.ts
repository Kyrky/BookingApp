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
      data: response,
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
      ownerId: req.body.ownerId,
      imageUrl,
    };

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

    const file = req.file as Express.Multer.File;
    let imageUrl = req.body.imageUrl;

    if (file) {
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
      data: { message: "Property deleted successfully" },
    });
  }
}

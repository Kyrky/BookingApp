import { PrismaPropertyRepository } from "../infrastructure/prisma-property.repository";
import { GetPropertiesUseCase } from "../application/get-properties.use-case";
import { GetPropertyByIdUseCase } from "../application/get-property-by-id.use-case";
import { CreatePropertyUseCase } from "../application/create-property.use-case";
import { UpdatePropertyUseCase } from "../application/update-property.use-case";
import { DeletePropertyUseCase } from "../application/delete-property.use-case";
import { PropertyController } from "../interfaces/property.controller";

export class PropertyContainer {
  private static repository: PrismaPropertyRepository | null = null;
  private static getPropertiesUseCase: GetPropertiesUseCase | null = null;
  private static getPropertyByIdUseCase: GetPropertyByIdUseCase | null = null;
  private static createPropertyUseCase: CreatePropertyUseCase | null = null;
  private static updatePropertyUseCase: UpdatePropertyUseCase | null = null;
  private static deletePropertyUseCase: DeletePropertyUseCase | null = null;
  private static controller: PropertyController | null = null;

  static getRepository(): PrismaPropertyRepository {
    if (!this.repository) {
      this.repository = new PrismaPropertyRepository();
    }
    return this.repository;
  }

  static getGetPropertiesUseCase(): GetPropertiesUseCase {
    if (!this.getPropertiesUseCase) {
      this.getPropertiesUseCase = new GetPropertiesUseCase(this.getRepository());
    }
    return this.getPropertiesUseCase;
  }

  static getGetPropertyByIdUseCase(): GetPropertyByIdUseCase {
    if (!this.getPropertyByIdUseCase) {
      this.getPropertyByIdUseCase = new GetPropertyByIdUseCase(this.getRepository());
    }
    return this.getPropertyByIdUseCase;
  }

  static getCreatePropertyUseCase(): CreatePropertyUseCase {
    if (!this.createPropertyUseCase) {
      this.createPropertyUseCase = new CreatePropertyUseCase(this.getRepository());
    }
    return this.createPropertyUseCase;
  }

  static getUpdatePropertyUseCase(): UpdatePropertyUseCase {
    if (!this.updatePropertyUseCase) {
      this.updatePropertyUseCase = new UpdatePropertyUseCase(this.getRepository());
    }
    return this.updatePropertyUseCase;
  }

  static getDeletePropertyUseCase(): DeletePropertyUseCase {
    if (!this.deletePropertyUseCase) {
      this.deletePropertyUseCase = new DeletePropertyUseCase(this.getRepository());
    }
    return this.deletePropertyUseCase;
  }

  static getController(): PropertyController {
    if (!this.controller) {
      this.controller = new PropertyController(
        this.getGetPropertiesUseCase(),
        this.getGetPropertyByIdUseCase(),
        this.getCreatePropertyUseCase(),
        this.getUpdatePropertyUseCase(),
        this.getDeletePropertyUseCase(),
      );
    }
    return this.controller;
  }

  static reset(): void {
    this.repository = null;
    this.getPropertiesUseCase = null;
    this.getPropertyByIdUseCase = null;
    this.createPropertyUseCase = null;
    this.updatePropertyUseCase = null;
    this.deletePropertyUseCase = null;
    this.controller = null;
  }
}

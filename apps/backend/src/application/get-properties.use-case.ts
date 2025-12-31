import { PropertyRepository } from "../domain/property.repository";
import { Property } from "@repo/database";

export class GetPropertiesUseCase {
  constructor(private propertyRepository: PropertyRepository) {}

  async execute(): Promise<Property[]> {
    return await this.propertyRepository.findAll();
  }
}

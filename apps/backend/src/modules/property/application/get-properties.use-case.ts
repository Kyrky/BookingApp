import { IPropertyRepository, Property } from "@repo/shared";

export class GetPropertiesUseCase {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(): Promise<Property[]> {
    return await this.propertyRepository.findAll();
  }
}

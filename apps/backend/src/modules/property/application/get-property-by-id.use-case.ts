import { IPropertyRepository, Property } from "@repo/shared";
import { PropertyNotFoundError } from "@repo/shared";

export class GetPropertyByIdUseCase {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(id: string): Promise<Property> {
    const property = await this.propertyRepository.findById(id);

    if (!property) {
      throw new PropertyNotFoundError(id);
    }

    return property;
  }
}

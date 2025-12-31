import { IPropertyRepository, Property, Address, Price, PropertyNotFoundError } from "@repo/shared";

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  pricePerNight?: number;
  address?: string;
  imageUrl?: string | null;
}

export class UpdatePropertyUseCase {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(id: string, input: UpdatePropertyInput): Promise<Property> {
    const property = await this.propertyRepository.findById(id);

    if (!property) {
      throw new PropertyNotFoundError(id);
    }

    if (input.title !== undefined) {
      property.updateTitle(input.title);
    }
    if (input.description !== undefined) {
      property.updateDescription(input.description);
    }
    if (input.pricePerNight !== undefined) {
      property.updatePrice(Price.create(input.pricePerNight));
    }
    if (input.address !== undefined) {
      property.updateAddress(Address.create(input.address));
    }
    if (input.imageUrl !== undefined) {
      property.updateImageUrl(input.imageUrl);
    }

    return await this.propertyRepository.save(property);
  }
}

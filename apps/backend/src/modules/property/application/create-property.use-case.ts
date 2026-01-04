import { IPropertyRepository, Property, Address, Price } from "@repo/shared";

export interface CreatePropertyInput {
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
  imageUrl?: string | null;
  ownerId: string;
}

export class CreatePropertyUseCase {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(input: CreatePropertyInput): Promise<Property> {
    const property = Property.create({
      title: input.title,
      description: input.description,
      address: Address.create(input.address),
      pricePerNight: Price.create(input.pricePerNight),
      imageUrl: input.imageUrl,
      ownerId: input.ownerId,
    });

    return await this.propertyRepository.save(property);
  }
}

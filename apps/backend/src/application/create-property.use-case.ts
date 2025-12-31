import { PropertyRepository } from "../domain/property.repository";

export interface CreatePropertyInput {
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
  imageUrl?: string;
  ownerId: string;
}

export class CreatePropertyUseCase {
  constructor(private propertyRepository: PropertyRepository) {}

  async execute(input: CreatePropertyInput) {
    return await this.propertyRepository.create({
      ...input,
      imageUrl: input.imageUrl ?? null,
    });
  }
}

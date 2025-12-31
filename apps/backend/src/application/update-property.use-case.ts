import { PropertyRepository } from "../domain/property.repository";

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  pricePerNight?: number;
  address?: string;
  imageUrl?: string;
}

export class UpdatePropertyUseCase {
  constructor(private propertyRepository: PropertyRepository) {}

  async execute(id: string, input: UpdatePropertyInput) {
    return await this.propertyRepository.update(id, input);
  }
}

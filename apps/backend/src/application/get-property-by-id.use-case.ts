import { PropertyRepository } from "../domain/property.repository";

export class GetPropertyByIdUseCase {
  constructor(private propertyRepository: PropertyRepository) {}

  async execute(id: string) {
    return await this.propertyRepository.findById(id);
  }
}

import { PropertyRepository } from "../domain/property.repository";

export class DeletePropertyUseCase {
  constructor(private propertyRepository: PropertyRepository) {}

  async execute(id: string) {
    return await this.propertyRepository.delete(id);
  }
}

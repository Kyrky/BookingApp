import { IPropertyRepository, PropertyNotFoundError } from "@repo/shared";

export class DeletePropertyUseCase {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(id: string): Promise<void> {
    const property = await this.propertyRepository.findById(id);

    if (!property) {
      throw new PropertyNotFoundError(id);
    }

    await this.propertyRepository.delete(id);
  }
}

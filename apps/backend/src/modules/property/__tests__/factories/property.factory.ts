import { Property, Address, Price, PropertyStatus } from "@repo/shared";

export class PropertyFactory {
  static create(overrides: {
    id?: string;
    ownerId?: string;
    title?: string;
    description?: string;
    address?: Address;
    pricePerNight?: Price;
    imageUrl?: string | null;
    status?: PropertyStatus;
    createdAt?: Date;
  } = {}): Property {
    return Property.create({
      id: overrides.id || "property-123",
      ownerId: overrides.ownerId || "owner-123",
      title: overrides.title || "Test Property",
      description: overrides.description || "A lovely test property located in a great area",
      address: overrides.address || Address.create("123 Test St, Test City, Test Country"),
      pricePerNight: overrides.pricePerNight || Price.create(100),
      imageUrl: overrides.imageUrl === undefined ? null : overrides.imageUrl,
      status: overrides.status || PropertyStatus.AVAILABLE,
      createdAt: overrides.createdAt || new Date("2025-01-01"),
    });
  }

  static withPrice(price: number): Property {
    return this.create({
      pricePerNight: Price.create(price),
    });
  }

  static withId(id: string): Property {
    return this.create({ id });
  }

  static withOwnerId(ownerId: string): Property {
    return this.create({ ownerId });
  }
}

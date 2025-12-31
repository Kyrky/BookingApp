import { Property } from "@repo/shared";
import { Address } from "@repo/shared";
import { Price } from "@repo/shared";
import { PropertyStatus } from "@repo/shared";
import { Property as PrismaProperty } from "@repo/database";

export function toDomain(prismaProperty: PrismaProperty): Property {
  return Property.create({
    id: prismaProperty.id,
    title: prismaProperty.title,
    description: prismaProperty.description,
    address: Address.create(prismaProperty.address),
    pricePerNight: Price.create(prismaProperty.pricePerNight),
    imageUrl: prismaProperty.imageUrl,
    ownerId: prismaProperty.ownerId,
    status: PropertyStatus.AVAILABLE,
    createdAt: prismaProperty.createdAt,
  });
}

export function toPrismaData(property: Property) {
  return {
    id: property.id,
    title: property.getTitle(),
    description: property.getDescription(),
    address: property.getAddress().toString(),
    pricePerNight: property.getPricePerNight().toNumber(),
    imageUrl: property.getImageUrl(),
    ownerId: property.ownerId,
    createdAt: property.createdAt,
  };
}

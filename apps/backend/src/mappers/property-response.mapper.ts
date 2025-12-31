import { Property } from "@repo/shared";
import { PropertyResponseDto, PropertyListResponseDto } from "@repo/dto";

export function toPropertyResponseDto(property: Property): PropertyResponseDto {
  return {
    id: property.id,
    title: property.getTitle(),
    description: property.getDescription(),
    address: property.getAddress().toString(),
    pricePerNight: property.getPricePerNight().toNumber(),
    imageUrl: property.getImageUrl(),
    ownerId: property.ownerId,
    status: property.status,
    createdAt: property.createdAt,
  };
}

export function toPropertyListResponseDto(properties: Property[]): PropertyListResponseDto {
  return {
    properties: properties.map(toPropertyResponseDto),
    total: properties.length,
  };
}

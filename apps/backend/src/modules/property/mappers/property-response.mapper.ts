import { Property } from "@repo/shared";
import { PropertyResponseDto, PropertyListResponseDto } from "@repo/dto";

const API_URL = process.env.API_URL || "http://localhost:3001";

function formatImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url}`;
}

export function toPropertyResponseDto(property: Property): PropertyResponseDto {
  return {
    id: property.id,
    title: property.getTitle(),
    description: property.getDescription(),
    address: property.getAddress().toString(),
    pricePerNight: property.getPricePerNight().toNumber(),
    imageUrl: formatImageUrl(property.getImageUrl()),
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

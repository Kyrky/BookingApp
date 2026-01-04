import { CreatePropertyDto, UpdatePropertyDto } from "@repo/dto";
import { Address } from "@repo/shared";
import { Price } from "@repo/shared";

export function toCreatePropertyInput(dto: CreatePropertyDto) {
  return {
    title: dto.title,
    description: dto.description,
    address: Address.create(dto.address),
    pricePerNight: Price.create(dto.pricePerNight),
    imageUrl: dto.imageUrl,
    ownerId: dto.ownerId,
  };
}

export function toUpdatePropertyInput(dto: UpdatePropertyDto) {
  const result: Record<string, unknown> = {};

  if (dto.title !== undefined) result.title = dto.title;
  if (dto.description !== undefined) result.description = dto.description;
  if (dto.pricePerNight !== undefined) result.pricePerNight = Price.create(dto.pricePerNight);
  if (dto.address !== undefined) result.address = Address.create(dto.address);
  if (dto.imageUrl !== undefined) result.imageUrl = dto.imageUrl;

  return result;
}

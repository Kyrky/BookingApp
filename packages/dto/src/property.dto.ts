export interface CreatePropertyDto {
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
  imageUrl?: string | null;
  ownerId: string;
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  pricePerNight?: number;
  address?: string;
  imageUrl?: string | null;
}

export interface PropertyResponseDto {
  id: string;
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
  imageUrl: string | null;
  ownerId: string;
  status: string;
  createdAt: Date;
}

export interface PropertyListResponseDto {
  properties: PropertyResponseDto[];
  total: number;
}

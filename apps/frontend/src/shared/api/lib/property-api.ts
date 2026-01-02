import { apiClient } from "./api-client";
import type { PropertyResponseDto, CreatePropertyDto, UpdatePropertyDto } from "@repo/dto";

export interface PropertyListResponse {
  properties: PropertyResponseDto[];
  total: number;
}

export const propertyApi = {
  async getAll(): Promise<PropertyListResponse> {
    return apiClient.get<PropertyListResponse>("/api/properties");
  },

  async getById(id: string): Promise<PropertyResponseDto> {
    return apiClient.get<PropertyResponseDto>(`/api/properties/${id}`);
  },

  async create(data: CreatePropertyDto | FormData): Promise<PropertyResponseDto> {
    if (data instanceof FormData) {
      return apiClient.postForm<PropertyResponseDto>("/api/properties", data);
    }
    return apiClient.post<PropertyResponseDto>("/api/properties", data);
  },

  async update(id: string, data: UpdatePropertyDto | FormData): Promise<PropertyResponseDto> {
    if (data instanceof FormData) {
      return apiClient.putForm<PropertyResponseDto>(`/api/properties/${id}`, data);
    }
    return apiClient.put<PropertyResponseDto>(`/api/properties/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/properties/${id}`);
  },
};

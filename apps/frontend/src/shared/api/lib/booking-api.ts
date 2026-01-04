import { apiClient } from "./api-client";
import type {
  BookingResponseDto,
  CreateBookingDto,
  UpdateBookingDto,
  BookingListResponseDto,
  BookingAvailabilityDto,
  BookingStatus,
  PaymentStatus,
} from "@repo/dto";

export interface BookingFilters {
  propertyId?: string;
  userId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
}

export const bookingApi = {
  async getAll(filters?: BookingFilters): Promise<BookingListResponseDto> {
    const params = new URLSearchParams();
    if (filters?.propertyId) params.append("propertyId", filters.propertyId);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
    if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
    if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());

    const query = params.toString();
    return apiClient.get<BookingListResponseDto>(`/api/bookings${query ? `?${query}` : ""}`);
  },

  async getById(id: string): Promise<BookingResponseDto> {
    return apiClient.get<BookingResponseDto>(`/api/bookings/${id}`);
  },

  async create(data: CreateBookingDto): Promise<BookingResponseDto> {
    return apiClient.post<BookingResponseDto>("/api/bookings", data);
  },

  async update(id: string, data: UpdateBookingDto): Promise<BookingResponseDto> {
    return apiClient.put<BookingResponseDto>(`/api/bookings/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/bookings/${id}`);
  },

  async cancel(id: string): Promise<BookingResponseDto> {
    return apiClient.post<BookingResponseDto>(`/api/bookings/${id}/cancel`, {});
  },

  async confirm(id: string): Promise<BookingResponseDto> {
    return apiClient.post<BookingResponseDto>(`/api/bookings/${id}/confirm`, {});
  },

  async checkIn(id: string): Promise<BookingResponseDto> {
    return apiClient.post<BookingResponseDto>(`/api/bookings/${id}/check-in`, {});
  },

  async checkOut(id: string): Promise<BookingResponseDto> {
    return apiClient.post<BookingResponseDto>(`/api/bookings/${id}/check-out`, {});
  },

  async getAvailability(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BookingAvailabilityDto> {
    const params = new URLSearchParams({
      propertyId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return apiClient.get<BookingAvailabilityDto>(`/api/bookings/availability?${params}`);
  },

  async calculatePrice(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    guests: number
  ): Promise<{ totalPrice: number; nights: number; pricePerNight: number }> {
    const params = new URLSearchParams({
      propertyId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      guests: guests.toString(),
    });
    return apiClient.get<{ totalPrice: number; nights: number; pricePerNight: number }>(
      `/api/bookings/calculate-price?${params}`
    );
  },
};

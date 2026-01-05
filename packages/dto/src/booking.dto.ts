export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface CreateBookingDto {
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalGuests: number;
  totalPrice: number;
}

export interface UpdateBookingDto {
  totalGuests?: number;
}

export interface BookingResponseDto {
  id: string;
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalGuests: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  days?: number;
  property?: {
    id: string;
    title: string;
    address: string;
    imageUrl: string | null;
    pricePerNight: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BookingListResponseDto {
  bookings: BookingResponseDto[];
  total: number;
}

export interface BookingCalendarDto {
  date: Date;
  available: boolean;
  bookingId?: string;
  price?: number;
}

export interface BookingAvailabilityDto {
  propertyId: string;
  startDate: Date;
  endDate: Date;
  calendar: BookingCalendarDto[];
}

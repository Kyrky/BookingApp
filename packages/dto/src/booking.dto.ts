export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
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
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  specialRequests?: string;
}

export interface UpdateBookingDto {
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  specialRequests?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

export interface BookingResponseDto {
  id: string;
  propertyId: string;
  userId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  specialRequests: string | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
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

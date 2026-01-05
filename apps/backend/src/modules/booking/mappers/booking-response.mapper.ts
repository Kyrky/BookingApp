import { Booking } from "@repo/shared";
import { Booking as PrismaBooking, Property, User } from "@repo/database";

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

export function toBookingResponseDto(
  booking: Booking,
  property?: Property | null,
  user?: User | null
): BookingResponseDto {
  const response: BookingResponseDto = {
    id: booking.id,
    propertyId: booking.propertyId,
    userId: booking.userId,
    startDate: booking.startDate,
    endDate: booking.endDate,
    totalGuests: booking.totalGuests,
    totalPrice: booking.totalPrice,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    days: booking.getDays(),
  };

  if (property) {
    response.property = {
      id: property.id,
      title: property.title,
      address: property.address,
      imageUrl: property.imageUrl,
      pricePerNight: property.pricePerNight,
    };
  }

  if (user) {
    response.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  return response;
}

export function toBookingListResponseDto(
  bookingsWithRelations: Array<{ booking: Booking; property?: Property | null; user?: User | null }>
): BookingListResponseDto {
  return {
    bookings: bookingsWithRelations.map(({ booking, property, user }) =>
      toBookingResponseDto(booking, property, user)
    ),
    total: bookingsWithRelations.length,
  };
}

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
  if (!booking) {
    throw new Error("Booking is required for mapping");
  }

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
    // console.log("Mapping property:", property.title);
    response.property = {
      id: property.id,
      title: property.title || "Unknown Property",
      address: property.address || "No Address",
      imageUrl: property.imageUrl || null,
      pricePerNight: Number(property.pricePerNight),
    };
  }

  if (user) {
    // console.log("Mapping user:", user.name);
    response.user = {
      id: user.id,
      name: user.name || "Unknown User",
      email: user.email || "",
    };
  }

  return response;
}

export function toBookingListResponseDto(
  bookingsWithRelations: Array<{ booking: Booking; property?: Property | null; user?: User | null }>
): BookingListResponseDto {
  if (!Array.isArray(bookingsWithRelations)) {
    return { bookings: [], total: 0 };
  }

  return {
    bookings: bookingsWithRelations.map(({ booking, property, user }) =>
      toBookingResponseDto(booking, property, user)
    ),
    total: bookingsWithRelations.length,
  };
}

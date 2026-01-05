import { Booking, BookingStatus } from "@repo/shared";
import { Booking as PrismaBooking } from "@repo/database";

export function toDomain(prismaBooking: PrismaBooking): Booking {
  return Booking.create({
    id: prismaBooking.id,
    propertyId: prismaBooking.propertyId,
    userId: prismaBooking.userId,
    startDate: prismaBooking.startDate,
    endDate: prismaBooking.endDate,
    totalGuests: prismaBooking.totalGuests,
    totalPrice: Number(prismaBooking.totalPrice),
    status: prismaBooking.status as BookingStatus,
    createdAt: prismaBooking.createdAt,
    updatedAt: prismaBooking.updatedAt,
  });
}

export function toPrismaData(booking: Booking) {
  return {
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
  };
}

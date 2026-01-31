import { IBookingRepository, Booking, BookingNotFoundError, BookingStatus } from "@repo/shared";
import { prisma, Booking as PrismaBooking, Property, User } from "@repo/database";
import { toDomain } from "../mappers/prisma-booking.mapper";

export class PrismaBookingRepository implements IBookingRepository {
  async findAll(): Promise<Booking[]> {
    try {
      const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
      });
      return bookings.map(toDomain);
    } catch (error) {
      console.error("Error finding all bookings:", error);
      throw new Error("Failed to fetch bookings");
    }
  }

  async findById(id: string): Promise<Booking | null> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
      });
      if (!booking) return null;
      return toDomain(booking);
    } catch (error) {
      console.error(`Error finding booking by id ${id}:`, error);
      throw new Error("Failed to fetch booking");
    }
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return bookings.map(toDomain);
    } catch (error) {
      console.error(`Error finding bookings by user ${userId}:`, error);
      throw new Error("Failed to fetch user bookings");
    }
  }

  async findByPropertyId(propertyId: string): Promise<Booking[]> {
    try {
      const bookings = await prisma.booking.findMany({
        where: { propertyId },
        orderBy: { startDate: "asc" },
      });
      return bookings.map(toDomain);
    } catch (error) {
      console.error(`Error finding bookings by property ${propertyId}:`, error);
      throw new Error("Failed to fetch property bookings");
    }
  }

  async findActiveByPropertyId(propertyId: string): Promise<Booking[]> {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          propertyId,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
        orderBy: { startDate: "asc" },
      });
      return bookings.map(toDomain);
    } catch (error) {
      console.error(`Error finding active bookings for property ${propertyId}:`, error);
      throw new Error("Failed to fetch active bookings");
    }
  }

  async findOverlappingBookings(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string
  ): Promise<Booking[]> {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          propertyId,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
          },
          id: excludeBookingId ? { not: excludeBookingId } : undefined,
          OR: [
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gt: startDate } },
              ],
            },
            {
              AND: [
                { startDate: { lt: endDate } },
                { endDate: { gte: endDate } },
              ],
            },
            {
              AND: [
                { startDate: { gte: startDate } },
                { endDate: { lte: endDate } },
              ],
            },
          ],
        },
      });
      return bookings.map(toDomain);
    } catch (error) {
      console.error(`Error finding overlapping bookings for property ${propertyId}:`, error);
      throw new Error("Failed to check availability");
    }
  }

  async save(booking: Booking): Promise<Booking> {
    try {
      const data = {
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

      const result = await prisma.booking.upsert({
        where: { id: booking.id },
        update: data,
        create: data,
      });

      return toDomain(result);
    } catch (error) {
      console.error(`Error saving booking ${booking.id}:`, error);
      throw new Error("Failed to save booking");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.booking.delete({ where: { id } });
    } catch (error) {
      console.error(`Error deleting booking ${id}:`, error);
      throw new Error("Failed to delete booking");
    }
  }

  // Methods with Relations
  async findAllWithRelations(): Promise<Array<{ booking: Booking; property: Property | null; user: User | null }>> {
    const bookings = await prisma.booking.findMany({
      include: { property: true, user: true },
      orderBy: { createdAt: "desc" },
    });

    return bookings.map((b) => ({
      booking: toDomain(b),
      property: b.property,
      user: b.user,
    }));
  }

  async findByUserIdWithRelations(userId: string): Promise<Array<{ booking: Booking; property: Property | null; user: User | null }>> {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { property: true, user: true },
      orderBy: { createdAt: "desc" },
    });

    return bookings.map((b) => ({
      booking: toDomain(b),
      property: b.property,
      user: b.user,
    }));
  }

  async findByIdWithRelations(id: string): Promise<{ booking: Booking; property: Property | null; user: User | null } | null> {
    const b = await prisma.booking.findUnique({
      where: { id },
      include: { property: true, user: true },
    });

    if (!b) return null;

    return {
      booking: toDomain(b),
      property: b.property,
      user: b.user,
    };
  }
}

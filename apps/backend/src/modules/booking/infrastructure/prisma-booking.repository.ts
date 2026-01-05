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

      if (!booking) {
        return null;
      }

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
              // New booking starts during an existing booking
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gt: startDate } },
              ],
            },
            {
              // New booking ends during an existing booking
              AND: [
                { startDate: { lt: endDate } },
                { endDate: { gte: endDate } },
              ],
            },
            {
              // New booking completely covers an existing booking
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
      const existing = await prisma.booking.findUnique({
        where: { id: booking.id },
      });

      if (existing) {
        const updated = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            propertyId: booking.propertyId,
            userId: booking.userId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalGuests: booking.totalGuests,
            totalPrice: booking.totalPrice,
            status: booking.status,
            updatedAt: booking.updatedAt,
          },
        });
        return toDomain(updated);
      } else {
        const created = await prisma.booking.create({
          data: {
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
          },
        });
        return toDomain(created);
      }
    } catch (error) {
      console.error(`Error saving booking ${booking.id}:`, error);
      throw new Error("Failed to save booking");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await prisma.booking.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new BookingNotFoundError(id);
      }

      await prisma.booking.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof BookingNotFoundError) {
        throw error;
      }
      console.error(`Error deleting booking ${id}:`, error);
      throw new Error("Failed to delete booking");
    }
  }

  // Additional methods to fetch bookings with relations (property and user)
  async findAllWithRelations(): Promise<Array<{ booking: Booking; property: Property | null; user: User | null }>> {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          property: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return bookings.map((b) => ({
        booking: toDomain(b),
        property: b.property,
        user: b.user,
      }));
    } catch (error) {
      console.error("Error finding all bookings with relations:", error);
      throw new Error("Failed to fetch bookings");
    }
  }

  async findByUserIdWithRelations(userId: string): Promise<Array<{ booking: Booking; property: Property | null; user: User | null }>> {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: {
          property: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return bookings.map((b) => ({
        booking: toDomain(b),
        property: b.property,
        user: b.user,
      }));
    } catch (error) {
      console.error(`Error finding bookings by user ${userId}:`, error);
      throw new Error("Failed to fetch user bookings");
    }
  }
}

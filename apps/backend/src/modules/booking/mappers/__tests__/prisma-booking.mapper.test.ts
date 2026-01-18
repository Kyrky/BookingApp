import { describe, it, expect, beforeEach } from "vitest";
import { toDomain, toPrismaData } from "../prisma-booking.mapper";
import { Booking, BookingStatus } from "@repo/shared";
import { Booking as PrismaBooking } from "@repo/database";

describe("prisma-booking.mapper", () => {
  let mockPrismaBooking: PrismaBooking;
  let mockBooking: Booking;

  beforeEach(() => {
    mockPrismaBooking = {
      id: "booking-123",
      propertyId: "property-123",
      userId: "user-123",
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-02-05"),
      totalGuests: 2,
      totalPrice: 500,
      status: "PENDING",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };

    mockBooking = Booking.create({
      id: "booking-123",
      propertyId: "property-123",
      userId: "user-123",
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-02-05"),
      totalGuests: 2,
      totalPrice: 500,
      status: BookingStatus.PENDING,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    });
  });

  describe("toDomain", () => {
    it("should map Prisma booking to domain Booking", () => {
      const result = toDomain(mockPrismaBooking);

      expect(result.id).toBe("booking-123");
      expect(result.propertyId).toBe("property-123");
      expect(result.userId).toBe("user-123");
      expect(result.startDate).toEqual(mockPrismaBooking.startDate);
      expect(result.endDate).toEqual(mockPrismaBooking.endDate);
      expect(result.totalGuests).toBe(2);
      expect(result.totalPrice).toBe(500);
      expect(result.status).toBe(BookingStatus.PENDING);
      expect(result.createdAt).toEqual(mockPrismaBooking.createdAt);
      expect(result.updatedAt).toEqual(mockPrismaBooking.updatedAt);
    });

    it("should convert Prisma decimal totalPrice to number", () => {
      const prismaBookingWithDecimal = {
        ...mockPrismaBooking,
        totalPrice: 999.99 as any,
      };

      const result = toDomain(prismaBookingWithDecimal);

      expect(result.totalPrice).toBe(999.99);
      expect(typeof result.totalPrice).toBe("number");
    });

    it("should handle CONFIRMED status", () => {
      const confirmedPrismaBooking = {
        ...mockPrismaBooking,
        status: "CONFIRMED",
      };

      const result = toDomain(confirmedPrismaBooking);

      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it("should handle CANCELLED status", () => {
      const cancelledPrismaBooking = {
        ...mockPrismaBooking,
        status: "CANCELLED",
      };

      const result = toDomain(cancelledPrismaBooking);

      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it("should handle COMPLETED status", () => {
      const completedPrismaBooking = {
        ...mockPrismaBooking,
        status: "COMPLETED",
      };

      const result = toDomain(completedPrismaBooking);

      expect(result.status).toBe(BookingStatus.COMPLETED);
    });
  });

  describe("toPrismaData", () => {
    it("should map domain Booking to Prisma data", () => {
      const result = toPrismaData(mockBooking);

      expect(result).toEqual({
        id: "booking-123",
        propertyId: "property-123",
        userId: "user-123",
        startDate: mockBooking.startDate,
        endDate: mockBooking.endDate,
        totalGuests: 2,
        totalPrice: 500,
        status: BookingStatus.PENDING,
        createdAt: mockBooking.createdAt,
        updatedAt: mockBooking.updatedAt,
      });
    });

    it("should preserve date objects", () => {
      const result = toPrismaData(mockBooking);

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle CONFIRMED status booking", () => {
      const confirmedBooking = Booking.create({
        ...mockBooking.toJSON(),
        status: BookingStatus.CONFIRMED,
      });

      const result = toPrismaData(confirmedBooking);

      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it("should handle CANCELLED status booking", () => {
      const cancelledBooking = Booking.create({
        ...mockBooking.toJSON(),
        status: BookingStatus.CANCELLED,
      });

      const result = toPrismaData(cancelledBooking);

      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it("should handle COMPLETED status booking", () => {
      const completedBooking = Booking.create({
        ...mockBooking.toJSON(),
        status: BookingStatus.COMPLETED,
      });

      const result = toPrismaData(completedBooking);

      expect(result.status).toBe(BookingStatus.COMPLETED);
    });
  });

  describe("Round-trip conversion", () => {
    it("should maintain data integrity through round-trip conversion", () => {
      // Prisma -> Domain -> Prisma
      const domainBooking = toDomain(mockPrismaBooking);
      const prismaData = toPrismaData(domainBooking);

      expect(prismaData.id).toBe(mockPrismaBooking.id);
      expect(prismaData.propertyId).toBe(mockPrismaBooking.propertyId);
      expect(prismaData.userId).toBe(mockPrismaBooking.userId);
      expect(prismaData.totalGuests).toBe(mockPrismaBooking.totalGuests);
      expect(prismaData.totalPrice).toBe(Number(mockPrismaBooking.totalPrice));
      expect(prismaData.status).toBe(BookingStatus.PENDING);
    });
  });
});

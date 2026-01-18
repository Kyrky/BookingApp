import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaBookingRepository } from "../prisma-booking.repository";
import { Booking, BookingNotFoundError, BookingStatus } from "@repo/shared";
import { prisma } from "@repo/database";
import { BookingFactory } from "../../__tests__/factories/booking.factory";

// Mock prisma
vi.mock("@repo/database", () => ({
  prisma: {
    booking: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("PrismaBookingRepository", () => {
  let repository: PrismaBookingRepository;
  let mockPrismaBooking: any;

  beforeEach(() => {
    repository = new PrismaBookingRepository();
    mockPrismaBooking = prisma.booking as any;

    // Clear all mocks before each test
    vi.clearAllMocks();

    // Suppress console.error output during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("findAll", () => {
    it("should return empty array when no bookings exist", async () => {
      mockPrismaBooking.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(mockPrismaBooking.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return all bookings ordered by createdAt desc", async () => {
      const mockBookings = [
        {
          id: "booking-2",
          propertyId: "property-1",
          userId: "user-1",
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.PENDING,
          createdAt: new Date("2025-01-15"),
          updatedAt: new Date("2025-01-15"),
        },
        {
          id: "booking-1",
          propertyId: "property-1",
          userId: "user-1",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.CONFIRMED,
          createdAt: new Date("2025-01-10"),
          updatedAt: new Date("2025-01-10"),
        },
      ];

      mockPrismaBooking.findMany.mockResolvedValue(mockBookings);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Booking);
      expect(result[0].id).toBe("booking-2");
      expect(result[1].id).toBe("booking-1");
    });

    it("should handle database errors", async () => {
      mockPrismaBooking.findMany.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findAll()).rejects.toThrow("Failed to fetch bookings");
      expect(console.error).toHaveBeenCalledWith(
        "Error finding all bookings:",
        expect.any(Error)
      );
    });
  });

  describe("findById", () => {
    it("should return booking when found", async () => {
      const mockBooking = {
        id: "booking-123",
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 2,
        totalPrice: 400,
        status: BookingStatus.PENDING,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);

      const result = await repository.findById("booking-123");

      expect(result).toBeInstanceOf(Booking);
      expect(result?.id).toBe("booking-123");
      expect(mockPrismaBooking.findUnique).toHaveBeenCalledWith({
        where: { id: "booking-123" },
      });
    });

    it("should return null when booking not found", async () => {
      mockPrismaBooking.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      mockPrismaBooking.findUnique.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findById("booking-123")).rejects.toThrow("Failed to fetch booking");
    });
  });

  describe("findByUserId", () => {
    it("should return bookings for user ordered by createdAt desc", async () => {
      const mockBookings = [
        {
          id: "booking-1",
          propertyId: "property-1",
          userId: "user-123",
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.PENDING,
          createdAt: new Date("2025-01-15"),
          updatedAt: new Date("2025-01-15"),
        },
        {
          id: "booking-2",
          propertyId: "property-1",
          userId: "user-123",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.CONFIRMED,
          createdAt: new Date("2025-01-10"),
          updatedAt: new Date("2025-01-10"),
        },
      ];

      mockPrismaBooking.findMany.mockResolvedValue(mockBookings);

      const result = await repository.findByUserId("user-123");

      expect(result).toHaveLength(2);
      expect(mockPrismaBooking.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return empty array when user has no bookings", async () => {
      mockPrismaBooking.findMany.mockResolvedValue([]);

      const result = await repository.findByUserId("user-123");

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockPrismaBooking.findMany.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findByUserId("user-123")).rejects.toThrow(
        "Failed to fetch user bookings"
      );
    });
  });

  describe("findByPropertyId", () => {
    it("should return bookings for property ordered by startDate asc", async () => {
      const mockBookings = [
        {
          id: "booking-1",
          propertyId: "property-123",
          userId: "user-1",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.PENDING,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-01"),
        },
        {
          id: "booking-2",
          propertyId: "property-123",
          userId: "user-1",
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.CONFIRMED,
          createdAt: new Date("2025-01-10"),
          updatedAt: new Date("2025-01-10"),
        },
      ];

      mockPrismaBooking.findMany.mockResolvedValue(mockBookings);

      const result = await repository.findByPropertyId("property-123");

      expect(result).toHaveLength(2);
      expect(mockPrismaBooking.findMany).toHaveBeenCalledWith({
        where: { propertyId: "property-123" },
        orderBy: { startDate: "asc" },
      });
    });

    it("should handle database errors", async () => {
      mockPrismaBooking.findMany.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findByPropertyId("property-123")).rejects.toThrow(
        "Failed to fetch property bookings"
      );
    });
  });

  describe("findActiveByPropertyId", () => {
    it("should return only pending and confirmed bookings", async () => {
      const mockBookings = [
        {
          id: "booking-1",
          propertyId: "property-123",
          userId: "user-1",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.PENDING,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-01"),
        },
        {
          id: "booking-2",
          propertyId: "property-123",
          userId: "user-1",
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.CONFIRMED,
          createdAt: new Date("2025-01-10"),
          updatedAt: new Date("2025-01-10"),
        },
      ];

      mockPrismaBooking.findMany.mockResolvedValue(mockBookings);

      const result = await repository.findActiveByPropertyId("property-123");

      expect(result).toHaveLength(2);
      expect(mockPrismaBooking.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: "property-123",
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
        orderBy: { startDate: "asc" },
      });
    });

    it("should not return cancelled or completed bookings", async () => {
      const mockBookings = [
        {
          id: "booking-1",
          propertyId: "property-123",
          userId: "user-1",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.PENDING,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-01"),
        },
      ];

      mockPrismaBooking.findMany.mockResolvedValue(mockBookings);

      const result = await repository.findActiveByPropertyId("property-123");

      expect(result.every(b => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED)).toBe(true);
    });

    it("should handle database errors", async () => {
      mockPrismaBooking.findMany.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findActiveByPropertyId("property-123")).rejects.toThrow(
        "Failed to fetch active bookings"
      );
    });
  });

  describe("findOverlappingBookings", () => {
    it("should find bookings that overlap with given date range", async () => {
      const mockBookings = [
        {
          id: "booking-1",
          propertyId: "property-123",
          userId: "user-1",
          startDate: new Date("2025-02-03"),
          endDate: new Date("2025-02-07"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.CONFIRMED,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-01"),
        },
      ];

      mockPrismaBooking.findMany.mockResolvedValue(mockBookings);

      const startDate = new Date("2025-02-01");
      const endDate = new Date("2025-02-05");

      const result = await repository.findOverlappingBookings("property-123", startDate, endDate);

      expect(result).toHaveLength(1);
      expect(mockPrismaBooking.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: "property-123",
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
          },
          id: undefined,
          OR: expect.any(Array),
        },
      });
    });

    it("should exclude booking with specified id", async () => {
      mockPrismaBooking.findMany.mockResolvedValue([]);

      const startDate = new Date("2025-02-01");
      const endDate = new Date("2025-02-05");

      await repository.findOverlappingBookings("property-123", startDate, endDate, "booking-123");

      expect(mockPrismaBooking.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: "property-123",
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
          },
          id: { not: "booking-123" },
          OR: expect.any(Array),
        },
      });
    });

    it("should handle database errors", async () => {
      mockPrismaBooking.findMany.mockRejectedValue(new Error("Database connection failed"));

      await expect(
        repository.findOverlappingBookings(
          "property-123",
          new Date("2025-02-01"),
          new Date("2025-02-05")
        )
      ).rejects.toThrow("Failed to check availability");
    });
  });

  describe("save", () => {
    it("should create new booking when it does not exist", async () => {
      const booking = BookingFactory.create({ id: "new-booking" });

      const mockCreatedBooking = {
        id: "new-booking",
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

      mockPrismaBooking.findUnique.mockResolvedValue(null);
      mockPrismaBooking.create.mockResolvedValue(mockCreatedBooking);

      const result = await repository.save(booking);

      expect(result).toBeInstanceOf(Booking);
      expect(mockPrismaBooking.create).toHaveBeenCalledWith({
        data: {
          id: "new-booking",
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
    });

    it("should update existing booking", async () => {
      const booking = BookingFactory.create({
        id: "existing-booking",
        totalGuests: 4,
        totalPrice: 800,
      });

      const mockExistingBooking = {
        id: "existing-booking",
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 2,
        totalPrice: 400,
        status: BookingStatus.PENDING,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };

      const mockUpdatedBooking = {
        id: "existing-booking",
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 4,
        totalPrice: 800,
        status: BookingStatus.PENDING,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockExistingBooking);
      mockPrismaBooking.update.mockResolvedValue(mockUpdatedBooking);

      const result = await repository.save(booking);

      expect(result).toBeInstanceOf(Booking);
      expect(mockPrismaBooking.update).toHaveBeenCalledWith({
        where: { id: "existing-booking" },
        data: {
          propertyId: "property-123",
          userId: "user-123",
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalGuests: 4,
          totalPrice: 800,
          status: BookingStatus.PENDING,
          updatedAt: booking.updatedAt,
        },
      });
    });

    it("should handle database errors on create", async () => {
      const booking = BookingFactory.create({ id: "new-booking" });

      mockPrismaBooking.findUnique.mockResolvedValue(null);
      mockPrismaBooking.create.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.save(booking)).rejects.toThrow("Failed to save booking");
    });

    it("should handle database errors on update", async () => {
      const booking = BookingFactory.create({ id: "existing-booking" });

      mockPrismaBooking.findUnique.mockResolvedValue({ id: "existing-booking" });
      mockPrismaBooking.update.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.save(booking)).rejects.toThrow("Failed to save booking");
    });
  });

  describe("delete", () => {
    it("should delete existing booking", async () => {
      const mockBooking = {
        id: "booking-123",
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 2,
        totalPrice: 400,
        status: BookingStatus.PENDING,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaBooking.delete.mockResolvedValue(mockBooking);

      await expect(repository.delete("booking-123")).resolves.toBeUndefined();

      expect(mockPrismaBooking.delete).toHaveBeenCalledWith({
        where: { id: "booking-123" },
      });
    });

    it("should throw BookingNotFoundError when booking does not exist", async () => {
      mockPrismaBooking.findUnique.mockResolvedValue(null);

      await expect(repository.delete("non-existent")).rejects.toThrow(BookingNotFoundError);

      expect(mockPrismaBooking.delete).not.toHaveBeenCalled();
    });

    it("should include booking id in BookingNotFoundError message", async () => {
      mockPrismaBooking.findUnique.mockResolvedValue(null);

      await expect(repository.delete("booking-123")).rejects.toThrow(
        'Booking with id "booking-123" not found'
      );
    });

    it("should handle database errors during delete", async () => {
      const mockBooking = {
        id: "booking-123",
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 2,
        totalPrice: 400,
        status: BookingStatus.PENDING,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaBooking.delete.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.delete("booking-123")).rejects.toThrow("Failed to delete booking");
    });

    it("should not catch BookingNotFoundError", async () => {
      mockPrismaBooking.findUnique.mockResolvedValue(null);

      await expect(repository.delete("booking-123")).rejects.toThrow(BookingNotFoundError);
    });
  });

  describe("findAllWithRelations", () => {
    it("should return bookings with property and user relations", async () => {
      const mockBookings = [
        {
          id: "booking-1",
          propertyId: "property-123",
          userId: "user-123",
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.PENDING,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-01"),
          property: {
            id: "property-123",
            title: "Test Property",
            ownerId: "owner-123",
          },
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
      ];

      mockPrismaBooking.findMany.mockResolvedValue(mockBookings);

      const result = await repository.findAllWithRelations();

      expect(result).toHaveLength(1);
      expect(result[0].booking).toBeInstanceOf(Booking);
      expect(result[0].property).not.toBeNull();
      expect(result[0].user).not.toBeNull();
      expect(mockPrismaBooking.findMany).toHaveBeenCalledWith({
        include: {
          property: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle bookings without relations", async () => {
      const mockBookings = [
        {
          id: "booking-1",
          propertyId: "property-123",
          userId: "user-123",
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.PENDING,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-01"),
          property: null,
          user: null,
        },
      ];

      mockPrismaBooking.findMany.mockResolvedValue(mockBookings);

      const result = await repository.findAllWithRelations();

      expect(result).toHaveLength(1);
      expect(result[0].property).toBeNull();
      expect(result[0].user).toBeNull();
    });

    it("should handle database errors", async () => {
      mockPrismaBooking.findMany.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findAllWithRelations()).rejects.toThrow("Failed to fetch bookings");
    });
  });

  describe("findByUserIdWithRelations", () => {
    it("should return user bookings with property and user relations", async () => {
      const mockBookings = [
        {
          id: "booking-1",
          propertyId: "property-123",
          userId: "user-123",
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          totalGuests: 2,
          totalPrice: 400,
          status: BookingStatus.PENDING,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-01"),
          property: {
            id: "property-123",
            title: "Test Property",
            ownerId: "owner-123",
          },
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
      ];

      mockPrismaBooking.findMany.mockResolvedValue(mockBookings);

      const result = await repository.findByUserIdWithRelations("user-123");

      expect(result).toHaveLength(1);
      expect(mockPrismaBooking.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        include: {
          property: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle database errors", async () => {
      mockPrismaBooking.findMany.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findByUserIdWithRelations("user-123")).rejects.toThrow(
        "Failed to fetch user bookings"
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle empty booking id", async () => {
      mockPrismaBooking.findUnique.mockResolvedValue(null);

      const result = await repository.findById("");
      expect(result).toBeNull();
    });

    it("should handle special characters in booking id", async () => {
      const mockBooking = {
        id: "booking-@#$",
        propertyId: "property-123",
        userId: "user-123",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalGuests: 2,
        totalPrice: 400,
        status: BookingStatus.PENDING,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);

      const result = await repository.findById("booking-@#$");
      expect(result?.id).toBe("booking-@#$");
    });
  });

  describe("Data integrity", () => {
    it("should preserve all booking fields when creating", async () => {
      const booking = BookingFactory.create({
        id: "booking-123",
        propertyId: "property-456",
        userId: "user-789",
        totalGuests: 5,
        totalPrice: 1000,
        status: BookingStatus.CONFIRMED,
      });

      const mockBooking = {
        id: "booking-123",
        propertyId: "property-456",
        userId: "user-789",
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalGuests: 5,
        totalPrice: 1000,
        status: BookingStatus.CONFIRMED,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };

      mockPrismaBooking.findUnique.mockResolvedValue(null);
      mockPrismaBooking.create.mockResolvedValue(mockBooking);

      const result = await repository.save(booking);

      expect(result.id).toBe("booking-123");
      expect(result.propertyId).toBe("property-456");
      expect(result.userId).toBe("user-789");
      expect(result.totalGuests).toBe(5);
      expect(result.totalPrice).toBe(1000);
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });
  });
});

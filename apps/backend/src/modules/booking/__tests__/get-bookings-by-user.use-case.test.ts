import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetBookingsByUserUseCase } from "../application/get-bookings-by-user.use-case";
import { IBookingRepository, Booking } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";

describe("GetBookingsByUserUseCase", () => {
  let getBookingsByUserUseCase: GetBookingsByUserUseCase;
  let mockBookingRepository: IBookingRepository;

  beforeEach(() => {
    mockBookingRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByPropertyId: vi.fn(),
      findActiveByPropertyId: vi.fn(),
      findOverlappingBookings: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as IBookingRepository;

    getBookingsByUserUseCase = new GetBookingsByUserUseCase(mockBookingRepository);
  });

  describe("execute", () => {
    it("should return empty array when user has no bookings", async () => {
      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue([]);

      const result = await getBookingsByUserUseCase.execute("user-123");

      expect(result).toEqual([]);
      expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith("user-123");
    });

    it("should return all bookings for a user", async () => {
      const bookings = [
        BookingFactory.create({ userId: "user-123" }),
        BookingFactory.create({ userId: "user-123" }),
        BookingFactory.create({ userId: "user-123" }),
      ];

      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue(bookings);

      const result = await getBookingsByUserUseCase.execute("user-123");

      expect(result).toHaveLength(3);
      expect(result).toEqual(bookings);
      expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith("user-123");
    });

    it("should return single booking for user", async () => {
      const booking = BookingFactory.create({ userId: "user-123" });

      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue([booking]);

      const result = await getBookingsByUserUseCase.execute("user-123");

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(booking);
    });

    it("should handle repository errors gracefully", async () => {
      vi.mocked(mockBookingRepository.findByUserId).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        getBookingsByUserUseCase.execute("user-123")
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("Different booking states", () => {
    it("should return bookings with different statuses", async () => {
      const bookings = [
        BookingFactory.create({ userId: "user-123", status: "pending" }),
        BookingFactory.create({ userId: "user-123", status: "confirmed" }),
        BookingFactory.create({ userId: "user-123", status: "completed" }),
        BookingFactory.create({ userId: "user-123", status: "cancelled" }),
      ];

      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue(bookings);

      const result = await getBookingsByUserUseCase.execute("user-123");

      expect(result).toHaveLength(4);
      expect(result[0].status).toBe("pending");
      expect(result[1].status).toBe("confirmed");
      expect(result[2].status).toBe("completed");
      expect(result[3].status).toBe("cancelled");
    });

    it("should return only bookings for the specified user", async () => {
      const userBookings = [
        BookingFactory.create({ userId: "user-123" }),
        BookingFactory.create({ userId: "user-123" }),
      ];

      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue(userBookings);

      const result = await getBookingsByUserUseCase.execute("user-123");

      expect(result).toHaveLength(2);
      expect(result.every(b => b.userId === "user-123")).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty user id", async () => {
      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue([]);

      const result = await getBookingsByUserUseCase.execute("");

      expect(result).toEqual([]);
      expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith("");
    });

    it("should handle special characters in user id", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue([booking]);

      const result = await getBookingsByUserUseCase.execute("user-123-@#$");

      expect(result).toHaveLength(1);
    });

    it("should handle very large number of bookings", async () => {
      const bookings = Array.from({ length: 1000 }, (_, i) =>
        BookingFactory.create({
          userId: "user-123",
          id: `booking-${i}`,
        })
      );

      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue(bookings);

      const result = await getBookingsByUserUseCase.execute("user-123");

      expect(result).toHaveLength(1000);
    });
  });

  describe("Data integrity", () => {
    it("should preserve booking properties", async () => {
      const booking = BookingFactory.create({
        userId: "user-123",
        propertyId: "property-456",
        totalGuests: 3,
        totalPrice: 600,
      });

      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue([booking]);

      const result = await getBookingsByUserUseCase.execute("user-123");

      expect(result[0].userId).toBe("user-123");
      expect(result[0].propertyId).toBe("property-456");
      expect(result[0].totalGuests).toBe(3);
      expect(result[0].totalPrice).toBe(600);
    });

    it("should return bookings in the order returned by repository", async () => {
      const bookings = [
        BookingFactory.create({ id: "booking-1", userId: "user-123" }),
        BookingFactory.create({ id: "booking-2", userId: "user-123" }),
        BookingFactory.create({ id: "booking-3", userId: "user-123" }),
      ];

      vi.mocked(mockBookingRepository.findByUserId).mockResolvedValue(bookings);

      const result = await getBookingsByUserUseCase.execute("user-123");

      expect(result[0].id).toBe("booking-1");
      expect(result[1].id).toBe("booking-2");
      expect(result[2].id).toBe("booking-3");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateBookingUseCase } from "../application/update-booking.use-case";
import { IBookingRepository, BookingNotFoundError } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";

describe("UpdateBookingUseCase", () => {
  let updateBookingUseCase: UpdateBookingUseCase;
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

    updateBookingUseCase = new UpdateBookingUseCase(mockBookingRepository);
  });

  describe("execute", () => {
    it("should successfully update booking with totalGuests", async () => {
      const booking = BookingFactory.create({ totalGuests: 2 });
      const updatedBooking = BookingFactory.create({ totalGuests: 4 });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(updatedBooking);

      const result = await updateBookingUseCase.execute("booking-123", { totalGuests: 4 });

      expect(result).toBe(updatedBooking);
      expect(mockBookingRepository.findById).toHaveBeenCalledWith("booking-123");
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it("should throw BookingNotFoundError when booking does not exist", async () => {
      vi.mocked(mockBookingRepository.findById).mockResolvedValue(null);

      await expect(
        updateBookingUseCase.execute("non-existent", { totalGuests: 4 })
      ).rejects.toThrow(BookingNotFoundError);
      expect(mockBookingRepository.findById).toHaveBeenCalledWith("non-existent");
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should preserve existing values when no update provided", async () => {
      const booking = BookingFactory.create({ totalGuests: 2 });
      const updatedBooking = BookingFactory.create({ totalGuests: 2 });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockImplementation((b) => Promise.resolve(b));

      const result = await updateBookingUseCase.execute("booking-123", {});

      expect(result.totalGuests).toBe(2);
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it("should update updatedAt timestamp", async () => {
      const booking = BookingFactory.create({
        updatedAt: new Date("2025-01-01"),
      });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockImplementation((b) => Promise.resolve(b));

      const result = await updateBookingUseCase.execute("booking-123", { totalGuests: 4 });

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.getTime()).toBeGreaterThan(new Date("2025-01-01").getTime());
    });

    it("should preserve all other booking properties", async () => {
      const booking = BookingFactory.create({
        id: "booking-123",
        propertyId: "property-456",
        userId: "user-789",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-05"),
        totalPrice: 500,
        status: "pending",
      });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockImplementation((b) => Promise.resolve(b));

      const result = await updateBookingUseCase.execute("booking-123", { totalGuests: 4 });

      expect(result.id).toBe("booking-123");
      expect(result.propertyId).toBe("property-456");
      expect(result.userId).toBe("user-789");
      expect(result.startDate).toEqual(new Date("2025-02-01"));
      expect(result.endDate).toEqual(new Date("2025-02-05"));
      expect(result.totalPrice).toBe(500);
      expect(result.status).toBe("pending");
    });

    it("should handle repository errors gracefully", async () => {
      vi.mocked(mockBookingRepository.findById).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        updateBookingUseCase.execute("booking-123", { totalGuests: 4 })
      ).rejects.toThrow("Database connection failed");
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should handle save errors gracefully", async () => {
      const booking = BookingFactory.create({ totalGuests: 2 });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockRejectedValue(new Error("Save failed"));

      await expect(
        updateBookingUseCase.execute("booking-123", { totalGuests: 4 })
      ).rejects.toThrow("Save failed");
    });
  });

  describe("totalGuests updates", () => {
    it("should increase totalGuests", async () => {
      const booking = BookingFactory.create({ totalGuests: 2 });
      const updatedBooking = BookingFactory.create({ totalGuests: 5 });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(updatedBooking);

      const result = await updateBookingUseCase.execute("booking-123", { totalGuests: 5 });

      expect(result.totalGuests).toBe(5);
    });

    it("should decrease totalGuests", async () => {
      const booking = BookingFactory.create({ totalGuests: 5 });
      const updatedBooking = BookingFactory.create({ totalGuests: 2 });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(updatedBooking);

      const result = await updateBookingUseCase.execute("booking-123", { totalGuests: 2 });

      expect(result.totalGuests).toBe(2);
    });

    it("should set totalGuests to 1", async () => {
      const booking = BookingFactory.create({ totalGuests: 4 });
      const updatedBooking = BookingFactory.create({ totalGuests: 1 });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(updatedBooking);

      const result = await updateBookingUseCase.execute("booking-123", { totalGuests: 1 });

      expect(result.totalGuests).toBe(1);
    });

    it("should handle large totalGuests values", async () => {
      const booking = BookingFactory.create({ totalGuests: 2 });
      const updatedBooking = BookingFactory.create({ totalGuests: 20 });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(updatedBooking);

      const result = await updateBookingUseCase.execute("booking-123", { totalGuests: 20 });

      expect(result.totalGuests).toBe(20);
    });
  });

  describe("Edge cases", () => {
    it("should throw ValueError for zero guests", async () => {
      const booking = BookingFactory.create({ totalGuests: 2 });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

      await expect(
        updateBookingUseCase.execute("booking-123", { totalGuests: 0 })
      ).rejects.toThrow("At least 1 guest is required");
    });

    it("should handle undefined totalGuests in input", async () => {
      const booking = BookingFactory.create({ totalGuests: 3 });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockImplementation((b) => Promise.resolve(b));

      const result = await updateBookingUseCase.execute("booking-123", {});

      expect(result.totalGuests).toBe(3);
    });

    it("should preserve createdAt timestamp", async () => {
      const originalCreatedAt = new Date("2024-01-01");
      const booking = BookingFactory.create({ createdAt: originalCreatedAt });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockImplementation((b) => Promise.resolve(b));

      const result = await updateBookingUseCase.execute("booking-123", { totalGuests: 4 });

      expect(result.createdAt).toEqual(originalCreatedAt);
    });
  });
});

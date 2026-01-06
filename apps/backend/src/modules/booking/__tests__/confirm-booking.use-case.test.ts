import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmBookingUseCase } from "../application/confirm-booking.use-case";
import { IBookingRepository, Booking, BookingNotFoundError } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";

describe("ConfirmBookingUseCase", () => {
  let confirmBookingUseCase: ConfirmBookingUseCase;
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

    confirmBookingUseCase = new ConfirmBookingUseCase(mockBookingRepository);
  });

  describe("execute", () => {
    it("should confirm a pending booking", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      const result = await confirmBookingUseCase.execute("booking-123");

      expect(result.isConfirmed()).toBe(true);
      expect(mockBookingRepository.findById).toHaveBeenCalledWith("booking-123");
      expect(mockBookingRepository.save).toHaveBeenCalledWith(booking);
    });

    it("should throw BookingNotFoundError when booking does not exist", async () => {
      vi.mocked(mockBookingRepository.findById).mockResolvedValue(null);

      await expect(confirmBookingUseCase.execute("non-existent")).rejects.toThrow(BookingNotFoundError);
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should propagate ValueError when confirming already confirmed booking", async () => {
      const booking = BookingFactory.confirmed();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

      await expect(confirmBookingUseCase.execute("booking-123")).rejects.toThrow(
        "Only pending bookings can be confirmed"
      );
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should propagate ValueError when confirming cancelled booking", async () => {
      const booking = BookingFactory.cancelled();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

      await expect(confirmBookingUseCase.execute("booking-123")).rejects.toThrow(
        "Only pending bookings can be confirmed"
      );
    });
  });
});

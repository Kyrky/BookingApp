import { describe, it, expect, vi, beforeEach } from "vitest";
import { CancelBookingUseCase } from "../application/cancel-booking.use-case";
import { IBookingRepository, Booking, BookingNotFoundError } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";

describe("CancelBookingUseCase", () => {
  let cancelBookingUseCase: CancelBookingUseCase;
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

    cancelBookingUseCase = new CancelBookingUseCase(mockBookingRepository);
  });

  describe("execute", () => {
    it("should cancel a pending booking", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      const result = await cancelBookingUseCase.execute("booking-123");

      expect(result.isCancelled()).toBe(true);
      expect(mockBookingRepository.findById).toHaveBeenCalledWith("booking-123");
      expect(mockBookingRepository.save).toHaveBeenCalledWith(booking);
    });

    it("should cancel a confirmed booking", async () => {
      const booking = BookingFactory.confirmed();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      const result = await cancelBookingUseCase.execute("booking-123");

      expect(result.isCancelled()).toBe(true);
    });

    it("should throw BookingNotFoundError when booking does not exist", async () => {
      vi.mocked(mockBookingRepository.findById).mockResolvedValue(null);

      await expect(cancelBookingUseCase.execute("non-existent")).rejects.toThrow(BookingNotFoundError);
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should propagate ValueError from booking.cancel() for completed bookings", async () => {
      const booking = BookingFactory.completed();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

      await expect(cancelBookingUseCase.execute("booking-123")).rejects.toThrow(
        "Booking cannot be cancelled in current status"
      );
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });
  });
});

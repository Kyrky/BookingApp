import { describe, it, expect, vi, beforeEach } from "vitest";
import { CheckOutBookingUseCase } from "../application/check-out-booking.use-case";
import { IBookingRepository, Booking, BookingNotFoundError } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";

describe("CheckOutBookingUseCase", () => {
  let checkOutBookingUseCase: CheckOutBookingUseCase;
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

    checkOutBookingUseCase = new CheckOutBookingUseCase(mockBookingRepository);
  });

  describe("execute", () => {
    it("should check out a completed (checked-in) booking", async () => {
      const booking = BookingFactory.completed();
      const updatedAtBefore = booking.updatedAt;

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      const result = await checkOutBookingUseCase.execute("booking-123");

      expect(result.isCompleted()).toBe(true);
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(updatedAtBefore.getTime());
      expect(mockBookingRepository.findById).toHaveBeenCalledWith("booking-123");
      expect(mockBookingRepository.save).toHaveBeenCalledWith(booking);
    });

    it("should throw BookingNotFoundError when booking does not exist", async () => {
      vi.mocked(mockBookingRepository.findById).mockResolvedValue(null);

      await expect(checkOutBookingUseCase.execute("non-existent")).rejects.toThrow(BookingNotFoundError);
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should propagate ValueError when checking out pending booking", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

      await expect(checkOutBookingUseCase.execute("booking-123")).rejects.toThrow(
        "Cannot check out from non-completed booking"
      );
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should propagate ValueError when checking out cancelled booking", async () => {
      const booking = BookingFactory.cancelled();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

      await expect(checkOutBookingUseCase.execute("booking-123")).rejects.toThrow(
        "Cannot check out from non-completed booking"
      );
    });

    it("should propagate ValueError when checking out confirmed booking", async () => {
      const booking = BookingFactory.confirmed();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

      await expect(checkOutBookingUseCase.execute("booking-123")).rejects.toThrow(
        "Cannot check out from non-completed booking"
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { CheckInBookingUseCase } from "../application/check-in-booking.use-case";
import { IBookingRepository, Booking, BookingNotFoundError } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";

describe("CheckInBookingUseCase", () => {
  let checkInBookingUseCase: CheckInBookingUseCase;
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

    checkInBookingUseCase = new CheckInBookingUseCase(mockBookingRepository);
  });

  describe("execute", () => {
    it("should check in a confirmed booking", async () => {
      const booking = BookingFactory.confirmed();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.save).mockResolvedValue(booking);

      const result = await checkInBookingUseCase.execute("booking-123");

      expect(result.isCompleted()).toBe(true);
      expect(mockBookingRepository.findById).toHaveBeenCalledWith("booking-123");
      expect(mockBookingRepository.save).toHaveBeenCalledWith(booking);
    });

    it("should throw BookingNotFoundError when booking does not exist", async () => {
      vi.mocked(mockBookingRepository.findById).mockResolvedValue(null);

      await expect(checkInBookingUseCase.execute("non-existent")).rejects.toThrow(BookingNotFoundError);
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should propagate ValueError when checking in pending booking", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

      await expect(checkInBookingUseCase.execute("booking-123")).rejects.toThrow(
        "Only confirmed bookings can be checked in"
      );
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });

    it("should propagate ValueError when checking in cancelled booking", async () => {
      const booking = BookingFactory.cancelled();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

      await expect(checkInBookingUseCase.execute("booking-123")).rejects.toThrow(
        "Only confirmed bookings can be checked in"
      );
    });
  });
});

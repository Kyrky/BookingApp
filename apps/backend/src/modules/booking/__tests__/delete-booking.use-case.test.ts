import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteBookingUseCase } from "../application/delete-booking.use-case";
import { IBookingRepository, BookingNotFoundError } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";

describe("DeleteBookingUseCase", () => {
  let deleteBookingUseCase: DeleteBookingUseCase;
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

    deleteBookingUseCase = new DeleteBookingUseCase(mockBookingRepository);
  });

  describe("execute", () => {
    it("should successfully delete booking", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockResolvedValue(undefined);

      await expect(
        deleteBookingUseCase.execute("booking-123")
      ).resolves.toBeUndefined();

      expect(mockBookingRepository.findById).toHaveBeenCalledWith("booking-123");
      expect(mockBookingRepository.delete).toHaveBeenCalledWith("booking-123");
    });

    it("should throw BookingNotFoundError when booking does not exist", async () => {
      vi.mocked(mockBookingRepository.findById).mockResolvedValue(null);

      await expect(
        deleteBookingUseCase.execute("non-existent")
      ).rejects.toThrow(BookingNotFoundError);

      expect(mockBookingRepository.findById).toHaveBeenCalledWith("non-existent");
      expect(mockBookingRepository.delete).not.toHaveBeenCalled();
    });

    it("should not call delete when booking is not found", async () => {
      vi.mocked(mockBookingRepository.findById).mockResolvedValue(null);

      try {
        await deleteBookingUseCase.execute("non-existent");
      } catch (e) {
        // Expected to throw
      }

      expect(mockBookingRepository.delete).not.toHaveBeenCalled();
    });

    it("should handle repository errors during findById", async () => {
      vi.mocked(mockBookingRepository.findById).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        deleteBookingUseCase.execute("booking-123")
      ).rejects.toThrow("Database connection failed");

      expect(mockBookingRepository.delete).not.toHaveBeenCalled();
    });

    it("should handle repository errors during delete", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockRejectedValue(
        new Error("Delete operation failed")
      );

      await expect(
        deleteBookingUseCase.execute("booking-123")
      ).rejects.toThrow("Delete operation failed");

      expect(mockBookingRepository.findById).toHaveBeenCalledWith("booking-123");
      expect(mockBookingRepository.delete).toHaveBeenCalledWith("booking-123");
    });
  });

  describe("Different booking states", () => {
    it("should delete pending booking", async () => {
      const booking = BookingFactory.create({ status: "pending" });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockResolvedValue(undefined);

      await expect(
        deleteBookingUseCase.execute("booking-123")
      ).resolves.toBeUndefined();

      expect(mockBookingRepository.delete).toHaveBeenCalledWith("booking-123");
    });

    it("should delete confirmed booking", async () => {
      const booking = BookingFactory.create({ status: "confirmed" });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockResolvedValue(undefined);

      await expect(
        deleteBookingUseCase.execute("booking-123")
      ).resolves.toBeUndefined();

      expect(mockBookingRepository.delete).toHaveBeenCalledWith("booking-123");
    });

    it("should delete cancelled booking", async () => {
      const booking = BookingFactory.create({ status: "cancelled" });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockResolvedValue(undefined);

      await expect(
        deleteBookingUseCase.execute("booking-123")
      ).resolves.toBeUndefined();

      expect(mockBookingRepository.delete).toHaveBeenCalledWith("booking-123");
    });

    it("should delete completed booking", async () => {
      const booking = BookingFactory.create({ status: "completed" });

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockResolvedValue(undefined);

      await expect(
        deleteBookingUseCase.execute("booking-123")
      ).resolves.toBeUndefined();

      expect(mockBookingRepository.delete).toHaveBeenCalledWith("booking-123");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty booking id", async () => {
      vi.mocked(mockBookingRepository.findById).mockResolvedValue(null);

      await expect(
        deleteBookingUseCase.execute("")
      ).rejects.toThrow(BookingNotFoundError);
    });

    it("should handle special characters in booking id", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockResolvedValue(undefined);

      await expect(
        deleteBookingUseCase.execute("booking-123-@#$")
      ).resolves.toBeUndefined();
    });

    it("should handle very long booking id", async () => {
      const booking = BookingFactory.create();
      const longId = "a".repeat(1000);

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockResolvedValue(undefined);

      await expect(
        deleteBookingUseCase.execute(longId)
      ).resolves.toBeUndefined();
    });
  });

  describe("Return value", () => {
    it("should return void on successful deletion", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockResolvedValue(undefined);

      const result = await deleteBookingUseCase.execute("booking-123");

      expect(result).toBeUndefined();
    });

    it("should not return any value", async () => {
      const booking = BookingFactory.create();

      vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);
      vi.mocked(mockBookingRepository.delete).mockResolvedValue(undefined);

      const result = await deleteBookingUseCase.execute("booking-123");

      expect(result).not.toBeDefined();
    });
  });
});

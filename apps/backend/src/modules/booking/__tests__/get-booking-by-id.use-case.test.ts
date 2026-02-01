import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetBookingByIdUseCase } from "../application/get-booking-by-id.use-case";
import { IBookingRepository, Booking, BookingNotFoundError } from "@repo/shared";
import { BookingFactory } from "./factories/booking.factory";

describe("GetBookingByIdUseCase", () => {
    let getBookingByIdUseCase: GetBookingByIdUseCase;
    let mockBookingRepository: IBookingRepository;

    beforeEach(() => {
        mockBookingRepository = {
            findAll: vi.fn(),
            findById: vi.fn(),
            findByUserId: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
        } as unknown as IBookingRepository;

        getBookingByIdUseCase = new GetBookingByIdUseCase(mockBookingRepository);
    });

    describe("execute", () => {
        it("should successfully return a booking by id", async () => {
            const booking = BookingFactory.create();

            vi.mocked(mockBookingRepository.findById).mockResolvedValue(booking);

            const result = await getBookingByIdUseCase.execute(booking.id);

            expect(result).toEqual(booking);
            expect(mockBookingRepository.findById).toHaveBeenCalledWith(booking.id);
        });

        it("should throw BookingNotFoundError if booking does not exist", async () => {
            vi.mocked(mockBookingRepository.findById).mockResolvedValue(null);

            await expect(
                getBookingByIdUseCase.execute("non-existent")
            ).rejects.toThrow(BookingNotFoundError);
        });

        it("should propagate repository errors", async () => {
            vi.mocked(mockBookingRepository.findById).mockRejectedValue(new Error("Database error"));

            await expect(getBookingByIdUseCase.execute("some-id")).rejects.toThrow("Database error");
        });
    });
});
